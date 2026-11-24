'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldOff,
  Unlock,
  Users,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useAuthStore } from '@/store/useAuthStore';
import { AdminUserResponse, AdminUserStatusUpdate } from '@/types/admin';
import { PageResponse } from '@/types/api';
import { UserRole, UserStatus } from '@/types/auth';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminToast, { useAdminToast } from '@/components/admin/AdminToast';

const PAGE_SIZE = 20;

interface PendingUserAction {
  type: 'status' | 'role';
  user: AdminUserResponse;
  nextStatus?: AdminUserStatusUpdate;
  nextRole?: UserRole;
  title: string;
  description: string;
  confirmLabel: string;
  tone: 'danger' | 'warning' | 'primary';
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * AdminUsersPage Component
 * Purpose: Quản lý danh sách người dùng hệ thống (ADM-02, ADM-03, ADM-04): tìm kiếm debounce, lọc vai trò/trạng thái, khóa/mở khóa và đổi vai trò có xác nhận.
 * Props: Không yêu cầu props.
 * Key States:
 *  - searchInput / debouncedSearch, roleFilter, statusFilter, page: Tham số truy vấn danh sách.
 *  - pageData: Dữ liệu phân trang người dùng.
 *  - pendingAction / isMutating: Thao tác đang chờ xác nhận qua ConfirmDialog.
 */
export default function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const { toast, showToast, clearToast } = useAdminToast();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(0);

  const [pageData, setPageData] = useState<PageResponse<AdminUserResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [pendingAction, setPendingAction] = useState<PendingUserAction | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getUsers({
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        size: PAGE_SIZE,
      });
      setPageData(data);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Không thể tải danh sách người dùng.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter, page]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const openStatusConfirm = (target: AdminUserResponse, nextStatus: AdminUserStatusUpdate) => {
    const isLocking = nextStatus === 'LOCKED';
    setPendingAction({
      type: 'status',
      user: target,
      nextStatus,
      title: isLocking ? 'Khóa tài khoản người dùng?' : 'Mở khóa / kích hoạt tài khoản?',
      description: isLocking
        ? `Tài khoản ${target.email} sẽ bị thu hồi phiên hiện tại và không thể đăng nhập cho tới khi được mở khóa.`
        : `Tài khoản ${target.email} sẽ chuyển sang trạng thái hoạt động và có thể đăng nhập lại bình thường.`,
      confirmLabel: isLocking ? 'Khóa tài khoản' : 'Kích hoạt',
      tone: isLocking ? 'danger' : 'primary',
    });
  };

  const openRoleConfirm = (target: AdminUserResponse, nextRole: UserRole) => {
    const isPromoting = nextRole === 'ROLE_ADMIN';
    setPendingAction({
      type: 'role',
      user: target,
      nextRole,
      title: isPromoting ? 'Cấp quyền Quản trị viên?' : 'Hạ quyền xuống Người dùng?',
      description: isPromoting
        ? `Tài khoản ${target.email} sẽ có toàn quyền truy cập bảng điều khiển quản trị.`
        : `Tài khoản ${target.email} sẽ mất quyền quản trị và bị thu hồi ngay các phiên đăng nhập hiện tại.`,
      confirmLabel: isPromoting ? 'Cấp Admin' : 'Hạ xuống User',
      tone: isPromoting ? 'warning' : 'danger',
    });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setIsMutating(true);
    try {
      let updated: AdminUserResponse;
      if (pendingAction.type === 'status' && pendingAction.nextStatus) {
        updated = await adminService.updateUserStatus(
          pendingAction.user.id,
          pendingAction.nextStatus,
        );
        showToast(
          'success',
          pendingAction.nextStatus === 'LOCKED'
            ? `Đã khóa tài khoản ${updated.email}.`
            : `Đã kích hoạt tài khoản ${updated.email}.`,
        );
      } else if (pendingAction.type === 'role' && pendingAction.nextRole) {
        updated = await adminService.updateUserRole(
          pendingAction.user.id,
          pendingAction.nextRole,
        );
        showToast(
          'success',
          pendingAction.nextRole === 'ROLE_ADMIN'
            ? `Đã cấp quyền quản trị cho ${updated.email}.`
            : `Đã hạ quyền ${updated.email} xuống người dùng.`,
        );
      } else {
        return;
      }

      setPageData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((item) => (item.id === updated.id ? updated : item)),
            }
          : prev,
      );
      setPendingAction(null);
    } catch (err: unknown) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Không thể cập nhật thông tin người dùng.',
      );
    } finally {
      setIsMutating(false);
    }
  };

  const users = pageData?.content ?? [];

  return (
    <div className="space-y-5">
      {/* Filter, Search & Refresh Toolbar */}
      <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo email hoặc họ tên..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <select
            aria-label="Lọc theo vai trò"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | '');
              setPage(0);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
          >
            <option value="">Tất cả vai trò</option>
            <option value="ROLE_ADMIN">Quản trị viên</option>
            <option value="ROLE_USER">Người dùng</option>
          </select>

          <select
            aria-label="Lọc theo trạng thái"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as UserStatus | '');
              setPage(0);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-mh-primary/30 focus:border-mh-primary"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="LOCKED">Đã khóa</option>
            <option value="PENDING_VERIFICATION">Chờ xác thực</option>
          </select>

          <button
            type="button"
            onClick={() => void fetchUsers()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-mh-primary hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-60 transition cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Error State Banner */}
      {errorMessage && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/40 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-rose-800 dark:text-rose-200 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => void fetchUsers()}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold cursor-pointer shrink-0"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Users Data Table */}
      <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-5 space-y-3 animate-pulse">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-12 bg-slate-100 dark:bg-[#1e2433] rounded-xl" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-[#1e2433] flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <p className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-100">
                Không tìm thấy người dùng phù hợp
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-[#1e2433] text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  <th className="py-3.5 px-4">Người dùng</th>
                  <th className="py-3.5 px-4">Vai trò</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center">Thiệp</th>
                  <th className="py-3.5 px-4">Ngày tạo</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/70 text-sm">
                {users.map((item) => {
                  const isSelf = currentUser?.id === item.id;
                  const isLocked = item.status === 'LOCKED';
                  const isAdmin = item.role === 'ROLE_ADMIN';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#1f2536] transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-mh-primary/90 to-[#ff7a97] text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {item.fullName ? item.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900 dark:text-slate-50 truncate max-w-[200px]">
                                {item.fullName}
                              </p>
                              {isSelf && (
                                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <p className="text-[13px] text-slate-600 dark:text-slate-300 truncate max-w-[230px]">
                              {item.email}
                            </p>
                            {item.phoneNumber && (
                              <p className="text-[13px] text-slate-600 dark:text-slate-300">
                                {item.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge category="userRole" value={item.role} />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge category="userStatus" value={item.status} />
                          {!item.emailVerified && item.status !== 'PENDING_VERIFICATION' && (
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                              Chưa xác thực
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-semibold text-slate-900 dark:text-slate-50">
                        {item.invitationCount}
                      </td>

                      <td className="py-3.5 px-4 text-[13px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {formatDateTime(item.createdAt)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {/* Lock / Unlock / Activate Action */}
                          {isLocked ? (
                            <button
                              type="button"
                              onClick={() => openStatusConfirm(item, 'ACTIVE')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40 dark:hover:bg-emerald-500/30 transition cursor-pointer"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Mở khóa</span>
                            </button>
                          ) : (
                            <>
                              {item.status === 'PENDING_VERIFICATION' && (
                                <button
                                  type="button"
                                  onClick={() => openStatusConfirm(item, 'ACTIVE')}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40 dark:hover:bg-emerald-500/30 transition cursor-pointer"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Kích hoạt</span>
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={isSelf}
                                title={
                                  isSelf
                                    ? 'Không thể tự khóa tài khoản của chính mình'
                                    : 'Khóa tài khoản này'
                                }
                                onClick={() => openStatusConfirm(item, 'LOCKED')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/40 dark:hover:bg-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Khóa</span>
                              </button>
                            </>
                          )}

                          {/* Change Role Action */}
                          {isAdmin ? (
                            <button
                              type="button"
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? 'Không thể tự hạ quyền của chính mình'
                                  : 'Hạ xuống vai trò người dùng thường'
                              }
                              onClick={() => openRoleConfirm(item, 'ROLE_USER')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-slate-800 dark:text-slate-100 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                              <ShieldOff className="w-3.5 h-3.5" />
                              <span>Hạ quyền</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openRoleConfirm(item, 'ROLE_ADMIN')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111520] text-slate-800 dark:text-slate-100 hover:border-mh-primary hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span>Cấp Admin</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {pageData && (
          <AdminPagination
            page={pageData.number}
            totalPages={pageData.totalPages}
            totalElements={pageData.totalElements}
            size={pageData.size}
            isLoading={isLoading}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.title ?? ''}
        description={pendingAction?.description ?? ''}
        confirmLabel={pendingAction?.confirmLabel ?? 'Xác nhận'}
        tone={pendingAction?.tone ?? 'primary'}
        isLoading={isMutating}
        onConfirm={() => void handleConfirmAction()}
        onCancel={() => setPendingAction(null)}
      />

      {/* Feedback Toast */}
      <AdminToast toast={toast} onClose={clearToast} />
    </div>
  );
}
