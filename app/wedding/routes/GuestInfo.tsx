import { Link } from "react-router";

interface GuestInfoProps {
  details: { title: string; copy: string[] }[];
  activities: string[][];
}

export function GuestInfo({ details, activities }: GuestInfoProps) {
  return (
    <section className="section-pad guest-page">
      <div className="page-heading">
        <p className="eyebrow">Guest info</p>
        <h1>Welcome in.</h1>
      </div>
      <section className="official-details" aria-label="Official invitation details">
        <figure>
          <img src="/private-image/invite-program" alt="Official Louise and Dani wedding weekend program" />
        </figure>
        <figure>
          <img src="/private-image/invite-map" alt="Official Cadaqués bay map for the wedding weekend" />
        </figure>
      </section>
      <div className="info-grid">
        {details.map(({ title, copy }) => (
          <article className="info-card" key={title}>
            <h2>{title}</h2>
            <div className="info-copy">
              {copy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </article>
        ))}
      </div>
      <div className="gallery-invitation">
        <div>
          <p className="eyebrow">From all of us</p>
          <h2>Weekend photos & videos</h2>
          <p>Share your favorite moments and see everyone else&apos;s.</p>
        </div>
        <Link className="button primary" to="/photos">Open shared gallery</Link>
      </div>
      <section className="activity-section" aria-labelledby="activity-title">
        <p className="eyebrow">Around town</p>
        <h2 id="activity-title">Activities in and around Cadaqués</h2>
        <div className="activity-list">
          {activities.map(([title, copy]) => (
            <article className="activity-item" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
