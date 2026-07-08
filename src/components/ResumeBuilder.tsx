import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Save, FileText, Plus, Trash2, Edit2, Check, ArrowRight,
  Briefcase, GraduationCap, Code2, User, HelpCircle, Loader2, RefreshCw, Printer,
  Upload, Settings, XCircle, AlertCircle, FileDown
} from 'lucide-react';
import { ResumeData, WorkExperience, EducationItem } from '../types';
import { defaultResumeData, printResume } from '../utils/resume';

interface CommaSeparatedInputProps {
  value: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

function CommaSeparatedInput({ value, onChange, placeholder, className }: CommaSeparatedInputProps) {
  const [localVal, setLocalVal] = useState('');

  useEffect(() => {
    const formatted = value.join(', ');
    const normalizedProp = value.map(s => s.trim()).filter(Boolean).join(', ');
    const normalizedLocal = localVal.split(',').map(s => s.trim()).filter(Boolean).join(', ');
    if (normalizedProp !== normalizedLocal) {
      setLocalVal(formatted);
    }
  }, [value]);

  return (
    <input
      type="text"
      value={localVal}
      onChange={e => {
        const val = e.target.value;
        setLocalVal(val);
        onChange(val);
      }}
      placeholder={placeholder}
      className={className}
    />
  );
}

export default function ResumeBuilder() {
  const [resume, setResume] = useState<ResumeData>(defaultResumeData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Tab states
  const [builderTab, setBuilderTab] = useState<'target' | 'info' | 'experience' | 'education' | 'skills' | 'ai'>('target');
  
  // Custom Resume Mode & Uploader State
  const [resumeSource, setResumeSource] = useState<'interactive' | 'custom'>(() => {
    try {
      return (localStorage.getItem('sudeis_resume_source') as 'interactive' | 'custom') || 'interactive';
    } catch {
      return 'interactive';
    }
  });
  const [customResumeFile, setCustomResumeFile] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sudeis_custom_resume_file');
    } catch {
      return null;
    }
  });
  const [customResumeName, setCustomResumeName] = useState<string>(() => {
    try {
      return localStorage.getItem('sudeis_custom_resume_name') || '';
    } catch {
      return '';
    }
  });
  const [customResumeSize, setCustomResumeSize] = useState<string>(() => {
    try {
      return localStorage.getItem('sudeis_custom_resume_size') || '';
    } catch {
      return '';
    }
  });
  const [customResumeDate, setCustomResumeDate] = useState<string>(() => {
    try {
      return localStorage.getItem('sudeis_custom_resume_date') || '';
    } catch {
      return '';
    }
  });
  const [dragActive, setDragActive] = useState(false);
  
  // AI Generation states
  const [aiDraftNotes, setAiDraftNotes] = useState('');
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // AI Enhancer individual states
  const [isEnhancingSummary, setIsEnhancingSummary] = useState(false);
  const [enhancingExpId, setEnhancingExpId] = useState<string | null>(null);

  // Load saved resume data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sudeis_resume_data');
      if (saved) {
        setResume(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("localStorage not available, using default data");
    }
  }, []);

  const handleSourceChange = (source: 'interactive' | 'custom') => {
    setResumeSource(source);
    try {
      localStorage.setItem('sudeis_resume_source', source);
    } catch (e) {}
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleResumeFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleResumeFileChange = (file: File) => {
    if (!file) return;
    
    const isAllowed = file.type === 'application/pdf' || 
                      file.name.endsWith('.pdf') || 
                      file.name.endsWith('.doc') || 
                      file.name.endsWith('.docx') ||
                      file.type === 'application/msword' || 
                      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                      
    if (!isAllowed) {
      alert("Only PDF or Word document (.doc, .docx) formats are allowed.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("The file size exceeds the 8MB storage limit. Please compress your resume and upload again.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      const dateStr = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      setCustomResumeFile(base64);
      setCustomResumeName(file.name);
      setCustomResumeSize(sizeStr);
      setCustomResumeDate(dateStr);

      try {
        localStorage.setItem('sudeis_custom_resume_file', base64);
        localStorage.setItem('sudeis_custom_resume_name', file.name);
        localStorage.setItem('sudeis_custom_resume_size', sizeStr);
        localStorage.setItem('sudeis_custom_resume_date', dateStr);
      } catch (err) {
        console.error(err);
        alert("Storage quota exceeded. Try uploading a compressed or smaller PDF (ideally under 1MB).");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomResume = () => {
    if (window.confirm("Are you sure you want to remove your custom resume?")) {
      setCustomResumeFile(null);
      setCustomResumeName('');
      setCustomResumeSize('');
      setCustomResumeDate('');
      try {
        localStorage.removeItem('sudeis_custom_resume_file');
        localStorage.removeItem('sudeis_custom_resume_name');
        localStorage.removeItem('sudeis_custom_resume_size');
        localStorage.removeItem('sudeis_custom_resume_date');
      } catch (e) {}
    }
  };

  const handleTestDownload = () => {
    if (!customResumeFile) return;
    const link = document.createElement('a');
    link.href = customResumeFile;
    link.download = customResumeName || 'Sudeis_Fedlu_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('sudeis_resume_data', JSON.stringify(resume));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      alert("Failed to save to local cache (localStorage access blocked).");
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    if (window.confirm("Are you sure you want to reset your resume to default template data?")) {
      setResume(defaultResumeData);
      try {
        localStorage.setItem('sudeis_resume_data', JSON.stringify(defaultResumeData));
      } catch (e) {}
    }
  };

  // AI Summary Enhancer
  const handleEnhanceSummary = async () => {
    if (!resume.summary.trim()) return;
    setIsEnhancingSummary(true);
    setAiError(null);
    try {
      const response = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'enhance_summary',
          payload: { summary: resume.summary }
        })
      });
      const data = await response.json();
      if (response.ok && data.result) {
        setResume(prev => ({ ...prev, summary: data.result }));
      } else {
        throw new Error(data.error || "Failed to enhance summary.");
      }
    } catch (err: any) {
      setAiError(err.message || "Something went wrong.");
    } finally {
      setIsEnhancingSummary(false);
    }
  };

  // AI Experience Bullet Enhancer
  const handleEnhanceExperience = async (id: string) => {
    const exp = resume.experience.find(e => e.id === id);
    if (!exp) return;
    setEnhancingExpId(id);
    setAiError(null);
    try {
      const response = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'enhance_experience',
          payload: {
            role: exp.role,
            company: exp.company,
            location: exp.location,
            period: exp.period,
            description: exp.description
          }
        })
      });
      const data = await response.json();
      if (response.ok && data.result) {
        setResume(prev => ({
          ...prev,
          experience: prev.experience.map(e => e.id === id ? { ...e, description: data.result } : e)
        }));
      } else {
        throw new Error(data.error || "Failed to optimize bullet points.");
      }
    } catch (err: any) {
      setAiError(err.message || "Failed to optimize bullets.");
    } finally {
      setEnhancingExpId(null);
    }
  };

  // Full AI Resume Generator from notes
  const handleGenerateFullResume = async () => {
    if (!aiDraftNotes.trim()) {
      setAiError("Please type in some draft notes first.");
      return;
    }
    setIsGeneratingFull(true);
    setAiError(null);
    try {
      const response = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'generate_full',
          payload: { notes: aiDraftNotes }
        })
      });
      const data = await response.json();
      if (response.ok && data.name) {
        setResume(data);
        setBuilderTab('info');
        alert("Success! Your resume has been completely re-generated with optimized ATS structure.");
      } else {
        throw new Error(data.error || "Generation error.");
      }
    } catch (err: any) {
      setAiError(err.message || "Failed to generate resume. Ensure Gemini API key is configured.");
    } finally {
      setIsGeneratingFull(false);
    }
  };

  // List manipulation helpers
  const updateExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const updated = [...resume.experience];
    updated[index] = { ...updated[index], [field]: value };
    setResume(prev => ({ ...prev, experience: updated }));
  };

  const addExperience = () => {
    const newJob: WorkExperience = {
      id: 'exp-' + Date.now(),
      role: "Software Developer",
      company: "Company Name",
      location: "City, Country",
      period: "2025 - Present",
      description: "• Accomplished X as measured by Y, by doing Z\n• Developed and streamlined critical software workflows"
    };
    setResume(prev => ({ ...prev, experience: [...prev.experience, newJob] }));
  };

  const removeExperience = (id: string) => {
    setResume(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const updated = [...resume.education];
    updated[index] = { ...updated[index], [field]: value };
    setResume(prev => ({ ...prev, education: updated }));
  };

  const addEducation = () => {
    const newEdu: EducationItem = {
      id: 'edu-' + Date.now(),
      degree: "B.S. in Computer Science",
      school: "University Name",
      location: "City, Country",
      period: "2020 - 2024",
      details: "Focus on software engineering."
    };
    setResume(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const removeEducation = (id: string) => {
    setResume(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  // Skill tag change helpers
  const handleSkillsChange = (category: 'languages' | 'frameworks' | 'tools', val: string) => {
    const arr = val.split(',').map(s => s.trim()).filter(Boolean);
    setResume(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: arr
      }
    }));
  };

  // Project lists
  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...resume.projects];
    if (field === 'technologies') {
      updated[index] = { ...updated[index], technologies: value.split(',').map((s: string) => s.trim()).filter(Boolean) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setResume(prev => ({ ...prev, projects: updated }));
  };

  const addProject = () => {
    setResume(prev => ({
      ...prev,
      projects: [...prev.projects, { title: "New Project", description: "Project description", technologies: ["React"] }]
    }));
  };

  const removeProject = (index: number) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // Print function (opens print layout specifically designed for ATS standard template)
  const triggerPrint = () => {
    printResume(resume);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="resume-builder-workspace">
      {/* Left Column: Form Editor & Controls (7 Cols) */}
      <div className="lg:col-span-7 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-6 text-black dark:text-white transition-colors duration-300" id="cv-editor-panel">
        
        {/* Head/Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black/5 dark:border-white/5 pb-4 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Interactive Resume Builder</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Edit inputs & optimize using built-in Gemini models</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={resetToDefault}
              className="px-3 py-1.5 border border-black/10 dark:border-white/10 rounded-lg text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              title="Reset to original template"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-black px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer font-sans transition-all duration-200"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saveSuccess ? "Saved!" : "Save Data"}
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1 bg-black/5 dark:bg-black/30 p-1 rounded-xl" id="builder-tab-controls">
          {[
            { key: 'target', label: 'Resume Mode', icon: <Settings className="w-3.5 h-3.5" /> },
            { key: 'info', label: 'Basic Info', icon: <User className="w-3.5 h-3.5" /> },
            { key: 'experience', label: 'Jobs', icon: <Briefcase className="w-3.5 h-3.5" /> },
            { key: 'education', label: 'Education', icon: <GraduationCap className="w-3.5 h-3.5" /> },
            { key: 'skills', label: 'Skills & Projects', icon: <Code2 className="w-3.5 h-3.5" /> },
            { key: 'ai', label: 'AI Generator', icon: <Sparkles className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setBuilderTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                builderTab === tab.key
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Errors displaying */}
        {aiError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2">
            <span className="font-bold">Error:</span>
            <span className="flex-1">{aiError}</span>
            <button onClick={() => setAiError(null)} className="text-[10px] underline uppercase font-bold tracking-wider hover:opacity-80">Dismiss</button>
          </div>
        )}

        {/* Tab View Contents */}

        {/* RESUME MODE TARGET CONFIG TAB */}
        {builderTab === 'target' && (
          <div className="space-y-6" id="form-tab-target">
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Choose Downloadable Resume Source
              </h3>
              <p className="text-xs text-gray-500 leading-normal font-light">
                Select which version of your resume is downloaded by public visitors on your portfolio's main landing page.
              </p>
            </div>

            {/* Selection Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Interactive ATS */}
              <div 
                onClick={() => handleSourceChange('interactive')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  resumeSource === 'interactive'
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md'
                    : 'bg-black/5 border-black/5 text-black dark:bg-white/5 dark:border-white/5 dark:text-white hover:border-black/10 dark:hover:border-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                      <Printer className="w-5 h-5" />
                    </div>
                    {resumeSource === 'interactive' && (
                      <span className="text-[8px] font-mono font-bold tracking-widest bg-emerald-500 text-black px-2 py-0.5 rounded uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider">Dynamic ATS Resume</h4>
                  <p className={`text-[10px] leading-relaxed font-light ${
                    resumeSource === 'interactive' ? 'opacity-80' : 'text-gray-500'
                  }`}>
                    Generates a clean, print-ready, single-column ATS (Applicant Tracking System) optimized template directly from your editor inputs.
                  </p>
                </div>
              </div>

              {/* Option B: Custom Uploaded Resume File */}
              <div 
                onClick={() => handleSourceChange('custom')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  resumeSource === 'custom'
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md'
                    : 'bg-black/5 border-black/5 text-black dark:bg-white/5 dark:border-white/5 dark:text-white hover:border-black/10 dark:hover:border-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                      <FileDown className="w-5 h-5" />
                    </div>
                    {resumeSource === 'custom' && (
                      <span className="text-[8px] font-mono font-bold tracking-widest bg-emerald-500 text-black px-2 py-0.5 rounded uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider">Custom Uploaded File</h4>
                  <p className={`text-[10px] leading-relaxed font-light ${
                    resumeSource === 'custom' ? 'opacity-80' : 'text-gray-500'
                  }`}>
                    Serves your exact uploaded custom designed PDF, DOC, or DOCX document (ideal for highly styled visual portfolio resumes).
                  </p>
                </div>
              </div>
            </div>

            {/* Warn user if custom chosen but no file yet */}
            {resumeSource === 'custom' && !customResumeFile && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5 leading-normal">
                  <strong className="block font-bold">No Custom Document Uploaded</strong>
                  <span>You selected Custom File download, but haven't uploaded a document yet. Please upload your resume PDF below.</span>
                </div>
              </div>
            )}

            {/* Custom Resume Uploader Panel */}
            <div className="space-y-4 pt-2">
              <div className="border-t border-black/5 dark:border-white/5 pt-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Upload Custom Resume File
                </h3>
                <p className="text-xs text-gray-500 font-light mb-4">
                  Upload a standard PDF, DOC, or DOCX file. Maximum file size is 8MB.
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDropFile}
                onClick={() => document.getElementById('custom-resume-picker')?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col justify-center items-center text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-black/10 hover:border-black/25 dark:border-white/10 dark:hover:border-white/25 bg-black/[0.02] dark:bg-white/[0.02]'
                }`}
              >
                <input
                  type="file"
                  id="custom-resume-picker"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleResumeFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                
                <Upload className="w-8 h-8 text-gray-400 mb-3 animate-pulse" />
                <p className="font-display text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  Drag &amp; drop resume file here
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-light">
                  or click to browse local files (PDF or Word up to 8MB)
                </p>
              </div>

              {/* Uploaded File Status */}
              {customResumeFile && (
                <div className="bg-[#F6F6F8] dark:bg-black/30 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-bold text-black dark:text-white truncate uppercase tracking-wider">
                        {customResumeName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                        <span>{customResumeSize}</span>
                        <span>•</span>
                        <span>Uploaded {customResumeDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto">
                    <button
                      onClick={handleTestDownload}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 border border-black/10 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider py-2 px-3 cursor-pointer transition-all duration-200"
                      title="Download uploaded file to verify"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      Test Download
                    </button>
                    <button
                      onClick={handleRemoveCustomResume}
                      className="flex items-center justify-center p-2 border border-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-550/10 hover:border-rose-500/30 cursor-pointer transition-colors"
                      title="Delete uploaded file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* INFO TAB */}
        {builderTab === 'info' && (
          <div className="space-y-4" id="form-tab-info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={resume.name}
                  onChange={e => setResume({ ...resume, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Professional Title</label>
                <input
                  type="text"
                  value={resume.title}
                  onChange={e => setResume({ ...resume, title: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={resume.email}
                  onChange={e => setResume({ ...resume, email: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  value={resume.phone}
                  onChange={e => setResume({ ...resume, phone: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  value={resume.location}
                  onChange={e => setResume({ ...resume, location: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Personal Website</label>
                <input
                  type="text"
                  value={resume.website || ''}
                  onChange={e => setResume({ ...resume, website: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">LinkedIn Profile</label>
                <input
                  type="text"
                  value={resume.linkedin || ''}
                  onChange={e => setResume({ ...resume, linkedin: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GitHub Profile</label>
                <input
                  type="text"
                  value={resume.github || ''}
                  onChange={e => setResume({ ...resume, github: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            {/* Profile Summary with AI enhancer */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Professional Summary</label>
                <button
                  onClick={handleEnhanceSummary}
                  disabled={isEnhancingSummary}
                  className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 disabled:opacity-40 bg-emerald-500/5 hover:bg-emerald-500/10 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                >
                  {isEnhancingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI Enhance Summary
                </button>
              </div>
              <textarea
                value={resume.summary}
                onChange={e => setResume({ ...resume, summary: e.target.value })}
                rows={5}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                placeholder="Brief professional profile summary..."
              />
            </div>
          </div>
        )}

        {/* EXPERIENCE TAB */}
        {builderTab === 'experience' && (
          <div className="space-y-6" id="form-tab-experience">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Work History ({resume.experience.length})</h3>
              <button
                onClick={addExperience}
                className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Job
              </button>
            </div>

            <div className="space-y-4">
              {resume.experience.map((exp, index) => (
                <div key={exp.id} className="p-4 bg-black/25 border border-white/5 rounded-xl space-y-3 relative group">
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Delete Job"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Role Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={e => updateExperience(index, 'role', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={e => updateExperience(index, 'company', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={e => updateExperience(index, 'location', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Period (e.g., 2023 - Present)</label>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={e => updateExperience(index, 'period', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Bullet points area with AI enhancer */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Responsibilities &amp; Achievements (ATS Bullets)</label>
                      <button
                        onClick={() => handleEnhanceExperience(exp.id)}
                        disabled={enhancingExpId !== null}
                        className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                      >
                        {enhancingExpId === exp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        AI Optimize Bullets
                      </button>
                    </div>
                    <textarea
                      value={exp.description}
                      onChange={e => updateExperience(index, 'description', e.target.value)}
                      rows={4}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                      placeholder="• Achieved X as measured by Y, by doing Z... (one bullet per line)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION TAB */}
        {builderTab === 'education' && (
          <div className="space-y-6" id="form-tab-education">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Education History ({resume.education.length})</h3>
              <button
                onClick={addEducation}
                className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Education
              </button>
            </div>

            <div className="space-y-4">
              {resume.education.map((edu, index) => (
                <div key={edu.id} className="p-4 bg-black/25 border border-white/5 rounded-xl space-y-3 relative group">
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Delete Education"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Degree / Program</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={e => updateEducation(index, 'degree', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">School / University</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={e => updateEducation(index, 'school', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Location</label>
                      <input
                        type="text"
                        value={edu.location}
                        onChange={e => updateEducation(index, 'location', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Graduation Period</label>
                      <input
                        type="text"
                        value={edu.period}
                        onChange={e => updateEducation(index, 'period', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Additional details / Honors (Optional)</label>
                    <input
                      type="text"
                      value={edu.details || ''}
                      onChange={e => updateEducation(index, 'details', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Focus areas, GPA, awards, etc."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKILLS & PROJECTS TAB */}
        {builderTab === 'skills' && (
          <div className="space-y-6" id="form-tab-skills-projects">
            
            {/* SKILLS SECTION */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-1">Technical Skills</h3>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Languages (comma-separated)</label>
                  <CommaSeparatedInput
                    value={resume.skills.languages}
                    onChange={val => handleSkillsChange('languages', val)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="Python, TypeScript, SQL..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Frameworks &amp; Libraries (comma-separated)</label>
                  <CommaSeparatedInput
                    value={resume.skills.frameworks}
                    onChange={val => handleSkillsChange('frameworks', val)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="React, FastAPI, Tailwind CSS..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Tools &amp; Infrastructure (comma-separated)</label>
                  <CommaSeparatedInput
                    value={resume.skills.tools}
                    onChange={val => handleSkillsChange('tools', val)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="Docker, Nginx, Git..."
                  />
                </div>
              </div>
            </div>

            {/* PROJECTS SECTION */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-1 flex-1">Key Showcase Projects</h3>
                <button
                  onClick={addProject}
                  className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Project
                </button>
              </div>

              <div className="space-y-4">
                {resume.projects.map((proj, index) => (
                  <div key={index} className="p-4 bg-black/25 border border-white/5 rounded-xl space-y-3 relative group">
                    <button
                      onClick={() => removeProject(index)}
                      className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={e => updateProject(index, 'title', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Technologies (comma-separated)</label>
                        <CommaSeparatedInput
                          value={proj.technologies}
                          onChange={val => updateProject(index, 'technologies', val)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Project Summary (one line)</label>
                      <input
                        type="text"
                        value={proj.description}
                        onChange={e => updateProject(index, 'description', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* AI GENERATOR TAB */}
        {builderTab === 'ai' && (
          <div className="space-y-5" id="form-tab-ai-generator">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                DRAFT-TO-RESUME CO-PILOT
              </span>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                Simply write raw details about your experience, stack, and studies below. Sudeis's custom AI engine will synthesize and optimize the data, re-building a comprehensive, fully populated, ATS-compliant professional resume.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type your unstructured notes or prompt</label>
              <textarea
                value={aiDraftNotes}
                onChange={e => setAiDraftNotes(e.target.value)}
                rows={8}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                placeholder="Example: My name is Sudeis. I work at Monolith Tech as a lead dev since late 2024. I use fastapi python and react tailwind to make fast map tools. Before that I was at Symmetrical digital for 2 years doing php/laravel, docker pipelines, and custom dashboards. I got a BS in CS from AAU in 2023 with honors. My email is sudeisfed@gmail.com and phone is +251974126234."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateFullResume}
                disabled={isGeneratingFull || !aiDraftNotes.trim()}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-gray-500 text-black px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer font-sans transition-all duration-200"
              >
                {isGeneratingFull ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI Structuring Portfolio Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Instantly Synthesize Full Resume
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Right Column: Live ATS Compliant Preview (5 Cols) */}
      <div className="lg:col-span-5 bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4" id="cv-preview-panel">
        
        {/* Preview Header controls */}
        <div className="flex justify-between items-center border-b border-black/5 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-black uppercase">LIVE ATS ENGINE PREVIEW</span>
          </div>
          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
            title="Download / Print Resume PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>

        {/* ATS-standard Minimalist rendering container */}
        <div 
          className="bg-white text-black p-6 rounded-xl border border-black/10 shadow-inner max-h-[700px] overflow-y-auto font-sans text-[11px] leading-relaxed space-y-4"
          style={{ fontFamily: "Arial, sans-serif" }}
          id="ats-print-container"
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-base font-bold uppercase tracking-tight text-black m-0 p-0 leading-none">{resume.name}</h1>
            <p className="text-xs italic text-gray-700 m-0 p-0">{resume.title}</p>
            <div className="text-[10px] text-gray-500 flex flex-wrap justify-center gap-x-2 gap-y-1 leading-normal">
              <span>{resume.location}</span>
              <span>•</span>
              <span>{resume.phone}</span>
              <span>•</span>
              <span className="underline">{resume.email}</span>
              {resume.website && (
                <>
                  <span>•</span>
                  <span className="underline">{resume.website}</span>
                </>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1">Professional Summary</h2>
            <p className="text-justify leading-relaxed font-light text-gray-800 p-0 m-0">{resume.summary}</p>
          </div>

          {/* Skills */}
          <div className="space-y-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1">Technical Skills</h2>
            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-gray-800">
              <span className="font-bold">Languages:</span>
              <span>{resume.skills.languages.join(', ')}</span>
              <span className="font-bold">Frameworks:</span>
              <span>{resume.skills.frameworks.join(', ')}</span>
              <span className="font-bold">Tools:</span>
              <span>{resume.skills.tools.join(', ')}</span>
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1">Professional Experience</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>{exp.role} — {exp.company}</span>
                  <span className="font-normal text-gray-500 text-[10px]">{exp.period}</span>
                </div>
                <div className="text-[10px] text-gray-500 italic">{exp.location}</div>
                <div className="pl-3.5 space-y-1 text-gray-800 font-light mt-1">
                  {exp.description.split('\n').map((bullet, i) => (
                    <p key={i} className="p-0 m-0 leading-relaxed">{bullet}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="space-y-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1">Key Projects</h2>
            {resume.projects.map((p, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold">
                  {p.title} <span className="font-normal text-[10px] text-gray-500 font-mono">({p.technologies.join(', ')})</span>
                </div>
                <p className="p-0 m-0 text-gray-800 font-light">{p.description}</p>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="space-y-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1">Education</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>{edu.degree}</span>
                  <span className="font-normal text-gray-500 text-[10px]">{edu.period}</span>
                </div>
                <div className="text-[10px] text-gray-700">{edu.school}, {edu.location}</div>
                {edu.details && <p className="p-0 m-0 text-[10px] text-gray-600 font-light mt-0.5">{edu.details}</p>}
              </div>
            ))}
          </div>

        </div>

        {/* Tip banner */}
        <div className="p-3 bg-neutral-100 rounded-xl flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="text-[10px] text-gray-500 leading-normal font-light">
            <strong className="text-black block mb-0.5">ATS Parser Optimized Format</strong>
            This template is engineered strictly around ATS (Applicant Tracking System) rules: single-column layouts, standard system fonts, non-nested tags, and no complex graphical tables, ensuring search readability.
          </div>
        </div>

      </div>
    </div>
  );
}
