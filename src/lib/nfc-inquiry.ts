export const NFC_INQUIRY_STORAGE_KEY = 'uic_nfc_inquiry_draft';

export interface NfcInquiryDraft {
  intent: 'design' | 'physical_order';
  cardName: string;
  isCustomName: boolean;
  role: string;
  brand: string;
  styleName: string;
  layoutVariant: string;
  fontVariant: string;
  finishName: string;
  cardColor: string;
  textColor: string;
  cornerRadius: number;
  artworkName: string;
}

export function saveNfcInquiryDraft(draft: NfcInquiryDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(NFC_INQUIRY_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage quota / privacy mode restrictions
  }
}

export function readNfcInquiryDraft(): NfcInquiryDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(NFC_INQUIRY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<NfcInquiryDraft>;
    if (!parsed || typeof parsed !== 'object' || !parsed.styleName) return null;
    return parsed as NfcInquiryDraft;
  } catch {
    return null;
  }
}

export function clearNfcInquiryDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(NFC_INQUIRY_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function formatNfcDraftMessage(draft: NfcInquiryDraft): string {
  const header =
    draft.intent === 'physical_order'
      ? 'Physical NFC Card Order Request'
      : 'Custom NFC Card Design Inquiry';

  return [
    `[${header}]`,
    `Style: ${draft.styleName} (${draft.layoutVariant} / ${draft.fontVariant}, radius ${draft.cornerRadius}px)`,
    `Finish & Colors: ${draft.finishName} (${draft.cardColor}) · Text Ink: ${draft.textColor}`,
    `Name on Card: ${draft.cardName}`,
    `Title / Tagline: ${draft.role || 'None'}`,
    `Brand / Company: ${draft.brand}`,
    `Artwork / Texture: ${draft.artworkName || 'None'}`,
    '',
    'Notes / Quantity / Delivery details:',
  ].join('\n');
}

