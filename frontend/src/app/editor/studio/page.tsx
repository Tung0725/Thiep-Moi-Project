'use client';

import React, { useState, useEffect, useCallback } from 'react';
import StudioTopBar from '@/components/studio/StudioTopBar';
import BlockTreePanel from '@/components/studio/BlockTreePanel';
import PropertyInspector from '@/components/studio/PropertyInspector';
import GlobalSettingsTab from '@/components/studio/GlobalSettingsTab';
import RawJsonTab from '@/components/studio/RawJsonTab';
import CloneModal from '@/components/studio/CloneModal';
import CreateModal from '@/components/studio/CreateModal';
import { PageRenderer } from '@/components/renderer/PageRenderer';
import { PageSchema } from '@/types/schema';
import { TemplateDetailResponse, CreateTemplatePayload } from '@/types/api';
import { templateService } from '@/services/templateService';
import { DEFAULT_TEMPLATES } from '@/data/defaultTemplates';

type InspectorTab = 'PROPERTIES' | 'GLOBAL' | 'RAW_JSON';

/**
 * StudioEditorPage Component
 * Purpose: Không gian làm việc thiết kế và sáng tạo mẫu thiệp cưới nội bộ (meHappy Studio).
 *   - Bố cục 3 cột chuyên nghiệp:
 *     1. Cột trái: Cây cấu trúc khối (Block Tree), thêm khối, đổi thứ tự, ẩn/hiện, xóa.
 *     2. Cột giữa: Khung Canvas tương tác trực tiếp với PageRenderer, hỗ trợ đổi kích thước Desktop / Mobile.
 *     3. Cột phải: Bộ thanh tra thuộc tính (Property Inspector, Cài đặt chung Theme/Effects, Raw JSON).
 *   - Tích hợp 1-click clone và lưu đồng bộ trực tiếp vào Database PostgreSQL qua Spring Boot API.
 * Key States:
 *   - activeTemplate: Thông tin mẫu hiện tại
 *   - schema: Cây JSON Schema phản ánh tức thời trên Canvas
 *   - activeBlockId: ID khối đang được chọn để chỉnh sửa
 *   - activeTab: Tab đang xem ở cột bên phải
 *   - viewMode: Chế độ Desktop rộng hoặc Mobile tiêu chuẩn
 */
export default function StudioEditorPage() {
  const [templatesList, setTemplatesList] = useState<{ id: number | string; code: string; title: string }[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<TemplateDetailResponse | null>(null);
  const [schema, setSchema] = useState<PageSchema | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<InspectorTab>('PROPERTIES');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCloneOpen, setIsCloneOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadTemplateDetail = useCallback(async (code: string) => {
    try {
      const detail = await templateService.getTemplateByCodeOrId(code);
      setActiveTemplate(detail);
      if (detail.contentSchema) {
        const parsed = JSON.parse(detail.contentSchema) as PageSchema;
        setSchema(parsed);
        if (parsed.blocks?.length > 0) {
          setActiveBlockId(parsed.blocks[0].id);
        }
      }
    } catch {
      // Fallback local HB04 if backend is not yet populated
      const fallback = DEFAULT_TEMPLATES.find((t) => t.id === code) || DEFAULT_TEMPLATES[0];
      setActiveTemplate({
        id: 1,
        code: fallback.id,
        title: fallback.title,
        category: fallback.category,
        categoryLabel: fallback.categoryLabel,
        style: fallback.style,
        badge: fallback.badge,
        imageUrl: fallback.imageUrl,
        description: fallback.description,
        version: 1,
        status: 'PUBLISHED',
        contentSchema: JSON.stringify(fallback.schema),
        viewsCount: 6600,
        likesCount: 142,
        createdAt: new Date().toISOString(),
      });
      setSchema(fallback.schema);
      if (fallback.schema.blocks?.length > 0) {
        setActiveBlockId(fallback.schema.blocks[0].id);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const list = await templateService.getTemplates();
        if (list && list.length > 0) {
          setTemplatesList(list.map((t) => ({ id: t.id, code: t.code, title: t.title })));
          await loadTemplateDetail(list[0].code);
          return;
        }
      } catch {
        // Fallback to local default templates
      }

      setTemplatesList(
        DEFAULT_TEMPLATES.map((t) => ({ id: t.id, code: t.id, title: t.title }))
      );
      await loadTemplateDetail(DEFAULT_TEMPLATES[0].id);
    }
    init();
  }, [loadTemplateDetail]);

  const handleSaveToDb = async () => {
    if (!schema || !activeTemplate) return;
    try {
      setIsSaving(true);
      const schemaString = JSON.stringify(schema);
      if (typeof activeTemplate.id === 'number' && activeTemplate.id > 0) {
        const updated = await templateService.updateTemplate(activeTemplate.id, {
          contentSchema: schemaString,
        });
        setActiveTemplate(updated);
      } else {
        const created = await templateService.createTemplate({
          code: activeTemplate.code,
          title: activeTemplate.title,
          category: activeTemplate.category || 'wedding',
          categoryLabel: activeTemplate.categoryLabel || 'Cưới',
          style: activeTemplate.style || 'Tươi sáng',
          badge: activeTemplate.badge || 'Miễn phí',
          imageUrl: activeTemplate.imageUrl || '',
          description: activeTemplate.description || '',
          contentSchema: schemaString,
        });
        setActiveTemplate(created);
      }
      showToast('Đã lưu thành công cấu trúc mẫu vào Database!');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi lưu lên server', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmClone = async (newCode: string, newTitle: string) => {
    if (!activeTemplate || !schema) return;
    try {
      let cloned: TemplateDetailResponse;
      if (typeof activeTemplate.id === 'number' && activeTemplate.id > 0) {
        cloned = await templateService.cloneTemplate(activeTemplate.id, {
          newCode,
          newTitle,
        });
      } else {
        cloned = await templateService.createTemplate({
          code: newCode,
          title: newTitle,
          category: activeTemplate.category,
          categoryLabel: activeTemplate.categoryLabel,
          style: activeTemplate.style,
          badge: 'Bản sao',
          imageUrl: activeTemplate.imageUrl,
          description: activeTemplate.description,
          contentSchema: JSON.stringify(schema),
        });
      }

      setTemplatesList((prev) => [{ id: cloned.id, code: cloned.code, title: cloned.title }, ...prev]);
      setActiveTemplate(cloned);
      setSchema(JSON.parse(cloned.contentSchema));
      showToast(`Nhân bản thành công! Đang biên tập "${cloned.title}"`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi nhân bản mẫu', 'error');
    }
  };

  const handleConfirmCreate = async (payload: Partial<CreateTemplatePayload>) => {
    if (!schema) return;
    try {
      const created = await templateService.createTemplate({
        code: payload.code || 'new-template',
        title: payload.title || 'Mẫu mới',
        category: payload.category || 'wedding',
        categoryLabel: payload.categoryLabel || 'Cưới',
        style: payload.style || 'Hiện đại',
        badge: payload.badge || 'Mới',
        imageUrl: payload.imageUrl || '',
        description: payload.description || '',
        contentSchema: JSON.stringify(schema),
      });

      setTemplatesList((prev) => [{ id: created.id, code: created.code, title: created.title }, ...prev]);
      setActiveTemplate(created);
      setSchema(JSON.parse(created.contentSchema));
      showToast(`Đã tạo mẫu mới "${created.title}" thành công!`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi tạo mẫu mới', 'error');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#fafafa] dark:bg-[#0c0e17] text-[#2d2d2d] dark:text-neutral-100">
      {/* 1. Global Studio Top Bar */}
      <StudioTopBar
        activeTemplate={activeTemplate}
        templatesList={templatesList}
        onSwitchTemplate={loadTemplateDetail}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSave={handleSaveToDb}
        onOpenClone={() => setIsCloneOpen(true)}
        onOpenCreate={() => setIsCreateOpen(true)}
        isSaving={isSaving}
      />

      {/* 2. Main 3-Column Studio Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Block Tree Panel */}
        <aside className="w-72 sm:w-80 shrink-0 h-full overflow-hidden border-r border-neutral-200 dark:border-[#242838]">
          {schema ? (
            <BlockTreePanel
              schema={schema}
              activeBlockId={activeBlockId}
              onSelectBlock={(id) => {
                setActiveBlockId(id);
                setActiveTab('PROPERTIES');
              }}
              onChange={setSchema}
            />
          ) : (
            <div className="p-4 text-xs text-neutral-400">Đang tải cây khối...</div>
          )}
        </aside>

        {/* Center Column: Live Responsive Canvas */}
        <main className="flex-1 h-full overflow-y-auto bg-neutral-100/70 dark:bg-[#080910] p-4 sm:p-8 flex flex-col items-center no-scrollbar">
          {schema ? (
            <div
              className={`w-full transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121420] ${
                viewMode === 'desktop' ? 'max-w-4xl' : 'max-w-md'
              }`}
            >
              <PageRenderer
                schema={schema}
                slug={activeTemplate?.code || 'preview'}
                containerClassName={viewMode === 'desktop' ? 'max-w-4xl' : 'max-w-md'}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="w-8 h-8 border-3 border-mh-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </main>

        {/* Right Column: Property & Theme Inspector */}
        <aside className="w-80 sm:w-96 shrink-0 h-full overflow-hidden border-l border-neutral-200 dark:border-[#242838] bg-white dark:bg-[#121420] flex flex-col">
          {/* Tab Selector */}
          <div className="flex items-center border-b border-neutral-200 dark:border-[#242838] p-1 bg-neutral-50 dark:bg-[#161824] shrink-0 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('PROPERTIES')}
              className={`flex-1 py-2 text-center rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'PROPERTIES'
                  ? 'bg-white dark:bg-neutral-800 text-mh-primary shadow-sm font-bold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">tune</span>
              <span>Khối</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('GLOBAL')}
              className={`flex-1 py-2 text-center rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'GLOBAL'
                  ? 'bg-white dark:bg-neutral-800 text-mh-primary shadow-sm font-bold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">settings</span>
              <span>Cài Đặt</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RAW_JSON')}
              className={`flex-1 py-2 text-center rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'RAW_JSON'
                  ? 'bg-white dark:bg-neutral-800 text-mh-primary shadow-sm font-bold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">code</span>
              <span>JSON</span>
            </button>
          </div>

          {/* Tab Content Viewport */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {schema && (
              <>
                {activeTab === 'PROPERTIES' && (
                  <PropertyInspector
                    schema={schema}
                    activeBlockId={activeBlockId}
                    onChange={setSchema}
                  />
                )}
                {activeTab === 'GLOBAL' && (
                  <GlobalSettingsTab schema={schema} onChange={setSchema} />
                )}
                {activeTab === 'RAW_JSON' && (
                  <RawJsonTab schema={schema} onChange={setSchema} />
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      {/* 3. Clone & Create Modals */}
      {activeTemplate && (
        <CloneModal
          isOpen={isCloneOpen}
          sourceTitle={activeTemplate.title}
          onClose={() => setIsCloneOpen(false)}
          onConfirm={handleConfirmClone}
        />
      )}

      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleConfirmCreate}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toastMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
