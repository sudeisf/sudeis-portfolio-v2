import { motion } from 'motion/react';
import { ArrowUpRight, Cpu, Layout, Smartphone, HelpCircle } from 'lucide-react';
import { Service } from '../types';

interface ServicesProps {
  onStartProject: (preferredService?: string) => void;
}

export default function Services({ onStartProject }: ServicesProps) {
  const services: Service[] = [
    {
      id: 'ui-ux',
      title: 'UI/UX DESIGN',
      description: 'I design intuitive, user-centric interfaces that blend functionality with aesthetics, ensuring seamless and engaging digital experiences.',
      arrow: '↗'
    },
    {
      id: 'android',
      title: 'ANDROID DEVELOPMENT',
      description: 'I develop efficient and user-friendly Android applications, focusing on intuitive design, smooth performance, and seamless navigation.',
      arrow: '↗'
    },
    {
      id: 'web',
      title: 'WEBSITE DEVELOPMENT',
      description: 'I build responsive and dynamic websites focused on performance, user experience, and modern design principles.',
      arrow: '↗',
      dark: true
    },
    {
      id: 'consulting',
      title: 'CONSULTING SERVICES',
      description: 'Providing expert advice on technical architecture, database systems, and framework selection to turn your software visions into robust reality.',
      arrow: '↗'
    }
  ];

  const getServiceIcon = (id: string, isDark?: boolean) => {
    const className = `w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`;
    switch (id) {
      case 'ui-ux': return <Layout className={className} />;
      case 'android': return <Smartphone className={className} />;
      case 'web': return <Cpu className={className} />;
      default: return <HelpCircle className={className} />;
    }
  };

  return (
    <section id="services" className="py-24 bg-transparent border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Header Left Col */}
          <div className="lg:col-span-5 flex flex-col justify-between" id="services-left-header">
            <div>
              {/* Category Pill */}
              <div className="mb-6">
                <span className="font-display text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#1C1C1E] uppercase bg-black/5 px-3.5 py-1.5 rounded-full" id="services-pill">
                  SERVICES
                </span>
              </div>

              {/* Title heading formatted exactly like the mockup */}
              <h2 className="font-display text-4.5xl sm:text-5xl font-light text-[#1C1C1E] tracking-tight leading-[1.05] select-none uppercase">
                A<br />
                <span className="block font-black mt-1 text-black">
                  Comprehensive
                </span>
                <span className="block mt-1">
                  look at what we
                </span>
                <span className="block mt-1 font-black text-black">
                  offer &amp; deliver
                </span>
              </h2>

              <p className="font-sans text-sm md:text-base text-gray-500 mt-6 leading-relaxed max-w-sm font-light">
                A deep dive into our technical stack, framework optimization, and bespoke system strategies.
              </p>
            </div>

            {/* Start Project CTA Button */}
            <div className="mt-8 lg:mt-0" id="services-cta-block">
              <button
                onClick={() => onStartProject()}
                className="font-display text-[10px] font-bold uppercase tracking-[0.15em] bg-black text-white hover:bg-[#1C1C1E] transition-all px-6 py-3.5 rounded-full cursor-pointer shadow-sm hover:scale-[1.02]"
                id="btn-start-project-services"
              >
                Start a Project
              </button>
            </div>
          </div>

          {/* Grid Right Col */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6" id="services-grid">
            {services.map((svc) => (
              <motion.div
                key={svc.id}
                onClick={() => onStartProject(svc.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4 }}
                className={`p-8 rounded-[24px] border border-black/5 flex flex-col justify-between aspect-square cursor-pointer transition-all duration-300 relative group overflow-hidden shadow-sm ${
                  svc.dark 
                    ? 'bg-[#1C1C1E] text-white shadow-sm' 
                    : 'bg-white text-[#1C1C1E] hover:bg-neutral-50 shadow-sm'
                }`}
                id={`service-card-${svc.id}`}
              >
                {/* Background glow micro interaction for premium look */}
                {svc.dark ? (
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                ) : (
                  <div className="absolute inset-0 bg-neutral-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}

                {/* Top Row: Icon & Arrow */}
                <div className="flex items-center justify-between relative z-10">
                  <div className={`p-2.5 rounded-xl ${svc.dark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                    {getServiceIcon(svc.id, svc.dark)}
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowUpRight className={`w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 ${
                      svc.dark ? 'text-gray-400 group-hover:text-white' : 'text-gray-400 group-hover:text-black'
                    }`} />
                  </div>
                </div>

                {/* Bottom Row Content */}
                <div className="mt-8 relative z-10">
                  <h3 className="font-display text-xs font-bold tracking-wider mb-2 uppercase">
                    {svc.title}
                  </h3>
                  <p className={`font-sans text-[11px] leading-relaxed font-light ${
                    svc.dark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-800'
                  }`}>
                    {svc.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
