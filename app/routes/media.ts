import { hasGuestAccess } from "../lib/guest-access.server";
import { createUpload } from "../lib/media.server";
import type { Route } from "./+types/media";

export async function action({ request }: Route.ActionArgs) {
  if (!(await hasGuestAccess(request))) {
    return Response.json(
      { error: "Enter the guest code first." },
      { status: 401 }
    );
  }
  if (
    request.headers.get("content-type")?.split(";")[0] !== "application/json"
  ) {
    return Response.json({ error: "Expected JSON." }, { status: 415 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 2048) {
    return Response.json({ error: "Request too large." }, { status: 413 });
  }
  try {
    const input: unknown = await request.json();
    if (
      !input ||
      typeof input !== "object" ||
      !("type" in input) ||
      !("size" in input)
    ) {
      return Response.json({ error: "Missing file details." }, { status: 400 });
    }
    const type = (input as { type: unknown }).type;
    const size = (input as { size: unknown }).size;
    if (typeof type !== "string" || typeof size !== "number") {
      return Response.json({ error: "Invalid file details." }, { status: 400 });
    }
    const grant = await createUpload(type, size);
    return Response.json(grant, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: "Could not prepare the upload." },
      { status: 500 }
    );
  }
}
