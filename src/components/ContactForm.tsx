import { FormEvent, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeftRight, ArrowRight, Brain, CheckCircle, Database, HelpCircle, Mail, Phone, Send, ShieldCheck, Trash2 } from 'lucide-react';
import { ContactMessage } from '../types';
import { safeStorage } from '../utils/safeStorage';

interface ContactFormProps {
  onSuccess: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  preSelectedService?: string;
}

export default function ContactForm({ onSuccess, isOpen = false, onClose, preSelectedService = '' }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState('web');
  const [budget, setBudget] = useState('medium');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedInquiries, setSubmittedInquiries] = useState<ContactMessage[]>([]);
  const [showAdminLogs, setShowAdminLogs] = useState(false);

  // Load inquiries from database/localStorage
  useEffect(() => {
    const loadInquiries = async () => {
      try {
        const res = await fetch('/api/inquiries');
        if (res.ok) {
          const data = await res.json();
          setSubmittedInquiries(data);
          safeStorage.setItem('sudeis_inquiries', JSON.stringify(data));
          return;
        }
      } catch (e) {
        console.error('Error fetching inquiries from database', e);
      }

      // Fallback
      const saved = safeStorage.getItem('sudeis_inquiries');
      if (saved) {
        try {
          setSubmittedInquiries(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading inquiries from local storage', e);
        }
      }
    };
    loadInquiries();
  }, [isSubmitted]);

  // Handle pre-selection of project type
  useEffect(() => {
    if (preSelectedService) {
      if (preSelectedService === 'ui-ux') setProjectType('ui-ux');
      else if (preSelectedService === 'android') setProjectType('android');
      else if (preSelectedService === 'web') setProjectType('web');
      else if (preSelectedService === 'consulting') setProjectType('consulting');
    }
  }, [preSelectedService]);

  // Dynamic cost and time estimator based on selections
  const getEstimation = () => {
    let basePrice = 1200;
    let baseWeeks = 3;

    if (projectType === 'ui-ux') {
      basePrice = 1500;
      baseWeeks = 3;
    } else if (projectType === 'android') {
      basePrice = 3500;
      baseWeeks = 6;
    } else if (projectType === 'web') {
      basePrice = 2800;
      baseWeeks = 4;
    } else if (projectType === 'consulting') {
      basePrice = 800;
      baseWeeks = 1;
    }

    // Budget multipliers
    if (budget === 'low') {
      basePrice = Math.round(basePrice * 0.85);
      baseWeeks = Math.round(baseWeeks * 0.9);
    } else if (budget === 'high') {
      basePrice = Math.round(basePrice * 1.5);
      baseWeeks = Math.round(baseWeeks * 1.3);
    } else if (budget === 'enterprise') {
      basePrice = Math.round(basePrice * 2.5);
      baseWeeks = Math.round(baseWeeks * 1.8);
    }

    return {
      priceRange: `$${basePrice.toLocaleString()} - $${Math.round(basePrice * 1.25).toLocaleString()}`,
      weeks: `${baseWeeks} - ${baseWeeks + 2} weeks`,
      milestones: projectType === 'consulting' 
        ? ['Technical Review', 'Infrastructure Map', 'Final Recommendations']
        : ['Architecture Brief', 'Fidelity Layouts', 'Database Map', 'Integration & QC']
    };
  };

  const estimation = getEstimation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);

    const newInquiry: ContactMessage = {
      id: `inq-${Date.now()}`,
      name,
      email,
      projectType,
      budget,
      message,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'unread'
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry)
      });
      if (res.ok) {
        const data = await res.json();
        const updated = [data.inquiry || newInquiry, ...submittedInquiries];
        safeStorage.setItem('sudeis_inquiries', JSON.stringify(updated));
        setSubmittedInquiries(updated);
      } else {
        throw new Error("Server error saving inquiry");
      }
    } catch (err) {
      console.warn("Database storage failed, falling back to local storage:", err);
      const updated = [newInquiry, ...submittedInquiries];
      safeStorage.setItem('sudeis_inquiries', JSON.stringify(updated));
      setSubmittedInquiries(updated);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
      onSuccess();

      // Clear input fields
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  const deleteInquiry = (id: string) => {
    const filtered = submittedInquiries.filter(i => i.id !== id);
    safeStorage.setItem('sudeis_inquiries', JSON.stringify(filtered));
    setSubmittedInquiries(filtered);
  };

  const clearAllInquiries = () => {
    if (window.confirm('Are you sure you want to clear the client submission database?')) {
      safeStorage.removeItem('sudeis_inquiries');
      setSubmittedInquiries([]);
    }
  };

  return (
    <section id="contact" className="py-24 bg-transparent text-black border-b border-black/5 relative overflow-hidden">
      
      {/* Background organic light mesh patterns */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neutral-100/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neutral-100/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Main Title Left Banner (5 columns) */}
          <div className="lg:col-span-4 space-y-8" id="contact-left">
            <div className="space-y-4">
              <h2 className="font-display text-5xl sm:text-7xl font-light tracking-tight leading-[0.95] select-none text-black uppercase">
                Let's
                <span className="block uppercase font-black text-black mt-2 tracking-tight">
                  Connect
                </span>
                <span className="block mt-2 font-light text-gray-400">
                  there
                </span>
              </h2>
            </div>

            {/* Direct contact info card */}
            <div className="bg-white border border-black/5 p-6 rounded-[24px] space-y-4 max-w-sm shadow-sm" id="contact-info-card">
              <span className="text-[10px] font-display tracking-widest text-gray-400 uppercase block font-bold">
                CREATIVE DISPATCH
              </span>
              <div className="space-y-3.5 text-xs font-sans text-gray-800 dark:text-gray-200">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <a href="mailto:sudeisfed@gmail.com" className="hover:text-black dark:hover:text-white transition-colors font-light">sudeisfed@gmail.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <a href="tel:+251974126234" className="hover:text-black dark:hover:text-white transition-colors font-light">+251974126234</a>
                </div>
              </div>
            </div>
          </div>

          {/* Core Interactive Setup Form Right (8 columns) */}
          <div className="lg:col-span-8 bg-white border border-black/5 p-8 md:p-10 rounded-[24px] shadow-sm relative animate-fade-in" id="contact-right">
            
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="contact-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="border-b border-black/5 pb-4">
                    <h3 className="font-display text-base font-bold uppercase mb-1 text-black">
                      Project Planning Assistant
                    </h3>
                    <p className="font-sans text-xs text-gray-500 font-light">
                      Configure your parameters to request a project design briefing.
                    </p>
                  </div>

                  {/* Input Rows: Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-display text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-[#F6F6F8] rounded-2xl border border-black/5 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 text-black font-light transition-all"
                        id="input-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-display text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-[#F6F6F8] rounded-2xl border border-black/5 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 text-black font-light transition-all"
                        id="input-email"
                      />
                    </div>
                  </div>

                  {/* Input Rows: Project Type and Est Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-display text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
                        Service Class
                      </label>
                      <select
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="w-full bg-[#F6F6F8] border border-black/5 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 text-[#1C1C1E] font-light transition-all appearance-none cursor-pointer"
                        id="select-project-type"
                      >
                        <option value="ui-ux">UI/UX Interface Design</option>
                        <option value="android">Android Application</option>
                        <option value="web">Fullstack Web Development</option>
                        <option value="consulting">Technical Consulting</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-display text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
                        Project Scope scale
                      </label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full bg-[#F6F6F8] border border-black/5 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 text-[#1C1C1E] font-light transition-all appearance-none cursor-pointer"
                        id="select-budget"
                      >
                        <option value="low">Standard / Minimal Phase</option>
                        <option value="medium">Growth / Core Operations</option>
                        <option value="high">Enterprise Scales / Advanced Integration</option>
                      </select>
                    </div>
                  </div>

                  {/* Message Detail */}
                  <div className="space-y-2">
                    <label className="font-display text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
                      Project Objective Summary
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Outline core business rules, target users, or design aesthetic preferences..."
                      className="w-full bg-[#F6F6F8] border border-black/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 text-black resize-none font-light transition-all"
                      id="input-details"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full font-display text-[11px] font-bold uppercase tracking-[0.15em] bg-[#1C1C1E] text-white hover:bg-black transition-all py-4 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 hover:scale-[1.01]"
                      id="contact-submit-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Ingesting Specifications...
                        </>
                      ) : (
                        <>
                          Dispatch Request Specifications
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="contact-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center text-center space-y-6"
                  id="contact-success-state"
                >
                  <div className="w-16 h-16 rounded-full bg-black/5 flex items-center center text-[#1C1C1E]">
                    <CheckCircle className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-wider text-black uppercase">
                      Specifications Dispatched
                    </h3>
                    <p className="font-sans text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed font-light">
                      Sudeis has received your product guidelines! He will review your request and get back to you shortly.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      if (onClose) onClose();
                    }}
                    className="font-display text-[10px] font-bold uppercase tracking-widest bg-black text-white hover:bg-[#1C1C1E] px-6 py-3.5 rounded-full cursor-pointer hover:scale-105 transition-transform shadow-sm"
                  >
                    Configure Another Scope
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

        {/* Real-time Simulated Inquiry Log Admin Terminal Panel (Toggled client-side) */}
        <AnimatePresence>
          {showAdminLogs && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-14 bg-white border border-black/5 rounded-[28px] p-6 md:p-8 outline-none shadow-sm"
              id="admin-logs-panel"
            >
              <div className="flex flex-wrap items-center justify-between border-b border-black/5 pb-4 mb-6 gap-4">
                <div>
                  <h4 className="font-display text-sm font-bold tracking-wider text-black flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    LOCAL INQUIRY DATABASE SUBMISSIONS
                  </h4>
                  <p className="font-sans text-xs text-gray-500 mt-1 font-light">
                    Direct access to submitted metadata in `localStorage` to verify form delivery.
                  </p>
                </div>
                {submittedInquiries.length > 0 && (
                  <button
                    onClick={clearAllInquiries}
                    className="font-display text-[10px] font-bold text-rose-700 bg-rose-50 px-3.5 py-2 rounded-full hover:bg-rose-100 cursor-pointer flex items-center gap-1.5 transition-transform hover:scale-[1.02] shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Factory Reset Database
                  </button>
                )}
              </div>

              {submittedInquiries.length === 0 ? (
                <div className="py-12 border border-dashed border-black/10 rounded-[20px] text-center space-y-3 bg-[#F6F6F8]">
                  <span className="font-display text-xs text-[#1A1A1A] block font-bold">
                    No active submission documents found
                  </span>
                  <p className="font-sans text-xs text-gray-500 max-w-xs mx-auto font-light">
                    Fill out the client contact form above and press dispatch to see records append automatically!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {submittedInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="bg-[#FDFCFB] border border-black/5 rounded-[24px] p-5 space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                      id={`inquiry-record-${inq.id}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-display text-sm font-bold text-black block">
                              {inq.name}
                            </span>
                            <span className="font-sans text-xs text-gray-400 font-light">
                              {inq.email}
                            </span>
                          </div>
                          <span className="tech-badge font-display text-[9px] font-bold px-3 py-1.5 rounded-full uppercase">
                            {inq.projectType}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-neutral-800 dark:text-gray-300 leading-relaxed font-light line-clamp-3">
                          "{inq.message || 'No target document details provided.'}"
                        </p>
                      </div>

                      <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                        <span className="font-mono text-[9px] text-gray-400 font-bold">
                          {inq.date}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteInquiry(inq.id)}
                            className="text-gray-400 hover:text-black p-1 hover:bg-neutral-100 rounded-full transition-colors duration-200 cursor-pointer"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
