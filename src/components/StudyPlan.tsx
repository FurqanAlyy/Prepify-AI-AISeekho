import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Calendar, 
  Map, 
  ChevronRight, 
  Target, 
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generatePrepPlan, PrepPlanDay } from '../services/gemini';

interface StudyPlanProps {
  user: User;
}

export const StudyPlan: React.FC<StudyPlanProps> = ({ user }) => {
  const [duration, setDuration] = useState<7 | 15 | 30>(7);
  const [role, setRole] = useState<'Intern' | 'Junior' | 'Senior'>('Junior');
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PrepPlanDay[] | null>(null);
  const [activeDay, setActiveDay] = useState(1);

  const createPlan = async () => {
    if (!jd.trim()) return;
    
    setLoading(true);
    try {
      const result = await generatePrepPlan(jd, role, duration);
      setPlan(result);
      
      // Save to Firestore
      await addDoc(collection(db, 'plans'), {
        userId: user.uid,
        duration,
        role,
        jdText: jd,
        dailyTasks: result,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 font-sans pb-20">
      <AnimatePresence mode="wait">
        {!plan ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-semibold text-white tracking-tight">Strategy Forge</h1>
              <p className="text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
                Generate a tactical roadmap engineered for your target role and preparation window.
              </p>
            </div>

            <div className="bg-[#141414] rounded-[40px] p-10 border border-white/5 shadow-2xl space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-600 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-400" />
                    Target Role
                  </h3>
                  <div className="flex gap-3">
                    {(['Intern', 'Junior', 'Senior'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all border ${
                          role === r ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-white/5 border-white/5 text-slate-400 hover:border-indigo-500/30'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-600 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    Prep Window
                  </h3>
                  <div className="flex gap-3">
                    {([7, 15, 30] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all border ${
                          duration === d ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-white/5 border-white/5 text-slate-400 hover:border-indigo-500/30'
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-600 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  Technical Requirements
                </h3>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste formal job requirements vector..."
                  className="w-full h-40 bg-white/[0.02] border border-white/5 rounded-[32px] p-8 focus:ring-2 focus:ring-indigo-600 focus:bg-white/[0.04] outline-none resize-none transition-all text-slate-300 placeholder:text-slate-800"
                />
              </div>

              <button
                disabled={loading || !jd.trim()}
                onClick={createPlan}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-white/5 disabled:text-slate-700 text-white py-5 rounded-[24px] font-bold text-lg transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? 'Synthesizing Intelligence...' : <>Forging Roadmap <ChevronRight className="w-6 h-6" /></>}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="plan"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-10"
          >
            {/* Sidebar Calendar Navigation */}
            <div className="lg:col-span-1 space-y-6 shrink-0">
               <div className="bg-[#141414] rounded-[32px] p-6 border border-white/5 shadow-sm sticky top-24">
                 <h3 className="font-bold text-slate-600 mb-6 flex items-center gap-2 uppercase text-[10px] tracking-[0.4em]">
                   Protocol
                 </h3>
                 <div className="grid grid-cols-4 gap-2">
                   {plan.map(d => (
                     <button
                       key={d.day}
                       onClick={() => setActiveDay(d.day)}
                       className={`aspect-square flex items-center justify-center rounded-xl font-bold text-xs transition-all border ${
                         activeDay === d.day ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:border-indigo-400'
                       }`}
                     >
                       {d.day}
                     </button>
                   ))}
                 </div>
               </div>
            </div>

            {/* Plan Content */}
            <div className="lg:col-span-3 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em] mb-1">
                    Day {activeDay} / {duration}
                  </h2>
                  <h1 className="text-3xl font-semibold text-white tracking-tight truncate">
                    {plan[activeDay-1].topic}
                  </h1>
                </div>
                <div className="w-16 h-16 bg-[#141414] rounded-2xl border border-indigo-500/20 flex items-center justify-center text-2xl font-bold text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.1)]">
                  {Math.round((activeDay / duration) * 100)}%
                </div>
              </div>

              <div className="bg-[#141414] rounded-[40px] p-10 border border-white/5 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                  <Map className="w-64 h-64 text-white" />
                </div>
                
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                    <h3 className="text-xl font-semibold text-white">Focused Objectives</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {plan[activeDay-1].tasks.map((task, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex items-center gap-6 p-6 bg-white/[0.02] rounded-[24px] border border-white/5 group hover:bg-white/[0.04] transition-all cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center shrink-0 group-hover:border-indigo-600 transition-colors">
                          <CheckCircle2 className="w-5 h-5 text-transparent group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <span className="text-slate-300 font-medium leading-relaxed">{task}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                  <button 
                    disabled={activeDay === 1}
                    onClick={() => setActiveDay(activeDay - 1)}
                    className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] hover:text-indigo-400 disabled:opacity-0 transition-all"
                  >
                    Previous Day
                  </button>
                  {activeDay === duration ? (
                    <button 
                      onClick={() => setPlan(null)}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-xs font-bold shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                      Complete Protocol
                    </button>
                  ) : (
                    <button 
                      onClick={() => setActiveDay(activeDay + 1)}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-xs font-bold shadow-xl shadow-indigo-500/20 active:scale-95 transition-all uppercase tracking-widest"
                    >
                      Vector Optimized
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
