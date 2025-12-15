import React from "react";
import {
    faCalendar,
    faPlayCircle,
    faStar,
    IconDefinition,
} from "@fortawesome/free-regular-svg-icons";
import { faArrowTrendUp, faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TmdbModalProvider } from "@/components/TmdbModalHost";
import SidebarLiWrapper from "@/components/SidebarLiWrapper";

type TabData = {
    path: string;
    icon: IconDefinition;
};

type TabInfo = {
    [key: string]: TabData
}

export const tabsInfo: TabInfo = {
    "Now Playing": { path: "movie/now_playing", icon: faPlayCircle },
    "Popular": { path: "movie/popular", icon: faFire },
    "Trending": { path: "trending/movie/week?language=en-US", icon: faArrowTrendUp },
    "Top Rated": { path: "movie/top_rated", icon: faStar },
    "Upcoming": { path: "movie/upcoming", icon: faCalendar }
};

const TmdbLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    return (
        <TmdbModalProvider>
            <div className="flex flex-col lg:flex-row">
                <aside
                    className="sticky top-16 lg:top-25 lg:h-fit z-40 my-4 p-4 lg:m-4 lg:p-6 border-2 border-base-300 bg-base-200 lg:bg-base-200/80 rounded-none lg:rounded-lg shadow-xl text-base-content flex items-center lg:items-start"
                >
                    <ul className="flex flex-row lg:flex-col lg:justify-center lg:items-start items-center space-x-1 lg:space-y-10 overflow-x-auto no-scrollbar ">
                        {Object.entries(tabsInfo).map(([label, tabData]) => {
                            const slug = label.replaceAll(" ", "-");
                            return (
                                <li key={tabData.path}>
                                    <SidebarLiWrapper path={`/tmdb/${slug}`}>
                                            <FontAwesomeIcon icon={tabData.icon} className="text-xl lg:text-base" />
                                            <span>{label}</span>
                                    </SidebarLiWrapper>
                                </li>
                            );
                        })}
                    </ul>
                </aside>

                <main className="flex-1 flex flex-col m-0 p-4 lg:m-8 lg:p-6 border-2 border-base-300 bg-base-200/80 rounded-lg shadow-xl">
                    {children}
                </main>
            </div>
        </TmdbModalProvider >
    );
};

export default TmdbLayout;
