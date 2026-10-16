import { NavLink, Outlet } from "react-router";

import { wedding } from "@/lib/wedding";

const navItems = [
  { href: "/", label: "Main" },
  { href: "/invitation", label: "Invitation" },
  { href: "/stays", label: "Stay" },
  { href: "/guest-info", label: "Guest info" },
];

export function SiteShell() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-steel-blue)] bg-[var(--color-parchment)]">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-4 py-5 sm:px-6"
          aria-label="Wedding site"
        >
          <NavLink
            to="/"
            className="text-base font-light tracking-[-0.02em] text-[var(--color-drive-blue)] outline-none focus-visible:underline"
          >
            {wedding.couple}
          </NavLink>
          <div className="flex gap-5">
            {navItems.map((item) => {
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    [
                      "text-base font-light tracking-[-0.02em] transition outline-none focus-visible:underline",
                      isActive
                        ? "text-[var(--color-drive-blue)] underline underline-offset-4"
                        : "text-[var(--color-midnight-ink)] hover:text-[var(--color-drive-blue)]",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-[var(--color-steel-blue)] px-4 py-8 text-center text-base font-light tracking-[-0.02em] text-[var(--color-midnight-ink)]">
        Cadaqués, 22-25 October 2026. Good vibes, good energy.
      </footer>
    </div>
  );
}
