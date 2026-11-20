'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  BankAccountInfo, CoupleBlockProps, EventsBlockProps, GalleryBlockProps,
  GiftBoxBlockProps, HeroBlockProps, PageSchema, SingleEventItem,
  ThankYouBlockProps, UIBlock, WishesBlockProps,
} from '@/types/schema';
import { BackgroundMusic } from '@/components/common/BackgroundMusic';
import { FallingEffects } from '@/components/common/FallingEffects';
import WishesBlock from './Wishes';
import styles from './styles.module.css';

const ASSETS = '/templates/minimalism-do-dam/archive/images/';
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function eventDate(value: string): Date | null {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const display = value.match(/(\d{1,2})\s*[./]\s*(\d{1,2})\s*[./]\s*(\d{4})/);
  const vietnamese = value.match(/(\d{1,2})\s+Tháng\s+(\d{1,2})\s+Năm\s+(\d{4})/i);
  const parts = display || vietnamese;
  if (!iso && !parts) return null;
  const date = iso ? new Date(+iso[1], +iso[2] - 1, +iso[3])
    : new Date(+parts![3], +parts![2] - 1, +parts![1]);
  return Number.isNaN(date.getTime()) ? null : date;
}

function displayDate(value: string): string {
  return eventDate(value)?.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) || value;
}

/**
 * Native Minimalism invitation: renders editable PageSchema blocks using archived artwork.
 * Props: schema, public slug, preview width and embedded editor mode.
 * State: envelope opening, gallery photo, gift dialog and clipboard feedback.
 */
export default function MinimalismRenderer({ schema, slug, embedded = false, containerClassName }: {
  schema: PageSchema;
  slug?: string;
  embedded?: boolean;
  containerClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(embedded);
  const [photo, setPhoto] = useState<string | null>(null);
  const [giftOpen, setGiftOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const photoDialog = useRef<HTMLDialogElement>(null);
  const giftDialog = useRef<HTMLDialogElement>(null);
  const blocks = schema.blocks.filter(block => !block.isHidden);
  const hero = blocks.find(block => block.type === 'HERO')?.props as unknown as HeroBlockProps | undefined;
  const gifts = blocks.find(block => block.type === 'GIFTBOX')?.props as unknown as GiftBoxBlockProps | undefined;
  const gallery = blocks.find(block => block.type === 'GALLERY')?.props as unknown as GalleryBlockProps | undefined;

  useEffect(() => {
    if (photo) photoDialog.current?.showModal();
    else photoDialog.current?.close();
  }, [photo]);

  useEffect(() => {
    if (giftOpen) giftDialog.current?.showModal();
    else giftDialog.current?.close();
  }, [giftOpen]);

  const movePhoto = (direction: number) => {
    const images = gallery?.images || [];
    if (!images.length) return;
    const current = photo ? images.indexOf(photo) : 0;
    setPhoto(images[(current + direction + images.length) % images.length]);
  };

  const copyAccount = async (account: BankAccountInfo) => {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopyMessage('Đã sao chép số tài khoản.');
    } catch {
      setCopyMessage('Không thể sao chép. Bạn có thể chọn số tài khoản bên trên.');
    }
  };

  const renderEvent = (props: EventsBlockProps) => {
    const isBanquet = Boolean(props.receptionTime || props.timeline?.length);
    const events = [...props.groomEvents, ...props.brideEvents];
    return (
      <section className={styles.event}>
        {/* Ceremony and banquet dates */}
        {isBanquet && <h2 className={styles.sectionTitle}>{props.title}</h2>}
        {events.map((event: SingleEventItem, index) => {
          const date = eventDate(event.dateText);
          const time = event.timeText.match(/\d{1,2}:\d{2}/)?.[0] || event.timeText;
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.locationName} ${event.address}`)}`;
          const firstDay = date ? (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7 : 0;
          const days = date ? new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() : 0;
          return (
            <div key={event.id || index} className={styles.eventDetails}>
              <p className={styles.eventHeading}>{event.title}</p>
              {!isBanquet && <h3>{event.locationName}</h3>}
              <p className={styles.eventTime}>{isBanquet ? time : `VÀO LÚC ${time}`}</p>
              {date ? (
                <div className={styles.dateRow}>
                  <span>{date.toLocaleDateString('vi-VN', { weekday: 'long' })}</span>
                  <strong>{String(date.getDate()).padStart(2, '0')}</strong>
                  <span>THÁNG {String(date.getMonth() + 1).padStart(2, '0')}<br />{date.getFullYear()}</span>
                </div>
              ) : <p>{event.dateText}</p>}
              {isBanquet && (
                <>
                  {/* Reception schedule and wedding calendar */}
                  <div className={styles.reception}>
                    <p>ĐÓN KHÁCH<strong>{props.receptionTime}</strong></p>
                    <p>KHAI TIỆC<strong>{time}</strong></p>
                  </div>
                  {date && (
                    <div className={styles.calendar} aria-label={`Lịch cưới ${displayDate(event.dateText)}`}>
                      <p>Tháng {date.getMonth() + 1} / {date.getFullYear()}</p>
                      <div className={styles.calendarGrid}>
                        {WEEKDAYS.map(day => <span key={day}>{day}</span>)}
                        {Array.from({ length: firstDay }, (_, day) => <span key={`empty-${day}`} />)}
                        {Array.from({ length: days }, (_, day) => (
                          <span key={day} className={day + 1 === date.getDate() ? styles.weddingDay : undefined}>
                            {day + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <a className={styles.button} href="#minimalism-wishes">XÁC NHẬN THAM DỰ</a>
                  <div className={styles.venue}>
                    <p>TIỆC CƯỚI SẼ TỔ CHỨC TẠI</p>
                    <h3>{event.locationName}</h3>
                    <p>{event.address}</p>
                    <a className={styles.button} href={mapUrl} target="_blank" rel="noreferrer">Chỉ đường ↗</a>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {/* Dress code and wedding timeline */}
        {props.dressCodeColors?.length ? (
          <div className={styles.dressCode}>
            <h2>DRESS CODE</h2>
            <p>Trang phục dự tiệc</p>
            <div>{props.dressCodeColors.map(color => <span key={color} style={{ backgroundColor: color }} aria-label={color} />)}</div>
          </div>
        ) : null}
        {props.timeline?.length ? (
          <div className={styles.timeline}>
            <h2>LỊCH TRÌNH NGÀY CƯỚI</h2>
            {props.timeline.map((item, index) => (
              <div key={`${item.time}-${index}`}><time>{item.time}</time><span /> <p>{item.label}</p></div>
            ))}
          </div>
        ) : null}
      </section>
    );
  };

  const renderBlock = (block: UIBlock) => {
    switch (block.type) {
      case 'HERO': {
        const props = block.props as unknown as HeroBlockProps;
        return (
          <section className={styles.hero}>
            {/* Polaroid cover and couple names */}
            <p className={styles.saveDate}>{props.title}</p>
            <div className={styles.heroArtwork}>
              <img className={styles.heroFlowers} src={`${ASSETS}flower2-decoration.webp`} alt="" />
              <button className={styles.polaroid} onClick={() => setPhoto(props.coverImageUrl)} aria-label="Phóng to ảnh cưới">
                <img src={props.coverImageUrl} alt={`${props.groomName} và ${props.brideName}`} />
              </button>
              <img className={styles.heroEnvelope} src={`${ASSETS}envelope-cover.webp`} alt="" />
            </div>
            <h1 className={styles.names}>{props.groomName}<span>&amp;</span>{props.brideName}</h1>
          </section>
        );
      }
      case 'COUPLE': {
        const props = block.props as unknown as CoupleBlockProps;
        return (
          <section className={styles.family}>
            {/* Two families and marriage announcement */}
            <h2 className={styles.sectionTitle}>{props.sectionTitle}</h2>
            <div className={styles.parents}>
              {[props.groom, props.bride].map(person => (
                <div key={person.role}><p>Ông Bà</p><strong>{person.fatherName}</strong><strong>{person.motherName}</strong><p>{person.address}</p></div>
              ))}
            </div>
            <p className={styles.announcement}>TRÂN TRỌNG BÁO TIN<br />LỄ THÀNH HÔN CỦA CON CHÚNG TÔI</p>
            <h3>{props.groom.name}</h3><p>TRƯỞNG NAM</p>
            <span className={styles.ampersand}>&amp;</span>
            <h3>{props.bride.name}</h3><p>ÚT NỮ</p>
          </section>
        );
      }
      case 'EVENTS': return renderEvent(block.props as unknown as EventsBlockProps);
      case 'GALLERY': {
        const props = block.props as unknown as GalleryBlockProps;
        return (
          <section className={styles.album}>
            {/* Photo album with accessible lightbox */}
            <h2>{props.title}</h2>
            {props.images?.length ? <div className={styles.photos}>
              {props.images.map((image, index) => <button key={`${image}-${index}`} onClick={() => setPhoto(image)} aria-label={`Xem ảnh cưới ${index + 1}`}><img src={image} alt={`Ảnh cưới ${index + 1}`} loading="lazy" /></button>)}
            </div> : <p>Album ảnh đang được chuẩn bị.</p>}
          </section>
        );
      }
      case 'WISHES': return <div id="minimalism-wishes" className={styles.wishes}><WishesBlock {...block.props as WishesBlockProps} slug={slug} /></div>;
      case 'GIFTBOX': return (
        <section className={styles.gift}>
          {/* Wedding gift envelope */}
          <h2>{(block.props as GiftBoxBlockProps).title}</h2>
          <button onClick={() => { setCopyMessage(''); setGiftOpen(true); }} aria-label="Mở hộp quà mừng cưới">
            <img src={`${ASSETS}envelope-cover.webp`} alt="Phong bì mừng cưới" loading="lazy" />
            <span>Nhấn để mở</span>
          </button>
        </section>
      );
      case 'THANKYOU': {
        const props = block.props as unknown as ThankYouBlockProps;
        return <section className={styles.thankyou}><h2>{props.title}</h2><p>{props.message}</p><img src={`${ASSETS}flower2-decoration.webp`} alt="" loading="lazy" /></section>;
      }
      default: return null;
    }
  };

  return (
    <main className={`${styles.invitation} ${containerClassName || ''} mx-auto w-full`} style={{ maxWidth: 430, '--template-primary': schema.theme.primaryColor, '--paper': schema.theme.backgroundColor, '--heading-font': schema.theme.headingFont, '--body-font': schema.theme.bodyFont } as React.CSSProperties}>
      {/* Opening invitation cover */}
      {!isOpen ? (
        <section className={styles.opening}>
          <div className={styles.openingPaper}>
            <img className={styles.openingFlowers} src={`${ASSETS}flower2-decoration.webp`} alt="" />
            <span className={styles.seal} aria-hidden="true">囍</span>
            <h1>{hero?.groomName}<span>&amp;</span>{hero?.brideName}</h1>
            <p className={styles.ornament} aria-hidden="true">― ❦ ―</p>
            <p>{displayDate(hero?.eventDate || '')}</p>
            <p className={styles.invited}>Thân Mời</p>
            <button className={styles.openButton} onClick={() => setIsOpen(true)}>Mở thiệp</button>
          </div>
        </section>
      ) : (
        <div className={styles.content}>
          {/* Schema driven invitation sections */}
          {blocks.map(block => <React.Fragment key={block.id}>{renderBlock(block)}</React.Fragment>)}
          {schema.effects.musicUrl && <BackgroundMusic musicUrl={schema.effects.musicUrl} embedded={embedded} />}
          {schema.effects.fallingType !== 'NONE' && <FallingEffects type={schema.effects.fallingType} embedded={embedded} />}
        </div>
      )}

      {/* Photo lightbox */}
      <dialog ref={photoDialog} className={styles.photoDialog} onCancel={() => setPhoto(null)} onClick={event => { if (event.target === event.currentTarget) setPhoto(null); }}>
        <button className={styles.close} onClick={() => setPhoto(null)} aria-label="Đóng ảnh">×</button>
        {photo && <img src={photo} alt="Ảnh cưới phóng to" />}
        <div className={styles.photoControls}><button onClick={() => movePhoto(-1)} aria-label="Ảnh trước">‹</button><button onClick={() => movePhoto(1)} aria-label="Ảnh tiếp theo">›</button></div>
      </dialog>

      {/* Gift accounts and QR downloads */}
      <dialog ref={giftDialog} className={styles.giftDialog} onCancel={() => setGiftOpen(false)}>
        <header><h2>{gifts?.title}</h2><button onClick={() => setGiftOpen(false)} aria-label="Đóng hộp quà">×</button></header>
        <div className={styles.accounts}>
          {[gifts?.groomAccount, gifts?.brideAccount].filter((account): account is BankAccountInfo => Boolean(account)).map(account => (
            <div key={`${account.bankName}-${account.accountNumber}`}>
              <h3>{account.label} - {account.ownerName}</h3>
              {account.qrCodeUrl && <img src={account.qrCodeUrl} alt={`Mã QR ${account.label}`} />}
              <p>{account.bankName}</p><p>{account.accountNumber}</p><strong>{account.ownerName}</strong>
              <div><a href={account.qrCodeUrl} download={`${account.accountNumber}.png`} className={styles.button}>Lưu QR</a><button className={styles.button} onClick={() => copyAccount(account)}>Sao chép STK</button></div>
            </div>
          ))}
          {!gifts?.groomAccount && !gifts?.brideAccount && <p>Thông tin mừng cưới chưa được thiết lập.</p>}
          <p role="status">{copyMessage}</p>
        </div>
      </dialog>
    </main>
  );
}
