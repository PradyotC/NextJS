import { ACHIEVEMENTS } from '../personal-data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export default function AchievementsWidget() {
    return (
        <div className="card bg-base-200 shadow-xl border border-base-300 h-full">
            <div className="card-body">
                <h3 className="card-title mb-2 text-base-content">Achievements</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ACHIEVEMENTS.map((achievement) => (
                        <li 
                            key={achievement.id} 
                            className="p-4 bg-base-300/60 flex gap-4 items-center rounded-lg border border-base-300 transition-all hover:bg-base-300"
                        >
                            <div className="text-3xl text-warning">
                                <FontAwesomeIcon icon={achievement.icon as IconDefinition} />
                            </div>
                            <div>
                                <div className="font-bold text-sm lg:text-base leading-tight">
                                    {achievement.title}
                                </div>
                                <div className="text-xs opacity-70 mt-1">
                                    {achievement.desc}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}