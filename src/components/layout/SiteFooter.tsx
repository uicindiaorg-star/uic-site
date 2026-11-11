import { Fragment } from 'react';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/cms-types';

function renderLines(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => (
    <Fragment key={`${line}-${idx}`}>
      {line}
      {idx < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

export function SiteFooter({
  settings = DEFAULT_SITE_SETTINGS,
}: {
  settings?: SiteSettings;
}) {
  return (
    <footer>
      <a className="logo" href="#top">
        {settings.logo_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.logo_image_url}
            alt={settings.logo_text || 'Brand logo'}
            className="logo-img"
          />
        ) : (
          <>
            {settings.logo_text || 'uic'}
            {settings.logo_mark ? <span>{settings.logo_mark}</span> : null}
          </>
        )}
      </a>
      <p>{renderLines(settings.footer_tagline)}</p>
      <span>
        © <span>{new Date().getFullYear()}</span> {settings.footer_copyright || 'UIC'}
      </span>
      <a href="#top">{settings.footer_top_label || 'BACK TO TOP ↑'}</a>
    </footer>
  );
}
