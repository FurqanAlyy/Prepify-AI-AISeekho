import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FileUp, Search, AlertCircle, CheckCircle2, ChevronRight, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractTextFromFile } from '../lib/documentParser';
import { analyzeResume, AnalysisResult } from '../services/gemini';

interface ResumeAnalysisProps {
  user: User;
}

export const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({ user }) => {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['.pdf', '.docx', '.txt'];
      const extension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (validTypes.includes(extension)) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF, DOCX, or TXT file.');
      }
    }
  };

  const runAnalysis = async () => {
    if (!file || !jd.trim()) {
      setError('Please provide both a resume and a job description.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const resumeText = await extractTextFromFile(file);
      const analysis = await analyzeResume(resumeText, jd);
      
      setResult(analysis);

      // Save to Firestore
      await addDoc(collection(db, 'analyses'), {
        userId: user.uid,
        resumeText: resumeText.substring(0, 5000), // Limit size
        jdText: jd,
        matchScore: analysis.matchScore,
        skillGaps: analysis.skillGaps,
        improvementAreas: analysis.improvementAreas,
        explanation: analysis.explanation,
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      setError('Analysis failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 font-sans">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-semibold text-white tracking-tight">Analysis Lab</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Deep-scan your technical compatibility and identify optimizations for target resumes.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Upload Area */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <FileUp className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-lg text-white">Source Resume</h3>
              </div>
              
              <label className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-[32px] cursor-pointer transition-all ${file ? 'border-indigo-600 bg-indigo-500/5' : 'border-white/5 hover:border-indigo-500/30 bg-[#141414]'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                  {file ? (
                    <>
                      <CheckCircle2 className="w-12 h-12 text-indigo-500 mb-4" />
                      <p className="text-sm font-semibold text-white truncate max-w-full italic">{file.name}</p>
                      <button onClick={(e) => { e.preventDefault(); setFile(null); }} className="mt-4 text-[10px] text-indigo-400 font-bold hover:underline uppercase tracking-widest">Change File</button>
                    </>
                  ) : (
                    <>
                      <FileUp className="w-12 h-12 text-slate-800 mb-4" />
                      <p className="text-sm text-slate-400 font-medium mb-1">Click or drag to upload</p>
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest">PDF, DOCX, TXT</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
              </label>
            </div>

            {/* JD Area */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-lg text-white">Target Job</h3>
              </div>
              
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste formal job requirements..."
                className="w-full h-80 bg-[#141414] border border-white/5 rounded-[32px] p-8 focus:ring-2 focus:ring-indigo-600 focus:bg-[#1A1A1A] outline-none resize-none transition-all text-sm leading-relaxed text-slate-300 placeholder:text-slate-700"
              />
            </div>

            <div className="md:col-span-2 mt-4">
              {error && (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-400/5 p-4 rounded-2xl mb-6 font-medium border border-rose-400/10">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <button
                disabled={loading}
                onClick={runAnalysis}
                className={`w-full py-5 rounded-[24px] font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  loading 
                    ? 'bg-white/5 text-slate-600 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-indigo-400/30 border-t-white rounded-full"
                    />
                    Scanning Intelligence Vector...
                  </>
                ) : (
                  <>
                    Launch Analysis Lab
                    <ChevronRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Score Card */}
            <div className="bg-[#141414] rounded-[40px] p-10 border border-white/5 shadow-2xl flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="88" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                  <motion.circle 
                    cx="96" cy="96" r="88" fill="none" stroke="#4f46e5" strokeWidth="12"
                    strokeDasharray={552.92}
                    initial={{ strokeDashoffset: 552.92 }}
                    animate={{ strokeDashoffset: 552.92 * (1 - result.matchScore / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-white">{result.matchScore}%</span>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Match Factor</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h2 className="text-2xl font-semibold text-white">Compatibility Analysis</h2>
                <p className="text-slate-400 leading-relaxed italic font-medium">{result.explanation}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                  <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full text-[10px] font-bold border border-emerald-500/20 uppercase tracking-widest">
                    ATS COMPATIBLE
                  </div>
                  <div className="bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full text-[10px] font-bold border border-indigo-500/20 uppercase tracking-widest">
                    {result.matchScore > 80 ? 'HIGH POTENTIAL' : result.matchScore > 50 ? 'STABLE FIT' : 'LOW COMPLIANCE'}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Skill Gaps */}
              <div className="bg-[#141414] p-8 rounded-[32px] border border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Skill Discrepancies</h3>
                </div>
                <div className="space-y-3">
                  {result.skillGaps.map((gap, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-2xl border border-white/5">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                      <span className="text-slate-300 text-sm font-medium">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Areas */}
              <div className="bg-[#141414] p-8 rounded-[32px] border border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Action Vectors</h3>
                </div>
                <div className="space-y-3">
                  {result.improvementAreas.map((area, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-2xl border border-white/5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      <span className="text-slate-300 text-sm font-medium">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={() => setResult(null)}
                className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] hover:text-indigo-400 transition-colors"
              >
                Reset Prototype
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
