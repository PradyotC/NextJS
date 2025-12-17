"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChevronDown,
	faChevronUp,
	faChevronRight,
	faChevronLeft,
	faTimes,
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
import Image from "next/image";
import ThemeToggle from "../ThemeToggle";

type NavItem = {
	title: string;
	icon?: any;
	href?: string;
	subItems?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
	{ title: "Home", icon: faHome, href: "/" },
	{
		title: "Daily",
		icon: faChartLine,
		href: "/daily",
		subItems: [
			{
				title: "Tmdb",
				icon: faFilm,
				href: "/daily/tmdb",
				subItems: [
					{ title: "Now Playing", href: "/daily/tmdb/Now-Playing", icon: faPlayCircle },
					{ title: "Popular", href: "/daily/tmdb/Popular", icon: faFire },
					{ title: "Trending", href: "/daily/tmdb/Trending", icon: faArrowTrendUp },
					{ title: "Top Rated", href: "/daily/tmdb/Top-Rated", icon: faStar },
					{ title: "Upcoming", href: "/daily/tmdb/Upcoming", icon: faCalendar },
				],
			},
			{ title: "Freesound", href: "/daily/freesound", icon: faMusic },
			{ title: "Jamendo", href: "/daily/jamendo", icon: faMusic },
			{
				title: "News",
				icon: faNewspaper,
				href: "/daily/news",
				subItems: [
					{ title: "General", href: "/daily/news/general", icon: faNewspaper },
					{ title: "World", href: "/daily/news/world", icon: faGlobe },
					{ title: "Nation", href: "/daily/news/nation", icon: faFlag },
					{ title: "Business", href: "/daily/news/business", icon: faChartLine },
					{ title: "Technology", href: "/daily/news/technology", icon: faMicrochip },
					{ title: "Entertainment", href: "/daily/news/entertainment", icon: faMasksTheater },
					{ title: "Sports", href: "/daily/news/sports", icon: faBaseballBatBall },
					{ title: "Science", href: "/daily/news/science", icon: faFlaskVial },
					{ title: "Health", href: "/daily/news/health", icon: faHouseMedical },
				],
			},
			{ title: "Stocks", href: "/daily/stocks", icon: faLineChart },
		],
	},
	{
		title: "Development",
		icon: faCode,
		href: "/development",
		subItems: [
			{ title: "Sandbox", icon: faTerminal, href: "/development/sandbox" },
		],
	},
];

export default function Sidebar() {
	const pathname = usePathname();
	const [isDesktopOpen, setIsDesktopOpen] = useState(true);

	return (
		<>
			{/* DESKTOP TOGGLE PILL */}
			<button
				onClick={() => setIsDesktopOpen(!isDesktopOpen)}
				className={`
                    fixed z-[60] top-1/2 -translate-y-1/2 
                    hidden lg:flex items-center justify-center 
                    h-12 w-5 bg-base-300 hover:bg-primary hover:text-primary-content
                    rounded-r-md cursor-pointer shadow-md
                    text-base-content/50 border-y border-r border-base-300/50
                    ${isDesktopOpen ? "left-64" : "left-0"}
                `}
				aria-label="Toggle Desktop Sidebar"
			>
				<FontAwesomeIcon
					icon={isDesktopOpen ? faChevronLeft : faChevronRight}
					className="w-3 h-3"
				/>
			</button>

			{/* SIDEBAR CONTAINER */}
			<aside
				data-theme="dark"
				className={`
                    fixed inset-y-0 left-0 z-50 
                    bg-base-200
                    
                    /* Key Fix: Always overflow-hidden so content doesn't bleed during transition */
                    overflow-hidden

                    /* Mobile: Slide in/out logic */
                    w-64 -translate-x-full peer-checked:translate-x-0
                    
                    /* Desktop: Width transition logic */
                    lg:translate-x-0 lg:static 
                    ${isDesktopOpen ? "lg:w-64 border-r border-base-300" : "lg:w-0 border-none"}
                `}
			>
				{/* Inner Container with fixed width. 
                    This keeps the content layout stable while the parent container shrinks.
                */}
				<div className="w-64 h-full flex flex-col whitespace-nowrap">
					<div className="flex items-center shrink-0 w-full h-16 px-3 border-b border-base-300">
						<div className="w-full hidden lg:flex lg:justify-between items-center">
							<Link
								href="/"
								className="btn btn-ghost normal-case text-xl text-base-content gap-2"
							>
								<Image src="/icon.svg" alt='Main Icon' width={26} height={26} />
								<span className="font-semibold">Portfolio</span>
							</Link>
							<ThemeToggle />
						</div>

						<div className="w-full flex lg:hidden justify-between items-center px-2">
							<span className="font-bold">Menu</span>
							<label
								htmlFor="sidebar-toggle"
								className="cursor-pointer text-base-content/60 hover:text-base-content"
							>
								<FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
							</label>
						</div>
					</div>

					<nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
						{NAV_ITEMS.map((item, idx) => (
							<SidebarItem
								key={item.href ?? item.title + idx}
								item={item}
								pathname={pathname}
								depth={0}
							/>
						))}
					</nav>
				</div>
			</aside>
		</>
	);
}

function isPathActive(item: NavItem, pathname: string | null): boolean {
	if (!pathname || !item.href) return false;
	if (pathname === item.href) return true;
	if (item.href !== "/" && pathname.startsWith(item.href + "/")) return true;
	if (item.subItems) {
		return item.subItems.some((child) => isPathActive(child, pathname));
	}
	return false;
}

function SidebarItem({ item, pathname, depth }: { item: NavItem; pathname: string | null; depth: number }) {
	const hasChildren = Boolean(item.subItems && item.subItems.length > 0);

	const isExact = item.href === pathname;
	const isPrefix = item.href !== "/" && pathname?.startsWith(item.href + "/");
	const thisIsActive = Boolean(item.href && (isExact || (!hasChildren && isPrefix)));
	const childActive = Boolean(isPathActive(item, pathname) && !thisIsActive);

	const [isOpen, setIsOpen] = useState(childActive || thisIsActive);

	useEffect(() => {
		if (childActive || thisIsActive) {
			const sampletimer = setTimeout(() => setIsOpen(true), 0);
			return () => clearTimeout(sampletimer);
		}
	}, [childActive, thisIsActive]);

	const indentClass = depth === 0 ? "" : "ml-4 pl-3 border-l";
	const borderClass = depth === 0 ? "" : "border-base-content/10";
	const wrapperClasses = `mb-1 ${indentClass} ${borderClass}`;

	const activeIconColor = "text-primary-content";
	const childActiveIconColor = "text-primary";
	const inactiveIconColor = "text-base-content/50";

	const activeTextColor = "text-primary-content";
	const childActiveTextColor = "text-primary";
	const inactiveTextColor = "text-base-content/70";

	if (hasChildren) {
		return (
			<div className={wrapperClasses}>
				<div className={`
                    flex items-stretch rounded-box overflow-hidden transition-colors duration-200
                    ${thisIsActive ? "bg-primary shadow-sm" : childActive ? "bg-primary/10" : "hover:bg-base-300"}
                `}>
					{item.href ? (
						<Link
							href={item.href}
							className={`flex-1 flex items-center gap-3 px-3 py-2.5 text-sm font-medium
                                ${thisIsActive ? activeTextColor : childActive ? childActiveTextColor : inactiveTextColor}
                            `}
						>
							{item.icon && (
								<FontAwesomeIcon
									icon={item.icon}
									className={`w-4 h-4 ${thisIsActive ? activeIconColor : childActive ? childActiveIconColor : inactiveIconColor}`}
								/>
							)}
							<span className="truncate">{item.title}</span>
						</Link>
					) : (
						<div className={`flex-1 flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-base-content/70 cursor-default`}>
							{item.icon && <FontAwesomeIcon icon={item.icon} className="w-4 h-4 text-base-content/50" />}
							<span className="truncate">{item.title}</span>
						</div>
					)}

					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setIsOpen(!isOpen);
						}}
						className={`
                            px-2 flex items-center justify-center cursor-pointer 
                            ${thisIsActive ? "text-primary-content/80 hover:bg-primary-focus" : "text-base-content/50 hover:bg-base-content/10"}
                        `}
						aria-label="Toggle submenu"
					>
						<FontAwesomeIcon
							icon={isOpen ? faChevronUp : faChevronDown}
							className="w-3 h-3"
						/>
					</button>
				</div>

				{isOpen && item.subItems && (
					<div className="mt-1 space-y-1">
						{item.subItems.map((sub, idx) => (
							<SidebarItem
								key={sub.href ?? sub.title + idx}
								item={sub}
								pathname={pathname}
								depth={depth + 1}
							/>
						))}
					</div>
				)}
			</div>
		);
	}

	return (
		<div className={wrapperClasses}>
			{item.href ? (
				<Link
					href={item.href}
					className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-box text-sm font-medium transition-colors duration-200
                        ${thisIsActive
							? "bg-primary text-primary-content shadow-sm"
							: "text-base-content/70 hover:bg-base-300 hover:text-base-content"
						}
                    `}
				>
					{item.icon && (
						<FontAwesomeIcon
							icon={item.icon}
							className={`w-4 h-4 ${thisIsActive ? activeIconColor : inactiveIconColor}`}
						/>
					)}
					<span className="truncate">{item.title}</span>
				</Link>
			) : (
				<div className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-base-content/50 cursor-default">
					{item.icon && <FontAwesomeIcon icon={item.icon} className="w-4 h-4 opacity-50" />}
					<span className="truncate">{item.title}</span>
				</div>
			)}
		</div>
	);
}