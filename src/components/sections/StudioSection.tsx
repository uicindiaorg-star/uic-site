import { ArrowUpRight } from 'lucide-react';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/cms-types';

export function StudioSection({
  settings = DEFAULT_SITE_SETTINGS,
}: {
  settings?: SiteSettings;
}) {
  return (
    <section className="intro section" id="intro">
      <div className="section-kicker">
        <span>{settings.studio_kicker}</span>
      </div>
      <div className="intro-grid">
        <h2>
          {settings.studio_headline_prefix}{' '}
          <em>{settings.studio_headline_em}</em>
        </h2>
        <div className="intro-text">
          <p>{settings.studio_p1}</p>
          <p>{settings.studio_p2}</p>
          <a className="text-link" href="#services" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>Meet your unfair advantage</span>
            <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="principles">
        <span>Built around you.</span>
        <span>Designed to connect.</span>
        <span>Made to move forward.</span>
      </div>
    </section>
  );
}
