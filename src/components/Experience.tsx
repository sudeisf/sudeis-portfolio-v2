import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Building, Award, X, ZoomIn, ZoomOut } from 'lucide-react';
import { ExperienceItem } from '../types';

interface ExperienceProps {
  experiences: ExperienceItem[];
}

export default function Experience({ experiences }: ExperienceProps) {
  const [certificateModal, setCertificateModal] = useState<{ image: string; company: string; role: string } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const openCertificate = (exp: ExperienceItem) => {
    if (exp.certificateImage) {
      setCertificateModal({ image: exp.certificateImage, company: exp.company, role: exp.role });
      setIsZoomed(false);
    }
  };

  const closeCertificate = () => {
    setCertificateModal(null);
    setIsZoomed(false);
  };

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

                  {/* Certificate Button */}
                  {exp.certificateImage && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      onClick={() => openCertificate(exp)}
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-full text-xs font-display font-bold uppercase tracking-wider text-amber-800 hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/50 transition-all duration-300 cursor-pointer group/cert"
                      id={`certificate-btn-${exp.id}`}
                    >
                      <Award className="w-4 h-4 text-amber-600 group-hover/cert:rotate-12 transition-transform duration-300" />
                      View Certificate
                    </motion.button>
                  )}
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
                          className="tech-badge font-display text-[9px] md:text-[10px] font-semibold px-3 py-1.5 rounded-full transition-colors cursor-default"
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

      {/* Certificate Image Modal */}
      <AnimatePresence>
        {certificateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCertificate}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              id="certificate-modal-backdrop"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="bg-white rounded-[24px] w-full max-w-4xl overflow-hidden shadow-2xl relative z-10 border border-black/5 max-h-[92vh] flex flex-col"
              id="certificate-modal"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-gradient-to-r from-amber-50/80 to-orange-50/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                    <Award className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#1C1C1E] uppercase tracking-wide">
                      Internship Certificate
                    </h3>
                    <p className="font-sans text-[11px] text-gray-500 mt-0.5">
                      {certificateModal.role} — {certificateModal.company}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Zoom Toggle */}
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors text-gray-400 hover:text-gray-700 cursor-pointer"
                    title={isZoomed ? 'Zoom out' : 'Zoom in'}
                    id="certificate-zoom-btn"
                  >
                    {isZoomed ? <ZoomOut className="w-4.5 h-4.5" /> : <ZoomIn className="w-4.5 h-4.5" />}
                  </button>
                  {/* Close */}
                  <button
                    onClick={closeCertificate}
                    className="p-2 rounded-full bg-black hover:bg-neutral-800 text-white transition-all cursor-pointer shadow-sm"
                    id="certificate-close-btn"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Certificate Image */}
              <div
                className={`flex-1 overflow-auto bg-neutral-100 flex items-center justify-center p-4 md:p-6 transition-all duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                onClick={() => setIsZoomed(!isZoomed)}
                id="certificate-image-container"
              >
                <motion.img
                  src={certificateModal.image}
                  alt={`Internship Certificate - ${certificateModal.company}`}
                  className={`rounded-lg shadow-lg border border-black/5 transition-all duration-500 ease-out ${
                    isZoomed
                      ? 'max-w-none w-[150%] md:w-[130%]'
                      : 'max-w-full max-h-[70vh] w-auto h-auto object-contain'
                  }`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  referrerPolicy="no-referrer"
                  id="certificate-image"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
