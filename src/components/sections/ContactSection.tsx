'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';
import { TestimonialMarquee } from '@/components/testimonials/TestimonialMarquee';
import {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_TESTIMONIALS,
  type CmsTestimonial,
  type SiteSettings,
} from '@/lib/cms-types';

const GREETINGS = [
  { id: 'en', word: 'hi.' },
  { id: 'kn', word: 'ನಮಸ್ಕಾರ.' },
  { id: 'hi', word: 'नमस्ते.' },
  { id: 'ml', word: 'നമസ്കാരം.' },
  { id: 'ta', word: 'வணக்கம்.' },
  { id: 'te', word: 'నమస్కారం.' },
];

export function ContactSection({
  settings = DEFAULT_SITE_SETTINGS,
  testimonials = DEFAULT_TESTIMONIALS,
}: {
  settings?: SiteSettings;
  testimonials?: CmsTestimonial[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % GREETINGS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const current = GREETINGS[index];

  return (
    <section className="contact section" id="contact">
      <div className="section-kicker" style={{ marginBottom: '24px' }}>
        <span>{settings.testimonials_kicker}</span>
      </div>
      <div className="contact-testimonials-viewport">
        <TestimonialMarquee items={testimonials} />
      </div>

      <div className="section-kicker" style={{ marginTop: 'clamp(36px, 5vh, 60px)' }}>
        <span>{settings.contact_kicker}</span>
      </div>
      <div className="contact-grid">
        <div className="contact-headline-col">
          <h2>
            <span className="contact-greeting-wrapper">
              <em key={current.id} className="contact-greeting-rotator">
                {current.word}
              </em>
            </span>
            <span className="big-arrow" aria-hidden="true">
              <ArrowUpRight strokeWidth={1.8} />
            </span>
          </h2>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
