import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  PenTool, 
  Sparkles, 
  FileText, 
  Copy, 
  Check, 
  Lightbulb,
  ArrowRight,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { optimizeResume } from '../services/gemini';
import Markdown from 'react-markdown';

interface ResumeOptimizerProps {
  user: User;
}

export const ResumeOptimizer: React.FC<ResumeOptimizerProps> = ({ user }) => {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ optimizedResume: string; tips: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const startOptimization = async () => {
    if (!resumeText.trim() || !jdText.trim()) return;
    setLoading(true);
    try {
      const res = await optimizeResume(resumeText, jdText);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.optimizedResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 font-sans pb-20">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-semibold text-white tracking-tight">ATS Blueprint Engine</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed font-medium">
          Transform your resume into a high-performance, machine-readable asset that ranks higher in applicant tracking systems.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div 
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-4">
              <h3 className="font-bold text-slate-600 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Raw Resume Data
              </h3>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste current career vectors..."
                className="w-full h-[500px] bg-[#141414] border border-white/5 rounded-[40px] p-10 focus:ring-2 focus:ring-indigo-600 focus:bg-[#1A1A1A] outline-none resize-none transition-all text-sm leading-relaxed text-slate-300 placeholder:text-slate-800"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-600 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                 <PenTool className="w-5 h-5 text-indigo-400" />
                 Target Pattern
              </h3>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste Job Description requirements..."
                className="w-full h-[500px] bg-[#141414] border border-white/5 rounded-[40px] p-10 focus:ring-2 focus:ring-indigo-600 focus:bg-[#1A1A1A] outline-none resize-none transition-all text-sm leading-relaxed text-slate-300 placeholder:text-slate-800"
              />
            </div>

            <div className="md:col-span-2 pt-6">
              <button
                disabled={loading || !resumeText.trim() || !jdText.trim()}
                onClick={startOptimization}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-white/5 disabled:text-slate-700 text-white py-6 rounded-[32px] font-bold text-xl transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? (
                   <>
                     <motion.div 
                       animate={{ rotate: 360 }}
                       transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                       className="w-6 h-6 border-2 border-indigo-400/30 border-t-white rounded-full"
                     />
                     Re-engineering Career Data...
                   </>
                ) : (
                  <>
                    Optimize Matrix <Sparkles className="w-6 h-6 fill-current animate-pulse" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-10"
          >
            {/* Main Resume Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-6">
                <h2 className="font-semibold text-xl text-white">Optimized Vector</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest bg-[#141414] px-6 py-2 rounded-xl border border-indigo-500/20 shadow-sm hover:bg-white/5 transition-all"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Extract Output'}
                  </button>
                </div>
              </div>
              
              <div className="bg-[#141414] rounded-[48px] p-12 border border-white/5 shadow-2xl">
                <div className="markdown-body">
                   <Markdown>{result.optimizedResume}</Markdown>
                </div>
              </div>
            </div>

            {/* Sidebar Tips */}
            <div className="space-y-8">
              <div className="bg-[#141414] rounded-[40px] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold uppercase tracking-[0.3em] text-[10px] text-slate-500">AI Intelligence</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {result.tips.map((tip, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-white/[0.02] rounded-2xl border border-white/5 group hover:bg-white/[0.04] transition-all">
                        <div className="font-bold text-indigo-500 font-mono text-sm leading-tight shrink-0">0{i+1}</div>
                        <p className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setResult(null)}
                    className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-bold uppercase tracking-[0.3em] border border-white/10 rounded-2xl text-slate-500 hover:text-white hover:border-white/30 transition-all"
                  >
                    Re-Optimize Stream <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-indigo-900/10 rounded-[40px] p-8 border border-indigo-500/20 text-center space-y-4 shadow-xl">
                <Download className="w-10 h-10 text-indigo-400 mx-auto opacity-40" />
                <p className="text-white font-bold text-sm tracking-tight capitalize">Precision Document Export</p>
                <p className="text-slate-500 text-xs leading-relaxed italic">Synchronize the optimized vector with your local document processor for PDF generation.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
