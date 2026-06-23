import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Rocket, Terminal, Settings } from 'lucide-react';

interface HeaderProps {
  onStartProject: () => void;
  onViewInbox: () => void;
  messageCount: number;
  onOpenCMS: () => void;
}

export default function Header({ onStartProject, onViewInbox, messageCount, onOpenCMS }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Simple active link detection
      const sections = ['hero', 'about', 'services', 'experience', 'portfolio', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Experience', id: 'experience' },
    { name: 'Portfolio', id: 'portfolio' },
    { name: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      id="app-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F6F6F8]/85 backdrop-blur-md border-b border-black/5 py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo sudeisfedl / u */}
        <div 
          className="cursor-pointer group flex flex-col font-display leading-none"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          id="nav-logo"
        >
          <span className="text-lg font-bold tracking-tight text-[#1C1C1E] group-hover:opacity-75 uppercase">
            sudeisfedl
          </span>
          <span className="text-[9px] font-medium tracking-[0.35em] text-gray-400 uppercase mt-1">
            Architect & Dev
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1" id="desktop-nav">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`font-display text-[11px] uppercase tracking-[0.2em] px-4 py-2 rounded-full duration-250 transition-all cursor-pointer ${
                activeSection === link.id
                  ? 'text-white bg-[#1C1C1E] font-medium'
                  : 'text-gray-500 hover:text-black hover:bg-black/5'
              }`}
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4" id="header-actions">
          {messageCount > 0 && (
            <button
              onClick={onViewInbox}
              className="relative p-2.5 text-gray-600 hover:text-black hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              title="View Inquiry Log"
              id="header-btn-inbox"
            >
              <Terminal className="w-4 h-4 text-black" />
              <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {messageCount}
              </span>
            </button>
          )}

          <button
            onClick={onStartProject}
            className="font-display text-[10px] font-bold uppercase tracking-[0.15em] bg-black text-white px-5 py-2.5 rounded-full hover:bg-[#1C1C1E] transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
            id="header-btn-start-project"
          >
            <Rocket className="w-3 h-3" />
            Start Project
          </button>
        </div>

        {/* Mobile Menu Buttons */}
        <div className="flex md:hidden items-center space-x-3" id="mobile-utils">
          {messageCount > 0 && (
            <button
              onClick={onViewInbox}
              className="relative p-1.5 text-gray-600 hover:text-black"
              id="mobile-inbox-btn"
            >
              <Terminal className="w-5 h-5 text-indigo-600" />
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {messageCount}
              </span>
            </button>
          )}
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-gray-900 focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
            id="mobile-hamburger-btn"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-4 right-4 mt-2 bg-[#F6F6F8] border border-black/5 rounded-2xl shadow-xl z-40 md:hidden overflow-hidden"
            id="mobile-nav-panel"
          >
            <div className="px-6 py-6 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-left font-display text-sm font-medium py-2 uppercase tracking-[0.15em] border-b border-black/5 ${
                    activeSection === link.id ? 'text-[#1C1C1E]' : 'text-gray-400'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onStartProject();
                  }}
                  className="w-full text-center font-display font-bold text-xs uppercase tracking-[0.2em] bg-[#1C1C1E] text-white py-3 px-6 rounded-full hover:bg-black transition-colors"
                >
                  Start Project
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
