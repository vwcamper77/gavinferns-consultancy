"use client";

import Link from "next/link";
import { useRef } from "react";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const menu = useRef<HTMLDetailsElement>(null);
  return <details ref={menu} className="mobile-nav" onKeyDown={(event) => {
    if (event.key === "Escape" && menu.current?.open) {
      menu.current.open = false;
      menu.current.querySelector("summary")?.focus();
    }
  }}>
    <summary>Menu</summary>
    <nav aria-label="Mobile">
      {links.map(({ href, label }) => {
        function close() { if (menu.current) menu.current.open = false; }
        return href === "/apply" ? <a key={href} href={href} onClick={close}>{label}</a>
          : <Link key={href} href={href} onClick={close}>{label}</Link>;
      })}
    </nav>
  </details>;
}
