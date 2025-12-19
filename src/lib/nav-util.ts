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
} from "@fortawesome/free-solid-svg-icons";
import { SNIPPETS } from "./sandbox-data";
import { faGolang, faPython } from "@fortawesome/free-brands-svg-icons";

// --- Helpers ---

export function toSlug(str: string): string {
    return str.toLowerCase().trim().replace(/\s+/g, "-");
}

export function urlStringToSentenceCase(str: string): string {
    if (!str) return str;
    const clean = str.replace(/-/g, " ");
    return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// --- Types ---

export type RawNavItem = {
    title: string;
    icon?: any;
    href?: string;
    noLink?: boolean;
    subItems?: RawNavItem[];
};

export type NavItem = {
    title: string;
    icon?: any;
    href?: string;
    subItems?: NavItem[];
};

// --- Dynamic Data Generation ---

// 1. Buckets for our categories
const goSubItems: RawNavItem[] = [];
const pythonSubItems: RawNavItem[] = [];
const otherSubItems: RawNavItem[] = [];

// 2. Iterate SNIPPETS once to populate buckets
SNIPPETS.forEach((snippet) => {
    const item: RawNavItem = {
        title: snippet.navTitle,
        icon: snippet.language === "go" 
            ? faGolang 
            : snippet.language === "python" 
                ? faPython 
                : faTerminal,
    };

    if (snippet.language === "go") {
        goSubItems.push(item);
    } else if (snippet.language === "python") {
        pythonSubItems.push(item);
    } else {
        otherSubItems.push(item);
    }
});

// 3. Construct the "Sandbox" folder structure
const sandboxFolderItems: RawNavItem[] = [];

if (goSubItems.length > 0) {
    sandboxFolderItems.push({
        title: "Go",
        icon: faGolang,
        noLink: true,
        subItems: goSubItems,
    });
}
if (pythonSubItems.length > 0) {
    sandboxFolderItems.push({
        title: "Python",
        icon: faPython,
        noLink: true,
        subItems: pythonSubItems,
    });
}
if (otherSubItems.length > 0) {
    sandboxFolderItems.push({
        title: "Other",
        icon: faTerminal,
        noLink: true,
        subItems: otherSubItems,
    });
}

// --- Main Navigation Tree ---

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
                subItems: sandboxFolderItems,
            },
        ],
    },
];

// --- Recursive Generator ---

function generateNavLinks(
    items: RawNavItem[],
    parentPath: string = ""
): NavItem[] {
    return items.map((item) => {
        let currentPath: string;

        if (item.href && item.href.startsWith("/")) {
            currentPath = item.href;
        } else {
            const slug = item.href || toSlug(item.title);
            const prefix = parentPath === "/" ? "" : parentPath;
            currentPath = `${prefix}/${slug}`;
        }

        const processedSubItems = item.subItems
            ? generateNavLinks(item.subItems, currentPath)
            : undefined;

        return {
            title: item.title,
            icon: item.icon,
            href: item.noLink ? undefined : currentPath,
            subItems: processedSubItems,
        };
    });
}

export const NAV_ITEMS = generateNavLinks(RAW_NAV_TREE);