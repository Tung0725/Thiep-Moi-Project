import { create } from 'zustand';
import { PageSchema, ThemeConfig, EffectsConfig } from '@/types/schema';

/**
 * Zustand Editor State Store (Khung quản lý trạng thái màn hình Editor)
 */
interface EditorState {
  schema: PageSchema | null;
  selectedBlockId: string | null;
  setSchema: (schema: PageSchema) => void;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  updateEffects: (effects: Partial<EffectsConfig>) => void;
  updateBlockProps: (blockId: string, props: Record<string, unknown>) => void;
  moveBlock: (blockId: string, direction: 'UP' | 'DOWN') => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  schema: null,
  selectedBlockId: null,

  setSchema: (schema) => set({ schema }),

  updateTheme: (theme) =>
    set((state) => (state.schema ? { schema: { ...state.schema, theme: { ...state.schema.theme, ...theme } } } : state)),

  updateEffects: (effects) =>
    set((state) => (state.schema ? { schema: { ...state.schema, effects: { ...state.schema.effects, ...effects } } } : state)),

  updateBlockProps: (blockId, props) =>
    set((state) => {
      if (!state.schema) return state;
      const blocks = state.schema.blocks.map((b) => (b.id === blockId ? { ...b, props: { ...b.props, ...props } } : b));
      return { schema: { ...state.schema, blocks } };
    }),

  moveBlock: (blockId, direction) =>
    set((state) => {
      if (!state.schema) return state;
      const blocks = [...state.schema.blocks];
      const idx = blocks.findIndex((b) => b.id === blockId);
      if (idx === -1) return state;
      const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= blocks.length) return state;
      const [moved] = blocks.splice(idx, 1);
      blocks.splice(targetIdx, 0, moved);
      return { schema: { ...state.schema, blocks } };
    }),
}));
