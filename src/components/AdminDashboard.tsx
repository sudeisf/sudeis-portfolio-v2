import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Image as ImageIcon, 
  FolderGit2, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  RotateCcw, 
  Eye, 
  Upload, 
  ArrowUp, 
  ArrowDown, 
  PlusCircle, 
  Check, 
  ExternalLink, 
  Mail, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  BadgeHelp,
  Briefcase,
  KeyRound,
  FileCheck,
  FileText,
  Sun,
  Moon,
  Monitor,
  Database,
  Award
} from 'lucide-react';
import { Project, ContactMessage, ExperienceItem } from '../types';
import { safeStorage } from '../utils/safeStorage';
import { apiFetch } from '../utils/api';
import { uploadMedia } from '../utils/upload';
import ResumeBuilder from './ResumeBuilder';
import ExperienceManager from './ExperienceManager';

interface AdminDashboardProps {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  experiences: ExperienceItem[];
  setExperiences: (experiences: ExperienceItem[]) => void;
  heroImage: string;
  setHeroImage: (url: string) => void;
  aboutImage: string;
  setAboutImage: (url: string) => void;
  onResetDefaults: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onLogout: () => void;
}

export default function AdminDashboard({
  projects,
  setProjects,
  experiences,
  setExperiences,
  heroImage,
  setHeroImage,
  aboutImage,
  setAboutImage,
  onResetDefaults,
  theme,
  onThemeChange,
  onLogout
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'images' | 'projects' | 'experiences' | 'inquiries' | 'resume' | 'security'>('images');
  
  // Project editing states
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('');
  const [projImage, setProjImage] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projFullDesc, setProjFullDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projLink, setProjLink] = useState('');
  
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [dragActiveHero, setDragActiveHero] = useState(false);
  const [dragActiveAbout, setDragActiveAbout] = useState(false);
  const [dragActiveProj, setDragActiveProj] = useState(false);

  // Inquiries and Security state
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactMessage | null>(null);
  
  const [adminEmail, setAdminEmail] = useState('sudeisfed@gmail.com');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Supabase and Cloudinary dynamic indicators
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [supabaseTableReady, setSupabaseTableReady] = useState(false);
  const [supabaseServiceRole, setSupabaseServiceRole] = useState(false);
  const [cloudinaryConfigured, setCloudinaryConfigured] = useState(false);
  const [directUploadEnabled, setDirectUploadEnabled] = useState(false);
  const [sqlSetupText, setSqlSetupText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');
  
  const heroInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLInputElement>(null);
  const projInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  // Load inquiries from Supabase with fallback
  const loadInquiries = async () => {
    try {
      const res = await apiFetch('/api/inquiries');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
        safeStorage.setItem('sudeis_inquiries', JSON.stringify(data));
        return;
      }
    } catch (e) {
      console.error('Error loading inquiries from database', e);
    }

    const saved = safeStorage.getItem('sudeis_inquiries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setInquiries(parsed);
        }
      } catch (e) {
        console.error('Error parsing inquiries fallback', e);
      }
    }
  };

  useEffect(() => {
    loadInquiries();

    apiFetch('/api/admin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSupabaseConfigured(!!data.supabaseConfigured);
          setSupabaseTableReady(!!data.supabaseTableReady);
          setSupabaseServiceRole(!!data.supabaseServiceRole);
          setCloudinaryConfigured(!!data.cloudinaryConfigured);
          setDirectUploadEnabled(!!data.directUploadEnabled);
          if (data.adminEmail) setAdminEmail(data.adminEmail);
        }
      })
      .catch((e) => console.error('Error fetching system status:', e));

    apiFetch('/api/supabase-sql')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.sql) {
          setSqlSetupText(data.sql);
        }
      })
      .catch((e) => console.error('Error fetching SQL helper script:', e));
  }, []);

  const uploadMediaToCloudinary = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      return await uploadMedia(file, setUploadProgressMsg);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Upload failed';
      console.error('Upload failed:', e);
      alert(`Upload failed: ${message}\nCheck Cloudinary env vars and upload preset.`);
      throw e;
    } finally {
      setIsUploading(false);
      setUploadProgressMsg('');
    }
  };

  const handleSeedDatabase = async () => {
    try {
      const res = await apiFetch('/api/admin/seed-database', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to initialize database rows.');
        return;
      }
      alert(`Database ready. Seeded: ${data.seeded?.join(', ') || 'none'}`);
      setSupabaseTableReady(true);
    } catch {
      alert('Could not reach server to seed database.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'about' | 'project') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      uploadMediaToCloudinary(file)
        .then((url) => {
          if (target === 'hero') setHeroImage(url);
          if (target === 'about') setAboutImage(url);
          if (target === 'project') setProjImage(url);
        })
        .catch(() => {});
    }
  };

  const handleDrag = (e: React.DragEvent, target: 'hero' | 'about' | 'project', active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (target === 'hero') setDragActiveHero(active);
    if (target === 'about') setDragActiveAbout(active);
    if (target === 'project') setDragActiveProj(active);
  };

  const handleDrop = (e: React.DragEvent, target: 'hero' | 'about' | 'project') => {
    e.preventDefault();
    e.stopPropagation();
    if (target === 'hero') setDragActiveHero(false);
    if (target === 'about') setDragActiveAbout(false);
    if (target === 'project') setDragActiveProj(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      uploadMediaToCloudinary(file)
        .then((url) => {
          if (target === 'hero') setHeroImage(url);
          if (target === 'about') setAboutImage(url);
          if (target === 'project') setProjImage(url);
        })
        .catch(() => {});
    }
  };

  // Add project handler
  const handleAddProject = () => {
    if (!projTitle || !projCategory) {
      alert('Please fill out at least the project Title and Category.');
      return;
    }

    const techArray = projTech
      ? projTech.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: projTitle.toUpperCase(),
      category: projCategory,
      image: projImage || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800',
      description: projDesc || 'No summary description provided.',
      fullDescription: projFullDesc || 'No details provided.',
      technologies: techArray,
      link: projLink || undefined
    };

    setProjects([...projects, newProj]);
    resetProjectForm();
  };

  // Start editing handler
  const handleStartEdit = (proj: Project) => {
    setEditingProjectId(proj.id);
    setIsAddingProject(false);
    setProjTitle(proj.title);
    setProjCategory(proj.category);
    setProjImage(proj.image);
    setProjDesc(proj.description);
    setProjFullDesc(proj.fullDescription);
    setProjTech(proj.technologies.join(', '));
    setProjLink(proj.link || '');
  };

  // Save project edit
  const handleSaveEdit = () => {
    if (!projTitle || !projCategory) {
      alert('Title and Category are required.');
      return;
    }

    const techArray = projTech
      ? projTech.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const updated = projects.map(p => {
      if (p.id === editingProjectId) {
        return {
          ...p,
          title: projTitle.toUpperCase(),
          category: projCategory,
          image: projImage,
          description: projDesc,
          fullDescription: projFullDesc,
          technologies: techArray,
          link: projLink || undefined
        };
      }
      return p;
    });

    setProjects(updated);
    resetProjectForm();
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
      if (editingProjectId === id) resetProjectForm();
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Delete this client inquiry message permanently?')) return;

    try {
      const res = await apiFetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const filtered = inquiries.filter((m) => m.id !== id);
        setInquiries(filtered);
        safeStorage.setItem('sudeis_inquiries', JSON.stringify(filtered));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
        window.dispatchEvent(new Event('storage'));
        return;
      }
    } catch (e) {
      console.error(e);
    }

    alert('Failed to delete inquiry. Please try again.');
  };

  const handleClearInquiries = async () => {
    if (!confirm('Are you sure you want to delete ALL submitted inquiries from your logs? This cannot be undone.')) {
      return;
    }

    try {
      const res = await apiFetch('/api/inquiries', { method: 'DELETE' });
      if (res.ok) {
        safeStorage.setItem('sudeis_inquiries', JSON.stringify([]));
        setInquiries([]);
        setSelectedInquiry(null);
        window.dispatchEvent(new Event('storage'));
        return;
      }
    } catch (e) {
      console.error(e);
    }

    alert('Failed to clear inquiries. Please try again.');
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (newPasscode && newPasscode !== confirmPasscode) {
      setSecurityError('Passcodes do not match.');
      return;
    }

    try {
      const res = await apiFetch('/api/admin/security', {
        method: 'POST',
        body: JSON.stringify({
          adminEmail,
          newPasscode: newPasscode || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSecurityError(data.error || 'Failed to update security settings.');
        return;
      }

      setSecuritySuccess('Administrative configuration updated successfully.');
      setNewPasscode('');
      setConfirmPasscode('');
    } catch {
      setSecurityError('Unable to reach the server. Please try again.');
    }
  };

  // Reorder projects
  const moveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const reordered = [...projects];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    setProjects(reordered);
  };

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setIsAddingProject(false);
    setProjTitle('');
    setProjCategory('');
    setProjImage('');
    setProjDesc('');
    setProjFullDesc('');
    setProjTech('');
    setProjLink('');
  };

  return (
    <div className="min-h-screen bg-[#F6F6F8] dark:bg-[#070708] flex flex-col md:flex-row text-black dark:text-white transition-colors duration-300" id="fullpage-admin-panel">
      
      {/* Left Navigation Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-[#0C0C0E] text-black dark:text-white flex flex-col justify-between p-6 border-r border-black/10 dark:border-white/5 md:fixed md:top-0 md:bottom-0 md:left-0 z-30 transition-colors duration-300">
        <div>
          {/* Brand Heading */}
          <div className="flex items-center gap-3 mb-8 pb-5 border-b border-black/10 dark:border-white/5">
            <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h2 className="font-display text-sm font-black tracking-widest text-black dark:text-white uppercase">
                SUDEIS CO.
              </h2>
              <span className="text-[9px] font-mono tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block uppercase mt-0.5">
                PORTFOLIO CMS
              </span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('images')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[11px] font-bold tracking-wider uppercase transition-all text-left cursor-pointer ${
                activeTab === 'images'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Site Images
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[11px] font-bold tracking-wider uppercase transition-all text-left cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              Manage Works ({projects.length})
            </button>

            <button
              onClick={() => setActiveTab('experiences')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[11px] font-bold tracking-wider uppercase transition-all text-left cursor-pointer ${
                activeTab === 'experiences'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Experience ({experiences.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('inquiries');
                loadInquiries();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-display text-[11px] font-bold tracking-wider uppercase transition-all text-left cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                Client Inbox
              </span>
              {inquiries.length > 0 && (
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${activeTab === 'inquiries' ? 'bg-white text-black dark:bg-black dark:text-white' : 'bg-emerald-500 text-black font-bold'}`}>
                  {inquiries.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('resume')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[11px] font-bold tracking-wider uppercase transition-all text-left cursor-pointer ${
                activeTab === 'resume'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              Resume Builder
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[11px] font-bold tracking-wider uppercase transition-all text-left cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Security Lock
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-3 pt-6 border-t border-black/10 dark:border-white/5 mt-8">
          <a
            href="#/"
            onClick={(e) => {
              window.location.hash = '';
            }}
            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 dark:bg-[#1C1C1E] dark:hover:bg-[#2C2C2E] text-white font-display text-[10px] font-black tracking-widest uppercase py-3 rounded-xl transition-all cursor-pointer border border-black/10 dark:border-white/5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            Go To Live Site
          </a>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-display text-[10px] font-black tracking-widest uppercase py-3 rounded-xl transition-all cursor-pointer border border-red-500/20 dark:border-red-900/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            End Session
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 md:ml-64 p-6 md:p-10 min-h-screen flex flex-col justify-between">
        
        {/* Content Header section */}
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-5 mb-8">
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400">
              SECURE ADMIN CONTROL ENVIRONMENT
            </span>
            <h1 className="font-display text-xl font-black tracking-tight text-black dark:text-white uppercase mt-0.5">
              {activeTab === 'images' && 'Site Visual Identity'}
              {activeTab === 'projects' && 'Portfolio Publications'}
              {activeTab === 'experiences' && 'Experience Timeline'}
              {activeTab === 'inquiries' && 'Prospective Clients Inbox'}
              {activeTab === 'resume' && 'AI Resume Builder'}
              {activeTab === 'security' && 'Admin security configurations'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Segmented theme selector */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-0.5 rounded-xl">
              {[
                { key: 'light', icon: <Sun className="w-3 h-3" />, title: 'Light' },
                { key: 'dark', icon: <Moon className="w-3 h-3" />, title: 'Dark' },
                { key: 'system', icon: <Monitor className="w-3 h-3" />, title: 'System' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onThemeChange(item.key as 'light' | 'dark' | 'system')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    theme === item.key 
                      ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm font-bold' 
                      : 'text-gray-400 hover:text-black dark:hover:text-white'
                  }`}
                  title={item.title}
                >
                  {item.icon}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full hidden sm:inline-block">
              ACTIVE NODE: <strong className="text-black dark:text-white">{adminEmail}</strong>
            </span>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1">
          {activeTab === 'images' && (
            <div className="space-y-8 max-w-4xl animate-fade-in" id="cms-tab-images">
              <div className="bg-white border border-black/5 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-display text-xs font-bold tracking-wider text-black uppercase">Factory Restorations</h4>
                  <p className="text-xs text-gray-500 font-light mt-1">Revert hero, about images, and portfolio publications gallery back to standard pre-sets.</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Revert all custom portfolio uploads and changes to original factory defaults?')) {
                      onResetDefaults();
                    }
                  }}
                  className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-display text-[10px] font-bold uppercase tracking-widest py-2.5 px-4 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Defaults
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* HERO PORTRAIT */}
                <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="border-b border-black/5 pb-3">
                    <h3 className="font-display text-xs font-black tracking-widest uppercase text-black">
                      Hero Portrait Customizer
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-1 font-light">Shown on the main landing fold of your portfolio site.</p>
                  </div>

                  <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-black/5 bg-neutral-100 relative group flex items-center justify-center">
                    {heroImage ? (
                      <img src={heroImage} alt="Hero banner" className="w-full h-full object-cover grayscale contrast-110" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xs text-gray-400">Empty State</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">IMAGE LINK URL</label>
                      <input 
                        type="text" 
                        value={heroImage}
                        onChange={(e) => setHeroImage(e.target.value)}
                        placeholder="Paste URL..."
                        className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2.5 focus:outline-none focus:border-black/25 font-light"
                      />
                    </div>

                    <div 
                      onDragOver={(e) => handleDrag(e, 'hero', true)}
                      onDragLeave={(e) => handleDrag(e, 'hero', false)}
                      onDrop={(e) => handleDrop(e, 'hero')}
                      onClick={() => heroInputRef.current?.click()}
                      className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                        dragActiveHero 
                          ? 'border-black bg-black/5' 
                          : 'border-black/10 hover:border-black/20 bg-[#F6F6F8]'
                      }`}
                    >
                      <input 
                        ref={heroInputRef}
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, 'hero')}
                      />
                      <Upload className="w-4 h-4 mx-auto text-gray-400 mb-1.5" />
                      <p className="text-[10px] font-display font-black uppercase tracking-wider text-black">
                        DRAG & DROP LOCAL PORTRAIT
                      </p>
                      <p className="text-[9px] text-gray-400 font-light mt-0.5">Translates file to robust persistent offline base64</p>
                    </div>
                  </div>
                </div>

                {/* ABOUT ME PORTRAIT */}
                <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="border-b border-black/5 pb-3">
                    <h3 className="font-display text-xs font-black tracking-widest uppercase text-black">
                      About Portrait Customizer
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-1 font-light">Shown beside the developer experience and narrative fold.</p>
                  </div>

                  <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-black/5 bg-neutral-100 relative group flex items-center justify-center">
                    {aboutImage ? (
                      <img src={aboutImage} alt="About Me portrait" className="w-full h-full object-cover grayscale contrast-110" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xs text-gray-400">Empty State</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">IMAGE LINK URL</label>
                      <input 
                        type="text" 
                        value={aboutImage}
                        onChange={(e) => setAboutImage(e.target.value)}
                        placeholder="Paste URL..."
                        className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2.5 focus:outline-none focus:border-black/25 font-light"
                      />
                    </div>

                    <div 
                      onDragOver={(e) => handleDrag(e, 'about', true)}
                      onDragLeave={(e) => handleDrag(e, 'about', false)}
                      onDrop={(e) => handleDrop(e, 'about')}
                      onClick={() => aboutInputRef.current?.click()}
                      className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                        dragActiveAbout 
                          ? 'border-black bg-black/5' 
                          : 'border-black/10 hover:border-black/20 bg-[#F6F6F8]'
                      }`}
                    >
                      <input 
                        ref={aboutInputRef}
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, 'about')}
                      />
                      <Upload className="w-4 h-4 mx-auto text-gray-400 mb-1.5" />
                      <p className="text-[10px] font-display font-black uppercase tracking-wider text-black">
                        DRAG & DROP LOCAL PORTRAIT
                      </p>
                      <p className="text-[9px] text-gray-400 font-light mt-0.5">Translates file to robust persistent offline base64</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-8 max-w-5xl animate-fade-in" id="cms-tab-projects">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Add/Edit Form */}
                <div className="lg:col-span-5">
                  <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4 sticky top-6">
                    <div className="flex justify-between items-center border-b border-black/5 pb-3">
                      <h3 className="font-display text-xs font-black tracking-widest uppercase text-black">
                        {editingProjectId ? 'EDIT SELECTED WORK' : 'PUBLISH NEW WORK'}
                      </h3>
                      {(editingProjectId || isAddingProject) && (
                        <button 
                          onClick={resetProjectForm}
                          className="text-gray-400 hover:text-black text-xs font-mono font-bold"
                        >
                          RESET
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">PROJECT TITLE</label>
                        <input 
                          type="text" 
                          value={projTitle}
                          onChange={(e) => setProjTitle(e.target.value)}
                          placeholder="e.g., ARCHITECTURAL CATALOG"
                          className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">CATEGORY</label>
                        <input 
                          type="text" 
                          value={projCategory}
                          onChange={(e) => setProjCategory(e.target.value)}
                          placeholder="e.g., Creative Showcase"
                          className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">PROJECT COVER IMAGE</label>
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            value={projImage}
                            onChange={(e) => setProjImage(e.target.value)}
                            placeholder="Paste custom web URL..."
                            className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light"
                          />
                          <div 
                            onDragOver={(e) => handleDrag(e, 'project', true)}
                            onDragLeave={(e) => handleDrag(e, 'project', false)}
                            onDrop={(e) => handleDrop(e, 'project')}
                            onClick={() => projInputRef.current?.click()}
                            className={`border border-dashed rounded-xl p-3 text-center cursor-pointer text-[10px] transition-all ${
                              dragActiveProj 
                                ? 'border-black bg-black/5' 
                                : 'border-black/10 hover:border-black/25 bg-[#F6F6F8]'
                            }`}
                          >
                            <input 
                              ref={projInputRef}
                              type="file" 
                              accept="image/*"
                              className="hidden" 
                              onChange={(e) => handleFileChange(e, 'project')}
                            />
                            <p className="font-display font-bold text-black uppercase tracking-wider text-[9px]">
                              Drag & Drop Local Image file
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">SHORT SUMMARY ONE-LINER</label>
                        <input 
                          type="text" 
                          value={projDesc}
                          onChange={(e) => setProjDesc(e.target.value)}
                          placeholder="Brief summary card caption on grid..."
                          className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">DETAILED STORY/JOURNEY</label>
                        <textarea 
                          value={projFullDesc}
                          onChange={(e) => setProjFullDesc(e.target.value)}
                          placeholder="Extended paragraphs displayed on modal explore overlays..."
                          rows={3}
                          className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">TECH STACK (COMMA SEPARATED)</label>
                        <input 
                          type="text" 
                          value={projTech}
                          onChange={(e) => setProjTech(e.target.value)}
                          placeholder="React, Tailwind, Firebase"
                          className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">EXTERNAL PRODUCTION LINK</label>
                        <input 
                          type="text" 
                          value={projLink}
                          onChange={(e) => setProjLink(e.target.value)}
                          placeholder="https://demoproject.com"
                          className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light"
                        />
                      </div>

                      <div className="flex justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={editingProjectId ? handleSaveEdit : handleAddProject}
                          className="w-full bg-black hover:bg-neutral-800 text-white font-display text-[10px] font-black tracking-widest uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {editingProjectId ? 'Save Selected' : 'Add To Gallery'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid List with Re-order controls */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-display text-xs font-black tracking-widest uppercase text-black border-b border-black/5 pb-3 mb-4">
                      CURRENT GALLERY WORKS ({projects.length})
                    </h3>

                    <div className="space-y-3">
                      {projects.map((proj, idx) => (
                        <div 
                          key={proj.id}
                          className="bg-[#F6F6F8] border border-black/5 rounded-xl p-3 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img 
                              src={proj.image} 
                              alt={proj.title} 
                              className="w-12 h-12 object-cover rounded-lg border border-black/5 grayscale flex-shrink-0" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <h5 className="font-display text-xs font-bold text-black uppercase truncate">
                                {proj.title}
                              </h5>
                              <span className="text-[9px] font-mono text-gray-400 block uppercase">
                                {proj.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Sorting */}
                            <button
                              disabled={idx === 0}
                              onClick={() => moveProject(idx, 'up')}
                              className="p-1 hover:bg-black/5 rounded disabled:opacity-20 text-gray-500 hover:text-black transition-colors cursor-pointer"
                              title="Move UP"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={idx === projects.length - 1}
                              onClick={() => moveProject(idx, 'down')}
                              className="p-1 hover:bg-black/5 rounded disabled:opacity-20 text-gray-500 hover:text-black transition-colors cursor-pointer"
                              title="Move DOWN"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <div className="w-px h-4 bg-black/10 mx-1" />

                            {/* Actions */}
                            <button
                              onClick={() => handleStartEdit(proj)}
                              className="p-1.5 text-gray-500 hover:text-black hover:bg-black/5 rounded transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteProject(proj.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {projects.length === 0 && (
                        <div className="text-center py-12 text-gray-400 text-xs">
                          Your visual showcase list is empty. Add a project using the left form panel!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'experiences' && (
            <ExperienceManager
              experiences={experiences}
              setExperiences={setExperiences}
              uploadMediaToCloudinary={uploadMediaToCloudinary}
              certInputRef={certInputRef}
            />
          )}

          {activeTab === 'inquiries' && (
            <div className="space-y-8 max-w-5xl animate-fade-in" id="cms-tab-inquiries">
              
              <div className="flex justify-between items-center bg-white border border-black/5 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono text-gray-500">
                    Sudeis inbox has detected <strong className="text-black">{inquiries.length}</strong> active messages.
                  </span>
                </div>
                {inquiries.length > 0 && (
                  <button
                    onClick={handleClearInquiries}
                    className="flex items-center gap-1.5 text-red-500 hover:bg-red-50 border border-red-200 hover:border-red-300 font-display text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Wipe Inbox
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* List Pane */}
                <div className="lg:col-span-5 bg-white border border-black/5 rounded-2xl shadow-sm p-4 h-[550px] overflow-y-auto">
                  <h4 className="font-display text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 border-b border-black/5 pb-2">
                    RECEIVED CLIENT MESSAGES
                  </h4>

                  <div className="space-y-2">
                    {inquiries.map(inq => {
                      const isSelected = selectedInquiry?.id === inq.id;
                      return (
                        <div
                          key={inq.id}
                          onClick={() => setSelectedInquiry(inq)}
                          className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-[#0C0C0E] border-black text-white'
                              : 'bg-[#F6F6F8] border-black/5 hover:border-black/15 text-black'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h5 className="font-display text-xs font-black uppercase truncate max-w-[150px]">
                              {inq.name}
                            </h5>
                            <span className="text-[8px] font-mono opacity-50 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(inq.timestamp || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <p className={`text-[10px] truncate mt-1 ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                            {inq.message || "No summary message body..."}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase ${
                              isSelected ? 'bg-white/10 text-white' : 'bg-black/5 text-gray-600'
                            }`}>
                              {inq.projectType || 'Unknown'}
                            </span>
                            <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase ${
                              isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {inq.budget || 'Custom'}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {inquiries.length === 0 && (
                      <div className="text-center py-24 text-gray-400 text-xs">
                        No client inquiry entries detected. Test submission by filling the form at the bottom of Sudeis' portfolio.
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Viewer Pane */}
                <div className="lg:col-span-7">
                  <AnimatePresence mode="wait">
                    {selectedInquiry ? (
                      <motion.div
                        key={selectedInquiry.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white border border-black/5 rounded-2xl shadow-sm p-6 space-y-6"
                      >
                        <div className="flex justify-between items-start border-b border-black/5 pb-4">
                          <div>
                            <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase tracking-wider block">
                              SECURE SYSTEM INCOMING WIRE
                            </span>
                            <h3 className="font-display text-base font-black text-black uppercase mt-1">
                              {selectedInquiry.name}
                            </h3>
                            <a 
                              href={`mailto:${selectedInquiry.email}`} 
                              className="text-xs text-gray-500 hover:text-black hover:underline mt-0.5 block"
                            >
                              {selectedInquiry.email}
                            </a>
                          </div>

                          <button
                            onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Metadata grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#F6F6F8] p-3 rounded-xl border border-black/5">
                            <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block">Project Type requested</span>
                            <span className="font-display text-xs font-bold uppercase text-black block mt-1">
                              {selectedInquiry.projectType === 'ui-ux' && 'UI/UX Interactive Design'}
                              {selectedInquiry.projectType === 'android' && 'Android Mobile Native Code'}
                              {selectedInquiry.projectType === 'web' && 'Full-Stack Web App Engine'}
                              {selectedInquiry.projectType === 'consulting' && 'Architectural Review & Consultation'}
                              {!['ui-ux', 'android', 'web', 'consulting'].includes(selectedInquiry.projectType) && selectedInquiry.projectType}
                            </span>
                          </div>

                          <div className="bg-[#F6F6F8] p-3 rounded-xl border border-black/5">
                            <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block">Requested tier / budget</span>
                            <span className="font-display text-xs font-bold uppercase text-emerald-600 block mt-1">
                              {selectedInquiry.budget === 'low' && 'Boutique Scale ($1,000 - $1,500)'}
                              {selectedInquiry.budget === 'medium' && 'Custom Growth Blueprint ($2,500 - $3,500)'}
                              {selectedInquiry.budget === 'high' && 'Premium Bespoke Scale ($5,000+)'}
                              {selectedInquiry.budget === 'enterprise' && 'Institutional Enterprise ($10,000+)'}
                              {!['low', 'medium', 'high', 'enterprise'].includes(selectedInquiry.budget) && selectedInquiry.budget}
                            </span>
                          </div>
                        </div>

                        {/* Message body */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block">CLIENT TRANSMISSION MESSAGE</span>
                          <div className="p-4 bg-[#F6F6F8] border border-black/5 rounded-xl text-xs font-light text-neutral-800 leading-relaxed whitespace-pre-wrap">
                            {selectedInquiry.message || "The client chose not to transmit an extended message description. Respond directly via email to begin scoping blueprints."}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="bg-[#F6F6F8] border border-dashed border-black/10 rounded-2xl h-[450px] flex flex-col justify-center items-center text-center p-6 text-gray-400">
                        <Mail className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="font-display text-xs font-black uppercase text-black">NO MESSAGE SELECTED</p>
                        <p className="text-[11px] text-gray-500 font-light max-w-sm mt-1">Select an inquiry from the client ledger panel to view detailed brief breakdowns and client contact metrics.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-6 animate-fade-in" id="cms-tab-resume">
              <ResumeBuilder />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 max-w-xl animate-fade-in" id="cms-tab-security">
              
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="border-b border-black/5 pb-3">
                  <h3 className="font-display text-xs font-black tracking-widest uppercase text-black">
                    PORTFOLIO CMS ACCESS CONTROLS
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 font-light">Modify your administrative credentials and passcode to maintain complete isolation.</p>
                </div>

                {securitySuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-xl p-3">
                    {securitySuccess}
                  </div>
                )}

                {securityError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl p-3">
                    {securityError}
                  </div>
                )}

                <form onSubmit={handleUpdateSecurity} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">ADMINISTRATOR PRIVILEGED EMAIL</label>
                    <input 
                      type="email" 
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="sudeisfed@gmail.com"
                      required
                      className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2.5 focus:outline-none focus:border-black/25 font-light"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">NEW ACCESS PASSCODE</label>
                    <input 
                      type="password" 
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="Leave blank to keep existing passcode..."
                      className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2.5 focus:outline-none focus:border-black/25 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">CONFIRM NEW ACCESS PASSCODE</label>
                    <input 
                      type="password" 
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      placeholder="Confirm passcode changes..."
                      className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2.5 focus:outline-none focus:border-black/25 font-mono"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-black hover:bg-neutral-800 text-white font-display text-[10px] font-black tracking-widest uppercase py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Commit System Updates
                    </button>
                  </div>
                </form>
              </div>

              {/* Database and CDN Configuration Diagnostics */}
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="border-b border-black/5 pb-3">
                  <h3 className="font-display text-xs font-black tracking-widest uppercase text-black flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-500" />
                    SUPABASE & CLOUDINARY INTEGRATION
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 font-light">Status indicators for your cloud-hosted database and content delivery networks.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#F6F6F8] rounded-xl border border-black/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-black uppercase">Supabase Cloud Database</span>
                      <span className="text-[9px] text-gray-400">Table: portfolio_settings (hero, projects, inquiries…)</span>
                    </div>
                    {!supabaseConfigured ? (
                      <span className="bg-amber-100 text-amber-700 text-[9px] font-mono font-bold px-2 py-1 rounded-full uppercase">Not connected</span>
                    ) : supabaseTableReady ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[9px] font-mono font-bold px-2 py-1 rounded-full uppercase">Table ready</span>
                    ) : (
                      <span className="bg-rose-100 text-rose-700 text-[9px] font-mono font-bold px-2 py-1 rounded-full uppercase">Run SQL below</span>
                    )}
                  </div>

                  {supabaseConfigured && !supabaseServiceRole && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 font-light">
                      Add <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> in Vercel env vars so the server can save data (anon key cannot write).
                    </p>
                  )}

                  {supabaseConfigured && supabaseTableReady && (
                    <button
                      type="button"
                      onClick={handleSeedDatabase}
                      className="w-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black text-white py-2.5 rounded-xl hover:bg-neutral-800 cursor-pointer"
                    >
                      Initialize empty CMS rows
                    </button>
                  )}

                  <div className="flex items-center justify-between p-3 bg-[#F6F6F8] rounded-xl border border-black/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-black uppercase">Cloudinary CDN Storage</span>
                      <span className="text-[9px] text-gray-400">
                        {directUploadEnabled ? 'Direct browser upload (fast)' : 'Server relay upload (slower)'}
                      </span>
                    </div>
                    {cloudinaryConfigured ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[9px] font-mono font-bold px-2 py-1 rounded-full uppercase">
                        {directUploadEnabled ? 'Direct' : 'Relay'}
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-700 text-[9px] font-mono font-bold px-2 py-1 rounded-full uppercase">Not configured</span>
                    )}
                  </div>

                  {cloudinaryConfigured && !directUploadEnabled && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 font-light">
                      For faster uploads, create an <strong>unsigned upload preset</strong> in Cloudinary and set <code className="font-mono">CLOUDINARY_UPLOAD_PRESET</code> in Vercel.
                    </p>
                  )}
                </div>

                {sqlSetupText && (
                  <div className="space-y-2 pt-2">
                    <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest">REQUIRED SQL SEED SCRIPT (SUPABASE)</span>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                      Please copy the query below and execute it in your <strong>Supabase SQL Editor</strong> to construct the target key-value document tables.
                    </p>
                    <div className="relative font-mono">
                      <pre className="text-[9px] font-mono bg-zinc-950 text-emerald-400 p-4 rounded-xl overflow-x-auto max-h-[160px] leading-relaxed">
                        {sqlSetupText}
                      </pre>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(sqlSetupText);
                          alert('Supabase SQL Setup script copied to clipboard!');
                        }}
                        className="absolute right-2 top-2 bg-white/10 hover:bg-white/20 text-white font-mono text-[8px] font-bold uppercase px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        Copy SQL
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Global Footer info bar */}
        <div className="border-t border-black/5 pt-5 mt-12 text-center md:text-left flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] font-mono text-gray-400">
          <span>DESIGNED FOR SUDEIS FEDL CO. v2.8 • ALL REVISIONS PERSISTED LOCAL-STORAGE</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            PROTECTED SECURED ENVIRONMENT (CLIENT-AUTHORITATIVE)
          </span>
        </div>

      </div>

      {/* Floating Uploading Loader indicator */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-black/95 text-white border border-white/10 backdrop-blur-md py-4 px-6 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Cloud Delivery Network</span>
              <span className="text-xs text-white/90 font-light mt-0.5">{uploadProgressMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
