"use client";

import { createContext, useContext, useState } from "react";
import TmdbModalContents from "./TmdbModalContentsComponent";

type ModalCtx = {
  open: (id: number) => void;
  close: () => void;
};

const ModalContext = createContext<ModalCtx | null>(null);

export function useTmdbModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useTmdbModal must be used inside provider");
  return ctx;
}

export function TmdbModalProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <ModalContext.Provider
      value={{
        open: (id) => setActiveId(id),
        close: () => setActiveId(null),
      }}
    >
      {children}

      {activeId !== null && (
        <TmdbModalContents
          id={activeId}
          closeModal={() => setActiveId(null)}
        />
      )}
    </ModalContext.Provider>
  );
}
