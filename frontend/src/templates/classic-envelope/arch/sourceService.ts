import { invitationService } from '@/services/invitationService';
import qrAssets from './qr-assets.json';

interface SourceRsvp {
  name?: string;
  attending: 'yes' | 'no';
  guestCount?: number;
  message?: string;
  rsvpAnswers?: Record<string, unknown>;
}

/** Routes the preserved source form through the project's public invitation API. */
export const sourceService = {
  mapEmbed(data: { address?: string; mapAddress?: string; latitude?: number; longitude?: number }) {
    const query = data.mapAddress || data.address || (data.latitude !== undefined && data.longitude !== undefined ? `${data.latitude},${data.longitude}` : '');
    return query ? `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : null;
  },
  async request(input: string | URL | Request, init?: RequestInit): Promise<Response> {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, window.location.origin);
    if (url.pathname === '/api/qr-png') {
      const asset = (qrAssets as Record<string, string>)[url.searchParams.get('d') || ''];
      if (!asset) throw new Error('Chưa có ảnh QR cho thông tin tài khoản này.');
      return fetch(asset, init);
    }
    const match = url.pathname.match(/^\/api\/invitations\/([^/]+)\/rsvp$/);
    if (match && init?.method === 'POST') {
      const payload = JSON.parse(String(init.body)) as SourceRsvp;
      if (!['yes', 'no'].includes(payload.attending)) throw new Error('Vui lòng chọn trạng thái tham dự.');
      if (payload.rsvpAnswers && Object.keys(payload.rsvpAnswers).length) throw new Error('Mẫu hiện chưa hỗ trợ câu hỏi RSVP bổ sung.');
      try {
        if (match[1] === 'song-hy-demo') {
          const key = 'song-hy:demo-rsvp';
          const responses = JSON.parse(window.localStorage.getItem(key) || '[]');
          const response = { ...payload, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
          window.localStorage.setItem(key, JSON.stringify([...responses, response].slice(-20)));
          return Response.json({ success: true, stored: false, guest: response });
        }
        const wish = await invitationService.submitWish(decodeURIComponent(match[1]), {
          guestName: payload.name?.trim() || '',
          attendanceStatus: payload.attending === 'yes' ? 'ATTENDING' : 'DECLINED',
          guestCount: payload.attending === 'yes' ? Math.max(1, payload.guestCount || 1) : 0,
          message: payload.message,
        });
        window.dispatchEvent(new CustomEvent('song-hy:response-saved', { detail: { slug: decodeURIComponent(match[1]) } }));
        return Response.json({ success: true, guest: wish });
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : 'Không thể lưu phản hồi.' }, { status: 400 });
      }
    }
    if (/\/ai-wishes$/.test(url.pathname)) {
      return Response.json({ success: true, wishes: [
        'Chúc hai bạn trăm năm hạnh phúc, luôn yêu thương và đồng hành cùng nhau!',
        'Chúc gia đình nhỏ luôn bình an và ngập tràn tiếng cười!',
        'Chúc hai bạn một đời viên mãn, cùng nhau sẻ chia mọi niềm vui!',
        'Chúc ngày vui của hai bạn thật trọn vẹn và đáng nhớ!',
        'Chúc hai bạn mãi giữ được tình yêu và sự thấu hiểu dành cho nhau!',
      ] });
    }
    if (url.origin === window.location.origin && url.pathname.startsWith('/templates/song-hy-xanh/archive/')) {
      return fetch(url, init);
    }
    throw new Error(`Dịch vụ nguồn chưa được hỗ trợ: ${url.pathname}`);
  },
};
