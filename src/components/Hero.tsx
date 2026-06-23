import { motion } from 'motion/react';
import { ArrowDown, Github, Linkedin, Send } from 'lucide-react';

interface HeroProps {
  portraitPath: string;
}

export default function Hero({ portraitPath }: HeroProps) {
  const handleScrollToNext = () => {
    const el = document.getElementById('about');
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      id="hero" 
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-transparent flex items-center overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content Left */}
          <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1" id="hero-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">
                Issue No. 01 — Structural Integrity
              </p>
              
              <h1 className="font-display text-6xl sm:text-8xl lg:text-[100px] leading-[0.85] tracking-tight mb-4 text-[#1C1C1E] select-none uppercase font-light">
                Pure<br />
                <span className="inline-block ml-8 sm:ml-16 font-extrabold text-black">
                  Form
                </span>
                <span className="block font-light text-gray-400 mt-2 text-4xl sm:text-6xl tracking-wide lowercase">
                  &amp; scalable logic
                </span>
              </h1>

              <div className="max-w-md text-base md:text-lg leading-relaxed text-gray-600 border-l border-black/10 pl-6 mt-8 font-sans font-light">
                Hi, I'm Sudeis. I build robust digital backend architectures balanced with tactile design fidelity and modern engineering rigor.
              </div>

              {/* Social Links sprint icons */}
              <div className="flex items-center gap-3 pl-6 pt-3" id="hero-social-links">
                <a
                  href="https://github.com/sudeisf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-black hover:bg-black/5 rounded-full transition-all duration-300 hover:scale-115"
                  title="GitHub Profile"
                  id="hero-link-github"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/sudeis-fedlu-554147341/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-black hover:bg-black/5 rounded-full transition-all duration-300 hover:scale-115"
                  title="LinkedIn Profile"
                  id="hero-link-linkedin"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://t.me/SudeisFD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-black hover:bg-black/5 rounded-full transition-all duration-300 hover:scale-115 flex items-center justify-center"
                  title="Telegram Chat"
                  id="hero-link-telegram"
                >
                  <Send className="w-5 h-5 -rotate-45" />
                </a>
              </div>
            </motion.div>

            {/* Micro interaction indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="mt-12 flex items-center gap-4 group cursor-pointer"
              onClick={handleScrollToNext}
              id="hero-scroll-btn"
            >
              <div className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center bg-white group-hover:bg-[#1C1C1E] group-hover:text-white transition-all duration-300 shadow-sm">
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </div>
              <span className="font-display text-[10px] font-bold tracking-[0.25em] text-gray-400 group-hover:text-black transition-colors uppercase">
                Scroll For Immersion
              </span>
            </motion.div>
          </div>

          {/* Hero Visual Right */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end order-1 lg:order-2" id="hero-right">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[400px] flex flex-col bg-white p-5 pb-6 rounded-[24px] border border-black/5 shadow-sm relative group"
            >
              {/* Image Frame */}
              <div className="aspect-square w-full overflow-hidden rounded-[18px] bg-neutral-100 mb-5 relative">
                <img
                  src={portraitPath}
                  alt="Sudeis Fedl - Full Stack Developer Portrait"
                  className="w-full h-full object-cover grayscale contrast-110 brightness-95 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  id="hero-portrait-img"
                />
                {/* Subtle corner detail matches design aesthetic */}
                <div className="absolute top-3 right-3 bg-black text-white text-[9px] font-mono px-3 py-1 rounded-full tracking-widest uppercase">
                  MONOLITH • 2026
                </div>
              </div>

              {/* Bio Caption Box */}
              <div className="px-1" id="hero-bio-caption">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">INDEX REF</span>
                  <span className="text-[10px] font-mono text-gray-500">p. 001</span>
                </div>
                <p className="font-sans text-xs leading-relaxed text-gray-500 font-light">
                  Sudeis F. specializes in Python &amp; PHP backends, cloud mapping ecosystems, and component-optimized web frontends.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
