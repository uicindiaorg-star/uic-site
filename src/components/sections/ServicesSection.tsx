import { ChevronDown } from 'lucide-react';
import { DEFAULT_SERVICES, type CmsService } from '@/lib/cms-types';

export function ServicesSection({
  services = DEFAULT_SERVICES,
}: {
  services?: CmsService[];
}) {
  return (
    <section className="services section" id="services">
      <div className="section-kicker">
        <span>THE WHOLE PICTURE. EVERY DETAIL.</span>
      </div>
      <div className="services-grid">
        <div>
          <h2>
            One studio.
            <br />
            <em>Many possibilities.</em>
          </h2>
          <p>
            From the first impression to the systems
            <br />
            behind it, we connect the dots.
          </p>
          <a className="pill" href="#contact">
            Find your starting point{' '}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="6" y1="18" x2="18" y2="6" />
              <polyline points="9 6 18 6 18 15" />
            </svg>
          </a>
        </div>
        <div className="service-list">
          {services.map((service) => (
            <details key={service.id} open={service.is_default_open}>
              <summary>
                <span>{service.number_label}</span> {service.title}
                <ChevronDown
                  className="service-expand-icon"
                  size={18}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
              </summary>
              <div>
                <p>{service.description}</p>
                <small>{service.tags}</small>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
