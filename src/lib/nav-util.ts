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

// --- Helpers ---

/**
 * Converts "Now Playing" -> "now-playing"
 */
function toSlug(str: string): string {
	return str.toLowerCase().trim().replace(/\s+/g, "-");
}

export function urlStringToSentenceCase(str: string): string {
	if (!str) return str;
	const clean = str.replace(/-/g, " ");
	return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// --- Types ---

// 1. Input Type: href is optional
type RawNavItem = {
	title: string;
	icon?: any;
	href?: string; // Optional override (e.g., for "/")
	subItems?: RawNavItem[];
};

// 2. Output Type: href is required (calculated)
export type NavItem = {
	title: string;
	icon?: any;
	href: string;
	subItems?: NavItem[];
};

// --- Data Definition (Simplified) ---

const RAW_NAV_TREE: RawNavItem[] = [
	{ title: "Home", icon: faHome, href: "/" }, // Explicit override for root
	{
		title: "Daily",
		icon: faChartLine,
		subItems: [
			{
				title: "Tmdb",
				icon: faFilm,
				subItems: [
					{ title: "Now Playing", icon: faPlayCircle }, // href -> /daily/tmdb/now-playing
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
		subItems: [
			{ title: "Sandbox", icon: faTerminal },
		],
	},
];

// --- Recursive Generator ---

function generateNavLinks(items: RawNavItem[], parentPath: string = ""): NavItem[] {
	return items.map((item) => {
		// 1. Determine the segment (either explicit href or slugified title)
		let currentPath: string;

		if (item.href && item.href.startsWith("/")) {
			// If it's an absolute path (like "/"), ignore parent path
			currentPath = item.href;
		} else {
			// Otherwise, append to parent path
			const slug = item.href || toSlug(item.title);
			// Ensure we don't end up with "//" if parent is root
			const prefix = parentPath === "/" ? "" : parentPath;
			currentPath = `${prefix}/${slug}`;
		}

		// 2. Process children recursively
		const processedSubItems = item.subItems
			? generateNavLinks(item.subItems, currentPath)
			: undefined;

		return {
			title: item.title,
			icon: item.icon,
			href: currentPath,
			subItems: processedSubItems,
		};
	});
}

// Export the fully hydrated list
export const NAV_ITEMS = generateNavLinks(RAW_NAV_TREE);