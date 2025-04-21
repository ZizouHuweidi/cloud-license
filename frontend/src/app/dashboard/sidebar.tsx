import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/devices", label: "Devices" },
  { href: "/dashboard/licenses", label: "Licenses" },
  { href: "/dashboard/mfa", label: "MFA" },
  { href: "/dashboard/export", label: "Export" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-muted h-screen px-4 py-8 border-r flex flex-col gap-2 fixed">
      <div className="mb-8 text-lg font-bold">Cloud License</div>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`block px-3 py-2 rounded hover:bg-accent transition-colors ${pathname === item.href ? "bg-accent font-semibold" : ""}`}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
