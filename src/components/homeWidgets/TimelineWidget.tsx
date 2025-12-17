import { TIMELINE } from '@/components/personal-data';
import { faBriefcase, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function TimelineWidget() {
  return (
    <div className="card bg-base-200 shadow-xl h-full overflow-hidden border border-base-400">
      <div className="card-body p-4 sm:p-6">
        <h3 className="card-title text-lg mb-4">Experience & Education</h3>
        <div className='flex h-full items-center justify-center'>
        <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
          {TIMELINE.map((item, index) => (
            <li key={item.id}>
              <div className="timeline-middle">
                {item.type === 'education' ? (
                    <FontAwesomeIcon icon={faGraduationCap}  className="w-5 h-5 text-accent"/> 
                ) : (
                    <FontAwesomeIcon icon={faBriefcase} className="w-5 h-5 text-secondary"/> 
                )}
              </div>
              <div className={`timeline-${index%2 === 0 ? 'start' : 'end'} ${index%2 === 0 ? 'md:text-end md:mr-10' : 'md:ml-10'} ml-5 mb-10`}>
                <time className="font-mono italic text-xs opacity-70">{item.date}</time>
                <div className="text-lg font-black">{item.title}</div>
                <div className="text-sm font-bold opacity-80">{item.org}</div>
                <p className="text-xs mt-1 max-w-xs ml-auto">{item.desc}</p>
              </div>
              {index !== TIMELINE.length - 1 && <hr className="bg-base-300"/>}
            </li>
          ))}
        </ul>
        </div>
      </div>
    </div>
  );
}