'use client';

import styles from './TestimonialMarquee.module.css';
import { DEFAULT_TESTIMONIALS, type CmsTestimonial } from '@/lib/cms-types';

function VerifiedIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Card({ item }: { item: CmsTestimonial }) {
  return (
    <div className={styles.card}>
      <div>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {item.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.avatar_url} alt={item.name} className={styles.avatarImg} />
            ) : (
              item.initials
            )}
          </div>
          <div className={styles.authorMeta}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.verifiedBadge} title="Verified Client Project">
                <VerifiedIcon />
              </span>
            </div>
            <span className={styles.role}>
              {item.role} · {item.company}
            </span>
          </div>
        </div>
        <p className={styles.quote}>“{item.quote}”</p>
      </div>
      <div className={styles.footer}>
        <span className={styles.tag}>{item.tag}</span>
        <span className={styles.accentDot} aria-hidden="true" />
      </div>
    </div>
  );
}

export function TestimonialMarquee({
  items = DEFAULT_TESTIMONIALS,
}: {
  items?: CmsTestimonial[];
}) {
  const list = items.length > 0 ? items : DEFAULT_TESTIMONIALS;
  const rowOne = list.filter((item) => item.row_group !== 2);
  const rowTwo = list.filter((item) => item.row_group === 2);

  return (
    <div className={styles.wrapper}>
      <div className={styles.maskViewport}>
        {/* Row 1: Scrolling Left */}
        {rowOne.length > 0 && (
          <div className={styles.row}>
            <div className={`${styles.track} ${styles.scrollLeft}`}>
              <div className={styles.cardSet}>
                {rowOne.map((item) => (
                  <Card key={item.id} item={item} />
                ))}
              </div>
              <div className={styles.cardSet} aria-hidden="true">
                {rowOne.map((item) => (
                  <Card key={`${item.id}-clone`} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Row 2: Scrolling Right */}
        {rowTwo.length > 0 && (
          <div className={styles.row}>
            <div className={`${styles.track} ${styles.scrollRight}`}>
              <div className={styles.cardSet}>
                {rowTwo.map((item) => (
                  <Card key={item.id} item={item} />
                ))}
              </div>
              <div className={styles.cardSet} aria-hidden="true">
                {rowTwo.map((item) => (
                  <Card key={`${item.id}-clone`} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
