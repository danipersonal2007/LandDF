import { cpSync, mkdirSync } from "node:fs";

mkdirSync("build/server/private-images", { recursive: true });
cpSync(
  "private/images/invite-program.png",
  "build/server/private-images/invite-program.png"
);
cpSync(
  "private/images/invite-map.png",
  "build/server/private-images/invite-map.png"
);
