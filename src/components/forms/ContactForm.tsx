'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, CreditCard, X } from 'lucide-react';
import {
  clearNfcInquiryDraft,
  formatNfcDraftMessage,
  readNfcInquiryDraft,
  type NfcInquiryDraft,
} from '@/lib/nfc-inquiry';
import { FormInput } from './FormInput';
import { FormTextarea } from './FormTextarea';
import { ServiceSelector } from './ServiceSelector';
import styles from './ContactForm.module.css';

const SERVICES = [
  'Brand & identity',
  'Websites & experiences',
  'ERP & business systems',
  'NFC & connected products',
  'A little of everything',
];

interface SubmittedBrief {
  name: string;
  email: string;
  service: string;
  time: string;
}

export function ContactForm() {
  const [submittedBrief, setSubmittedBrief] = useState<SubmittedBrief | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [service, setService] = useState('Brand & identity');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [nfcDraft, setNfcDraft] = useState<NfcInquiryDraft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const applyDraft = () => {
      const draft = readNfcInquiryDraft();
      if (!draft) return;
      setNfcDraft(draft);
      setService('NFC & connected products');
      if (draft.isCustomName && draft.cardName) {
        setSenderName((prev) => prev || draft.cardName);
      }
      setMessage((prev) => (prev.trim() ? prev : formatNfcDraftMessage(draft)));
    };

    const rafId = window.requestAnimationFrame(applyDraft);
    const readInterest = () => {
      setService('NFC & connected products');
      applyDraft();
    };
    window.addEventListener('uic:interest', readInterest);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('uic:interest', readInterest);
    };
  }, []);

  function dismissNfcDraft() {
    clearNfcInquiryDraft();
    setNfcDraft(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmittedBrief(null);

    const name = senderName.trim();
    const email = senderEmail.trim();
    const selectedService = service.trim();
    const note = message.trim();

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          service: selectedService,
          message: note,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setSubmitError(
          result.error ?? 'Could not send your inquiry right now. Please try again.'
        );
        return;
      }

      setSubmittedBrief({
        name,
        email,
        service: selectedService,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      clearNfcInquiryDraft();
      setNfcDraft(null);
      setSenderName('');
      setSenderEmail('');
      setMessage('');
      setService('Brand & identity');
    } catch {
      setSubmitError('Network error while sending your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      id="contact-form"
      className={styles.formCard}
      onSubmit={submit}
      aria-label="Prepare project brief"
    >
      <div className={styles.cardHeader} aria-hidden="true">
        <div className={styles.brandMark}>
          uic<span>®</span>
        </div>
        <span className={styles.cardType}>
          {nfcDraft
            ? nfcDraft.intent === 'physical_order'
              ? 'NFC PHYSICAL ORDER · INTAKE'
              : 'NFC CUSTOM DESIGN · INTAKE'
            : 'PROJECT BRIEF · INTAKE'}
        </span>
        <span className={styles.signal}>)))</span>
      </div>

      {nfcDraft ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '10px 14px',
            marginBottom: 18,
            borderRadius: 10,
            background: 'rgba(44, 255, 5, 0.08)',
            border: '1px solid rgba(44, 255, 5, 0.28)',
            fontSize: 12,
            color: '#EDE7DC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <CreditCard size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Attached NFC Card: <strong>{nfcDraft.styleName}</strong> · {nfcDraft.finishName} (
              {nfcDraft.cardColor}) — <strong>{nfcDraft.cardName}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={dismissNfcDraft}
            aria-label="Clear attached NFC card details"
            style={{
              background: 'transparent',
              border: 0,
              color: 'rgba(237, 231, 220, 0.72)',
              cursor: 'pointer',
              display: 'inline-flex',
              padding: 4,
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      <div className={styles.row}>
        <FormInput
          name="name"
          label="Your name"
          placeholder="How should we call you?"
          autoComplete="name"
          required
          maxLength={120}
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
        />
        <FormInput
          name="email"
          label="Email address"
          type="email"
          placeholder="Where can we reach you?"
          autoComplete="email"
          required
          maxLength={254}
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
        />
      </div>

      <ServiceSelector
        name="service"
        label="What do you have in mind?"
        options={SERVICES}
        selected={service}
        onSelect={setService}
      />

      <FormTextarea
        name="message"
        label="A little about your project"
        placeholder="Your idea, ambition, timeline, or challenge…"
        rows={nfcDraft ? 8 : 3}
        required
        maxLength={5000}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
        <span>{isSubmitting ? 'Sending inquiry…' : 'Send inquiry'}</span>
        <span className={styles.buttonArrow} aria-hidden="true">
          <ArrowUpRight size={17} strokeWidth={2.4} />
        </span>
      </button>

      {submitError ? (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorHeader}>Could not send inquiry</div>
          <div className={styles.errorDetails}>{submitError}</div>
        </div>
      ) : null}

      {submittedBrief ? (
        <div className={styles.successBanner} role="status">
          <div className={styles.successHeader}>
            <span className={styles.successIcon}>
              <Check size={12} strokeWidth={3} />
            </span>
            <span>Inquiry received at {submittedBrief.time}</span>
          </div>
          <div className={styles.successDetails}>
            Thank you, <strong>{submittedBrief.name}</strong>. We received your note for{' '}
            <em>{submittedBrief.service}</em> and will reply to {submittedBrief.email}.
          </div>
        </div>
      ) : null}

      <p className={styles.note}>
        Your inquiry is sent directly to UIC.
      </p>
    </form>
  );
}
