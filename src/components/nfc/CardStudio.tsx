'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, RotateCw, Check } from 'lucide-react';
import {
  DEFAULT_NFC_FINISHES,
  DEFAULT_NFC_STYLES,
  DEFAULT_SITE_SETTINGS,
  type CmsNfcStyle,
  type NfcFinishPreset,
  type SiteSettings,
} from '@/lib/cms-types';
import { saveNfcInquiryDraft } from '@/lib/nfc-inquiry';
import styles from './CardStudio.module.css';

function renderLines(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => (
    <Fragment key={`${line}-${idx}`}>
      {line}
      {idx < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

function customFinish(hex: string) {
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return { name: 'Custom', background: hex, ink: luminance > 0.179 ? '#000000' : '#ffffff' };
}

export function CardStudio({
  settings = DEFAULT_SITE_SETTINGS,
  cardStyles = DEFAULT_NFC_STYLES,
}: {
  settings?: SiteSettings;
  cardStyles?: CmsNfcStyle[];
}) {
  const router = useRouter();
  const finishes: NfcFinishPreset[] =
    Array.isArray(settings.nfc_finishes_json) && settings.nfc_finishes_json.length > 0
      ? settings.nfc_finishes_json
      : DEFAULT_NFC_FINISHES;
  const availableStyles: CmsNfcStyle[] =
    cardStyles.length > 0 ? cardStyles : DEFAULT_NFC_STYLES;

  const initialStyle =
    availableStyles.find((s) => s.layout_variant === 'orbit') ?? availableStyles[0];

  const [finish, setFinish] = useState(finishes[0]);
  const [hexInput, setHexInput] = useState(finishes[0].background);
  const validHex = /^#[0-9a-f]{6}$/i.test(hexInput);
  const [selectedStyleId, setSelectedStyleId] = useState<string | number>(initialStyle.id);
  const activeStyle =
    availableStyles.find((s) => String(s.id) === String(selectedStyleId)) ?? availableStyles[0];
  const [name, setName] = useState('John Honai');
  const [role, setRole] = useState('Designer & creative thinker');
  const [brand, setBrand] = useState('John Studio');
  const [flipped, setFlipped] = useState(false);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const frontRef = useRef<HTMLSpanElement>(null);
  const backRef = useRef<HTMLSpanElement>(null);
  const [artwork, setArtwork] = useState<{ name: string; url: string } | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [opacity, setOpacity] = useState(70);
  const [position, setPosition] = useState(50);
  const [fit, setFit] = useState('cover');
  const [ink, setInk] = useState('auto');
  const uploadVersion = useRef(0);
  useEffect(
    () => () => {
      uploadVersion.current += 1;
    },
    [],
  );
  const displayName = name.trim() || 'Your name';
  const displayBrand = brand.trim() || 'Your brand';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
  const textColor = ink === 'auto' ? finish.ink : ink;
  const effectiveArtworkUrl = artwork?.url || activeStyle.artwork_url || '';
  const colors = {
    '--card-color': finish.background,
    '--card-ink': textColor,
    '--card-radius': `${activeStyle.corner_radius ?? 16}px`,
    '--card-artwork': effectiveArtworkUrl ? `url("${effectiveArtworkUrl}")` : 'none',
    '--artwork-opacity': effectiveArtworkUrl
      ? artwork
        ? opacity / 100
        : 0.45
      : 0,
    '--artwork-position': `50% ${position}%`,
    '--artwork-size': fit,
    '--nfc-page-bg': settings.nfc_page_bg || '#f4f3ee',
    '--nfc-preview-bg': settings.nfc_preview_bg || '#e3e8da',
    '--nfc-panel-bg': settings.nfc_panel_bg || '#fffefa',
    '--nfc-page-ink': settings.nfc_page_ink || '#242c27',
  } as CSSProperties;

  async function uploadArtwork(file?: File) {
    const version = ++uploadVersion.current;
    setUploadError('');
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setUploadError('Choose a PNG, JPG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Please choose an image smaller than 5 MB.');
      return;
    }
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Unable to read image'));
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Unable to decode image'));
        image.src = url;
      });
      if (version !== uploadVersion.current) return;
      setArtwork({ name: file.name, url });
      setStatus('');
    } catch {
      if (version === uploadVersion.current)
        setUploadError('This image could not be opened. Try another PNG, JPG, or WebP.');
    }
  }

  function updateCustomColor(value: string) {
    setHexInput(value);
    if (/^#[0-9a-f]{6}$/i.test(value)) setFinish(customFinish(value.toLowerCase()));
  }

  function handleInquireWithDesign(intent: 'design' | 'physical_order') {
    saveNfcInquiryDraft({
      intent,
      cardName: displayName,
      isCustomName: name.trim().length > 0 && name.trim() !== 'John Honai',
      role: role.trim(),
      brand: displayBrand,
      styleName: activeStyle.name,
      layoutVariant: activeStyle.layout_variant,
      fontVariant: activeStyle.font_variant,
      finishName: finish.name,
      cardColor: finish.background,
      textColor,
      cornerRadius: activeStyle.corner_radius ?? 16,
      artworkName:
        artwork?.name || (activeStyle.artwork_url ? 'Custom style artwork' : 'None'),
    });
    router.push('/?nfc=1#contact');
  }

  async function downloadDesign() {
    const face = flipped ? backRef.current : frontRef.current;
    if (!face || saving) return;
    setSaving(true);
    setStatus('Preparing your card image…');
    try {
      const { toSvg } = await import('html-to-image');
      await document.fonts.ready;
      const svg = await toSvg(face, {
        width: face.offsetWidth,
        height: face.offsetHeight,
        style: {
          transform: 'none',
          position: 'relative',
          inset: 'auto',
          backfaceVisibility: 'visible',
          transition: 'none',
        },
      });
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Unable to render card'));
        image.src = svg;
      });
      const canvas = document.createElement('canvas');
      canvas.width = face.offsetWidth * 4;
      canvas.height = face.offsetHeight * 4;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image export is unavailable');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL('image/png');
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `UIC-card-${flipped ? 'back' : 'front'}.png`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setStatus('Your card PNG is ready. Flip the card to save the other side.');
    } catch {
      setStatus('The image could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.studio} style={colors}>
      <a className="skip" href="#card-studio">
        Skip to card studio
      </a>
      <header className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="UIC home">
          {settings.logo_image_url ? (
            <img
              src={settings.logo_image_url}
              alt={`${settings.logo_text || 'uic'} logo`}
              className={styles.logoImg}
            />
          ) : (
            <>
              {settings.logo_text || 'uic'}
              {settings.logo_mark ? <span>{settings.logo_mark}</span> : null}
            </>
          )}
        </Link>
        <span className={styles.productName}>{settings.nfc_page_tagline}</span>
        <Link href="/#nfc" className={styles.back} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span>Back to studio</span>
          <ArrowUpRight size={13} strokeWidth={2.2} aria-hidden="true" />
        </Link>
      </header>
      <main id="card-studio">
        <section className={styles.intro}>
          <h1>
            {settings.nfc_page_title_prefix}
            <br />
            <em>{settings.nfc_page_title_em}</em>
          </h1>
          <p className={styles.subtitle}>
            {settings.nfc_page_subtitle}
          </p>
          <span className={styles.guest}>
            Guest studio <span>•</span> No sign-up needed
          </span>
        </section>

        <section className={styles.workbench} aria-label="Customize your NFC card">
          <div className={styles.preview}>
            <div className={styles.previewTop}>
              <span>
                <i /> LIVE PREVIEW
              </span>
              <span>UIC CONNECT / 01</span>
            </div>
            <div className={styles.cardSpace}>
              <div className={styles.halo} />
              <button
                type="button"
                className={`${styles.card} ${flipped ? styles.flipped : ''}`}
                onClick={() => setFlipped(!flipped)}
                aria-label={flipped ? 'Show front of card' : 'Show back of card'}
                aria-pressed={flipped}
              >
                <span
                  ref={frontRef}
                  className={`${styles.face} ${styles[activeStyle.layout_variant] ?? styles.minimal} ${
                    activeStyle.font_variant === 'serif'
                      ? styles.fontSerif
                      : activeStyle.font_variant === 'mono'
                        ? styles.fontMono
                        : ''
                  } ${styles.front}`}
                  aria-hidden={flipped}
                >
                  <span className={styles.cardBrand}>
                    {displayBrand}
                    {activeStyle.show_signal ? <span className={styles.signal}>)))</span> : null}
                  </span>
                  <span className={styles.orbitArt} />
                  <span className={styles.monogram}>{initials}</span>
                  <span className={styles.identity}>
                    <strong>{displayName}</strong>
                    <small>{role || 'Your title or tagline'}</small>
                  </span>
                  <span className={styles.cardFooter}>
                    {activeStyle.card_footer_text}
                    <b>{activeStyle.card_badge_text}</b>
                  </span>
                </span>
                <span
                  ref={backRef}
                  className={`${styles.face} ${styles.reverse} ${
                    activeStyle.font_variant === 'serif'
                      ? styles.fontSerif
                      : activeStyle.font_variant === 'mono'
                        ? styles.fontMono
                        : ''
                  }`}
                  aria-hidden={!flipped}
                >
                  <span className={styles.cardBrand}>
                    {displayBrand}
                    {activeStyle.show_signal ? <span className={styles.signal}>)))</span> : null}
                  </span>
                  <strong>{renderLines(activeStyle.back_headline)}</strong>
                  <span className={styles.reverseMark} aria-hidden="true">
                    <ArrowUpRight size={48} strokeWidth={1.8} />
                  </span>
                  <span className={styles.cardFooter}>
                    {activeStyle.back_footer_text}
                    <b>{activeStyle.card_badge_text}</b>
                  </span>
                </span>
              </button>
            </div>
            <div className={styles.previewBottom}>
              <button
                className={styles.flipButton}
                onClick={() => setFlipped(!flipped)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCw size={13} strokeWidth={2.2} />
                <span>{flipped ? 'View front' : 'Flip card'}</span>
              </button>
              <span>
                {finish.name} / {activeStyle.name}
              </span>
            </div>
            <p className={styles.previewNote}>
              Visual concept · Final materials and print colors may vary.
            </p>
          </div>

          <div className={styles.controls}>
            <div className={styles.controlHeading}>
              <span className={styles.eyebrow}>THE DETAILS MAKE IT YOU</span>
              <h2>
                Your card. <em>Your rules.</em>
              </h2>
            </div>
            <fieldset>
              <legend>
                <span>01</span> Choose your color <small>{finish.name}</small>
              </legend>
              <div className={styles.swatches}>
                {finishes.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    aria-label={option.name}
                    aria-pressed={finish.name === option.name}
                    onClick={() => {
                      setFinish(option);
                      setHexInput(option.background);
                    }}
                    style={{ background: option.background, color: option.ink }}
                  >
                    {finish.name === option.name ? (
                      <Check size={14} strokeWidth={2.6} />
                    ) : (
                      ''
                    )}
                  </button>
                ))}
              </div>
              <div className={styles.customColor}>
                <label>
                  Custom color
                  <input
                    type="color"
                    value={finish.background}
                    onChange={(event) => updateCustomColor(event.target.value)}
                    aria-label="Choose a custom card color"
                  />
                </label>
                <label>
                  Hex code
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(event) => updateCustomColor(event.target.value)}
                    maxLength={7}
                    spellCheck={false}
                    autoComplete="off"
                    aria-invalid={!validHex}
                    aria-describedby="color-help"
                    placeholder="#123ABC"
                  />
                </label>
              </div>
              <p id="color-help" className={styles.note}>
                {validHex
                  ? 'Choose any color. Text contrast adjusts automatically.'
                  : 'Enter # followed by six letters (A–F) or numbers. Preview keeps your last valid color.'}
              </p>
            </fieldset>
            <fieldset>
              <legend>
                <span>02</span> Add an image or texture
              </legend>
              <label className={styles.uploadLabel}>
                {artwork ? 'Replace image' : 'Upload your artwork'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  aria-label="Upload card image or texture"
                  aria-describedby="artwork-help"
                  onChange={(event) => {
                    void uploadArtwork(event.target.files?.[0]);
                    event.target.value = '';
                  }}
                />
              </label>
              <p id="artwork-help" className={styles.note}>
                PNG, JPG or WebP · Up to 5 MB. Applied to both sides. Images stay in your browser.
              </p>
              {uploadError && (
                <p className={styles.uploadError} role="alert">
                  {uploadError}
                </p>
              )}
              {artwork && (
                <div className={styles.artworkControls}>
                  <p className={styles.artworkName}>{artwork.name}</p>
                  <label>
                    Image opacity: {opacity}%
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opacity}
                      onChange={(event) => setOpacity(Number(event.target.value))}
                    />
                  </label>
                  <label>
                    Vertical position: {position}%
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={position}
                      onChange={(event) => setPosition(Number(event.target.value))}
                    />
                  </label>
                  <label>
                    Image fit
                    <select value={fit} onChange={(event) => setFit(event.target.value)}>
                      <option value="cover">Fill card</option>
                      <option value="contain">Fit whole image</option>
                    </select>
                  </label>
                  <label>
                    Text color
                    <select value={ink} onChange={(event) => setInk(event.target.value)}>
                      <option value="auto">Match card color</option>
                      <option value="#ffffff">White</option>
                      <option value="#000000">Black</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    className={styles.flipButton}
                    onClick={() => {
                      uploadVersion.current += 1;
                      setArtwork(null);
                      setUploadError('');
                      setInk('auto');
                    }}
                  >
                    Remove image
                  </button>
                  <p className={styles.note}>
                    Your uploaded artwork is included in the saved card image.
                  </p>
                </div>
              )}
            </fieldset>
            <fieldset>
              <legend>
                <span>03</span> Find your style <small>{activeStyle.name}</small>
              </legend>
              <div className={styles.layouts}>
                {availableStyles.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={String(activeStyle.id) === String(option.id)}
                    onClick={() => setSelectedStyleId(option.id)}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
              {activeStyle.description ? (
                <p className={styles.styleDescription}>{activeStyle.description}</p>
              ) : null}
              {finish.background.toLowerCase() !== activeStyle.default_bg.toLowerCase() ? (
                <button
                  type="button"
                  className={styles.flipButton}
                  style={{ marginTop: '10px', fontSize: '10px', padding: '6px 12px' }}
                  onClick={() => {
                    setFinish({
                      name: activeStyle.name,
                      background: activeStyle.default_bg,
                      ink: activeStyle.default_ink,
                    });
                    setHexInput(activeStyle.default_bg);
                  }}
                >
                  Apply {activeStyle.name} palette
                </button>
              ) : null}
            </fieldset>
            <fieldset>
              <legend>
                <span>04</span> Add your identity
              </legend>
              <label>
                Your name
                <input
                  value={name}
                  maxLength={32}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                />
              </label>
              <label>
                Title or tagline
                <input
                  value={role}
                  maxLength={48}
                  onChange={(event) => setRole(event.target.value)}
                />
              </label>
              <label>
                Brand or company
                <input
                  value={brand}
                  maxLength={28}
                  onChange={(event) => setBrand(event.target.value)}
                  autoComplete="organization"
                />
              </label>
            </fieldset>
            <button
              type="button"
              className={styles.save}
              onClick={() => handleInquireWithDesign('design')}
            >
              <span>Inquire with this NFC design</span>
              <ArrowUpRight size={15} strokeWidth={2.3} />
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 10 }}>
              <p className={styles.note} style={{ margin: 0 }}>
                Sends your color, style, and card details straight to our contact form.
              </p>
              <button
                type="button"
                className={styles.flipButton}
                onClick={downloadDesign}
                disabled={saving}
                style={{ fontSize: '10px', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                {saving ? 'Saving…' : 'Download PNG'}
              </button>
            </div>
            <p className={styles.status} role="status">
              {status}
            </p>
          </div>
        </section>

        <section className={styles.experience} aria-labelledby="tap-title">
          <div className={styles.experienceCopy}>
            <p className={styles.eyebrow}>FROM NICE CARD TO NICE TO MEET YOU</p>
            <h2 id="tap-title">
              One tap.
              <br />
              <em>You’re connected.</em>
            </h2>
            <p>
              No searching. No typing. Just bring your card near a compatible phone and open your
              digital profile.
            </p>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <strong>Make the introduction.</strong>
                  <p>Hold your card near the phone’s NFC reader.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Your world opens up.</strong>
                  <p>They open the notification to see your profile.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Keep the connection.</strong>
                  <p>Share contact details, work, and ways to reach you.</p>
                </div>
              </li>
            </ol>
            <button
              className={styles.demoButton}
              onClick={() => setConnected(!connected)}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {connected ? (
                <>
                  <span>Reset the demo</span>
                  <RotateCw size={14} strokeWidth={2.2} />
                </>
              ) : (
                <>
                  <span>Try a virtual tap</span>
                  <ArrowUpRight size={14} strokeWidth={2.2} />
                </>
              )}
            </button>
            <p className={styles.demoNote}>
              Interactive simulation. No NFC hardware required here.
            </p>
          </div>
          <div className={`${styles.demoStage} ${connected ? styles.connected : ''}`}>
            <div className={styles.wave} aria-hidden="true" />
            <div className={styles.miniCard} aria-hidden="true">
              <span>{displayBrand}</span>
              <strong>{displayName}</strong>
              <b>)))</b>
            </div>
            <div className={styles.phone}>
              <div className={styles.island} />
              <div className={styles.phoneTime}>
                9:41 <span>••• ▰</span>
              </div>
              {connected ? (
                <div className={styles.profile} key="profile">
                  <span className={styles.connectedBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Check size={12} strokeWidth={2.8} />
                    <span>CONNECTION MADE</span>
                  </span>
                  <div className={styles.avatar}>{initials}</div>
                  <h3>{displayName}</h3>
                  <p>{role}</p>
                  <span className={styles.profileBrand}>{displayBrand}</span>
                  <div className={styles.profileButton} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span>Save contact</span>
                    <ArrowUpRight size={12} strokeWidth={2.2} />
                  </div>
                  <div className={styles.profileLink} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span>Explore my work</span>
                    <ArrowUpRight size={12} strokeWidth={2.2} />
                  </div>
                  <div className={styles.profileLink} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span>Let’s connect</span>
                    <ArrowUpRight size={12} strokeWidth={2.2} />
                  </div>
                  <small>PROFILE PREVIEW · POWERED BY UIC</small>
                </div>
              ) : (
                <div className={styles.phoneIdle}>
                  <span className={styles.tapIcon}>)))</span>
                  <h3>
                    A new connection
                    <br />
                    is one tap away.
                  </h3>
                  <p>
                    Press “Try a virtual tap”
                    <br />
                    to meet your digital self.
                  </p>
                </div>
              )}
            </div>
            <div className={styles.demoStatus} role="status">
              {connected
                ? 'Your personalized profile is ready to explore.'
                : 'YOUR CARD + THEIR PHONE. THAT’S IT.'}
            </div>
          </div>
        </section>
        <section className={styles.closing}>
          <span className={styles.eyebrow}>LOOKS LIKE YOU. CONNECTS LIKE MAGIC.</span>
          <h2>
            Ready to make it <em>real?</em>
          </h2>
          <p>
            Order your physical NFC card with your customized style and details.
            <br />
            We’ll help with artwork, card options, and your digital profile.
          </p>
          <button
            type="button"
            onClick={() => handleInquireWithDesign('physical_order')}
            className={styles.demoButton}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <span>Order your physical card</span>
            <ArrowUpRight size={14} strokeWidth={2.2} />
          </button>
        </section>
      </main>
      <footer className={styles.footer}>
        <Link href="/" className={styles.logo}>
          {settings.logo_image_url ? (
            <img
              src={settings.logo_image_url}
              alt={`${settings.logo_text || 'uic'} logo`}
              className={styles.logoImg}
            />
          ) : (
            <>
              {settings.logo_text || 'uic'}
              {settings.logo_mark ? <span>{settings.logo_mark}</span> : null}
            </>
          )}
        </Link>
        <span>{settings.nfc_page_footer_tagline}</span>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span>Back to UIC</span>
          <ArrowUpRight size={13} strokeWidth={2.2} />
        </Link>
      </footer>
    </div>
  );
}
