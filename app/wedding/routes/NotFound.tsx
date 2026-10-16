import { Link } from "react-router";

export function NotFound() {
  return (
    <section className="section-pad gate-page">
      <div className="panel code-gate">
        <p className="eyebrow">404</p>
        <h1>Page not found.</h1>
        <p>
          This wedding note seems to have wandered off. The invitation is still
          waiting at the front.
        </p>
        <Link className="button primary" to="/">
          Back to main
        </Link>
      </div>
    </section>
  );
}
