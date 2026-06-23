interface SkillsTickerProps {
  skills?: string[];
}

export default function SkillsTicker({ skills }: SkillsTickerProps) {
  const defaultSkills = [
    'DJANGO',
    'FASTAPI',
    'EXPRESS',
    'LARAVEL',
    'REACT',
    'NEXT.JS',
    'TAILWIND CSS',
    'DOCKER',
    'MYSQL',
    'REDIS',
    'POSTGRESQL'
  ];

  const skillList = skills || defaultSkills;
  
  // Duplicate the list multiple times to fill wide screens and support smooth looping
  const combinedList = [...skillList, ...skillList, ...skillList, ...skillList];

  return (
    <div 
      className="bg-transparent border-y border-black/5 py-5 overflow-hidden w-full select-none"
      id="skills-ticker-container"
    >
      <div className="relative flex items-center w-full">
        <div 
          className="animate-ticker hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing flex items-center whitespace-nowrap"
          id="skills-ticker-list"
        >
          {combinedList.map((skill, index) => (
            <div 
              key={`${skill}-${index}`} 
              className="flex items-center font-display text-[11px] md:text-xs font-black tracking-[0.25em] text-[#1C1C1E]/45 mx-8 transition-colors duration-200 hover:text-black uppercase"
            >
              <span>{skill}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-black/35 ml-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
