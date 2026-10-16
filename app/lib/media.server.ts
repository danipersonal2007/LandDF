import { randomUUID } from "node:crypto";

import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
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

export async function uploadMedia(file: File) {
  const extension = extensions[file.type];
  if (!extension || file.size < 1 || file.size > MAX_MEDIA_BYTES) {
    throw new Error(
      "Choose a JPG, PNG, WebP, GIF, MP4, MOV, or WebM file under 4 MB."
    );
  }

  const key = `uploads/${Date.now()}-${randomUUID()}.${extension}`;
  await client.send(
    new PutObjectCommand({
      Bucket: weddingMedia.name,
      Key: key,
      Body: new Uint8Array(await file.arrayBuffer()),
      ContentType: file.type,
    })
  );
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
