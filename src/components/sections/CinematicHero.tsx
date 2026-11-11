'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { HairlineBridge } from '@/components/hairline/HairlineBridge';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/cms-types';

export function CinematicHero({
  settings = DEFAULT_SITE_SETTINGS,
}: {
  settings?: SiteSettings;
}) {
  const [isOpened, setIsOpened] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [cardTilt, setCardTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const [figTilt, setFigTilt] = useState({ rx: 0, ry: 0 });

  const cardRef = useRef<HTMLDivElement>(null);
  const figRef = useRef<HTMLDivElement>(null);

  // Synthesized luxury haptic chime (zero external audio files, zero lag)
  const playChime = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(1080, now + 0.14);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }, []);

  // 3D Parallax tilt tracking for the Pre-Open Business Card
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOpened) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const rx = -((y - cy) / cy) * 12;
    const ry = ((x - cx) / cx) * 15;
    const gx = (x / rect.width) * 100;
    const gy = (y / rect.height) * 100;

    setCardTilt({ rx, ry, gx, gy });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ rx: 0, ry: 0, gx: 50, gy: 50 });
  };

  // Tap business card to open portal & reveal the hero page (slow, deliberate 2s luxury transition)
  const handleCardTap = () => {
    if (isOpened) return;
    setIsTapped(true);
    playChime();

    setTimeout(() => {
      setIsOpened(true);
      window.dispatchEvent(new CustomEvent('uic:hero-open'));
    }, 320);

    setTimeout(() => {
      setIsTapped(false);
    }, 2000);
  };

  // Open portal automatically when landing on a hash target (e.g. /#contact from /nfc)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    const hasNfcParam = window.location.search.includes('nfc=');
    if (!hash && !hasNfcParam) return;

    const rafId = window.requestAnimationFrame(() => {
      setIsOpened(true);
      window.dispatchEvent(new CustomEvent('uic:hero-open'));
      if (hash) {
        const targetId = hash.slice(1);
        window.setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          window.dispatchEvent(new CustomEvent('uic:interest'));
        }, 120);
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  // Sync with document state, lock body scroll when closed, and manage scroll restoration on refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    document.documentElement.setAttribute('data-hero-opened', isOpened ? 'true' : 'false');

    const hasIncomingTarget = Boolean(window.location.hash || window.location.search.includes('nfc='));
    if (!isOpened && !hasIncomingTarget) {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpened]);

  // External trigger (e.g. from navbar clicks)
  useEffect(() => {
    const handleExternalOpen = () => {
      if (!isOpened) setIsOpened(true);
    };
    window.addEventListener('uic:hero-open', handleExternalOpen);
    return () => window.removeEventListener('uic:hero-open', handleExternalOpen);
  }, [isOpened]);

  // Natural wheel & touch swipe detection: scrolling downwards triggers the entrance transition
  useEffect(() => {
    if (isOpened) return;

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 15 && !isOpened) {
        handleCardTap();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      if (touchStartY - touchY > 30 && !isOpened) {
        handleCardTap();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpened]);

  // 3D Parallax for the Visor Figure in the opened hero section
  const handleFigMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const fig = figRef.current;
    if (!fig) return;
    const rect = fig.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = -((y - cy) / cy) * 6;
    const ry = ((x - cx) / cx) * 8;
    setFigTilt({ rx, ry });
  };

  const handleFigMouseLeave = () => {
    setFigTilt({ rx: 0, ry: 0 });
  };

  return (
    <section
      className={`noir-hero-viewport ${isOpened ? 'portal-is-open' : 'portal-is-closed'}`}
      id="top"
      aria-label="UIC Studio — Crafting presence that feels impossible to ignore"
    >
      {/* =====================================================================
          PHASE 1: PRE-OPEN BUSINESS CARD GATEWAY (The Entrance Stage)
          ===================================================================== */}
      <div
        className={`portal-card-gateway ${isOpened ? 'is-opened' : ''} ${isTapped ? 'is-tapped' : ''}`}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
      >
        {/* Faded Cinematic Skyline Artwork for Pre-Open Hero Section */}
        <div className="portal-gateway-art" aria-hidden="true">
          <img
            src="/images/hero-card-art.jpg"
            alt=""
            className="portal-gateway-art-img"
            loading="eager"
            decoding="async"
          />
          <div className="portal-gateway-art-wash" />
          <div className="portal-gateway-art-vignette" />
        </div>

        {/* Minimal Atmospheric Passing Signals */}
        <div className="portal-signal-field" aria-hidden="true">
          <div className="signal-track track-h1">
            <span className="signal-pulse pulse-lime" />
          </div>
          <div className="signal-track track-h2">
            <span className="signal-pulse pulse-bone" />
          </div>
          <div className="signal-track track-v1">
            <span className="signal-pulse pulse-lime-v" />
          </div>
          <div className="signal-track track-v2">
            <span className="signal-pulse pulse-bone-v" />
          </div>

          <div className="signal-node node-tr">
            <span className="node-dot" />
            <span className="node-ring" />
            <span className="node-label">SIG // 04.92 GHZ</span>
          </div>
          <div className="signal-node node-bl">
            <span className="node-dot dot-lime" />
            <span className="node-ring ring-lime" />
            <span className="node-label">NFC // TX ACTIVE</span>
          </div>
        </div>

        {/* Two small glowing accent dots at the centre */}
        <div className="hero-accent-dots" aria-hidden="true">
          <span className="accent-dot dot-lime" />
          <span className="accent-dot dot-bone" />
        </div>

        {/* Concentric NFC ripple waves on tap */}
        <div className={`portal-card-ripple ${isTapped ? 'active' : ''}`} aria-hidden="true">
          <div className="ripple-ring ring-1" />
          <div className="ripple-ring ring-2" />
          <div className="ripple-ring ring-3" />
        </div>

        {/* The Tilted Minimalist Luxury Business Card */}
        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          aria-label="Welcome to UIC Business Card. Tap to enter studio."
          className="hero-business-card"
          style={
            {
              '--rx': `${cardTilt.rx}deg`,
              '--ry': `${cardTilt.ry}deg`,
              '--gx': `${cardTilt.gx}%`,
              '--gy': `${cardTilt.gy}%`,
            } as React.CSSProperties
          }
          onClick={handleCardTap}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCardTap();
            }
          }}
        >


          {/* Dynamic specular light reflection sheen */}
          <div className="card-glare-layer" aria-hidden="true" />

          {/* Fine tactile micro-grain overlay */}
          <div className="card-grain-layer" aria-hidden="true" />

          {/* Interactive Hairline Secure Transaction Bridge Canvas on Card Face */}
          <HairlineBridge embedded />

          {/* Minimalist Art Details: Corner crosses */}
          <div className="card-art-cross cross-tl" aria-hidden="true">+</div>
          <div className="card-art-cross cross-tr" aria-hidden="true">+</div>
          <div className="card-art-cross cross-bl" aria-hidden="true">+</div>
          <div className="card-art-cross cross-br" aria-hidden="true">+</div>

          {/* Card Header: Brand Monogram + NFC */}
          <div className="card-top-row">
            <div className="card-brand-lockup">
              <span className="card-brand-text">uic<span>®</span></span>
            </div>

            <div className="card-nfc-mark" title="NFC Enabled">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8.5 5A12 12 0 0 1 8.5 19" />
                <path d="M12.5 8A7.5 7.5 0 0 1 12.5 16" />
                <path d="M16.5 10.5A3.5 3.5 0 0 1 16.5 13.5" />
              </svg>
            </div>
          </div>

          {/* Card Center: "Welcome to uic®" */}
          <div className="card-welcome-center">
            <span className="card-welcome-lead">Welcome to</span>
            <strong className="card-welcome-title">
              uic<span>®</span>
            </strong>
          </div>

          {/* Card Footer */}
          <div className="card-bottom-row">
            <span className="card-meta-tag">UNIQUE IDENTITY CRAFT</span>
            <span className="card-pass-code">№ 0089 // TAP PASS</span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          PHASE 2: THE NOIR-INSPIRED REVEALED HERO STAGE
          ===================================================================== */}
      <div className="noir-hero-container">
        {/* Editorial Top Content: Kicker, Headline, Copy, Dual CTAs */}
        <div className="noir-hero-content">
          <div className="noir-kicker">
            <span className="noir-kicker-dot" />
            <span className="noir-kicker-text">{settings.hero_kicker}</span>
          </div>

          <h1 className="noir-headline">
            {settings.hero_headline}
            <br />
            <span className="noir-highlight">{settings.hero_highlight}</span>
          </h1>

          <p className="noir-editorial-copy">
            {settings.hero_copy}
          </p>

          <div className="noir-cta-group">
            <a href="#contact" className="noir-btn-primary">
              <span>Start Project</span>
              <svg
                className="btn-arrow"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>

            <a href="#work" className="noir-btn-secondary">
              <span>Explore Work</span>
              <span className="btn-dot" />
            </a>
          </div>
        </div>

        {/* Lower Visual Centerpiece: Giant UIC Watermark + Cyber Visor Figure */}
        <div
          ref={figRef}
          className="noir-stage-visual"
          onMouseMove={handleFigMouseMove}
          onMouseLeave={handleFigMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${figTilt.rx}deg) rotateY(${figTilt.ry}deg)`,
          }}
        >
          {/* Monumental Transparent Watermark Letters across the lower backdrop */}
          <div className="noir-watermark-wrap" aria-hidden="true">
            <span className="watermark-letter">U</span>
            <span className="watermark-letter">I</span>
            <span className="watermark-letter">C</span>
          </div>

          {/* The Emerging Visor Figure */}
          <div className="noir-figure-wrap">
            <img
              src={settings.hero_image_url || '/images/hero-noir-figure.jpg'}
              alt="UIC Visionary"
              className="noir-figure-img"
              loading="eager"
              decoding="async"
            />
            {/* Visor Neon Flare Glow */}
            <div className="noir-visor-glow" aria-hidden="true" />
            {/* Seamless Bottom Vignette Fade */}
            <div className="noir-figure-fade" aria-hidden="true" />
          </div>
        </div>


      </div>
    </section>
  );
}
