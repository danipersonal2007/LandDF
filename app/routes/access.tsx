import { Form, redirect, useActionData, useLoaderData } from "react-router";

import {
  guestCookieHeader,
  hasGuestAccess,
  safeReturnTo,
  validGuestCode,
} from "../lib/guest-access.server";
import type { Route } from "./+types/access";

export async function loader({ request }: Route.LoaderArgs) {
  const returnTo = safeReturnTo(
    new URL(request.url).searchParams.get("returnTo")
  );
  if (await hasGuestAccess(request)) throw redirect(returnTo);
  return { returnTo };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? ""));
  if (!validGuestCode(String(form.get("code") ?? ""))) {
    return {
      error:
        "That code is not quite it. Check the message from Louise and Dani.",
    };
  }
  throw redirect(returnTo, {
    headers: { "Set-Cookie": await guestCookieHeader(request) },
  });
}

export default function Access() {
  const { returnTo } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  return (
    <section className="section-pad gate-page">
      <Form className="panel code-gate" method="post" reloadDocument>
        <p className="eyebrow">For confirmed guests</p>
        <h1>Enter the shared code.</h1>
        <input type="hidden" name="returnTo" value={returnTo} />
        <label className="field">
          <span>Access code</span>
          <input
            name="code"
            placeholder="Enter code"
            autoComplete="off"
            required
          />
        </label>
        {result?.error ? (
          <p className="error-message" role="alert">
            {result.error}
          </p>
        ) : null}
        <button className="button primary" type="submit">
          Unlock details
        </button>
      </Form>
    </section>
  );
}
