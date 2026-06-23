import { motion } from 'motion/react';
import { Calendar, Building, BookOpen } from 'lucide-react';
import { ExperienceItem } from '../types';

export default function Experience() {
  const experiences: ExperienceItem[] = [
    {
      id: 'kuraztech',
      role: 'Back End Developer Intern',
      company: 'Kuraztech',
      period: 'Jul 2025 - Oct 2025',
      bullets: [
        'Led the backend team and collaborated closely with frontend developers.',
        'Designed and implemented RESTful APIs with comprehensive API documentation.',
        'Improved system performance by ~35% using background queues and scheduled tasks.',
        'Developed secure callback webhooks for Chapa payment integration.',
        'Integrated Cloudinary for media/file uploads and implemented automated email services.'
      ],
      technologies: ['Laravel', 'PHP', 'MySQL', 'Redis', 'Cloudinary', 'Chapa API', 'RESTful APIs', 'Queues & Scheduling']
    },
    {
      id: 'essti',
      role: 'Full-stack Developer Intern (ETHIOPIAN SPACE SCIENCE AND TECHNOLOGY INSTITUTE)',
      company: 'ESSTI',
      period: 'Mar 2025 - Jun 2025',
      bullets: [
        'Developed and designed scalable RESTful APIs using Django and DRF for a vehicle fleet management system.',
        'Built core backend logic for tracking, updating, and managing vehicles, drivers, and trip assignments.',
        'Integrated OpenStreetMap into the admin dashboard for real-time vehicle location visualization.',
        'Collaborated with frontend team for smooth API consumption and handled backend optimization.',
        'Gained hands-on experience with database modeling, user authentication, and role-based permissions.'
      ],
      technologies: ['Django', 'Django REST Framework']
    }
  ];

  return (
    <section id="experience" className="py-24 bg-transparent border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Experience Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-end mb-16" id="experience-header">
          <div>
            <div className="mb-4">
              <span className="font-display text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#1C1C1E] uppercase bg-black/5 px-3.5 py-1.5 rounded-full">
                EXPERIENCE
              </span>
            </div>
            <h2 className="font-display text-4.5xl sm:text-5xl font-light text-[#1C1C1E] tracking-tight leading-none uppercase">
              A snapshot of
              <span className="block font-black uppercase mt-1 text-black tracking-tight select-none">
                my creative growth
              </span>
            </h2>
          </div>
          <div>
            <p className="font-sans text-sm md:text-base text-gray-500 leading-relaxed max-w-md md:ml-auto font-light">
              A timeline of architectural excellence and technical leadership at world-class technology firms and research institutes.
            </p>
          </div>
        </div>

        {/* Timeline Body */}
        <div className="space-y-12 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-black/10 pl-6 md:pl-10" id="experience-timeline">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative group pb-4"
              id={`experience-item-${exp.id}`}
            >
              {/* Timeline Bullet Anchor */}
              <div className="absolute -left-[31px] md:-left-[47px] top-2.5 w-3 h-3 rounded-full bg-[#1C1C1E] border-2 border-white ring-4 ring-black/5 group-hover:scale-110 transition-transform duration-200 shadow-sm" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
                
                {/* Left side: Role & details (spanning 8 columns) */}
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <h3 className="font-display text-lg md:text-xl font-bold text-black uppercase leading-snug group-hover:text-black transition-colors">
                      {exp.role}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span className="font-semibold text-black flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        {exp.company}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {exp.period}
                      </span>
                    </div>
                  </div>

                  {/* Bullet statements */}
                  <ul className="space-y-3.5 text-xs md:text-sm text-gray-500 leading-relaxed font-light">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 text-gray-600">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-black/40 mt-2 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right side: Tech tags list (spanning 4 columns) */}
                <div className="lg:col-span-4 flex flex-col lg:items-end justify-start space-y-4" id={`experience-meta-${exp.id}`}>
                  {/* Styled block representing tech pile */}
                  <div className="w-full lg:text-right bg-white lg:bg-transparent p-5 lg:p-0 rounded-[20px] border border-black/5 lg:border-none shadow-sm lg:shadow-none font-sans">
                    <span className="text-[10px] font-display font-bold text-gray-400 block tracking-widest uppercase mb-2">
                      TECHNOLOGIES
                    </span>
                    <div className="flex flex-wrap lg:justify-end gap-1.5">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="font-display text-[9px] md:text-[10px] font-semibold text-black bg-neutral-100 px-3 py-1.5 rounded-full hover:bg-black hover:text-white transition-colors cursor-default"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Period badge highlighted as in mockup */}
                  <div className="hidden lg:flex items-center gap-2 text-right">
                    <span className="font-display text-xs md:text-sm font-medium tracking-wide text-gray-900 border-l border-black/10 pl-4 uppercase">
                      {exp.period}
                    </span>
                  </div>
                </div>

              </div>

              {/* Decorative block separator */}
              {index < experiences.length - 1 && (
                <div className="h-[1px] w-full bg-gray-100/80 my-8 lg:my-10" />
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
