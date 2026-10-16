"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { rsvpOptions, shirtSizes } from "@/lib/wedding";
import type { PartyMember } from "@/lib/api";

type Rsvp = (typeof rsvpOptions)[number];
type ShirtSize = (typeof shirtSizes)[number];

export function RsvpForm() {
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>([
    { name: "", type: "adult", shirtSize: "M", dietaryNote: "" },
  ]);
  const [email, setEmail] = useState("");
  const [rsvp, setRsvp] = useState<Rsvp>("Yes");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<RsvpEmailDraft | null>(null);
  const [copyStatus, setCopyStatus] = useState("");

  const cleanPartyMembers = useMemo(
    () =>
      partyMembers
        .map((member) => ({
          ...member,
          name: member.name.trim(),
          dietaryNote: member.dietaryNote.trim(),
        }))
        .filter((member) => member.name),
    [partyMembers],
  );
  const cleanGuestNames = useMemo(
    () =>
      cleanPartyMembers
        .filter((member) => member.type === "adult")
        .map((member) => member.name),
    [cleanPartyMembers],
  );
  const contactName = cleanGuestNames[0] ?? "";
  const partySize = cleanPartyMembers.length;
  const canSubmit = contactName.length > 1 && email.includes("@");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const nextDraft = createRsvpEmailDraft({
      name: contactName,
      email: email.trim(),
      rsvp,
      partyMembers: cleanPartyMembers,
      note: note.trim(),
    });
    setDraft(nextDraft);
    setSubmitted(true);
    window.location.assign(nextDraft.href);
  }

  async function handleCopyDraft() {
    if (!draft) return;

    try {
      await navigator.clipboard.writeText(
        [
          `To: ${rsvpRecipient}`,
          `Subject: ${draft.subject}`,
          "",
          draft.body,
        ].join("\n"),
      );
      setCopyStatus("Copied.");
    } catch {
      setCopyStatus("Select the text and copy it manually.");
    }
  }

  function resetDraft() {
    setSubmitted(false);
    setCopyStatus("");
  }

  if (submitted) {
    return (
      <section className="panel success-panel" aria-labelledby="rsvp-sent">
        <p className="eyebrow">RSVP received</p>
        <h2 id="rsvp-sent">Thank you, {contactName}.</h2>
        <p>
          Your email app should now have an RSVP draft addressed to Louise and
          Dani, with <strong>{rsvp}</strong> for a party of{" "}
          <strong>{partySize}</strong>. Please send that email to finish the
          RSVP.
        </p>
        {draft ? (
          <div className="email-fallback">
            <a className="button primary" href={draft.href}>
              Open email draft
            </a>
            <button
              className="button secondary"
              type="button"
              onClick={handleCopyDraft}
            >
              Copy RSVP text
            </button>
            {copyStatus ? <p className="form-intro">{copyStatus}</p> : null}
            <textarea
              readOnly
              value={[
                `To: ${rsvpRecipient}`,
                `Subject: ${draft.subject}`,
                "",
                draft.body,
              ].join("\n")}
              rows={10}
              aria-label="RSVP email text"
            />
          </div>
        ) : null}
        <button className="button secondary" type="button" onClick={resetDraft}>
          Edit response
        </button>
      </section>
    );
  }

  return (
    <form className="panel rsvp-form" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">RSVP</p>
        <h2>Can you make it?</h2>
        <p className="form-intro">
          Tell Louise and Dani if you are in, out, or floating in maybe-land,
          and add everyone included in this RSVP.
        </p>
      </div>

      <PartyMemberFields members={partyMembers} onChange={setPartyMembers} />

      <label className="field">
        <span>Email</span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>

      <fieldset className="choice-group">
        <legend>Your answer</legend>
        <div className="segmented">
          {rsvpOptions.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name="rsvp"
                checked={rsvp === option}
                onChange={() => setRsvp(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Note for Louise and Dani</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Travel plans, a tiny poem, anything else..."
          rows={4}
        />
      </label>

      <button className="button primary" type="submit" disabled={!canSubmit}>
        Open RSVP email
      </button>
    </form>
  );
}

const rsvpRecipient = "Louisevdoord@gmail.com";

type RsvpEmailDetails = {
  name: string;
  email: string;
  rsvp: Rsvp;
  partyMembers: PartyMember[];
  note: string;
};

type RsvpEmailDraft = {
  subject: string;
  body: string;
  href: string;
};

function createRsvpEmailDraft({
  name,
  email,
  rsvp,
  partyMembers,
  note,
}: RsvpEmailDetails): RsvpEmailDraft {
  const subject = `Wedding RSVP: ${name} - ${rsvp}`;
  const body = [
    "Hi Louise and Dani,",
    "",
    "Here is our RSVP for Cadaqués.",
    "",
    `Main contact: ${name}`,
    `Contact email: ${email}`,
    `RSVP: ${rsvp}`,
    `Party size: ${partyMembers.length}`,
    "",
    "People included:",
    ...partyMembers.map((member, index) =>
      [
        `${index + 1}. ${member.name}`,
        `Type: ${member.type === "child" ? "Child" : "Adult / guest"}`,
        `T-shirt size: ${member.shirtSize}`,
        `Dietary notes: ${member.dietaryNote || "None"}`,
      ].join("\n   "),
    ),
    "",
    `Note: ${note || "None"}`,
    "",
    "Love,",
    name,
  ].join("\n");

  return {
    subject,
    body,
    href: `mailto:${rsvpRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}

type PartyMemberFieldsProps = {
  members: PartyMember[];
  onChange: (members: PartyMember[]) => void;
};

function PartyMemberFields({ members, onChange }: PartyMemberFieldsProps) {
  function updateMember(index: number, nextMember: PartyMember) {
    onChange(
      members.map((member, memberIndex) =>
        memberIndex === index ? nextMember : member,
      ),
    );
  }

  function addMember(type: PartyMember["type"]) {
    onChange([...members, { name: "", type, shirtSize: "M", dietaryNote: "" }]);
  }

  function removeMember(index: number) {
    onChange(members.filter((_, memberIndex) => memberIndex !== index));
  }

  return (
    <fieldset className="party-fields">
      <legend>People included</legend>
      {members.map((member, index) => (
        <PartyMemberField
          key={`${member.type}-${index}`}
          member={member}
          index={index}
          canRemove={members.length > 1}
          onChange={(nextMember) => updateMember(index, nextMember)}
          onRemove={() => removeMember(index)}
        />
      ))}
      <div className="party-actions">
        <button
          className="button ghost compact"
          type="button"
          onClick={() => addMember("adult")}
        >
          Add partner or guest
        </button>
        <button
          className="button ghost compact"
          type="button"
          onClick={() => addMember("child")}
        >
          Add child
        </button>
      </div>
    </fieldset>
  );
}

type PartyMemberFieldProps = {
  member: PartyMember;
  index: number;
  canRemove: boolean;
  onChange: (member: PartyMember) => void;
  onRemove: () => void;
};

function PartyMemberField({
  member,
  index,
  canRemove,
  onChange,
  onRemove,
}: PartyMemberFieldProps) {
  const title =
    index === 0 ? "Main contact" : member.type === "child" ? "Child" : "Guest";

  return (
    <article className="party-member-card">
      <div className="party-member-heading">
        <span>{title}</span>
        {canRemove ? (
          <button className="text-button" type="button" onClick={onRemove}>
            Remove
          </button>
        ) : null}
      </div>
      <div className="party-member-grid">
        <label className="field">
          <span>Name</span>
          <input
            required={index === 0}
            value={member.name}
            onChange={(event) =>
              onChange({ ...member, name: event.target.value })
            }
            placeholder={index === 0 ? "Your full name" : "Full name"}
            autoComplete={index === 0 ? "name" : "off"}
          />
        </label>
        <label className="field">
          <span>Type</span>
          <select
            value={member.type}
            onChange={(event) =>
              onChange({
                ...member,
                type: event.target.value as PartyMember["type"],
              })
            }
          >
            <option value="adult">Adult / guest</option>
            <option value="child">Child</option>
          </select>
        </label>
        <label className="field">
          <span>T-shirt size</span>
          <select
            value={member.shirtSize}
            onChange={(event) =>
              onChange({
                ...member,
                shirtSize: event.target.value as ShirtSize,
              })
            }
          >
            {shirtSizes.map((shirtSize) => (
              <option key={shirtSize} value={shirtSize}>
                {shirtSize}
              </option>
            ))}
          </select>
        </label>
        <label className="field party-member-note">
          <span>Dietary notes</span>
          <textarea
            value={member.dietaryNote}
            onChange={(event) =>
              onChange({ ...member, dietaryNote: event.target.value })
            }
            placeholder="Allergies, vegetarian, no notes..."
            rows={3}
          />
        </label>
      </div>
    </article>
  );
}
