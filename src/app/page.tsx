import React from "react";
import ProfileCard from '@/components/homeWidgets/ProfileCard';
import TimelineWidget from '@/components/homeWidgets/TimelineWidget';
import SkillsWidget from '@/components/homeWidgets/SkillsWidget';
import Link from 'next/link';
import ProjectsWidget from "@/components/homeWidgets/ProjectsWidget";
import AchievementsWidget from "@/components/homeWidgets/AchievementsWidget";


export default function Home() {
	return (
		<React.Fragment>
			<div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6">

				{/* Top Row: Profile & Core Identity (3 columns) */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<ProfileCard />
					</div>
					<div className="h-full">
						<SkillsWidget />
					</div>
				</div>

				{/* --- MIDDLE ROW (Balanced Project/Timeline) --- */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

					{/* Column 1: Projects (1/3 width) */}
					<div className="lg:col-span-1">
						<ProjectsWidget />
					</div>

					{/* Columns 2 & 3: Timeline (2/3 width) */}
					<div className="lg:col-span-2">
						<TimelineWidget />
					</div>

					{/* The Achievements card was moved out of this row to fix the layout */}

				</div>

				{/* --- NEW ROW FOR ACHIEVEMENTS (Optional, or integrate into app row) --- */}
				{/* If you want achievements to span one column next to an app tile: */}

				<div className="w-full">
                    <AchievementsWidget />
                </div>

				<div>

					{/* Bottom Row: The "Apps" (Your Next.js Projects) */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{/* Stocks App Tile */}
						<Link href="/stocks" className="group">
							<div className="card bg-base-200 shadow-md hover:shadow-xl transition-all border border-base-200 h-64">
								<div className="card-body">
									<h3 className="card-title text-success">Market Watch</h3>
									{/* Place a mini-chart or just the top gainer here */}
									<p className="text-sm opacity-70">Live stock data via AlphaVantage</p>
								</div>
							</div>
						</Link>

						{/* Freesound App Tile */}
						<Link href="/freesound" className="group">
							<div className="card bg-base-200 shadow-md hover:shadow-xl transition-all border border-base-200 h-64">
								<div className="card-body">
									<h3 className="card-title text-warning">Sound Library</h3>
									<p className="text-sm opacity-70">Search & visualize audio samples</p>
								</div>
							</div>
						</Link>

						{/* TMDB App Tile */}
						<Link href="/tmdb" className="group">
							<div className="card bg-base-200 shadow-md hover:shadow-xl transition-all border border-base-200 h-64">
								<div className="card-body">
									<h3 className="card-title text-primary">Movies</h3>
									<p className="text-sm opacity-70">Trending now</p>
								</div>
							</div>
						</Link>

						{/* News App Tile (will wrap to next line if screen is not large enough) */}
						<Link href="/news" className="group">
							<div className="card bg-base-200 shadow-md hover:shadow-xl transition-all border border-base-200 h-64">
								<div className="card-body">
									<h3 className="card-title text-info">Daily Briefing</h3>
									<p className="text-sm opacity-70">Latest headlines</p>
								</div>
							</div>
						</Link>

					</div>
				</div>

			</div>
		</React.Fragment>
	);
}