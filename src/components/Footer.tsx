import { Github, Linkedin, Send, Sparkles } from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    { icon: <Github className="w-4 h-4" />, href: 'https://github.com/sudeisf', name: 'GitHub' },
    { icon: <Linkedin className="w-4 h-4" />, href: 'https://www.linkedin.com/in/sudeis-fedlu-554147341/', name: 'LinkedIn' },
    { icon: <Send className="w-4 h-4" />, href: 'https://t.me/SudeisFD', name: 'Telegram' }
  ];

  const footerLinks = [
    { name: 'Templates', href: '#' },
    { name: 'Tools', href: '#' },
    { name: 'Features', href: '#' },
    { name: 'About Us', href: '#' }
  ];

  return (
    <footer className="bg-[#F6F6F8] text-[#1C1C1E] border-t border-black/5 pt-16 pb-12 overflow-hidden" id="app-footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Core footer columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-black/5 pb-12 mb-8" id="footer-columns">
          
          {/* Brand Col */}
          <div className="space-y-4" id="footer-col-brand">
            <h3 className="font-display text-xl font-black uppercase text-black tracking-tight">
              Duwy
            </h3>
            <p className="font-sans text-xs text-gray-500 leading-relaxed max-w-[240px] font-light">
              Sudeis F. is a Full Stack Developer creating high-performance digital products that scale with your business and vision.
            </p>
            {/* Social media icons with nice squared offsets */}
            <div className="flex items-center space-x-3.5 pt-1.5">
              {socialLinks.map((sub, idx) => (
                <a
                  key={idx}
                  href={sub.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={sub.name}
                  className="w-9 h-9 rounded-full bg-white border border-black/5 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all shadow-sm duration-200 cursor-pointer hover:scale-105"
                >
                  {sub.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Location Col */}
          <div className="space-y-4" id="footer-col-address">
            <h4 className="font-display text-[10px] text-gray-400 tracking-widest uppercase font-bold">
              ADDRESS
            </h4>
            <p className="font-sans text-xs text-gray-500 leading-relaxed max-w-[220px] font-light">
              Technology Park 7-12 Gumpang Recidance, Surakarta 57292, Indonesia
            </p>
          </div>

          {/* Email Address Col */}
          <div className="space-y-4" id="footer-col-emails">
            <h4 className="font-display text-[10px] text-gray-400 tracking-widest uppercase font-bold">
              EMAIL ADDRESS
            </h4>
            <div className="space-y-1.5 font-sans text-xs text-gray-500 font-light">
              <a href="mailto:halloj@dewadewi.com" className="block hover:text-black transition-colors">
                halloj@dewadewi.com
              </a>
              <a href="mailto:sudeis@dev.io" className="block hover:text-black transition-colors">
                sudeis@dev.io
              </a>
            </div>
          </div>

          {/* Phone Number Col */}
          <div className="space-y-4" id="footer-col-phones">
            <h4 className="font-display text-[10px] text-gray-400 tracking-widest uppercase font-bold">
              PHONE NUMBER
            </h4>
            <div className="space-y-1.5 font-sans text-xs text-gray-500 font-light">
              <a href="tel:+02711314564" className="block hover:text-black transition-colors">
                (0271) 131 4564 232
              </a>
              <a href="tel:+082124720342342" className="block hover:text-black transition-colors">
                082124720342342
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright alignment row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-gray-400" id="footer-bottom">
          <div className="flex items-center gap-1.5 text-gray-500 font-light">
            <span>All rights reserved @Duwy</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-gray-400 font-bold">
              <Sparkles className="w-3 h-3 text-black animate-pulse" />
              BUILD 2026
            </span>
          </div>
          <div className="flex items-center space-x-6">
            {footerLinks.map((lnk) => (
              <a key={lnk.name} href={lnk.href} className="text-gray-500 hover:text-black font-light transition-colors duration-200">
                {lnk.name}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
