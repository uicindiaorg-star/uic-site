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

export function ProcessSection({
  settings = DEFAULT_SITE_SETTINGS,
}: {
  settings?: SiteSettings;
}) {
  return (
    <section className="process section" id="process">
      <div className="section-kicker">
        <span>{settings.process_kicker}</span>
      </div>
      <h2>
        {renderLines(settings.process_headline_prefix)}{' '}
        <em>{settings.process_headline_em}</em>
      </h2>
      <div className="process-grid">
        <article>
          <div className="p3d-stage p3d-discover" aria-hidden="true">
            <div className="p3d-radar-plane">
              <div className="p3d-ring p3d-ring-1"></div>
              <div className="p3d-ring p3d-ring-2"></div>
              <div className="p3d-ring p3d-ring-3"></div>
              <div className="p3d-sweep"></div>
              <div className="p3d-core-orb"></div>
              <div className="p3d-satellite p3d-sat-1"></div>
              <div className="p3d-satellite p3d-sat-2"></div>
            </div>
          </div>
          <span>01 / DISCOVER</span>
          <h3>Ask better questions.</h3>
          <p>We listen, challenge assumptions and find the story worth telling.</p>
        </article>

        <article>
          <div className="p3d-stage p3d-define" aria-hidden="true">
            <div className="p3d-cube-wrapper">
              <div className="p3d-cube">
                <div className="p3d-face p3d-face-front">
                  <span>X</span>
                </div>
                <div className="p3d-face p3d-face-top">
                  <span>Y</span>
                </div>
                <div className="p3d-face p3d-face-right">
                  <span>Z</span>
                </div>
                <div className="p3d-face p3d-face-back"></div>
                <div className="p3d-face p3d-face-left"></div>
                <div className="p3d-face p3d-face-bottom"></div>
              </div>
              <div className="p3d-cube-shadow"></div>
            </div>
          </div>
          <span>02 / DEFINE</span>
          <h3>Give it direction.</h3>
          <p>A shared strategy connects your ambitions with a clear creative path.</p>
        </article>

        <article>
          <div className="p3d-stage p3d-craft" aria-hidden="true">
            <div className="p3d-layers-stack">
              <div className="p3d-layer p3d-layer-1">
                <div className="p3d-layer-grid"></div>
              </div>
              <div className="p3d-layer p3d-layer-2">
                <div className="p3d-wire-bar"></div>
                <div className="p3d-wire-bar"></div>
                <div className="p3d-wire-bar"></div>
              </div>
              <div className="p3d-layer p3d-layer-3">
                <span>UI/UX</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
                </svg>
              </div>
            </div>
          </div>
          <span>03 / CRAFT</span>
          <h3>Make it matter.</h3>
          <p>Design and development come together through thoughtful iteration.</p>
        </article>

        <article>
          <div className="p3d-stage p3d-evolve" aria-hidden="true">
            <div className="p3d-gyro">
              <div className="p3d-gyro-ring p3d-gyro-outer"></div>
              <div className="p3d-gyro-ring p3d-gyro-middle"></div>
              <div className="p3d-gyro-ring p3d-gyro-inner"></div>
              <div className="p3d-gyro-nucleus">
                <svg
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
                  <path d="M8.5 5A12 12 0 0 1 8.5 19" />
                  <path d="M12.5 8A7.5 7.5 0 0 1 12.5 16" />
                  <path d="M16.5 10.5A3.5 3.5 0 0 1 16.5 13.5" />
                </svg>
              </div>
            </div>
          </div>
          <span>04 / EVOLVE</span>
          <h3>Keep moving.</h3>
          <p>Launch with care, learn from real use and plan the next chapter.</p>
        </article>
      </div>
    </section>
  );
}
