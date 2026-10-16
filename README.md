# Louise & Dani

The separate React Router version of the wedding site. The existing Vite site and its deployment are unchanged.

## Run locally

```bash
npm install
npm run dev
```

The public pages work without extra services. Guest info and the gallery use a shared code. In local development the existing guest code is available as a fallback; set `GUEST_ACCESS_CODE` in a local `.env` to replace it. Set `GUEST_SESSION_SECRET` to a long random value.

The photo/video gallery uses a private Monolayer bucket. Local uploads require Docker and the Monolayer development bucket (`npx monolayer start dev`). Without it, the gallery shows a storage-unavailable message, but the rest of the site works.

## Monolayer setup

Connect this repository as a **new** Monolayer project; leave the existing wedding project live until the switch. The app is server-rendered React Router. `workloads/wedding-media.ts` defines the private media bucket; no Postgres database is required for this gallery.

Configure these server environment variables in the new project before inviting guests:

- `GUEST_ACCESS_CODE`: the shared code sent to confirmed guests.
- `GUEST_SESSION_SECRET`: a long, random signing secret for the access cookie.

Do not prefix either variable with `VITE_` or expose it in browser code. The gallery is at `/photos`; its QR code can be downloaded from that page **after opening the deployed domain**. The QR does not contain the access code. Images and videos are stored in the private bucket; guests receive short-lived viewing URLs after unlocking.

The RSVP page remains an email draft to `Louisevdoord@gmail.com`, as on the current site. It is not connected to a new RSVP database.

## Checks

```bash
npm run check
npm run build
```
