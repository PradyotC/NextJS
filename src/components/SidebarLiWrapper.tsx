'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarLiWrapper({
  children,
  path,
}: {
  children: React.ReactNode;
  path: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === path;

  return (
    <Link
      href={path}
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex flex-col lg:flex-row items-center justify-start gap-1 lg:gap-2 min-w-[72px] text-xs lg:text-sm transition-colors",
        isActive
          ? "text-base-content font-semibold"
          : "text-base-content/60 opacity-70 hover:opacity-100",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
