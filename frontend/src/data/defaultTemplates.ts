import { PageSchema } from '@/types/schema';

export interface TemplateDefinition {
  id: string;
  category: 'wedding' | 'birthday' | 'event';
  title: string;
  style: string;
  views: string;
  likes: string;
  badge: 'Miễn phí' | 'VIP';
  categoryLabel: string;
  imageUrl: string;
  description: string;
  defaultData: {
    groomName: string;
    brideName: string;
    groomPhone: string;
    bridePhone: string;
    eventDate: string;
    eventTime: string;
    venueName: string;
    venueAddress: string;
    coverImageUrl: string;
  };
  schema: PageSchema;
}

export const DEFAULT_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'hb04-basic',
    category: 'wedding',
    title: 'Giao diện HB04 - Basic',
    style: 'Tươi sáng & Thanh lịch',
    views: '6.6k',
    likes: '142',
    badge: 'Miễn phí',
    categoryLabel: 'Cưới',
    imageUrl: '/templates/hb04/assets/75c863c2-a372-4fca-8fa5-335d3a30795e-full.webp',
    description:
      'Giao diện thiết kế tươi sáng mát mẻ, tạo cảm giác dễ chịu, vui vẻ cho người xem. Nơi lưu giữ kỷ niệm tuyệt vời cho dâu rể.',
    defaultData: {
      groomName: 'Hà Văn Bách',
      brideName: 'Lưu Khánh Ly',
      groomPhone: '0988 123 456',
      bridePhone: '0977 654 321',
      eventDate: '2026-12-25',
      eventTime: '16:00',
      venueName: 'Tư Gia Nhà Trai - Thôn Trong',
      venueAddress: 'Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang',
      coverImageUrl: '/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp',
    },
    schema: {
      version: 1,
      layoutMode: 'STACK',
      theme: {
        primaryColor: '#A80606',
        backgroundColor: '#FFFFFF',
        headingFont: 'serif',
        bodyFont: 'sans-serif',
      },
      effects: {
        fallingType: 'PETALS',
        musicUrl: '/templates/hb04/audio/4360425c-05a9-4611-8ba7-45da2c47ab1d.mp3',
        openingEffect: {
          enabled: true,
          leftImage: '/templates/hb04/opening/left-thiep.webp',
          rightImage: '/templates/hb04/opening/right-thiep.webp',
          delayMs: 1200,
        },
      },
      blocks: [
        {
          id: 'hero-1',
          type: 'HERO',
          props: {
            title: 'SAVE THE DATE',
            subtitle: 'Trân trọng kính mời quý khách đến dự lễ thành hôn của',
            groomName: 'Văn Bách',
            brideName: 'Khánh Ly',
            eventDate: '25 . 12 . 2026',
            coverImageUrl: '/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp',
          },
        },
        {
          id: 'couple-1',
          type: 'COUPLE',
          props: {
            sectionTitle: 'Chú Rể & Cô Dâu',
            quote:
              'Hôn nhân không phải là nơi thuyền tình cập bến, mà là nơi hai người quyết định cùng giăng buồm vượt sóng ra khơi.',
            groom: {
              name: 'Hà Văn Bách',
              role: 'GROOM',
              photoUrl: '/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp',
              fatherName: 'Hà Văn Nam',
              motherName: 'Bùi Thị Như',
              address: 'Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang',
              storyQuote:
                'Anh chưa từng nghĩ mình có thể dành nhiều cảm xúc cho một người đến thế, rồi anh nhận ra điều đó khi gặp và yêu em. Yêu em và chung đôi bên cạnh em là cảm giác tuyệt vời nhất đối với anh.',
            },
            bride: {
              name: 'Lưu Khánh Ly',
              role: 'BRIDE',
              photoUrl: '/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp',
              fatherName: 'Lưu Hoàng Hải',
              motherName: 'Đỗ Thị Hảo',
              address: 'Xã Tam Dị, Huyện Lục Nam, Tỉnh Bắc Giang',
              storyQuote:
                'Có điều này chắc chắn anh chưa bao giờ nghĩ tới, đó là lúc chúng ta mới bắt đầu em đã biết mình sẽ về chung một nhà. Ở thời điểm phù hợp nhất, mặc lên người bộ váy cưới đẹp nhất, gả cho người đáng tin cậy nhất, người đó chỉ có thể… là anh.',
            },
          },
        },
        {
          id: 'countdown-1',
          type: 'COUNTDOWN',
          props: {
            title: 'Cùng Đếm Ngược Ngày Chung Đôi',
            description: 'Từng giây từng phút hướng về ngày hạnh phúc nhất của hai đứa mình',
            targetDate: '2026-12-25T16:00:00',
          },
        },
        {
          id: 'events-1',
          type: 'EVENTS',
          props: {
            title: 'Sự Kiện Cưới',
            groomEvents: [
              {
                title: 'Tiệc Cưới Nhà Trai',
                timeText: 'Vào Lúc 16:00 Thứ Bảy',
                dateText: 'Ngày 24/12/2026',
                locationName: 'Tư Gia Nhà Trai',
                address: 'Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang',
                illustrationUrl: '/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp',
              },
              {
                title: 'Lễ Thành Hôn',
                timeText: 'Vào Lúc 16:00 Thứ Bảy',
                dateText: 'Ngày 24/12/2026',
                locationName: 'Tư Gia Nhà Trai',
                address: 'Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang',
                illustrationUrl: '/templates/hb04/assets/74f60f44-0ddd-4624-a57b-864692d07b67-full.webp',
              },
            ],
            brideEvents: [
              {
                title: 'Tiệc Cưới Nhà Gái',
                timeText: 'Vào Lúc 16:00 Thứ Bảy',
                dateText: 'Ngày 24/12/2026',
                locationName: 'Tư Gia Nhà Gái',
                address: 'Xã Tam Dị, Huyện Lục Nam, Tỉnh Bắc Giang',
                illustrationUrl: '/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp',
              },
              {
                title: 'Lễ Vu Quy',
                timeText: 'Vào Lúc 16:00 Thứ Bảy',
                dateText: 'Ngày 24/12/2026',
                locationName: 'Tư Gia Nhà Gái',
                address: 'Xã Tam Dị, Huyện Lục Nam, Tỉnh Bắc Giang',
                illustrationUrl: '/templates/hb04/assets/74f60f44-0ddd-4624-a57b-864692d07b67-full.webp',
              },
            ],
          },
        },
        {
          id: 'gallery-1',
          type: 'GALLERY',
          props: {
            title: 'Album Ảnh Cưới',
            subtitle: 'Khoảnh khắc ngọt ngào ghi dấu tình yêu đôi lứa',
            images: [
              '/templates/hb04/assets/21f2743d-5a44-43b0-ab13-41653668eefb-full.webp',
              '/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp',
              '/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp',
              '/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp',
              '/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp',
              '/templates/hb04/assets/125452c0-c29d-4f76-a9a9-ce5a1bc158c9-full.webp',
              '/templates/hb04/assets/75c863c2-a372-4fca-8fa5-335d3a30795e-full.webp',
              '/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp',
            ],
          },
        },
        {
          id: 'giftbox-1',
          type: 'GIFTBOX',
          props: {
            title: 'Hộp Mừng Cưới',
            subtitle: 'Gửi món quà chúc phúc cho ngày vui của chúng mình',
            groomAccount: {
              ownerName: 'HÀ VĂN BÁCH',
              bankName: 'MB Bank (Quân Đội)',
              accountNumber: '0988123456',
              qrCodeUrl: '/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp',
              label: 'Mừng Cưới Chú Rể',
            },
            brideAccount: {
              ownerName: 'LƯU KHÁNH LY',
              bankName: 'Techcombank',
              accountNumber: '190366889988',
              qrCodeUrl: '/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp',
              label: 'Mừng Cưới Cô Dâu',
            },
          },
        },
        {
          id: 'thankyou-1',
          type: 'THANKYOU',
          props: {
            title: 'Thank You',
            message:
              'Chân thành cảm ơn gia đình, bạn bè và tất cả những ai đã cùng tụi mình viết nên một ngày đáng nhớ. Sự hiện diện và yêu thương của mọi người là món quà quý giá nhất.',
            imageUrl: '/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp',
          },
        },
        {
          id: 'wishes-1',
          type: 'WISHES',
          props: {
            title: 'Sổ Lưu Bút & Lời Chúc',
            subtitle: 'Hãy gửi những lời chúc tốt đẹp nhất tới cô dâu & chú rể',
            allowRsvp: true,
          },
        },
      ],
    },
  },
  {
    id: '145',
    category: 'wedding',
    title: 'Giao diện HB04 - Basic (meHappy #145)',
    style: 'Tươi sáng & Thanh lịch',
    views: '8.2k',
    likes: '235',
    badge: 'Miễn phí',
    categoryLabel: 'Cưới',
    imageUrl: '/templates/hb04/assets/75c863c2-a372-4fca-8fa5-335d3a30795e-full.webp',
    description:
      'Bản mẫu thiệp cưới HB04 trích xuất trực tiếp từ meHappy #145. Nơi lưu giữ kỷ niệm ngày cưới tuyệt vời cho Hà Văn Bách & Lưu Khánh Ly.',
    defaultData: {
      groomName: 'Hà Văn Bách',
      brideName: 'Lưu Khánh Ly',
      groomPhone: '0988 123 456',
      bridePhone: '0977 654 321',
      eventDate: '2026-12-25',
      eventTime: '16:00',
      venueName: 'Tư Gia Nhà Trai - Thôn Trong',
      venueAddress: 'Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang',
      coverImageUrl: '/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp',
    },
    schema: {
      version: 1,
      layoutMode: 'STACK',
      theme: {
        primaryColor: '#A80606',
        backgroundColor: '#FFFFFF',
        headingFont: 'serif',
        bodyFont: 'sans-serif',
      },
      effects: {
        fallingType: 'PETALS',
        musicUrl: '/templates/hb04/audio/4360425c-05a9-4611-8ba7-45da2c47ab1d.mp3',
        openingEffect: {
          enabled: true,
          leftImage: '/templates/hb04/opening/left-thiep.webp',
          rightImage: '/templates/hb04/opening/right-thiep.webp',
          delayMs: 1200,
        },
      },
      blocks: [
        {
          id: 'hero-145',
          type: 'HERO',
          props: {
            title: 'SAVE THE DATE',
            subtitle: 'Trân trọng kính mời quý khách đến dự lễ thành hôn của',
            groomName: 'Văn Bách',
            brideName: 'Khánh Ly',
            eventDate: '25 . 12 . 2026',
            coverImageUrl: '/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp',
          },
        },
        {
          id: 'couple-145',
          type: 'COUPLE',
          props: {
            sectionTitle: 'Chú Rể & Cô Dâu',
            quote:
              'Hôn nhân không phải là nơi thuyền tình cập bến, mà là nơi hai người quyết định cùng giăng buồm vượt sóng ra khơi.',
            groom: {
              name: 'Hà Văn Bách',
              role: 'GROOM',
              photoUrl: '/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp',
              fatherName: 'Hà Văn Nam',
              motherName: 'Bùi Thị Như',
              address: 'Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang',
              storyQuote:
                'Anh chưa từng nghĩ mình có thể dành nhiều cảm xúc cho một người đến thế, rồi anh nhận ra điều đó khi gặp và yêu em. Yêu em và chung đôi bên cạnh em là cảm giác tuyệt vời nhất đối với anh.',
            },
            bride: {
              name: 'Lưu Khánh Ly',
              role: 'BRIDE',
              photoUrl: '/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp',
              fatherName: 'Lưu Hoàng Hải',
              motherName: 'Đỗ Thị Hảo',
              address: 'Xã Tam Dị, Huyện Lục Nam, Tỉnh Bắc Giang',
              storyQuote:
                'Có điều này chắc chắn anh chưa bao giờ nghĩ tới, đó là lúc chúng ta mới bắt đầu em đã biết mình sẽ về chung một nhà. Ở thời điểm phù hợp nhất, mặc lên người bộ váy cưới đẹp nhất, gả cho người đáng tin cậy nhất, người đó chỉ có thể… là anh.',
            },
          },
        },
        {
          id: 'countdown-145',
          type: 'COUNTDOWN',
          props: {
            title: 'Cùng Đếm Ngược Ngày Chung Đôi',
            description: 'Từng giây từng phút hướng về ngày hạnh phúc nhất của hai đứa mình',
            targetDate: '2026-12-25T16:00:00',
          },
        },
        {
          id: 'events-145',
          type: 'EVENTS',
          props: {
            title: 'Sự Kiện Cưới',
            groomEvents: [
              {
                title: 'Tiệc Cưới Nhà Trai',
                timeText: 'Vào Lúc 16:00 Thứ Bảy',
                dateText: 'Ngày 24/12/2026',
                locationName: 'Tư Gia Nhà Trai',
                address: 'Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang',
                illustrationUrl: '/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp',
              },
              {
                title: 'Lễ Thành Hôn',
                timeText: 'Vào Lúc 16:00 Thứ Bảy',
                dateText: 'Ngày 24/12/2026',
                locationName: 'Tư Gia Nhà Trai',
                address: 'Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang',
                illustrationUrl: '/templates/hb04/assets/74f60f44-0ddd-4624-a57b-864692d07b67-full.webp',
              },
            ],
            brideEvents: [
              {
                title: 'Tiệc Cưới Nhà Gái',
                timeText: 'Vào Lúc 16:00 Thứ Bảy',
                dateText: 'Ngày 24/12/2026',
                locationName: 'Tư Gia Nhà Gái',
                address: 'Xã Tam Dị, Huyện Lục Nam, Tỉnh Bắc Giang',
                illustrationUrl: '/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp',
              },
              {
                title: 'Lễ Vu Quy',
                timeText: 'Vào Lúc 16:00 Thứ Bảy',
                dateText: 'Ngày 24/12/2026',
                locationName: 'Tư Gia Nhà Gái',
                address: 'Xã Tam Dị, Huyện Lục Nam, Tỉnh Bắc Giang',
                illustrationUrl: '/templates/hb04/assets/74f60f44-0ddd-4624-a57b-864692d07b67-full.webp',
              },
            ],
          },
        },
        {
          id: 'gallery-145',
          type: 'GALLERY',
          props: {
            title: 'Album Ảnh Cưới',
            subtitle: 'Khoảnh khắc ngọt ngào ghi dấu tình yêu đôi lứa',
            images: [
              '/templates/hb04/assets/21f2743d-5a44-43b0-ab13-41653668eefb-full.webp',
              '/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp',
              '/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp',
              '/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp',
              '/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp',
              '/templates/hb04/assets/125452c0-c29d-4f76-a9a9-ce5a1bc158c9-full.webp',
              '/templates/hb04/assets/75c863c2-a372-4fca-8fa5-335d3a30795e-full.webp',
              '/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp',
            ],
          },
        },
        {
          id: 'giftbox-145',
          type: 'GIFTBOX',
          props: {
            title: 'Hộp Mừng Cưới',
            subtitle: 'Gửi món quà chúc phúc cho ngày vui của chúng mình',
            groomAccount: {
              ownerName: 'HÀ VĂN BÁCH',
              bankName: 'MB Bank (Quân Đội)',
              accountNumber: '0988123456',
              qrCodeUrl: '/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp',
              label: 'Mừng Cưới Chú Rể',
            },
            brideAccount: {
              ownerName: 'LƯU KHÁNH LY',
              bankName: 'Techcombank',
              accountNumber: '190366889988',
              qrCodeUrl: '/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp',
              label: 'Mừng Cưới Cô Dâu',
            },
          },
        },
        {
          id: 'thankyou-145',
          type: 'THANKYOU',
          props: {
            title: 'Thank You',
            message:
              'Chân thành cảm ơn gia đình, bạn bè và tất cả những ai đã cùng tụi mình viết nên một ngày đáng nhớ. Sự hiện diện và yêu thương của mọi người là món quà quý giá nhất.',
            imageUrl: '/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp',
          },
        },
        {
          id: 'wishes-145',
          type: 'WISHES',
          props: {
            title: 'Sổ Lưu Bút & Lời Chúc',
            subtitle: 'Hãy gửi những lời chúc tốt đẹp nhất tới cô dâu & chú rể',
            allowRsvp: true,
          },
        },
      ],
    },
  },
  {
    id: 'mn01-nature',
    category: 'wedding',
    title: 'MN01 - Cây Cối Ngoại Cảnh',
    style: 'Ngoại cảnh Lãng mạn',
    views: '3.4k',
    likes: '98',
    badge: 'VIP',
    categoryLabel: 'Cưới',
    imageUrl:
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
    description: 'Hòa quyện với thiên nhiên xanh mướt, tone rêu olive mộc mạc và gần gũi.',
    defaultData: {
      groomName: 'Bảo Hoàng',
      brideName: 'Thu Trang',
      groomPhone: '0912 345 678',
      bridePhone: '0987 654 321',
      eventDate: '2026-11-20',
      eventTime: '17:30',
      venueName: 'The Deck Saigon Riverside Garden',
      venueAddress: '38 Nguyễn Ư Dĩ, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
      coverImageUrl:
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    },
    schema: {
      version: 1,
      layoutMode: 'STACK',
      theme: {
        primaryColor: '#2e5a44',
        backgroundColor: '#f6f8f5',
        headingFont: 'serif',
        bodyFont: 'sans-serif',
      },
      effects: {
        fallingType: 'NONE',
      },
      blocks: [
        {
          id: 'hero-2',
          type: 'HERO',
          props: {
            title: 'WE ARE GETTING MARRIED',
            subtitle: 'Khoảnh khắc bắt đầu một hành trình yêu thương bất tận',
            groomName: 'Bảo Hoàng',
            brideName: 'Thu Trang',
            eventDate: '20 . 11 . 2026',
            coverImageUrl:
              'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
          },
        },
        {
          id: 'countdown-2',
          type: 'COUNTDOWN',
          props: {
            title: 'Thời Gian Đếm Ngược',
            description: 'Hẹn gặp mọi người trong buổi hoàng hôn lãng mạn',
            targetDate: '2026-11-20T17:30:00',
          },
        },
        {
          id: 'location-2',
          type: 'LOCATION',
          props: {
            ceremonyVenue: 'The Deck Saigon Riverside Garden',
            address: '38 Nguyễn Ư Dĩ, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
            eventTime: '17:30 - Thứ Sáu, 20/11/2026',
            mapUrl: 'https://maps.google.com/?q=The+Deck+Saigon',
          },
        },
        {
          id: 'wishes-2',
          type: 'WISHES',
          props: {
            title: 'Gửi Gắm Lời Yêu Thương',
            subtitle: 'Mỗi lời chúc từ bạn là niềm hạnh phúc lớn lao của chúng mình',
            allowRsvp: true,
          },
        },
      ],
    },
  },
  {
    id: 'da01-luxury',
    category: 'wedding',
    title: 'DA01 - Hoàng Gia Cổ Điển',
    style: 'Vàng Kim Luxury',
    views: '5.1k',
    likes: '210',
    badge: 'VIP',
    categoryLabel: 'Cưới',
    imageUrl:
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
    description: 'Phong cách tiệc cưới quý tộc lộng lẫy với ánh kim xa hoa và đẳng cấp tuyệt đối.',
    defaultData: {
      groomName: 'Minh Trí',
      brideName: 'Khánh Linh',
      groomPhone: '0903 555 777',
      bridePhone: '0908 666 888',
      eventDate: '2027-01-18',
      eventTime: '18:00',
      venueName: 'GEM Center - Grand Ballroom',
      venueAddress: '08 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP. Hồ Chí Minh',
      coverImageUrl:
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    },
    schema: {
      version: 1,
      layoutMode: 'STACK',
      theme: {
        primaryColor: '#b8860b',
        backgroundColor: '#fffdf9',
        headingFont: 'serif',
        bodyFont: 'sans-serif',
      },
      effects: {
        fallingType: 'HEARTS',
      },
      blocks: [
        {
          id: 'hero-3',
          type: 'HERO',
          props: {
            title: 'THE ROYAL WEDDING',
            subtitle: 'Trân trọng kính mời quý khách tham dự dạ tiệc cưới của',
            groomName: 'Minh Trí',
            brideName: 'Khánh Linh',
            eventDate: '18 . 01 . 2027',
            coverImageUrl:
              'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
          },
        },
        {
          id: 'countdown-3',
          type: 'COUNTDOWN',
          props: {
            title: 'Đếm Ngược Giờ Vàng Khai Tiệc',
            description: 'Đêm tiệc hoàng gia tôn vinh tình yêu đôi lứa',
            targetDate: '2027-01-18T18:00:00',
          },
        },
        {
          id: 'location-3',
          type: 'LOCATION',
          props: {
            ceremonyVenue: 'GEM Center - Grand Ballroom',
            address: '08 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP. Hồ Chí Minh',
            eventTime: '18:00 - Thứ Hai, 18/01/2027',
            mapUrl: 'https://maps.google.com/?q=GEM+Center+Nguyen+Binh+Khiem',
          },
        },
        {
          id: 'wishes-3',
          type: 'WISHES',
          props: {
            title: 'Lưu Bút Hạnh Phúc',
            subtitle: 'Kính chúc quý khách một buổi tối trọn vẹn niềm vui',
            allowRsvp: true,
          },
        },
      ],
    },
  },
];
