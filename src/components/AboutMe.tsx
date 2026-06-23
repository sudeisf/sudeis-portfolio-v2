import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface AboutMeProps {
  portraitPath: string;
}

export default function AboutMe({ portraitPath }: AboutMeProps) {
  const experiences = [
    {
      title: '1+ YEAR EXPERIENCE IN WEB DEVELOPMENT',
      details: 'Led several end-to-end web products from architecture schema definitions to responsive frontends.'
    },
    {
      title: 'DJANGO, LARAVEL, FASTAPI, EXPRESS',
      details: 'Proficient in Python & PHP backends with solid RESTful API practices, databases, memory caching and messaging queues.'
    },
    {
      title: 'REACT, NEXT.JS, TAILWIND CSS',
      details: 'Expertise in modern component-driven architectures, custom state management, and pixel-perfect design accuracy.'
    },
    {
      title: 'DOCKER, VPS, SSH, CI/CD',
      details: 'Experienced in containerization, deploying and maintaining virtual servers, secure remote access, and setting up automated integration/deployment pipelines.'
    }
  ];

  return (
    <section id="about" className="py-24 bg-transparent border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Image Left Col */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-start" id="about-image-col">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-[420px] aspect-[3/4] overflow-hidden rounded-[24px] border border-black/5 shadow-sm relative group bg-neutral-100"
            >
              <img
                src={portraitPath}
                alt="Sudeis F. - Professional Portrait"
                className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700 ease-out"
                referrerPolicy="no-referrer"
                id="about-portrait-img"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          </div>

          {/* Content Right Col */}
          <div className="lg:col-span-7 flex flex-col justify-center" id="about-content-col">
            {/* Styled Broad Category Title */}
            <div className="mb-4">
              <span className="font-display text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#1C1C1E] uppercase bg-black/5 px-3.5 py-1.5 rounded-full">
                ABOUT ME
              </span>
            </div>

            {/* Subtitle Headline */}
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#1C1C1E] tracking-tight leading-snug mt-6 mb-6 uppercase">
              Software Engineering student and full-stack developer passionate about building scalable, user-focused applications.
            </h2>

            {/* Paragraph Description */}
            <div className="font-sans text-sm md:text-base text-gray-500 space-y-4 leading-relaxed mb-8 font-light">
              <p>
                I specialize in transforming complex ideas into reliable products, with a deep focus on software architecture, backend engineering, and system design. To me, great software is a balance of functionality, clean logic, and effortless evolution.
              </p>
              <p>
                Constantly learning and building, I aim to deliver thoughtful, high-quality solutions within high-performing engineering teams.
              </p>
            </div>

            {/* Bullet Points with Checkboxes */}
            <div className="space-y-4 border-t border-black/5 pt-6" id="about-bullets">
              {experiences.map((exp, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  key={index} 
                  className="flex items-start gap-4 pb-4 border-b border-black/5 last:border-0 last:pb-0 transition-all group"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border border-black/15 flex items-center justify-center bg-[#1C1C1E] text-white group-hover:bg-neutral-100 group-hover:text-black transition-all mt-1">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-display text-xs md:text-sm font-bold tracking-wider text-black uppercase">
                      {exp.title}
                    </h3>
                    <p className="font-sans text-xs md:text-sm text-gray-500 mt-1 leading-relaxed font-light">
                      {exp.details}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
