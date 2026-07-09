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
import { Project, ExperienceItem } from './types';
import { safeStorage } from './utils/safeStorage';
import { apiFetch, verifyAdminSession } from './utils/api';
import {
  DEFAULT_HERO_IMAGE,
  DEFAULT_ABOUT_IMAGE,
  DEFAULT_PROJECTS,
  DEFAULT_EXPERIENCES,
  DEFAULT_OG_IMAGE,
} from './utils/defaults';

const SITE_URL = import.meta.env.VITE_APP_URL || 'https://sudeisfedlu.et';

function resolveImageUrl(value: string | null | undefined, fallback: string): string {
  if (value && typeof value === 'string' && value.trim()) return value;
  return fallback;
}

function resolveProjects(value: Project[] | null | undefined): Project[] {
  if (Array.isArray(value) && value.length > 0) return value;
  return DEFAULT_PROJECTS;
}

function resolveExperiences(value: ExperienceItem[] | null | undefined): ExperienceItem[] {
  if (Array.isArray(value) && value.length > 0) return value;
  return DEFAULT_EXPERIENCES;
}

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

  const [currentRoute, setCurrentRoute] = useState<'public' | 'admin'>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/admin' || hash === '#admin') {
      return 'admin';
    }
    return 'public';
  });

  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('public');
      }
    };

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

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
        const parsed = JSON.parse(saved);
        const hasStaleImages = parsed.some(
          (p: Project) => typeof p.image === 'string' && p.image.startsWith('/src/')
        );
        if (!hasStaleImages && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // Fallback to defaults
      }
    }
    return DEFAULT_PROJECTS;
  });

  const [experiences, setExperiences] = useState<ExperienceItem[]>(() => {
    const saved = safeStorage.getItem('sudeis_experiences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // Fallback to defaults
      }
    }
    return DEFAULT_EXPERIENCES;
  });

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await verifyAdminSession();
      setIsAdminAuthenticated(authenticated);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const res = await fetch('/api/portfolio');
        if (res.ok) {
          const data = await res.json();
          const nextHero = resolveImageUrl(data.heroImage, DEFAULT_HERO_IMAGE);
          const nextAbout = resolveImageUrl(data.aboutImage, DEFAULT_ABOUT_IMAGE);
          const nextProjects = resolveProjects(data.projects);
          const nextExperiences = resolveExperiences(data.experiences);

          setHeroImage(nextHero);
          setAboutImage(nextAbout);
          setProjects(nextProjects);
          setExperiences(nextExperiences);
          safeStorage.setItem('sudeis_hero_image', nextHero);
          safeStorage.setItem('sudeis_about_image', nextAbout);
          safeStorage.setItem('sudeis_projects', JSON.stringify(nextProjects));
          safeStorage.setItem('sudeis_experiences', JSON.stringify(nextExperiences));
        }
      } catch (err) {
        console.error('Failed to fetch portfolio data', err);
      }
    };
    loadPortfolioData();
  }, []);

  const handleSetHeroImage = async (url: string) => {
    setHeroImage(url);
    safeStorage.setItem('sudeis_hero_image', url);
    try {
      await apiFetch('/api/portfolio', {
        method: 'POST',
        body: JSON.stringify({ key: 'heroImage', value: url }),
      });
    } catch (e) {
      console.error('Failed to save hero image:', e);
    }
  };

  const handleSetAboutImage = async (url: string) => {
    setAboutImage(url);
    safeStorage.setItem('sudeis_about_image', url);
    try {
      await apiFetch('/api/portfolio', {
        method: 'POST',
        body: JSON.stringify({ key: 'aboutImage', value: url }),
      });
    } catch (e) {
      console.error('Failed to save about image:', e);
    }
  };

  const handleSetProjects = async (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    safeStorage.setItem('sudeis_projects', JSON.stringify(updatedProjects));
    try {
      await apiFetch('/api/portfolio', {
        method: 'POST',
        body: JSON.stringify({ key: 'projects', value: updatedProjects }),
      });
    } catch (e) {
      console.error('Failed to save projects:', e);
    }
  };

  const handleSetExperiences = async (updatedExperiences: ExperienceItem[]) => {
    setExperiences(updatedExperiences);
    safeStorage.setItem('sudeis_experiences', JSON.stringify(updatedExperiences));
    try {
      await apiFetch('/api/portfolio', {
        method: 'POST',
        body: JSON.stringify({ key: 'experiences', value: updatedExperiences }),
      });
    } catch (e) {
      console.error('Failed to save experiences:', e);
    }
  };

  const updateInquiryCount = () => {
    const saved = safeStorage.getItem('sudeis_inquiries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInquiryCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setInquiryCount(0);
      }
    } else {
      setInquiryCount(0);
    }
  };

  useEffect(() => {
    updateInquiryCount();
  }, []);

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
        behavior: 'smooth',
      });
    }
  };

  const handleViewInbox = () => {
    if (isAdminAuthenticated) {
      window.location.hash = 'admin';
    } else {
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
    await handleSetExperiences(DEFAULT_EXPERIENCES);
  };

  const handleOpenCMS = () => {
    window.location.hash = 'admin';
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Continue logout even if request fails
    }
    setIsAdminAuthenticated(false);
    window.location.hash = '';
  };

  const ogImageUrl = DEFAULT_OG_IMAGE.startsWith('http')
    ? DEFAULT_OG_IMAGE
    : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

  if (currentRoute === 'admin') {
    if (!authChecked) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F6F6F8] dark:bg-[#0B0B0C] text-gray-500 text-xs font-mono tracking-widest uppercase">
          Verifying session...
        </div>
      );
    }

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
          experiences={experiences}
          setExperiences={handleSetExperiences}
          heroImage={heroImage}
          setHeroImage={handleSetHeroImage}
          aboutImage={aboutImage}
          setAboutImage={handleSetAboutImage}
          onResetDefaults={handleResetDefaults}
          theme={theme}
          onThemeChange={setTheme}
          onLogout={handleLogout}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] selection:bg-black selection:text-white antialiased font-sans flex flex-col justify-between">
      <Helmet>
        <title>Sudeis Fedlu | Full Stack Developer & Digital Architect</title>
        <meta name="description" content="Explore Sudeis Fedlu's portfolio. High-performance software engineering, analytics dashboards, minimal responsive architectures, and pixel-perfect design solutions based in Addis Ababa, Ethiopia." />
        <meta name="keywords" content="Sudeis Fedlu, Full Stack Developer, Addis Ababa, Ethiopia, Software Engineer, Web Developer, React, Node.js, Tailwind CSS, Portfolio" />
        <meta name="author" content="Sudeis Fedlu" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Sudeis Fedlu | Full Stack Developer & Digital Architect" />
        <meta property="og:description" content="Explore Sudeis Fedlu's portfolio. High-performance software engineering, analytics dashboards, minimal responsive architectures, and pixel-perfect design solutions based in Addis Ababa, Ethiopia." />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={ogImageUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sudeis Fedlu | Full Stack Developer & Digital Architect" />
        <meta name="twitter:description" content="Explore Sudeis Fedlu's portfolio. High-performance software engineering, analytics dashboards, minimal responsive architectures, and pixel-perfect design solutions based in Addis Ababa, Ethiopia." />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>
      <Header
        onStartProject={() => handleStartProject()}
        onViewInbox={handleViewInbox}
        messageCount={inquiryCount}
        onOpenCMS={handleOpenCMS}
        theme={theme}
        onThemeChange={setTheme}
      />

      <main className="flex-1">
        <Hero portraitPath={heroImage} />
        <SkillsTicker />
        <AboutMe portraitPath={aboutImage} />
        <Services onStartProject={handleStartProject} />
        <Experience experiences={experiences} />
        <Portfolio projects={projects} />
        <ContactForm onSuccess={handleSuccessfulDispatch} preSelectedService={preSelectedService} />
      </main>

      <Footer />
    </div>
  );
}
