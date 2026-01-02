// src/lib/server/nav-data.ts
import {
    faHome,
    faChartLine,
    faNewspaper,
    faFilm,
    faCode,
    faPlayCircle,
    faFire,
    faArrowTrendUp,
    faStar,
    faCalendar,
    faLineChart,
    faTerminal,
    faGlobe,
    faFlag,
    faMicrochip,
    faMasksTheater,
    faBaseballBatBall,
    faFlaskVial,
    faHouseMedical,
    faMusic,
    // Add these new icons:
    faHeadphones,
    faBolt,
    faGuitar,
    faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { getSandboxNavItems } from "./sandbox-nav";
import { generateNavLinks, RawNavItem } from "./nav-util";

export async function getSidebarData() {
    // Await the dynamic DB data here
    const sandboxItems = await getSandboxNavItems();

    // Define the Tree structure inside the function
    const RAW_NAV_TREE: RawNavItem[] = [
        { title: "Home", icon: faHome, href: "/" },
        {
            title: "Daily",
            icon: faChartLine,
            noLink: true,
            subItems: [
                {
                    title: "Tmdb",
                    icon: faFilm,
                    subItems: [
                        { title: "Now Playing", icon: faPlayCircle },
                        { title: "Popular", icon: faFire },
                        { title: "Trending", icon: faArrowTrendUp },
                        { title: "Top Rated", icon: faStar },
                        { title: "Upcoming", icon: faCalendar },
                    ],
                },
                // Updated Music Section
                {
                    title: "Music",
                    icon: faMusic,
                    subItems: [
                        { title: "Lofi", icon: faHeadphones },
                        { title: "Pop", icon: faMusic },
                        { title: "Rock", icon: faGuitar },
                        { title: "Electronic", icon: faBolt },
                        { title: "Jazz", icon: faMusic },
                        { title: "Classical", icon: faMusic },
                    ],
                },
                {
                    title: "News",
                    icon: faNewspaper,
                    subItems: [
                        { title: "General", icon: faNewspaper },
                        { title: "World", icon: faGlobe },
                        { title: "Nation", icon: faFlag },
                        { title: "Business", icon: faChartLine },
                        { title: "Technology", icon: faMicrochip },
                        { title: "Entertainment", icon: faMasksTheater },
                        { title: "Sports", icon: faBaseballBatBall },
                        { title: "Science", icon: faFlaskVial },
                        { title: "Health", icon: faHouseMedical },
                    ],
                },
                { title: "Stocks", icon: faLineChart },
            ],
        },
        {
            title: "Development",
            icon: faCode,
            noLink: true,
            subItems: [
                {
                    title: "Sandbox",
                    icon: faTerminal,
                    noLink: true,
                    subItems: sandboxItems,
                },
            ],
        },
        { title: "About", icon: faCircleInfo, href: "/about" },
    ];

    // Generate and return final links
    return generateNavLinks(RAW_NAV_TREE);
}
