import { ImageResponse } from 'next/og';

export const alt = 'UIC — Unique Identity Craft | Creative Brand, Web, ERP & NFC Studio';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0C0E',
          color: '#EDE7DC',
          padding: '64px 72px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '1px solid rgba(44, 255, 5, 0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: '#2CFF05',
                letterSpacing: -3,
              }}
            >
              uic
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#2CFF05',
              }}
            >
              ®
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 16,
              letterSpacing: 3,
              color: '#9BA39A',
              textTransform: 'uppercase',
            }}
          >
            UNIQUE IDENTITY CRAFT
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -2,
              color: '#EDE7DC',
            }}
          >
            Forging digital presence that refuses to be overlooked.
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#A9B0A6',
              lineHeight: 1.4,
            }}
          >
            Brand Identity · Web Experiences · ERP Systems · UIC Connect NFC Cards
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(237, 231, 220, 0.16)',
            paddingTop: '24px',
            fontSize: 18,
            color: '#2CFF05',
          }}
        >
          <span>UIC STUDIO · DIGITAL & CONNECTED SYSTEMS</span>
          <span>uic / connect</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

