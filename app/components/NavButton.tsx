"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function NavButton({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(() => router.push(href));
      }}
      className={`${className ?? ""} relative flex items-center gap-2`}
      disabled={isPending}
    >
      {isPending && (
        <span className="spinner" />
      )}
      {children}
    </button>
  );
}