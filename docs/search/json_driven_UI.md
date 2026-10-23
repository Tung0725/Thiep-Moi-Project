# Kiến Trúc JSON-Driven UI (Server-Driven UI)

> Tài liệu tham khảo kỹ thuật toàn diện về mô hình **JSON-Driven UI** (SDUI / Schema-Driven UI), áp dụng trực tiếp cho dự án **Java Spring Boot 4 + Next.js / React**.

---

## 1. Tổng Quan Kiến Trúc (Architecture Overview)

Kiến trúc **JSON-Driven UI** (còn gọi là **Server-Driven UI - SDUI** hoặc **Schema-Driven UI**) là mô hình thiết kế trong đó giao diện người dùng không bị đóng cứng (*hardcode*) ở phía Frontend. Thay vào đó, toàn bộ bố cục (*layout*), thứ tự hiển thị, kiểu dáng (*styling*) và dữ liệu của trang được định nghĩa hoàn toàn bằng một cấu trúc dữ liệu JSON lưu trữ ở Backend.

### So sánh với mô hình truyền thống
- **Mô hình truyền thống**: Backend chỉ trả về dữ liệu thô (Data DTO), còn việc sắp xếp khối nào nằm trên, khối nào nằm dưới do Frontend quy định cố định.
- **Mô hình JSON-Driven UI**: Backend trả về cả dữ liệu lẫn cấu trúc hiển thị (**UI Schema**). Frontend đóng vai trò như một "trình duyệt thu nhỏ", đọc Schema và vẽ giao diện tương ứng.

### Luồng hoạt động tổng thể

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             1. TRÌNH EDITOR                             │
│  [Người dùng thao tác Form/Kéo thả] ──► Cập nhật State (JSON Tree)      │
└──────────────────────────────────────────────┬──────────────────────────┘
                                               │ (POST / PUT JSON)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       2. BACKEND (Spring Boot)                          │
│  [Validate Schema & Gói VIP] ──► Lưu vào PostgreSQL (Cột kiểu JSONB)    │
└──────────────────────────────────────────────┬──────────────────────────┘
                                               │ (GET /api/cards/{slug})
                                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    3. FRONTEND RENDERER (Next.js/React)                 │
│  [Nhận JSON] ──► [Đọc Theme/Effects] ──► [Component Registry] ──► [UI]  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Các Thành Phần Cốt Lõi (Core Components)

Một hệ thống JSON-Driven UI chuẩn chỉnh luôn được cấu thành từ 5 mảnh ghép độc lập:

### A. JSON Schema (Hợp đồng dữ liệu giữa BE và FE)
Là cấu trúc chuẩn định nghĩa toàn bộ trang. Một Schema chuẩn thường được chia làm 3 phần:
1. **Metadata** (`version`, `layoutMode`): Kiểm soát phiên bản (hỗ trợ nâng cấp từ dạng cuộn dọc `STACK` lên kéo thả tự do `FREE_CANVAS` mà không bị lỗi tương thích).
2. **Global Tokens** (`theme`, `effects`): Chứa màu sắc chủ đạo, font chữ, nhạc nền, hiệu ứng rơi phủ màn hình (hoa hồng, tuyết, trái tim).
3. **Component Tree** (`blocks` / `sections`): Mảng danh sách các khối giao diện kèm thuộc tính riêng (`props`) và vị trí (`layout`).

### B. Component Registry (Từ điển ánh xạ ở Frontend)
Là trái tim của Frontend. Đây là một bảng ánh xạ (Hash Map) kết nối giữa tên định danh dạng chuỗi (ví dụ: `type: "HERO"`) trong JSON với React Component thực tế (`<HeroBlock />`), kết hợp kỹ thuật **Lazy Loading** để tối ưu hóa dung lượng tải trang.

### C. Renderer Engine (Bộ máy kết xuất đệ quy)
Là một Component vòng lặp nhận đầu vào là mảng `blocks` từ JSON, tra cứu trong Component Registry và vẽ từng Component ra màn hình kèm theo `props` tương ứng. Nếu một Component có chứa các Component con bên trong (`children`), Renderer sẽ gọi đệ quy chính nó.

### D. Visual Editor / State Mutator (Bộ máy chỉnh sửa)
Là giao diện dành cho người tạo nội dung. Bản chất kỹ thuật của Editor không phải là sửa trực tiếp lên DOM, mà là các hàm thao tác trên cây JSON (CRUD JSON Node):
- Thêm / Xóa phần tử trong mảng `blocks`.
- Đổi chỗ các phần tử (Drag & Drop Reordering).
- Thay đổi giá trị bên trong `props` hoặc `layout` ($x, y, w, h$) và kích hoạt Renderer vẽ lại theo thời gian thực (Live Preview).

### E. Schema Validator & Storage (Tầng lưu trữ & Bảo vệ ở Backend)
- **Storage**: Sử dụng PostgreSQL với kiểu dữ liệu `JSONB` (lưu trữ dưới dạng nhị phân, hỗ trợ đánh Index GIN để truy vấn sâu bên trong JSON cực nhanh).
- **Validator**: Kiểm tra tính hợp lệ của JSON trước khi lưu vào Database và kiểm soát phân quyền tính năng (**Feature Gating** - ví dụ: chặn lưu nếu tài khoản gói cơ bản cố tình chèn block RSVP của gói VIP vào JSON).

---

## 3. Đánh Giá Ưu Điểm & Nhược Điểm

| Tiêu chí | Ưu điểm (Pros) | Nhược điểm & Thách thức (Cons) |
| :--- | :--- | :--- |
| **Khả năng mở rộng** | **Cực kỳ linh hoạt**: Tạo hàng trăm mẫu template mới chỉ bằng cách thêm các bản ghi JSON vào Database mà không cần viết thêm code hay build/deploy lại Frontend. | **Chi phí thiết kế ban đầu cao**: Tốn thời gian quy hoạch cấu trúc JSON Schema và viết bộ khung Editor/Renderer lúc mới khởi tạo dự án. |
| **Tùy biến người dùng** | **Cá nhân hóa 100%**: Cho phép người dùng tự thêm/bớt khối, đổi thứ tự, kéo thả vị trí, đổi màu sắc/font chữ theo ý thích. | **Rủi ro lệch phiên bản (Schema Drift)**: Khi sửa code của một Component ở FE (đổi tên prop), các bản ghi JSON cũ đã lưu trong DB có thể bị lỗi hiển thị nếu không quản lý version. |
| **Hiệu năng (Performance)** | **Dễ dàng cache**: Toàn bộ cục JSON có thể cache trên Redis hoặc CDN (Cloudflare) vì toàn bộ trang chỉ là một chuỗi văn bản tĩnh. | **Nguy cơ phình to Bundle Size**: Nếu import tĩnh tất cả Component vào Registry, trình duyệt sẽ phải tải cả những Component không dùng đến (Bắt buộc phải giải quyết bằng `React.lazy`). |
| **Quản lý gói cước (SaaS)** | **Dễ làm Paywall / Feature Gating**: Chỉ cần kiểm tra xem mảng JSON có chứa các `type` hoặc `effects` thuộc danh mục trả phí hay không. | **Bảo mật (XSS Injection)**: Dữ liệu từ JSON được đẩy thẳng ra giao diện; nếu không lọc kỹ các chuỗi văn bản hoặc URL, người dùng xấu có thể chèn mã độc JavaScript. |

---

## 4. Hướng Dẫn Triển Khai Thực Tế (Next.js + Spring Boot)

Dưới đây là khung code chuẩn (*Production-ready*) kết hợp **Next.js (TypeScript)** và **Java Spring Boot 3**:

### Bước 1: Định nghĩa JSON Schema chuẩn (TypeScript Interfaces)

Thiết kế cấu trúc hỗ trợ sẵn cả chế độ xếp chồng (`STACK`) cho MVP và chế độ tọa độ (`FREE_CANVAS`) để nâng cấp sau này:

```typescript
// types/schema.ts
export type LayoutMode = 'STACK' | 'FREE_CANVAS';

export interface ElementLayout {
  x?: number;
  y?: number;
  width?: number | string;
  height?: number | string;
  zIndex?: number;
  rotation?: number;
}

export interface UIBlock {
  id: string;
  type: 'HERO' | 'COUNTDOWN' | 'MAP' | 'GALLERY' | 'WISHES';
  isHidden?: boolean;
  layout?: ElementLayout; // Dùng khi nâng cấp lên kéo thả tự do
  props: Record<string, any>; // Dữ liệu riêng của từng block
}

export interface PageSchema {
  version: number;
  layoutMode: LayoutMode;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    headingFont: string;
    bodyFont: string;
  };
  effects: {
    fallingType: 'NONE' | 'PETALS' | 'SNOW' | 'HEARTS';
    musicUrl?: string;
  };
  blocks: UIBlock[];
}
```

---

### Bước 2: Xây dựng Component Registry & Renderer ở Frontend (Next.js)

Sử dụng `next/dynamic` (hoặc `React.lazy`) để đảm bảo thiệp dùng block nào thì chỉ tải code của block đó:

```typescript
// components/renderer/ComponentRegistry.tsx
import dynamic from 'next/dynamic';
import React from 'react';

const Skeleton = () => <div className="h-32 w-full animate-pulse bg-gray-100 rounded-md my-2" />;

export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  HERO: dynamic(() => import('./blocks/HeroBlock'), { loading: () => <Skeleton /> }),
  COUNTDOWN: dynamic(() => import('./blocks/CountdownBlock'), { loading: () => <Skeleton /> }),
  MAP: dynamic(() => import('./blocks/MapBlock'), { loading: () => <Skeleton /> }),
  GALLERY: dynamic(() => import('./blocks/GalleryBlock'), { loading: () => <Skeleton /> }),
  WISHES: dynamic(() => import('./blocks/WishesBlock'), { loading: () => <Skeleton /> }),
};
```

```typescript
// components/renderer/PageRenderer.tsx
import React from 'react';
import { PageSchema } from '@/types/schema';
import { COMPONENT_REGISTRY } from './ComponentRegistry';

export const PageRenderer = ({ schema }: { schema: PageSchema }) => {
  const { theme, layoutMode, blocks } = schema;

  return (
    <div
      style={{
        backgroundColor: theme.backgroundColor,
        '--primary-color': theme.primaryColor,
        fontFamily: theme.bodyFont,
      } as React.CSSProperties}
      className="relative max-w-[420px] mx-auto min-h-screen shadow-2xl overflow-hidden"
    >
      {blocks.map((block) => {
        if (block.isHidden) return null;
        const Component = COMPONENT_REGISTRY[block.type];
        if (!Component) return null;

        // Nếu ở chế độ kéo thả tự do (Giai đoạn nâng cao)
        if (layoutMode === 'FREE_CANVAS' && block.layout) {
          return (
            <div
              key={block.id}
              style={{
                position: 'absolute',
                left: `${block.layout.x}px`,
                top: `${block.layout.y}px`,
                width: `${block.layout.width}px`,
                height: `${block.layout.height}px`,
                zIndex: block.layout.zIndex ?? 1,
                transform: `rotate(${block.layout.rotation ?? 0}deg)`,
              }}
            >
              <Component {...block.props} theme={theme} />
            </div>
          );
        }

        // Chế độ xếp chồng mặc định (Giai đoạn MVP)
        return (
          <section key={block.id} className="w-full">
            <Component {...block.props} theme={theme} />
          </section>
        );
      })}
    </div>
  );
};
```

---

### Bước 3: Thiết kế State Management cho Editor (Dùng Zustand)

Khi làm trình chỉnh sửa, dùng Zustand giúp code gọn hơn Redux hoặc Context API rất nhiều và tránh re-render thừa:

```typescript
// store/useEditorStore.ts
import { create } from 'zustand';
import { PageSchema, UIBlock } from '@/types/schema';

interface EditorState {
  schema: PageSchema;
  selectedBlockId: string | null;
  selectBlock: (id: string | null) => void;
  updateBlockProps: (blockId: string, newProps: Record<string, any>) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  schema: initialDefaultSchema,
  selectedBlockId: null,

  selectBlock: (id) => set({ selectedBlockId: id }),

  updateBlockProps: (blockId, newProps) =>
    set((state) => ({
      schema: {
        ...state.schema,
        blocks: state.schema.blocks.map((b) =>
          b.id === blockId ? { ...b, props: { ...b.props, ...newProps } } : b
        ),
      },
    })),

  reorderBlocks: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.schema.blocks);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { schema: { ...state.schema, blocks: result } };
    }),
}));
```

---

### Bước 4: Xử lý lưu trữ JSONB ở Backend (Java Spring Boot 3 + Hibernate 6)

Từ Spring Boot 3 (Hibernate 6) trở đi, bạn không cần cài thêm thư viện ngoài như `hypersistence-utils` nữa, chỉ cần dùng trực tiếp annotation `@JdbcTypeCode(SqlTypes.JSON)` để map thẳng một Object Java sang cột JSONB của PostgreSQL:

```java
// entity/Invitation.java
package com.example.wedding.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "invitations")
@Data
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String slug;

    @Enumerated(EnumType.STRING)
    private InvitationStatus status = InvitationStatus.DRAFT;

    // Map trực tiếp cấu trúc PageSchema sang cột JSONB trong PostgreSQL
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_schema", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> contentSchema;
}
```

---

## 5. Các Nguyên Tắc "Sống Còn" Khi Đưa Lên Production

### 1. Luôn đặt giá trị mặc định (Default Props Fallback)
Trong mỗi Block Component ở Frontend, luôn gán giá trị mặc định cho mọi biến:
```typescript
const { title = "Tên Cô Dâu & Chú Rể", textColor = "#000000" } = props;
```
> Điều này đảm bảo dù JSON trong DB bị thiếu trường dữ liệu thì trang web vẫn hiển thị bình thường, không bao giờ bị văng lỗi trắng trang (*White Screen of Death*).

### 2. Bảo vệ luồng hiển thị bằng `<ErrorBoundary>`
Bọc từng khối `<Component />` bên trong một React `ErrorBoundary`. Nếu 1 block (ví dụ block Bản đồ) bị lỗi dữ liệu, chỉ duy nhất block đó bị ẩn đi, 4 block còn lại của chiếc thiệp vẫn hoạt động bình thường.

### 3. Không lưu ảnh dạng Base64 vào trong JSON
Tuyệt đối không cho phép Editor nhét chuỗi ảnh `data:image/png;base64,...` vào trong cục JSON vì sẽ làm bản ghi JSONB nặng hàng chục MB, gây nghẽn Database và RAM của Spring Boot. Bắt buộc upload ảnh lên Cloudflare R2 / S3 trước, lấy đường link URL ngắn gọn rồi mới gắn vào JSON.