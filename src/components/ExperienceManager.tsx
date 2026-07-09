import React, { useState } from 'react';
import { ExperienceItem } from '../types';
import { Edit, Trash2, ArrowUp, ArrowDown, Check, Upload, Award } from 'lucide-react';

interface ExperienceManagerProps {
  experiences: ExperienceItem[];
  setExperiences: (experiences: ExperienceItem[]) => void;
  uploadMediaToCloudinary: (file: File) => Promise<string>;
  certInputRef: React.RefObject<HTMLInputElement>;
}

export default function ExperienceManager({
  experiences,
  setExperiences,
  uploadMediaToCloudinary,
  certInputRef
}: ExperienceManagerProps) {
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [period, setPeriod] = useState('');
  const [bullets, setBullets] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [certificateImage, setCertificateImage] = useState('');
  
  const [dragActiveCert, setDragActiveCert] = useState(false);

  const handleDrag = (e: React.DragEvent, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveCert(active);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveCert(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadMediaToCloudinary(e.dataTransfer.files[0])
        .then((url) => setCertificateImage(url))
        .catch(() => {});
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMediaToCloudinary(e.target.files[0])
        .then((url) => setCertificateImage(url))
        .catch(() => {});
    }
  };

  const resetForm = () => {
    setEditingExpId(null);
    setRole('');
    setCompany('');
    setPeriod('');
    setBullets('');
    setTechnologies('');
    setCertificateImage('');
  };

  const handleStartEdit = (exp: ExperienceItem) => {
    setEditingExpId(exp.id);
    setRole(exp.role);
    setCompany(exp.company);
    setPeriod(exp.period);
    setBullets(exp.bullets.join('\n'));
    setTechnologies(exp.technologies.join(', '));
    setCertificateImage(exp.certificateImage || '');
  };

  const handleSave = () => {
    if (!role || !company || !period) {
      alert('Role, Company, and Period are required.');
      return;
    }

    const bulletArray = bullets.split('\n').map(b => b.trim()).filter(Boolean);
    const techArray = technologies.split(',').map(t => t.trim()).filter(Boolean);

    const newExp: ExperienceItem = {
      id: editingExpId || `exp-${Date.now()}`,
      role,
      company,
      period,
      bullets: bulletArray,
      technologies: techArray,
      certificateImage: certificateImage || undefined
    };

    if (editingExpId) {
      setExperiences(experiences.map(e => e.id === editingExpId ? newExp : e));
    } else {
      setExperiences([...experiences, newExp]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this experience entry?')) {
      setExperiences(experiences.filter(e => e.id !== id));
      if (editingExpId === id) resetForm();
    }
  };

  const moveExp = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;

    const reordered = [...experiences];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    setExperiences(reordered);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="cms-tab-experiences">
      {/* Add/Edit Form */}
      <div className="lg:col-span-5">
        <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4 sticky top-6">
          <div className="flex justify-between items-center border-b border-black/5 pb-3">
            <h3 className="font-display text-xs font-black tracking-widest uppercase text-black">
              {editingExpId ? 'EDIT EXPERIENCE' : 'ADD EXPERIENCE'}
            </h3>
            {editingExpId && (
              <button 
                onClick={resetForm}
                className="text-gray-400 hover:text-black text-xs font-mono font-bold cursor-pointer"
              >
                RESET
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">ROLE / TITLE</label>
              <input 
                type="text" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Senior Full Stack Developer"
                className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">COMPANY</label>
              <input 
                type="text" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Tech Corp"
                className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">PERIOD</label>
              <input 
                type="text" 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g., Jan 2022 - Present"
                className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">RESPONSIBILITIES / ACHIEVEMENTS (NEWLINE SEPARATED)</label>
              <textarea 
                value={bullets}
                onChange={(e) => setBullets(e.target.value)}
                placeholder="Led development of...\nImproved performance by..."
                rows={4}
                className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light resize-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">TECHNOLOGIES (COMMA SEPARATED)</label>
              <input 
                type="text" 
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="React, Node.js, AWS"
                className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">CERTIFICATE IMAGE</label>
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={certificateImage}
                  onChange={(e) => setCertificateImage(e.target.value)}
                  placeholder="Paste custom web URL..."
                  className="w-full text-xs bg-[#F6F6F8] border border-black/5 rounded-xl px-3 py-2 focus:outline-none focus:border-black/25 font-light"
                />
                <div 
                  onDragOver={(e) => handleDrag(e, true)}
                  onDragLeave={(e) => handleDrag(e, false)}
                  onDrop={handleDrop}
                  onClick={() => certInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-3 text-center cursor-pointer text-[10px] transition-all ${
                    dragActiveCert 
                      ? 'border-black bg-black/5' 
                      : 'border-black/10 hover:border-black/25 bg-[#F6F6F8]'
                  }`}
                >
                  <input 
                    ref={certInputRef}
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <p className="font-display font-bold text-black uppercase tracking-wider text-[9px]">
                    Drag & Drop Certificate Image
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="w-full bg-black hover:bg-neutral-800 text-white font-display text-[10px] font-black tracking-widest uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                {editingExpId ? 'Save Selected' : 'Add Experience'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid List with Re-order controls */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
          <h3 className="font-display text-xs font-black tracking-widest uppercase text-black border-b border-black/5 pb-3 mb-4">
            CURRENT EXPERIENCES ({experiences.length})
          </h3>

          <div className="space-y-3">
            {experiences.map((exp, idx) => (
              <div 
                key={exp.id}
                className="bg-[#F6F6F8] border border-black/5 rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col min-w-0">
                  <h5 className="font-display text-xs font-bold text-black uppercase truncate">
                    {exp.role}
                  </h5>
                  <span className="text-[10px] text-gray-500 block">
                    {exp.company} • {exp.period}
                  </span>
                  {exp.certificateImage && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 uppercase mt-1">
                      <Award className="w-3 h-3" /> Certificate Attached
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Sorting */}
                  <button
                    disabled={idx === 0}
                    onClick={() => moveExp(idx, 'up')}
                    className="p-1 hover:bg-black/5 rounded disabled:opacity-20 text-gray-500 hover:text-black transition-colors cursor-pointer"
                    title="Move UP"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === experiences.length - 1}
                    onClick={() => moveExp(idx, 'down')}
                    className="p-1 hover:bg-black/5 rounded disabled:opacity-20 text-gray-500 hover:text-black transition-colors cursor-pointer"
                    title="Move DOWN"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-4 bg-black/10 mx-1" />

                  {/* Actions */}
                  <button
                    onClick={() => handleStartEdit(exp)}
                    className="p-1.5 text-gray-500 hover:text-black hover:bg-black/5 rounded transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {experiences.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-xs">
                Your experience timeline is empty. Add a role using the left form panel!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
