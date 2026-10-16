import { randomUUID } from "node:crypto";

import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { bucketLocalConfiguration } from "@monolayer/sdk";

import weddingMedia from "../../workloads/wedding-media";
import { MAX_MEDIA_BYTES } from "./media";

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

const client = new S3Client({
  ...bucketLocalConfiguration(),
  region: process.env.AWS_REGION ?? "us-east-1",
});

export interface MediaItem {
  key: string;
  url: string;
  kind: "image" | "video";
  date: string;
}

export async function createUpload(type: string, size: number) {
  const extension = extensions[type];
  if (
    !extension ||
    !Number.isSafeInteger(size) ||
    size < 1 ||
    size > MAX_MEDIA_BYTES
  ) {
    throw new Response(
      "Choose a JPG, PNG, WebP, GIF, MP4, MOV, or WebM file under 250 MB.",
      { status: 400 }
    );
  }

  const key = `uploads/${Date.now()}-${randomUUID()}.${extension}`;
  const grant = await createPresignedPost(client, {
    Bucket: weddingMedia.name,
    Key: key,
    Expires: 15 * 60,
    Fields: { "Content-Type": type },
    Conditions: [
      ["content-length-range", 1, MAX_MEDIA_BYTES],
      ["eq", "$Content-Type", type],
    ],
  });
  return { ...grant, key };
}

export async function listMedia(): Promise<MediaItem[]> {
  const objects: { key: string; date: string }[] = [];
  let token: string | undefined;
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: weddingMedia.name,
        Prefix: "uploads/",
        ContinuationToken: token,
      })
    );
    for (const item of page.Contents ?? []) {
      if (
        item.Key &&
        /\.(?<ext>jpg|png|webp|gif|mp4|mov|webm)$/iu.test(item.Key)
      ) {
        objects.push({
          key: item.Key,
          date: item.LastModified?.toISOString() ?? "",
        });
      }
    }
    token = page.NextContinuationToken;
  } while (token);

  objects.sort((a, b) => b.key.localeCompare(a.key));
  return Promise.all(
    objects.map(async ({ key, date }) => ({
      key,
      date,
      kind: /\.(?<ext>mp4|mov|webm)$/iu.test(key)
        ? ("video" as const)
        : ("image" as const),
      url: await getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: weddingMedia.name, Key: key }),
        { expiresIn: 15 * 60 }
      ),
    }))
  );
}
