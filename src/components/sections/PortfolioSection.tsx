'use client';

import { useEffect, useRef, useState } from 'react';
import { projects as defaultProjects, Project } from '@/data/projects';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/cms-types';

// SVG Icons for clean, crisp vector rendering
function ArrowUpRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
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
  );
}

function ContactlessWaveIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8.5 5A12 12 0 0 1 8.5 19" />
      <path d="M12.5 8A7.5 7.5 0 0 1 12.5 16" />
      <path d="M16.5 10.5A3.5 3.5 0 0 1 16.5 13.5" />
    </svg>
  );
}

function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function PortfolioSection({
  items = defaultProjects,
  settings = DEFAULT_SITE_SETTINGS,
}: {
  items?: Project[];
  settings?: SiteSettings;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const projectList = items.length > 0 ? items : defaultProjects;
  const [selected, setSelected] = useState<Project>(projectList[0]);

  function openProject(project: Project) {
    setSelected(project);
    dialogRef.current?.showModal();
  }

  function closeProject() {
    dialogRef.current?.close();
  }

  // Horizontal Catalogue Rail Scroll & Resize Sync
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let rafId = 0;

    function sync() {
      rafId = 0;
      if (!section || !track) return;

      const innerWidth = window.innerWidth;
      const innerHeight = window.innerHeight;
      const scrollWidth = track.scrollWidth;

      // Measured at sync time so it survives resize
      const maxTravel = Math.max(0, scrollWidth - innerWidth);

      // Scroll runway distance needed to scrub through the horizontal rail comfortably
      const scrollBuffer = 380;
      const runway = maxTravel + scrollBuffer;
      section.style.height = `${innerHeight + runway}px`;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));

      if (reducedMotion.matches) {
        track.style.transform = 'none';
        return;
      }

      // Translate the row by calc(-1 * progress * (track.scrollWidth - innerWidth)), measured at sync time so it survives resize.
      track.style.transform = `translateX(calc(-1 * ${progress} * (${scrollWidth}px - ${innerWidth}px)))`;
      track.style.setProperty('--progress', String(progress));
      track.style.setProperty('--max-travel', `${maxTravel}px`);

      // Sync visual progress indicator bar
      section.style.setProperty('--catalogue-progress', `${(progress * 100).toFixed(2)}%`);
    }

    function schedule() {
      if (!rafId) {
        rafId = requestAnimationFrame(sync);
      }
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', schedule);

    // ResizeObserver guarantees recalculation whenever layout or images finish loading
    const ro = new ResizeObserver(() => schedule());
    ro.observe(track);

    sync();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', schedule);
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <section className="work-catalogue section" id="work" ref={sectionRef}>
        <div className="catalogue-sticky-stage">
          {/* Top Section Header - Clean & Minimal */}
          <div className="catalogue-header">
            <div className="catalogue-title-row">
              <div className="catalogue-title-left">
                <h2>
                  {settings.portfolio_headline_prefix}{' '}
                  <em>{settings.portfolio_headline_em}</em>
                </h2>
                <p>
                  {settings.portfolio_sub_1}
                  <br />
                  {settings.portfolio_sub_2}
                </p>
              </div>
            </div>
          </div>

          {/* Modern Horizontal Catalogue Rail Viewport */}
          <div className="catalogue-rail-viewport">
            <div
              className="catalogue-rail-track"
              ref={trackRef}
              role="region"
              aria-label="Horizontal catalogue items rail"
            >
              {projectList.map((project, idx) => (
                <article
                  key={project.id}
                  className={`catalogue-item catalogue-item-${project.id}`}
                  onClick={() => openProject(project)}
                  tabIndex={0}
                  role="button"
                  aria-haspopup="dialog"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openProject(project);
                    }
                  }}
                >
                  {/* Generated plate at 4/5 aspect */}
                  <div className="catalogue-plate">
                    {project.coverImage ? (
                      <div className="plate-media-wrap">
                        <img
                          src={project.coverImage}
                          alt={project.title}
                          className="plate-cover-img"
                          loading="lazy"
                        />
                        <div className="plate-scrim" />
                        <div className="plate-meta-top">
                          <span className="plate-index">0{idx + 1}</span>
                          <span className="plate-badge">{project.badge}</span>
                        </div>
                        <div className="plate-meta-bottom">
                          <span className="plate-client">{project.client}</span>
                          <span className="plate-arrow">
                            <ArrowUpRightIcon />
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className={`plate-generated-art plate-art-${project.id}`}>
                        {project.id === 'forma' && (
                          <div className="plate-forma-content">
                            <div className="plate-meta-top">
                              <span className="plate-index">0{idx + 1}</span>
                              <span className="plate-badge">{project.badge}</span>
                            </div>
                            <div className="plate-forma-stage">
                              <div className="plate-forma-pillars">
                                <i></i>
                                <i></i>
                                <i></i>
                              </div>
                            </div>
                            <div className="plate-meta-bottom">
                              <span className="plate-client">FORMA® SPACES</span>
                              <span className="plate-arrow">
                                <ArrowUpRightIcon />
                              </span>
                            </div>
                          </div>
                        )}
                        {project.id === 'connect' && (
                          <div className="plate-connect-content">
                            <div className="plate-meta-top">
                              <span className="plate-index">0{idx + 1}</span>
                              <span className="plate-badge">{project.badge}</span>
                            </div>
                            <div className="plate-connect-stage">
                              <div className="plate-nfc-card-body">
                                <span className="nfc-label">uic / connect</span>
                                <strong className="nfc-headline">One tap.</strong>
                                <ContactlessWaveIcon className="nfc-waves-icon" />
                              </div>
                            </div>
                            <div className="plate-meta-bottom">
                              <span className="plate-client">NFC + QR PROFILE</span>
                              <span className="plate-arrow">
                                <ArrowUpRightIcon />
                              </span>
                            </div>
                          </div>
                        )}
                        {project.id === 'flow' && (
                          <div className="plate-flow-content">
                            <div className="plate-meta-top">
                              <span className="plate-index">0{idx + 1}</span>
                              <span className="plate-badge">{project.badge}</span>
                            </div>
                            <div className="plate-flow-stage">
                              <div className="plate-flow-dash-body">
                                <div className="dash-chart">
                                  <i></i>
                                  <i></i>
                                  <i></i>
                                  <i></i>
                                  <i></i>
                                  <i></i>
                                  <i></i>
                                </div>
                                <span className="telemetry-pill">TELEMETRY SYNC</span>
                              </div>
                            </div>
                            <div className="plate-meta-bottom">
                              <span className="plate-client">WORKSPACE INTELLIGENCE</span>
                              <span className="plate-arrow">
                                <ArrowUpRightIcon />
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Serif Name, Mono Year, and Two-Line Note */}
                  <div className="catalogue-info">
                    <div className="catalogue-header-row">
                      <h3 className="catalogue-name">
                        {project.title.includes('—')
                          ? project.title.split('—')[0].trim()
                          : project.title}
                      </h3>
                      <span className="catalogue-year">
                        {project.year === 'Concept' ? 'EXP / 24' : project.year}
                      </span>
                    </div>
                    <p className="catalogue-note" title={project.subtitle || project.description}>
                      {project.subtitle
                        ? `${project.subtitle}. ${project.description}`
                        : project.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Clean Bottom Progress Track without redundant counter text */}
          <div className="catalogue-bottom-bar">
            <div className="catalogue-progress-track">
              <div className="catalogue-progress-indicator" />
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Dialog Modal */}
      <dialog
        ref={dialogRef}
        id="project-dialog"
        aria-labelledby="project-title"
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          ) {
            closeProject();
          }
        }}
      >
        <button className="dialog-close" aria-label="Close project" onClick={closeProject}>
          <CloseIcon />
        </button>

        {selected.coverImage && (
          <div className="dialog-cover-hero">
            <img
              src={selected.coverImage}
              alt={selected.title}
              className="dialog-cover-image"
            />
            <div className="dialog-cover-tagline">
              <span>{selected.client}</span>
              <span className="dialog-badge-tag">{selected.badge}</span>
            </div>
          </div>
        )}

        <span className="eyebrow">
          {selected.kind === 'client' ? 'COMMISSIONED CLIENT PROJECT' : 'STUDIO CONCEPT STUDY'}
        </span>
        <h2 id="project-title">{selected.title}</h2>
        <p>{selected.description}</p>

        {selected.metrics && selected.metrics.length > 0 && (
          <div className="dialog-metrics-grid">
            {selected.metrics.map((m, i) => (
              <div key={i} className="dialog-metric-item">
                <span className="metric-val">{m.value}</span>
                <span className="metric-lbl">{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {selected.challenge && selected.solution && (
          <div className="dialog-brief-block">
            <p>
              <strong>The Brief & Outcome:</strong> {selected.solution}
            </p>
          </div>
        )}

        {selected.deliverables && selected.deliverables.length > 0 && (
          <div className="dialog-deliverables-block">
            <small className="deliverables-title">KEY DELIVERABLES</small>
            <ul className="deliverables-list">
              {selected.deliverables.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="project-tags">{selected.tags}</div>

        <div className="dialog-actions-row">
          {selected.externalUrl && (
            <a
              className="pill"
              href={selected.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit live project <ArrowUpRightIcon />
            </a>
          )}
          <a className="pill pill-subtle" href="#contact" onClick={closeProject}>
            Build something like this <ArrowUpRightIcon />
          </a>
        </div>
      </dialog>
    </>
  );
}
