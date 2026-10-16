import { Link } from "react-router";

import { wedding } from "@/lib/wedding";

const invitationHighlights = [
  ["Thursday", "Casual meet-up"],
  ["Friday", "Welcome reception"],
  ["Saturday", "Ceremony, dinner and party"],
  ["Sunday", "Casual goodbyes"],
];

export function Invitation() {
  return (
    <section className="invitation-page" aria-labelledby="invitation-title">
      <figure className="official-invite">
        <img
          src="/images/invite.png"
          alt="Official invitation for Louise and Dani's wedding in Cadaqués, Girona"
        />
      </figure>
      <div className="invitation-panel">
        <p className="eyebrow">Invitation</p>
        <h1 id="invitation-title">{wedding.couple}</h1>
        <p>
          A small Cadaqués weekend with ceremony, dinner, music, and everyone we
          love close by.
        </p>
        <div className="invitation-actions">
          <Link className="button primary" to="/guest-info">
            Details
          </Link>
          <Link className="button ghost" to="/stays">
            Places to stay
          </Link>
        </div>
        <div className="invitation-highlights" aria-label="Weekend highlights">
          {invitationHighlights.map(([day, copy]) => (
            <article key={day}>
              <span>{day}</span>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
