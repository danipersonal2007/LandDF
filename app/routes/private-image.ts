import { readFile } from "node:fs/promises";
import path from "node:path";

import { hasGuestAccess } from "../lib/guest-access.server";
import type { Route } from "./+types/private-image";

const files: Record<string, string> = {
  "invite-program": "invite-program.png",
  "invite-map": "invite-map.png",
};

export async function loader({ request, params }: Route.LoaderArgs) {
  if (!(await hasGuestAccess(request))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const name = params.name ? files[params.name] : undefined;
  if (!name) return new Response("Not found", { status: 404 });

  const folder =
    process.env.NODE_ENV === "production"
      ? path.join(process.cwd(), "build/server/private-images")
      : path.join(process.cwd(), "private/images");
  try {
    const bytes = await readFile(path.join(folder, name));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
