import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0C0E',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2CFF05',
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: -0.5,
          border: '1px solid #2CFF05',
        }}
      >
        uic
      </div>
    ),
    {
      ...size,
    }
  );
}

