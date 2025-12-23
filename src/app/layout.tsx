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
import ThemeToggle from "@/components/ThemeToggle";
import Sidebar from "@/components/layouts/SidebarMenu";
import ImageWithChecks from "@/components/ImageCheck";
import { getSidebarData } from "@/lib/server/nav-data";

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

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const navItems = await getSidebarData();
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
				suppressHydrationWarning // Add 'relative'
			>
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
						<Sidebar menuItems={navItems} />

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
										<ImageWithChecks wrapperClassName="flex items-center justify-center w-full h-full m-0 p-0" src="/icon.svg" alt="Main Icon" width={26} height={26} />
										<span className="font-semibold">Portfolio</span>
									</Link>
									<ThemeToggle />
								</div>
							</header>

							{/* Page Content - Independent Scroll */}
							<main className="grow overflow-y-auto py-6 px-3 lg:px-6 w-full">
								{children}
							</main>
						</div>
					</div>
				</ThemeProvider>
			</body>
			<SpeedInsights />
		</html>
	);
}