import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header';
import Hero from './components/Hero';
import SkillsTicker from './components/SkillsTicker';
import AboutMe from './components/AboutMe';
import Services from './components/Services';
import Experience from './components/Experience';
import Portfolio from './components/Portfolio';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { Project } from './types';
import { Settings, Sparkles } from 'lucide-react';
import { safeStorage } from './utils/safeStorage';

const DEFAULT_HERO_IMAGE = '/src/assets/images/sudeis_portrait_1782228695665.jpg';
const DEFAULT_ABOUT_IMAGE = '/src/assets/images/sudeis_portrait_1782228695665.jpg';

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'WEBSITE PROJECT 1',
    category: 'Analytics Dashboard',
    image: '/src/assets/images/website_project_1_1782223721946.jpg',
    description: 'A powerful backend telemetry engine and dark dashboard presenting live service state updates.',
    fullDescription: 'WEBSITE PROJECT 1 represents a high-performance backend integration featuring real-time data ingestion, Redis stream aggregation, and a low-latency analytics frontend. Engineered to process complex telemetry markers with tight performance overhead and present them through an eye-safe dark slate interface.',
    technologies: ['FastAPI', 'Redis', 'React', 'Tailwind CSS', 'Recharts', 'Docker'],
    link: 'https://demo.sudeisfedl.dev/analytics'
  },
  {
    id: 'proj-2',
    title: 'WEBSITE PROJECT 2',
    category: 'Architectural Portfolio',
    image: '/src/assets/images/website_project_2_1782223736929.jpg',
    description: 'A gorgeous editorial architecture catalog highlighting spatial minimalism with fluid, typography-driven states.',
    fullDescription: 'WEBSITE PROJECT 2 is a tailored responsive mobile and desktop platform optimized for architectural showcases. Focused around rigorous grids, high-fidelity images with cross-fade transition cues, and custom routing states that mimic the elegant tactile flipping of a physical design magazine.',
    technologies: ['Laravel', 'PHP', 'React', 'Motion', 'PostgreSQL', 'Cloudinary'],
    link: 'https://demo.sudeisfedl.dev/architecture-catalog'
  },
  {
    id: 'proj-3',
    title: 'POSTER DESIGNS',
    category: 'Digital Art Collective',
    image: '/src/assets/images/poster_designs_1782223754679.jpg',
    description: 'Abstract mesh topologies and node clouds designed representing secure system architectures.',
    fullDescription: 'POSTER DESIGNS is a visual exploration mapping node network complexities into fine-art vector prints. Employs mathematically generated glowing mesh clouds, 3D particles, and geometric vector lines to translate complex system backends into aesthetic graphic diagrams.',
    technologies: ['D3.js', 'Canvas API', 'Adobe Illustrator', 'WebGL'],
    link: 'https://demo.sudeisfedl.dev/posters'
  },
  {
    id: 'proj-4',
    title: 'WEBSITE UI MOCKUPS',
    category: 'Luxury Web Mockup',
    image: '/src/assets/images/website_ui_mockups_1782223770173.jpg',
    description: 'High-end responsive user interfaces optimized for modern web layouts on clean physical displays.',
    fullDescription: 'WEBSITE UI MOCKUPS delivers a suite of beautiful reusable wireframe templates and high-fidelity layouts featuring pixel-perfect grid compositions, adaptive editorial panels, and responsive media scaling utilities designed specifically for high-end boutique brands.',
    technologies: ['Figma', 'Next.js', 'Tailwind CSS', 'TypeScript'],
    link: 'https://demo.sudeisfedl.dev/luxury-mockups'
  }
];

export default function App() {
  const [inquiryCount, setInquiryCount] = useState(0);
  const [preSelectedService, setPreSelectedService] = useState('');
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (safeStorage.getItem('sudeis_theme') as 'light' | 'dark' | 'system') || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = () => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isSystemDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();
    safeStorage.setItem('sudeis_theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);
  
  // Custom secure client-side router states
  const [currentRoute, setCurrentRoute] = useState<'public' | 'admin'>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/admin' || hash === '#admin') {
      return 'admin';
    }
    return 'public';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return safeStorage.getItem('sudeis_admin_auth') === 'true';
  });

  // Dynamic portfolio customizer states
  const [heroImage, setHeroImage] = useState<string>(() => {
    return safeStorage.getItem('sudeis_hero_image') || DEFAULT_HERO_IMAGE;
  });
  const [aboutImage, setAboutImage] = useState<string>(() => {
    return safeStorage.getItem('sudeis_about_image') || DEFAULT_ABOUT_IMAGE;
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = safeStorage.getItem('sudeis_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_PROJECTS;
  });

  // Fetch Supabase data on mount
  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const res = await fetch('/api/portfolio');
        if (res.ok) {
          const data = await res.json();
          if (data.heroImage) {
            setHeroImage(data.heroImage);
            safeStorage.setItem('sudeis_hero_image', data.heroImage);
          }
          if (data.aboutImage) {
            setAboutImage(data.aboutImage);
            safeStorage.setItem('sudeis_about_image', data.aboutImage);
          }
          if (data.projects) {
            setProjects(data.projects);
            safeStorage.setItem('sudeis_projects', JSON.stringify(data.projects));
          }
          if (data.adminEmail) {
            safeStorage.setItem('sudeis_admin_email', data.adminEmail);
          }
          if (data.passcode) {
            safeStorage.setItem('sudeis_admin_passcode', data.passcode);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial portfolio configurations from Supabase database", err);
      }
    };
    loadPortfolioData();
  }, []);

  // Sync wrappers that save to Supabase database
  const handleSetHeroImage = async (url: string) => {
    setHeroImage(url);
    safeStorage.setItem('sudeis_hero_image', url);
    try {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'heroImage', value: url })
      });
    } catch (e) {
      console.error("Failed to save hero image to Supabase:", e);
    }
  };

  const handleSetAboutImage = async (url: string) => {
    setAboutImage(url);
    safeStorage.setItem('sudeis_about_image', url);
    try {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'aboutImage', value: url })
      });
    } catch (e) {
      console.error("Failed to save about image to Supabase:", e);
    }
  };

  const handleSetProjects = async (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    safeStorage.setItem('sudeis_projects', JSON.stringify(updatedProjects));
    try {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'projects', value: updatedProjects })
      });
    } catch (e) {
      console.error("Failed to save projects to Supabase:", e);
    }
  };

  // Sync state with local storage to feed count to Header badge
  const updateInquiryCount = () => {
    const saved = safeStorage.getItem('sudeis_inquiries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInquiryCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch (e) {
        setInquiryCount(0);
      }
    } else {
      setInquiryCount(0);
    }
  };

  useEffect(() => {
    updateInquiryCount();
  }, []);

  // Sync route and check authorization periodically
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('public');
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    
    const handleStorageUpdate = () => {
      updateInquiryCount();
      setIsAdminAuthenticated(safeStorage.getItem('sudeis_admin_auth') === 'true');
    };
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const handleStartProject = (serviceId?: string) => {
    if (serviceId) {
      setPreSelectedService(serviceId);
    } else {
      setPreSelectedService('');
    }

    const contactEl = document.getElementById('contact');
    if (contactEl) {
      const offset = 85;
      const elementPosition = contactEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleViewInbox = () => {
    // Navigate straight to the secure admin inquiries tab if authenticated
    if (isAdminAuthenticated) {
      window.location.hash = 'admin';
    } else {
      // Smoothly guide user-facing contact log drawer
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const adminBtn = document.getElementById('btn-admin-log');
        if (adminBtn) {
          adminBtn.click();
        }
      }
    }
  };

  const handleSuccessfulDispatch = () => {
    updateInquiryCount();
  };

  const handleResetDefaults = async () => {
    await handleSetHeroImage(DEFAULT_HERO_IMAGE);
    await handleSetAboutImage(DEFAULT_ABOUT_IMAGE);
    await handleSetProjects(DEFAULT_PROJECTS);
  };

  const handleOpenCMS = () => {
    window.location.hash = 'admin';
  };

  // If Sudeis is viewing the Admin Portal route, render the Secure Login Gate or the Master Dashboard Page
  if (currentRoute === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <>
          <Helmet>
            <title>Admin Login | Sudeis Fedlu</title>
            <meta name="description" content="Secure administration gateway for Sudeis Fedlu's digital workspace portfolio." />
            <meta name="robots" content="noindex, nofollow" />
          </Helmet>
          <AdminLogin 
            onLoginSuccess={() => setIsAdminAuthenticated(true)} 
            allowedEmail={safeStorage.getItem('sudeis_admin_email') || 'sudeisfed@gmail.com'} 
            theme={theme}
            onThemeChange={setTheme}
          />
        </>
      );
    }
    return (
      <>
        <Helmet>
          <title>Admin Dashboard | Sudeis Fedlu</title>
          <meta name="description" content="Manage and customize portfolio sections, showcase items, and user-facing experiences." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <AdminDashboard 
          projects={projects}
          setProjects={handleSetProjects}
          heroImage={heroImage}
          setHeroImage={handleSetHeroImage}
          aboutImage={aboutImage}
          setAboutImage={handleSetAboutImage}
          onResetDefaults={handleResetDefaults}
          theme={theme}
          onThemeChange={setTheme}
          onLogout={() => {
            safeStorage.removeItem('sudeis_admin_auth');
            setIsAdminAuthenticated(false);
            window.location.hash = '';
          }}
        />
      </>
    );
  }

  // Otherwise, render the gorgeous interactive public-facing showcase
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] selection:bg-black selection:text-white antialiased font-sans flex flex-col justify-between">
      <Helmet>
        <title>Sudeis Fedlu | Full Stack Developer & Digital Architect</title>
        <meta name="description" content="Explore Sudeis Fedlu's portfolio. High-performance software engineering, analytics dashboards, minimal responsive architectures, and pixel-perfect design solutions based in Addis Ababa, Ethiopia." />
        <meta name="keywords" content="Sudeis Fedlu, Full Stack Developer, Addis Ababa, Ethiopia, Software Engineer, Web Developer, React, Node.js, Tailwind CSS, Portfolio" />
        <meta name="author" content="Sudeis Fedlu" />
        
        {/* OpenGraph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Sudeis Fedlu | Full Stack Developer & Digital Architect" />
        <meta property="og:description" content="Explore Sudeis Fedlu's portfolio. High-performance software engineering, analytics dashboards, minimal responsive architectures, and pixel-perfect design solutions based in Addis Ababa, Ethiopia." />
        <meta property="og:url" content="https://sudeis-portfolio-v2.vercel.app/" />
        <meta property="og:image" content="/src/assets/images/sudeis_portrait_1782228695665.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sudeis Fedlu | Full Stack Developer & Digital Architect" />
        <meta name="twitter:description" content="Explore Sudeis Fedlu's portfolio. High-performance software engineering, analytics dashboards, minimal responsive architectures, and pixel-perfect design solutions based in Addis Ababa, Ethiopia." />
        <meta name="twitter:image" content="/src/assets/images/sudeis_portrait_1782228695665.jpg" />
      </Helmet>
      {/* Dynamic Header */}
      <Header 
        onStartProject={() => handleStartProject()} 
        onViewInbox={handleViewInbox}
        messageCount={inquiryCount}
        onOpenCMS={handleOpenCMS}
        theme={theme}
        onThemeChange={setTheme}
      />

      <main className="flex-1">
        {/* Hero Segment */}
        <Hero portraitPath={heroImage} />

        {/* Endless skills ticker tape */}
        <SkillsTicker />

        {/* Detailed About Me block */}
        <AboutMe portraitPath={aboutImage} />

        {/* Services Showcase & CTA */}
        <Services onStartProject={handleStartProject} />

        {/* Interactive Growth Experience Timeline */}
        <Experience />

        {/* Detailed Portfoli grid gallery */}
        <Portfolio projects={projects} />

        {/* Connect & Estimator Panel */}
        <ContactForm 
          onSuccess={handleSuccessfulDispatch} 
          preSelectedService={preSelectedService}
        />
      </main>

      {/* Structured precise Footer columns */}
      <Footer />
    </div>
  );
}

