import React from "react";
import { TmdbModalProvider } from "@/components/TmdbModalHost";
const TmdbLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    return (
        <TmdbModalProvider>
            <main className="flex-1 flex flex-col m-0 p-4 lg:m-8 lg:p-6 border-2 border-base-300 bg-base-200/80 rounded-lg shadow-xl">
                {children}
            </main>
        </TmdbModalProvider >
    );
};

export default TmdbLayout;
