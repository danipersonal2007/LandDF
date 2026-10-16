export type PartyMember = {
  name: string;
  type: "adult" | "child";
  shirtSize: string;
  dietaryNote: string;
};

export type RsvpPayload = {
  name: string;
  email: string;
  rsvp: string;
  guestNames: string[];
  kidNames: string[];
  partyMembers: PartyMember[];
  shirtSize: string;
  note: string;
};

export type RsvpRecord = RsvpPayload & {
  id: string;
  createdAt: string;
  emailStatus: "sent" | "not_configured" | "failed";
};

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

const configuredApiBase = import.meta.env.VITE_RSVP_API_URL as
  | string
  | undefined;
const apiBase = configuredApiBase?.replace(/\/$/, "") ?? "";

function apiUrl(path: string) {
  return `${apiBase}${path}`;
}

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      "The RSVP backend is not available for this deployed site yet. The site is loading, but guest responses need the hosted RSVP API before they can be saved to the private RSVP file.",
    );
  }

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.ok) {
    throw new Error(body.error ?? "Something went wrong.");
  }

  return body;
}

export async function submitRsvp(payload: RsvpPayload) {
  const response = await callApi("/api/rsvp", payload);

  return readJson<RsvpRecord>(response);
}

export async function fetchAdminRsvps(code: string) {
  const response = await callApi("/api/admin/rsvps", { code });

  const result = await readJson<RsvpRecord[]>(response);
  return result.data ?? [];
}

async function callApi(path: string, payload: unknown) {
  try {
    return await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message
        ? `Could not reach the RSVP backend: ${error.message}`
        : "Could not reach the RSVP backend.",
      { cause: error },
    );
  }
}
