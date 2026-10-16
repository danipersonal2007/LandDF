import { useLoaderData } from "react-router";

import { requireGuestAccess } from "../lib/guest-access.server";
import { activities, details } from "../lib/guest-content.server";
import { GuestInfo } from "../wedding/routes/GuestInfo";
import type { Route } from "./+types/guest-info";

export async function loader({ request }: Route.LoaderArgs) {
  await requireGuestAccess(request);
  return { activities, details };
}

export default function GuestInfoPage() {
  const content = useLoaderData<typeof loader>();
  return <GuestInfo {...content} />;
}
