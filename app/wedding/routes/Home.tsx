"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router";

import { wedding } from "@/lib/wedding";

export function Home() {
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    if (!isMapOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMapOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMapOpen]);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>{wedding.couple}</h1>
          <p className="hero-line">
            An intimate, low-key wedding weekend in {wedding.place}, with good
            vibes, good energy, and the sea somewhere nearby.
          </p>
          <div className="date-strip" aria-label="Wedding date and location">
            <span>{wedding.date}</span>
            <button
              className="date-location"
              type="button"
              onClick={() => setIsMapOpen(true)}
            >
              {wedding.place}
            </button>
          </div>
          <div className="hero-actions" aria-label="Main actions">
            <Link className="button primary" to="/invitation">
              Invitation
            </Link>
            <Link className="button ghost" to="/guest-info">
              Guest info
            </Link>
          </div>
        </div>
        <figure className="rsvp-card-preview">
          <img
            src="/images/invite.png"
            alt="Official wedding invitation for Louise and Dani, 24 October 2026 in Cadaqués, Girona"
          />
        </figure>
      </section>

      {isMapOpen ? <MapModal onClose={() => setIsMapOpen(false)} /> : null}
    </>
  );
}

type MapModalProps = {
  onClose: () => void;
};

function MapModal({ onClose }: MapModalProps) {
  return (
    <div
      className="map-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        aria-labelledby="map-title"
        aria-modal="true"
        className="map-modal"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="map-modal-header">
          <div>
            <p className="eyebrow">Where is Cadaqués?</p>
            <h2 id="map-title">Barcelona to the edge of the sea.</h2>
          </div>
          <button className="map-close" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <svg
          aria-label="Simple route map from Barcelona to Girona to Cadaqués"
          className="route-map"
          viewBox="0 0 720 360"
          role="img"
        >
          <path
            d="M96 286 C178 238 234 218 304 174 C381 126 458 108 620 72"
            fill="none"
            stroke="var(--color-drive-blue)"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <path
            d="M82 304 C170 330 263 318 354 286 C478 242 563 148 650 53"
            fill="none"
            stroke="var(--color-steel-blue)"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <MapPoint label="Barcelona" x={96} y={286} />
          <MapPoint label="Girona" x={304} y={174} />
          <MapPoint label="Cadaqués" x={620} y={72} />
          <path
            d="M560 48 L569 68 L591 70 L574 84 L579 106 L560 94 L541 106 L546 84 L529 70 L551 68 Z"
            fill="var(--color-celestial-yellow)"
          />
        </svg>

        <div className="route-notes">
          <article>
            <span>Barcelona</span>
            <strong>1.5-2h by car</strong>
          </article>
          <article>
            <span>Girona</span>
            <strong>1.25-1.5h by car</strong>
          </article>
          <article>
            <span>Airports</span>
            <strong>Barcelona or Girona</strong>
          </article>
        </div>

        <a
          className="button primary"
          href="https://www.google.com/maps/dir/Barcelona/Cadaqués,+Girona"
          rel="noreferrer"
          target="_blank"
        >
          Open in Google Maps
        </a>
      </section>
    </div>
  );
}

type MapPointProps = {
  label: string;
  x: number;
  y: number;
};

function MapPoint({ label, x, y }: MapPointProps) {
  return (
    <g>
      <circle cx={x} cy={y} fill="var(--color-parchment)" r="12" />
      <circle cx={x} cy={y} fill="var(--color-celestial-yellow)" r="6" />
      <circle
        cx={x}
        cy={y}
        fill="none"
        r="12"
        stroke="var(--color-drive-blue)"
        strokeWidth="2"
      />
      <text
        fill="var(--color-drive-blue)"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="18"
        fontWeight="300"
        letterSpacing="-0.36"
        x={x + 18}
        y={y - 14}
      >
        {label}
      </text>
    </g>
  );
}
