import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUpRight, Code, Heart, Search, Eye } from 'lucide-react';
import { Project } from '../types';

interface PortfolioProps {
  projects: Project[];
}

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg', '.mkv', '.avi'];
  if (videoExtensions.some(ext => url.toLowerCase().endsWith(ext))) return true;
  if (url.includes('/video/upload/')) return true;
  return false;
};

export default function Portfolio({ projects }: PortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="portfolio" className="py-24 bg-transparent border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Title Section Spelled PORTFOLIO with modern design */}
        <div className="text-center mb-16 flex flex-col items-center" id="portfolio-title-container">
          <div className="mb-4">
            <span className="font-display text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#1C1C1E] uppercase bg-black/5 px-3.5 py-1.5 rounded-full">
              PORTFOLIO
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-light text-[#1C1C1E] uppercase tracking-tight">
            Selected <span className="font-black text-black">Works</span>
          </h2>
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14" id="portfolio-projects-grid">
          {projects.map((proj, idx) => (
            <motion.div
              key={proj.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.7 }}
              className="flex flex-col cursor-pointer group"
              onClick={() => setSelectedProject(proj)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              id={`portfolio-item-${proj.id}`}
            >
              {/* Photo Card Frame */}
              <div className="aspect-[4/3] w-full bg-[#F6F6F8] rounded-[28px] overflow-hidden border border-black/5 shadow-sm relative transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
                {isVideoUrl(proj.image) ? (
                  <video
                    src={proj.image}
                    className="w-full h-full object-cover grayscale contrast-110 brightness-[0.98] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700 ease-out"
                    muted
                    loop
                    playsInline
                    autoPlay
                    id={`portfolio-video-${proj.id}`}
                  />
                ) : (
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover grayscale contrast-110 brightness-[0.98] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700 ease-out"
                    referrerPolicy="no-referrer"
                    id={`portfolio-img-${proj.id}`}
                  />
                )}
                
                {/* Search / Magnify glass overlay interaction on hover */}
                <AnimatePresence>
                  {hoveredIndex === idx && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px] flex items-center justify-center text-white"
                    >
                      <div className="rounded-full bg-white text-black px-4 py-2 font-display text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 duration-300">
                        <Eye className="w-4 h-4" />
                        Explore Entry
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Centered Descriptive Metadata below the picture */}
              <div className="text-center mt-5" id={`portfolio-meta-${proj.id}`}>
                <h3 className="font-display text-base font-bold tracking-tight text-[#1C1C1E] group-hover:text-black transition-colors uppercase">
                  {proj.title}
                </h3>
                <span className="font-sans text-[11px] text-gray-400 font-light mt-0.5 uppercase tracking-widest block font-mono">
                  {proj.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Project Deep Dive Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Dark Mask Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-[2px]"
              id="modal-backdrop"
            />

            {/* Modal Body */}
            <motion.div
              layoutId={`project-card-${selectedProject.id}`}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-[#F6F6F8] rounded-[28px] w-full max-w-3xl overflow-hidden shadow-2xl relative z-10 border border-black/5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-250"
              id="portfolio-detail-modal"
            >
              {/* Header Banner */}
              <div className="relative aspect-video w-full bg-neutral-100 flex-shrink-0 border-b border-black/5">
                {isVideoUrl(selectedProject.image) ? (
                  <video
                    src={selectedProject.image}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    controls
                    autoPlay
                    muted
                    playsInline
                    id="modal-banner-video"
                  />
                ) : (
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    referrerPolicy="no-referrer"
                    id="modal-banner-img"
                  />
                )}
                
                {/* Close Trigger Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 bg-black hover:bg-[#1C1C1E] text-white p-2.5 rounded-full transition-all cursor-pointer shadow-md"
                  id="modal-close-btn"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow border border-white/25">
                  <span className="font-display text-[9px] text-[#1C1C1E] font-bold uppercase tracking-wider">
                    {selectedProject.category}
                  </span>
                </div>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 md:p-10 overflow-y-auto space-y-6 flex-1 bg-[#F6F6F8]">
                <div id="modal-title-row">
                  <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight text-black uppercase">
                    {selectedProject.title}
                  </h3>
                </div>

                {/* Extended Details */}
                <div className="font-sans text-sm text-gray-500 leading-relaxed space-y-4" id="modal-desc">
                  <p className="font-sans text-[#1C1C1E] text-sm font-medium">
                    {selectedProject.description}
                  </p>
                  <p className="font-light leading-relaxed text-gray-500 text-xs sm:text-sm">
                    {selectedProject.fullDescription}
                  </p>
                </div>

                {/* Technologies Grid */}
                <div id="modal-tech-stack">
                  <h4 className="font-display text-[10px] tracking-widest text-[#1C1C1E] uppercase mb-3 flex items-center gap-1.5 font-bold">
                    <Code className="w-4 h-4 text-black" />
                    BUILT WITH
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="font-display text-[10px] sm:text-xs font-semibold text-black bg-white border border-black/5 px-3.5 py-1.5 rounded-full cursor-default shadow-sm hover:bg-neutral-100 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Links */}
                <div className="pt-6 border-t border-black/5 flex flex-wrap items-center justify-between gap-4" id="modal-action-row">
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noreferrer"
                    className="font-display text-[10px] font-bold uppercase tracking-[0.15em] bg-black text-white px-5 py-3 rounded-full hover:bg-neutral-800 transition-all border border-black/5 flex items-center gap-1.5 cursor-pointer"
                  >
                    View Live Deployment
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setSelectedProject(null)}
                    className="font-display text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                  >
                    Back to Gallery
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
