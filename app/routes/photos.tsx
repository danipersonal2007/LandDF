import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useLoaderData, useRevalidator } from "react-router";

import { requireGuestAccess } from "../lib/guest-access.server";
import { MAX_MEDIA_BYTES } from "../lib/media";
import { listMedia } from "../lib/media.server";
import type { Route } from "./+types/photos";

export async function loader({ request }: Route.LoaderArgs) {
  await requireGuestAccess(request);
  try {
    return { items: await listMedia(), storageError: false };
  } catch {
    return { items: [], storageError: true };
  }
}

export default function Photos() {
  const { items, storageError } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [uploadError, setUploadError] = useState("");
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

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    setUploadError("");
    setFiles([...(event.target.files ?? [])]);
  }

  async function upload() {
    if (!files.length || uploading) return;
    setUploading(true);
    setUploadError("");
    try {
      for (const [index, file] of files.entries()) {
        if (file.size > MAX_MEDIA_BYTES)
          throw new Error(`${file.name} is over 250 MB.`);
        setProgress(`Uploading ${index + 1} of ${files.length}: ${file.name}`);
        const response = await fetch("/resources/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: file.type, size: file.size }),
        });
        if (!response.ok) {
          const failure = (await response.json()) as { error?: string };
          throw new Error(failure.error ?? "Could not prepare upload.");
        }
        const grant = (await response.json()) as {
          url: string;
          fields: Record<string, string>;
        };
        const body = new FormData();
        for (const [key, value] of Object.entries(grant.fields))
          body.append(key, value);
        body.append("file", file);
        const sent = await fetch(grant.url, { method: "POST", body });
        if (!sent.ok)
          throw new Error(`Upload failed for ${file.name}. Please try again.`);
      }
      setFiles([]);
      setProgress("Thanks for sharing. Your moments are now in the gallery.");
      revalidator.revalidate();
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again."
      );
      setProgress("");
    } finally {
      setUploading(false);
    }
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

      <div className="media-upload">
        <label className="field" htmlFor="media-files">
          <span>Share photos or videos</span>
          <input
            id="media-files"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
            multiple
            onChange={chooseFiles}
            disabled={uploading}
          />
        </label>
        <button
          className="button primary"
          type="button"
          onClick={upload}
          disabled={!files.length || uploading}
        >
          {uploading
            ? "Uploading..."
            : `Upload ${files.length ? `${files.length} ` : ""}${files.length === 1 ? "file" : "files"}`}
        </button>
        <p className="media-hint">
          JPG, PNG, WebP, GIF, MP4, MOV or WebM. Up to 250 MB each.
        </p>
        {progress && <output className="media-feedback">{progress}</output>}
        {uploadError && (
          <p className="error-message" role="alert">
            {uploadError}
          </p>
        )}
      </div>

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
