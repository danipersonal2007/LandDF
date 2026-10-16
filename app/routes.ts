import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/site.tsx", [
    index("routes/home.tsx"),
    route("invitation", "routes/invitation.tsx"),
    route("stays", "routes/stays.tsx"),
    route("rsvp", "routes/rsvp.tsx"),
    route("guest-info", "routes/guest-info.tsx"),
    route("photos", "routes/photos.tsx"),
    route("access", "routes/access.tsx"),
    route("*", "routes/not-found.tsx"),
  ]),
  route("resources/media", "routes/media.ts"),
  route("private-image/:name", "routes/private-image.ts"),
] satisfies RouteConfig;
