const stayNotes = [
  {
    title: "Parking",
    copy: [
      "Zero stress on where you stay.",
      "Just make sure you have parking if you rent or bring a car. Parking in town is a challenge.",
      "There is a large paid parking lot at the entrance of town.",
    ],
  },
  {
    title: "Transport",
    copy: [
      "The closest airport is Girona, followed by Barcelona.",
      "There is a great train connection to Figueres if you fly in and want to use public transport.",
      "A bus comes into town too. Bring snacks for the 20-minute windy road so you do not arrive too dizzy.",
    ],
  },
];

const hotelGroups = [
  {
    tier: "High end",
    options: [
      {
        name: "Boutique Hotel Villa Gala",
        note: "Chiquest in town.",
        url: "https://maps.app.goo.gl/XLWnRkjm6Dzz4Nbc7?g_st=ic",
      },
    ],
  },
  {
    tier: "Mid range",
    options: [
      {
        name: "Hotel Llané Petit",
        note: "The algorithm game.",
        url: "https://maps.app.goo.gl/h6XYadd3GDQiBbVRA?g_st=ic",
      },
      {
        name: "Set Cadaqués",
        note: "Four rooms above the restaurant.",
        url: "https://maps.app.goo.gl/MmULVPZsWrNwHXBJ7?g_st=ic",
      },
      {
        name: "Hotel Playa Sol",
        note: "Family rooms available.",
        url: "https://maps.app.goo.gl/YjeJ9EGV9KXonRcL6",
      },
    ],
  },
  {
    tier: "Budget / pet friendly",
    options: [
      {
        name: "La Fonda",
        note: "Former hostal retrofitted by a hip couple.",
        url: "https://maps.app.goo.gl/MmULVPZsWrNwHXBJ7?g_st=ic",
      },
    ],
  },
];

const airbnbGroups = [
  {
    tier: "In old town",
    options: [
      {
        name: "Five bedrooms",
        note: "Four doubles and one bunk room.",
        url: "https://www.airbnb.co.uk/rooms/636058667004935055?unique_share_id=8af8714b-05cd-4583-a5c5-e7cd0388b9d4&viralityEntryPoint=1&s=76",
      },
      {
        name: "Three bedrooms with en-suite",
        note: "A good sharing option in the old town.",
        url: "https://www.airbnb.co.uk/rooms/12404275?unique_share_id=5e87398f-2c3b-4826-b5a7-a4e6ab43ec08&viralityEntryPoint=1&s=76",
      },
    ],
  },
  {
    tier: "Short walk to town",
    options: [
      {
        name: "Two bedrooms",
        note: "Uphill walk from the seafront.",
        url: "https://www.airbnb.co.uk/rooms/51512873?unique_share_id=8beef985-bdd5-488f-86da-20d846c80d59&viralityEntryPoint=1&s=76",
      },
      {
        name: "Two bedrooms with pool and view",
        note: "Uphill walk, with a pool and a view.",
        url: "https://www.airbnb.co.uk/rooms/5688560?unique_share_id=1150b610-4775-4d87-a080-f87e148beee9&viralityEntryPoint=1&s=76",
      },
    ],
  },
];

export function Stays() {
  return (
    <section className="section-pad stays-page">
      <div className="page-heading">
        <p className="eyebrow">Places to stay</p>
        <h1>Somewhere lovely, no room block.</h1>
        <p>
          A few places Louise and Dani like: Airbnb finds, cool small hotels,
          and direct-booking options. These are friendly recommendations, not
          reserved rooms or a room block.
        </p>
      </div>

      <div className="stay-grid">
        {stayNotes.map((note) => (
          <article className="stay-card" key={note.title}>
            <span>Good to know</span>
            <h2>{note.title}</h2>
            <div className="stay-copy">
              {note.copy.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <StaySection title="Hotel options" groups={hotelGroups} />
      <StaySection
        title="Airbnb options if you want to share"
        groups={airbnbGroups}
      />
    </section>
  );
}

type StayGroup = {
  tier: string;
  options: {
    name: string;
    note: string;
    url: string;
  }[];
};

type StaySectionProps = {
  title: string;
  groups: StayGroup[];
};

function StaySection({ title, groups }: StaySectionProps) {
  return (
    <section className="stay-section" aria-labelledby={toId(title)}>
      <h2 id={toId(title)}>{title}</h2>
      <div className="stay-list">
        {groups.map((group) => (
          <article className="stay-group" key={group.tier}>
            <span>{group.tier}</span>
            <div className="stay-options">
              {group.options.map((option) => (
                <a
                  className="stay-option"
                  href={option.url}
                  key={option.name}
                  rel="noreferrer"
                  target="_blank"
                >
                  <strong>{option.name}</strong>
                  <small>{option.note}</small>
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function toId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
