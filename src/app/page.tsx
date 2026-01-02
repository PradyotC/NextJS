import React from "react";
import ProfileCard from '@/components/homeWidgets/ProfileCard';
import TimelineWidget from '@/components/homeWidgets/TimelineWidget';
import SkillsWidget from '@/components/homeWidgets/SkillsWidget';
import ProjectsWidget from "@/components/homeWidgets/ProjectsWidget";
import AchievementsWidget from "@/components/homeWidgets/AchievementsWidget";
import StockWidget from "@/components/homeWidgets/StockWidget";
import MusicWidget from "@/components/homeWidgets/MusicWidget";
import MovieWidget from "@/components/homeWidgets/MovieWidget";
import NewsWidget from "@/components/homeWidgets/NewsWidget";


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

						<div className="h-full min-h-[300px]">
							<StockWidget />
						</div>

						<div className="h-full min-h-[300px]">
							<MusicWidget />
						</div>

						<div className="h-full min-h-[300px]">
							<MovieWidget />
						</div>

						<div className="h-full min-h-[300px]">
							<NewsWidget />
						</div>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}