import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import AnimatedBackground from "@/components/AnimatedBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeHtmlWrapper from "@/components/ThemeHtmlWrapper";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import ThemeToggle from "@/components/ThemeToggle";
// import HeaderComponent from "@/components/headerComponent";
import Sidebar from "@/components/layouts/SidebarMenu";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	preload: false,
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	preload: false,
});

export const metadata: Metadata = {
	title: "Portfolio",
	icons: {
		icon: "/icon.svg",
		shortcut: "/icon.svg",
		apple: "/icon.svg"
	}
};

// const navItems = [
// 	{ name: "Home", path: "/", allowed: true },
// 	{ name: "TMDB", path: "/tmdb", allowed: true },
// 	{ name: "Jamendo", path: "/jamendo", allowed: true },
// 	{ name: "Freesound", path: "/freesound", allowed: true },
// 	{ name: "News", path: "/news", allowed: true },
// 	{ name: "Stocks", path: "/stocks", allowed: true },
// ];

// const navFilteredItems = navItems.filter((item) => item.allowed);

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
				suppressHydrationWarning // Add 'relative'
			>
				{/* <ThemeProvider>
					<ThemeHtmlWrapper />
					<AnimatedBackground />

					<div className="relative z-10 min-h-screen">
						<div
							data-theme="dark"
							className="navbar bg-[var(--header-bg)] text-base-content shadow-lg border-b border-base-200/50 sticky top-0 z-[60] transition-colors duration-300"
						>

							<div className="navbar-start">
								<div className="dropdown lg:hidden">
									<label tabIndex={0} aria-label="Open navigation menu" className="btn btn-ghost btn-circle">
										<FontAwesomeIcon icon={faBars} className="h-5 w-5" />
									</label>

									<ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-200 text-base-content rounded-box z-[1] mt-3 w-52 p-2 shadow">
										{navFilteredItems.map((item, index) => (
											<li key={index}>
												<HeaderComponent item={item} />
											</li>
										))}
									</ul>
								</div>

								<Link
									href="/"
									className="btn btn-ghost normal-case text-xl text-base-content gap-2"
								>
									<Image src="/icon.svg" alt='Main Icon' width={26} height={26} />
									<span className="font-semibold">TestNextJS</span>
								</Link>
							</div>

							<div className="navbar-center hidden lg:flex">
								<ul className="menu menu-horizontal space-x-0">
									{navItems.map((item, index) => (
										<li key={index} className="p-0 m-0">
											<HeaderComponent item={item} />
										</li>
									))}
								</ul>
							</div>

							<div className="navbar-end space-x-1">
								<ThemeToggle />
							</div>
						</div>
						<main role="main">
							{children}
						</main>
					</div>
				</ThemeProvider> */}

				<ThemeProvider>
					<ThemeHtmlWrapper />
					<AnimatedBackground />
					<div className="relative z-10 h-screen flex overflow-hidden">
						{/* Sidebar toggle */}
						<input type="checkbox" id="sidebar-toggle" className="hidden peer" />

						{/* Mobile Overlay */}
						<label
							htmlFor="sidebar-toggle"
							className="fixed inset-0 z-40 bg-neutral/50 hidden peer-checked:block lg:peer-checked:hidden"
							aria-label="Close sidebar"
						/>

						{/* Sidebar */}
						<Sidebar />

						{/* Main Content Area */}
						<div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
							{/* Mobile Header */}
							<header
								data-theme="dark"
								className="lg:hidden sticky top-0 z-30 h-16 flex items-center px-4 bg-[var(--header-bg)] border-b border-base-300 shrink-0"
							>
								<label
									htmlFor="sidebar-toggle"
									className="p-2 -ml-2 rounded-btn cursor-pointer text-base-content/70 hover:bg-base-200"
								>
									<FontAwesomeIcon icon={faBars} className="w-6 h-6" />
								</label>
								<div className="w-full flex justify-between items-center">
									<Link href="/" className="btn btn-ghost normal-case text-xl text-base-content gap-2">
										<Image src="/icon.svg" alt="Main Icon" width={26} height={26} />
										<span className="font-semibold">Portfolio</span>
									</Link>
									<ThemeToggle />
								</div>
							</header>

							{/* Page Content - Independent Scroll */}
							<main className="flex-1 overflow-y-auto py-6 px-3 lg:px-6 w-full">
								<div className="mx-auto">
									{children}
								</div>
							</main>
						</div>
					</div>
				</ThemeProvider>
			</body>
			<SpeedInsights />
		</html>
	);
}