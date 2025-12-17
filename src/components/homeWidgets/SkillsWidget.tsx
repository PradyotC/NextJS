import React, { isValidElement } from 'react';
import { SKILLS, SkillItem } from '@/components/personal-data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// Helper component to handle both IconDefinition objects and raw JSX
const SkillIconRenderer = ({ item }: { item: SkillItem }) => {
  if (isValidElement(item.icon)) {
    return <span className="text-xl h-5 w-5 flex items-center justify-center">{item.icon}</span>;
  }
  
  // It is an FA IconDefinition
  return (
    <FontAwesomeIcon 
      icon={item.icon as IconDefinition} 
      className="text-xl h-5 w-5" 
      style={{ color: item.color }} 
    />
  );
};

export default function SkillsWidget() {
  return (
    <div className="card bg-base-200 shadow-xl border border-base-400 h-full">
      <div className="card-body">
        <h3 className="card-title text-lg">Tech Stack</h3>
        
        <div className="flex flex-col h-full">
          {SKILLS.map((cat) => (
            <div className="h-full flex flex-col justify-start" key={cat.category}>
              <span className="text-xs font-bold uppercase opacity-50 mt-9 mb-6 block tracking-wider">
                {cat.category}
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                {cat.items.map((skill) => (
                  <div 
                    key={skill.item} 
                    className="badge badge-lg p-3 h-auto py-2 gap-2 bg-white/30 hover:bg-white/20 border border-base-400 transition-colors cursor-default"
                  >
                    <SkillIconRenderer item={skill} />
                    <span className="text-sm font-medium">{skill.item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}