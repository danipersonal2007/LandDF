import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";

import { requireGuestAccess } from "../lib/guest-access.server";
import { MAX_MEDIA_BYTES } from "../lib/media";
import { listMedia, uploadMedia } from "../lib/media.server";
import type { Route } from "./+types/photos";

export async function loader({ request }: Route.LoaderArgs) {
  await requireGuestAccess(request);
  try {
    return {
      items: await listMedia(),
      storageError: false,
      uploaded: new URL(request.url).searchParams.has("uploaded"),
    };
  } catch {
    return { items: [], storageError: true, uploaded: false };
  }
}

export async function action({ request }: Route.ActionArgs) {
  await requireGuestAccess(request);
  const contentLength = Number(request.headers.get("content-length"));
  if (contentLength > 5 * 1024 * 1024) {
    return { error: "Choose a file under 4 MB." };
  }

  let file: FormDataEntryValue | null;
  try {
    const formData = await request.formData();
    file = formData.get("file");
  } catch {
    return { error: "Could not read that file. Please try again." };
  }

  if (!(file instanceof File) || !file.size || file.size > MAX_MEDIA_BYTES) {
    return { error: "Choose a file under 4 MB." };
  }

  try {
    await uploadMedia(file);
    return redirect("/photos?uploaded=1");
  } catch {
    return { error: "Upload failed. Please try again." };
  }
}

export default function Photos() {
  const { items, storageError, uploaded } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [file, setFile] = useState<File | null>(null);
  const [selectionError, setSelectionError] = useState("");
  const uploading = navigation.state !== "idle";
  const [showQr, setShowQr] = useState(false);
  const [qrImage, setQrImage] = useState("");

  useEffect(() => {
    if (!showQr) return;
    let active = true;
    async function generateQr() {
      try {
        const { toDataURL } = await import("qrcode");
        const url = await toDataURL(`${window.location.origin}/photos`, {
          width: 440,
          margin: 3,
          color: { dark: "#0020c2", light: "#fffdd0" },
        });
        if (active) setQrImage(url);
      } catch {
        if (active) setQrImage("");
      }
    }
    void generateQr();
    return () => {
      active = false;
    };
  }, [showQr]);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setSelectionError(
      selected && selected.size > MAX_MEDIA_BYTES
        ? `${selected.name} is over 4 MB.`
        : ""
    );
  }

  return (
    <section className="section-pad media-page" aria-labelledby="media-title">
      <div className="media-heading">
        <div>
          <p className="eyebrow">For our people</p>
          <h1 id="media-title">Our weekend, through your eyes.</h1>
          <p>
            Photos and little films from Cadaqués, all together in one place.
          </p>
        </div>
        <button
          className="button ghost"
          type="button"
          onClick={() => setShowQr((open) => !open)}
        >
          {showQr ? "Hide QR code" : "Show QR code"}
        </button>
      </div>

      {showQr && (
        <section className="qr-panel" aria-label="Gallery QR code">
          <div>
            <p className="eyebrow">Share at the wedding</p>
            <h2>Scan to add a moment.</h2>
            <p>
              The code opens this gallery; guests still need the shared access
              code.
            </p>
          </div>
          {qrImage ? (
            <img
              src={qrImage}
              alt="QR code linking to the private wedding gallery"
            />
          ) : (
            <p>Preparing QR code...</p>
          )}
          {qrImage && (
            <a
              className="button ghost"
              href={qrImage}
              download="louise-dani-gallery-qr.png"
            >
              Download QR code
            </a>
          )}
        </section>
      )}

      <Form
        className="media-upload"
        method="post"
        encType="multipart/form-data"
      >
        <label className="field" htmlFor="media-files">
          <span>Share photos or videos</span>
          <input
            id="media-files"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
            onChange={chooseFile}
            disabled={uploading}
          />
        </label>
        <button
          className="button primary"
          type="submit"
          disabled={!file || !!selectionError || uploading}
        >
          {uploading ? "Uploading..." : "Upload file"}
        </button>
        <p className="media-hint">
          JPG, PNG, WebP, GIF, MP4, MOV or WebM. One file at a time, up to 4 MB.
        </p>
        {uploaded && (
          <output className="media-feedback">
            Thanks for sharing. Your moment is now in the gallery.
          </output>
        )}
        {(selectionError || actionData?.error) && (
          <p className="error-message" role="alert">
            {selectionError || actionData?.error}
          </p>
        )}
      </Form>

      <div className="media-list-heading">
        <h2>Shared moments</h2>
        <span>{items.length}</span>
      </div>
      {storageError ? (
        <p className="media-empty" role="alert">
          The gallery storage is not available yet. Please try again later.
        </p>
      ) : items.length ? (
        <div className="media-grid">
          {items.map((item) => (
            <figure className="media-item" key={item.key}>
              {item.kind === "image" ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open wedding photo"
                >
                  <img
                    src={item.url}
                    alt="A moment shared from Louise and Dani's wedding"
                    loading="lazy"
                  />
                </a>
              ) : (
                <video
                  src={item.url}
                  controls
                  preload="metadata"
                  aria-label="Wedding video"
                />
              )}
              <figcaption>
                {item.date
                  ? new Date(item.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Wedding weekend"}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="media-empty">
          The first moments will appear here. Yours could be the first.
        </p>
      )}
      <Link className="media-back" to="/guest-info">
        Back to guest info
      </Link>
    </section>
  );
}
