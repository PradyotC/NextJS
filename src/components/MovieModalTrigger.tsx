"use client";

import { useTmdbModal } from "@/components/TmdbModalHost";

export default function MovieModalTrigger({
  movieId,
  children,
}: {
  movieId: number;
  children: React.ReactNode;
}) {
  const modal = useTmdbModal();

  return (
    <button
      type="button"
      className="contents"
      onClick={() => modal.open(movieId)}
    >
      {children}
    </button>
  );
}