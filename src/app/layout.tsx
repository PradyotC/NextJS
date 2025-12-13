import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import HeaderComponent from "@/components/headerComponent";
import "./globals.scss";
import AnimatedBackground from "@/components/AnimatedBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeHtmlWrapper from "@/components/ThemeHtmlWrapper";

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
				<ThemeProvider>
					{/* 1. The Animated Background (Placed first to be in the back) */}
					<ThemeHtmlWrapper />
					<AnimatedBackground />

					{/* 2. Content Wrapper (Needs z-index to sit above the background) */}
					<div className="relative z-10 min-h-screen">
						<HeaderComponent />
						<main role="main">
							{children}
						</main>
					</div>
				</ThemeProvider>
			</body>
			<SpeedInsights />
		</html>
	);
}