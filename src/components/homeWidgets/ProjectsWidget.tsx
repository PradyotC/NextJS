import React from 'react';
import { sampleProjects, Project } from '@/components/personal-data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faPlay, faFileAlt, faVideo } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';


// Helper component to render action links
const ProjectActionLink: React.FC<{ project: Project }> = ({ project }) => {
    return (
        <div className="flex flex-wrap gap-2 text-xs">
            {project.code && (
                <a 
                    href={project.code} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="badge badge-outline badge-sm gap-1 hover:bg-base-300 transition-colors"
                >
                    <FontAwesomeIcon icon={faGithub} /> Code
                </a>
            )}
            {project.demo && (
                <a 
                    href={project.demo} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="badge badge-info badge-sm gap-1 hover:bg-info/80 transition-colors text-info-content"
                >
                    <FontAwesomeIcon icon={faPlay} /> Demo
                </a>
            )}
            {project.publication && (
                <a 
                    href={project.publication} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="badge badge-accent badge-sm gap-1 hover:bg-accent/80 transition-colors text-accent-content"
                >
                    <FontAwesomeIcon icon={faFileAlt} /> Paper
                </a>
            )}
            {project.video && (
                <a 
                    href={project.video} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="badge badge-secondary badge-sm gap-1 hover:bg-secondary/80 transition-colors text-secondary-content"
                >
                    <FontAwesomeIcon icon={faVideo} /> Video
                </a>
            )}
        </div>
    );
};


const ProjectsWidget: React.FC = () => {
    // Show only the top 4 projects for a dashboard widget
    const projectsToShow = sampleProjects;

    return (
        <div className="card bg-base-200 shadow-xl border border-base-400 h-full">
            <div className="card-body p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title text-lg">
                        <FontAwesomeIcon icon={faCode} className="text-primary w-4 h-4"/>
                        Featured Projects
                    </h3>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-150 no-scrollbar"> 
                    {projectsToShow.map((project) => (
                        <div 
                            key={project.id} 
                            className="p-3 bg-base-300/60 rounded-lg border border-base-300"
                        >
                            <h4 className="font-bold text-base line-clamp-1">{project.name}</h4>
                            <span className="badge badge-sm badge-outline mt-1 mb-2 opacity-70">{project.category}</span>
                            <p className="text-xs text-base-content/80 line-clamp-2 mb-3">
                                {project.description}
                            </p>
                            <ProjectActionLink project={project} />
                        </div>
                    ))}
                </div>

                {projectsToShow.length === 0 && (
                    <p className="text-center text-gray-500 italic mt-8">
                        No projects to display yet.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProjectsWidget;