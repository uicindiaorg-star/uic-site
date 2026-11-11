import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/cms-types';

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function safeHex(val: string | undefined, fallback: string): string {
  return val && HEX_COLOR_RE.test(val.trim()) ? val.trim() : fallback;
}

export function SiteThemeStyle({
  settings = DEFAULT_SITE_SETTINGS,
}: {
  settings?: SiteSettings;
}) {
  const d = DEFAULT_SITE_SETTINGS;
  const css = `:root {
  --accent: ${safeHex(settings.color_accent, d.color_accent)};
  --paper: ${safeHex(settings.color_paper, d.color_paper)};
  --ink: ${safeHex(settings.color_ink, d.color_ink)};
  --muted: ${safeHex(settings.color_muted, d.color_muted)};
  --portal-bg: ${safeHex(settings.color_dark_bg, d.color_dark_bg)};
  --portal-bone: ${safeHex(settings.color_dark_text, d.color_dark_text)};
  --portal-lime: ${safeHex(settings.color_accent, d.color_accent)};
  --header-bg: ${safeHex(settings.color_header_bg, d.color_header_bg)};
  --header-text: ${safeHex(settings.color_header_text, d.color_header_text)};
  --footer-bg: ${safeHex(settings.color_footer_bg, d.color_footer_bg)};
  --footer-text: ${safeHex(settings.color_footer_text, d.color_footer_text)};
  --work-bg: ${safeHex(settings.color_work_bg, d.color_work_bg)};
  --nfc-bg: ${safeHex(settings.color_nfc_bg, d.color_nfc_bg)};
  --contact-bg: ${safeHex(settings.color_contact_bg, d.color_contact_bg)};
}`;

  return <style id="uic-cms-theme">{css}</style>;
}

