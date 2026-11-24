import { PageSchema } from '@/types/schema';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_UPLOAD_FILE_BYTES = 10 * 1024 * 1024;
const SAFE_DATA_IMAGE_URL = /^data:image\/(?:jpeg|png|webp|avif);base64,[A-Za-z0-9+/=]+$/;

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không thể đọc tệp ảnh này. Vui lòng chọn ảnh khác.'));
    img.src = src;
  });
}

/**
 * Compresses and resizes a user-selected image file in the browser into a WebP/JPEG data URL
 * so customized wedding photos render immediately and persist in schema JSON without overflowing payloads.
 */
export async function compressImageFile(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    throw new Error('Chỉ hỗ trợ định dạng ảnh JPG, PNG hoặc WebP.');
  }
  if (file.size > MAX_UPLOAD_FILE_BYTES) {
    throw new Error('Dung lượng ảnh tối đa 10MB.');
  }

  const maxDimension = options.maxDimension ?? 1280;
  const quality = options.quality ?? 0.82;
  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await loadImageElement(objectUrl);
    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;

    if (!naturalWidth || !naturalHeight) {
      throw new Error('Ảnh không hợp lệ hoặc kích thước bằng 0.');
    }

    const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
    const targetWidth = Math.max(1, Math.round(naturalWidth * scale));
    const targetHeight = Math.max(1, Math.round(naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    const webpUrl = canvas.toDataURL('image/webp', quality);
    if (webpUrl.startsWith('data:image/webp')) {
      return webpUrl;
    }
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Validates whether a string is a safe local asset path, HTTPS URL, or compressed base64 image data URL.
 */
export function isValidImageSource(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (SAFE_DATA_IMAGE_URL.test(trimmed)) return true;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

/**
 * Extracts unique template-owned image paths from a schema for 1-click sample selection.
 */
export function extractTemplateSampleImages(schema: PageSchema): string[] {
  const candidates: string[] = [];

  for (const block of schema.blocks) {
    const props = block.props as Record<string, unknown>;
    if (block.type === 'HERO' && typeof props.coverImageUrl === 'string') {
      candidates.push(props.coverImageUrl);
    }
    if (block.type === 'COUPLE') {
      const groom = props.groom as Record<string, unknown> | undefined;
      const bride = props.bride as Record<string, unknown> | undefined;
      if (typeof groom?.photoUrl === 'string') candidates.push(groom.photoUrl);
      if (typeof bride?.photoUrl === 'string') candidates.push(bride.photoUrl);
    }
    if (block.type === 'GALLERY' && Array.isArray(props.images)) {
      for (const img of props.images) {
        if (typeof img === 'string') candidates.push(img);
      }
    }
    if (block.type === 'THANKYOU' && typeof props.imageUrl === 'string') {
      candidates.push(props.imageUrl);
    }
    if (block.type === 'SONG_HY_GREEN') {
      const data = props.data as Record<string, unknown> | undefined;
      if (typeof data?.heroPhoto === 'string') candidates.push(data.heroPhoto);
      if (Array.isArray(data?.galleryImages)) {
        for (const item of data.galleryImages) {
          if (item && typeof item === 'object' && typeof (item as { url?: unknown }).url === 'string') {
            candidates.push((item as { url: string }).url);
          }
        }
      }
    }
  }

  return Array.from(new Set(candidates.filter(Boolean))).slice(0, 8);
}
