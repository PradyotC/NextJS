// src/lib/server/nav-data.ts
import { 
    faHome, faChartLine, faNewspaper, faFilm, faCode, faPlayCircle, 
    faFire, faArrowTrendUp, faStar, faCalendar, faLineChart, faTerminal, 
    faGlobe, faFlag, faMicrochip, faMasksTheater, faBaseballBatBall, 
    faFlaskVial, faHouseMedical, faMusic 
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
                { title: "Freesound", icon: faMusic },
                { title: "Jamendo", icon: faMusic },
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
                    subItems: sandboxItems
                },
            ],
        },
    ];

    // Generate and return final links
    return generateNavLinks(RAW_NAV_TREE);
}