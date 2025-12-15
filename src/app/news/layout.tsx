import { toSentenceCase } from "@/lib/util";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBaseballBatBall, faChartLine, faFlag, faFlaskVial, faGlobe, faHouseMedical, faMasksTheater, faMicrochip, faNewspaper, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import SidebarLiWrapper from "@/components/SidebarLiWrapper";

type categoryData = {
    label: string,
    icon: IconDefinition
}

const categories: categoryData[] = [
    { label: "general", icon: faNewspaper },
    { label: "world", icon: faGlobe },
    { label: "nation", icon: faFlag },
    { label: "business", icon: faChartLine },
    { label: "technology", icon: faMicrochip },
    { label: "entertainment", icon: faMasksTheater },
    { label: "sports", icon: faBaseballBatBall },
    { label: "science", icon: faFlaskVial },
    { label: "health", icon: faHouseMedical },
];


const NewsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex flex-col lg:flex-row">
            <aside
                className="sticky top-16 lg:top-25 lg:h-fit z-40 my-4 p-4 lg:m-4 lg:p-6 border-2 border-base-300 bg-base-200 lg:bg-base-200/80 rounded-none lg:rounded-lg shadow-xl text-base-content flex items-center lg:items-start"
            >
                <ul className="flex flex-row lg:flex-col lg:justify-center lg:items-start items-center space-x-1 lg:space-y-10 overflow-x-auto no-scrollbar ">
                    {categories.map((item) => {
                        return (
                            <li key={item.label}>
                                <SidebarLiWrapper path={`/news/${item.label}`}>
                                    <FontAwesomeIcon icon={item.icon} className="text-xl lg:text-base" />
                                    <span>{toSentenceCase(item.label)}</span>
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
    );
};

export default NewsLayout;