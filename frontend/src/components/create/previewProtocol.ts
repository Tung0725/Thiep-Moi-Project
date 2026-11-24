import { PageSchema } from '@/types/schema';

export const PREVIEW_READY_EVENT = 'INVITATION_PREVIEW_READY';
export const PREVIEW_SYNC_EVENT = 'INVITATION_PREVIEW_SYNC';
export const PREVIEW_SCROLL_TOP_EVENT = 'INVITATION_PREVIEW_SCROLL_TOP';
export const PREVIEW_REPLAY_OPENING_EVENT = 'INVITATION_PREVIEW_REPLAY_OPENING';
export const PREVIEW_SELECT_PHOTO_EVENT = 'INVITATION_PREVIEW_SELECT_PHOTO';
export const PREVIEW_FOCUS_PHOTO_EVENT = 'INVITATION_PREVIEW_FOCUS_PHOTO';

export interface PhotoSlotReference {
  id: string;
  url: string;
}

export interface PreviewSyncMessage {
  type: typeof PREVIEW_SYNC_EVENT;
  schema: PageSchema;
  slug: string;
  interactiveEdit?: boolean;
  photoSlotMap?: PhotoSlotReference[];
}

export interface PreviewFocusPhotoMessage {
  type: typeof PREVIEW_FOCUS_PHOTO_EVENT;
  slotId: string;
  url?: string;
}

export interface PreviewSelectPhotoMessage {
  type: typeof PREVIEW_SELECT_PHOTO_EVENT;
  slotId: string;
}

export interface PreviewControlMessage {
  type:
    | typeof PREVIEW_READY_EVENT
    | typeof PREVIEW_SCROLL_TOP_EVENT
    | typeof PREVIEW_REPLAY_OPENING_EVENT;
}

export type PreviewFrameMessage =
  | PreviewSyncMessage
  | PreviewFocusPhotoMessage
  | PreviewSelectPhotoMessage
  | PreviewControlMessage;
