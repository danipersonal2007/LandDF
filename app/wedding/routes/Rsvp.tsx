import { RsvpForm } from "@/components/RsvpForm";
import { wedding } from "@/lib/wedding";

export function Rsvp() {
  return (
    <section className="section-pad rsvp-page" aria-labelledby="rsvp-title">
      <div className="page-heading">
        <p className="eyebrow">RSVP</p>
        <h1 id="rsvp-title">Come, maybe come, or send love from afar.</h1>
        <p>
          Tell Louise and Dani who is coming, shirt sizes, and any notes they
          should know before the weekend in {wedding.place}.
        </p>
      </div>
      <RsvpForm />
    </section>
  );
}
