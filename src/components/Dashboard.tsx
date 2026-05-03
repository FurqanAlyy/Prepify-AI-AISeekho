import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy 
} from 'firebase/firestore';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Briefcase, 
  ArrowRight, 
  PlusCircle,
  Trophy
} from 'lucide-react';
import { motion } from 'motion/react';
import { suggestJobs } from '../services/gemini';

interface DashboardProps {
  user: User;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, setActiveTab }) => {
  const [stats, setStats] = useState({
    analyses: 0,
    interviews: 0,
    plans: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch counts
      const analysesQuery = query(collection(db, 'analyses'), where('userId', '==', user.uid));
      const interviewsQuery = query(collection(db, 'interviews'), where('userId', '==', user.uid));
      const plansQuery = query(collection(db, 'plans'), where('userId', '==', user.uid));

      const [analysesSnap, interviewsSnap, plansSnap] = await Promise.all([
        getDocs(analysesQuery),
        getDocs(interviewsQuery),
        getDocs(plansQuery)
      ]);

      setStats({
        analyses: analysesSnap.size,
        interviews: interviewsSnap.size,
        plans: plansSnap.size
      });

      // Fetch recent analysis for suggestions
      if (analysesSnap.size > 0) {
        const sortedAnalyses = analysesSnap.docs.sort((a, b) => 
          b.data().createdAt?.seconds - a.data().createdAt?.seconds
        );
        const lastResumeText = sortedAnalyses[0].data().resumeText;
        if (lastResumeText) {
          setLoadingSuggestions(true);
          try {
            const jobs = await suggestJobs(lastResumeText);
            setSuggestions(jobs);
          } catch (e) {
            console.error(e);
          } finally {
            setLoadingSuggestions(false);
          }
        }
      }

      // Latest activities
      const latest = [...analysesSnap.docs, ...interviewsSnap.docs]
        .sort((a, b) => b.data().createdAt?.seconds - a.data().createdAt?.seconds)
        .slice(0, 5)
        .map(doc => ({
          id: doc.id,
          type: doc.ref.parent.id,
          data: doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
      
      setRecentActivities(latest);
    };

    fetchDashboardData();
  }, [user.uid]);

  const statCards = [
    { label: 'Total Analyses', value: stats.analyses, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Practice Sessions', value: stats.interviews, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Active Plans', value: stats.plans, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight mb-2">
            Welcome back, {user.displayName?.split(' ')[0]}!
          </h1>
          <p className="text-slate-400 font-medium">Here's what's happening with your preparation today.</p>
        </div>
        <button 
          onClick={() => setActiveTab('analysis')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/10 font-medium w-fit"
        >
          <PlusCircle className="w-5 h-5" />
          New Analysis
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#141414] p-8 rounded-2xl border border-white/5 shadow-sm"
          >
            <div className={`w-14 h-14 ${stat.bg.replace('bg-', 'bg-').replace('50', '500/10')} rounded-xl flex items-center justify-center mb-6`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <p className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-widest">{stat.label}</p>
            <p className="text-4xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white tracking-tight">Recent Activity</h2>
          </div>
          <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden shadow-sm">
            {recentActivities.length > 0 ? (
              <div className="divide-y divide-white/5">
                {recentActivities.map((act) => (
                  <div key={act.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${act.type === 'analyses' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-400'}`}>
                        {act.type === 'analyses' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-white capitalize">
                          {act.type === 'analyses' ? 'Resume Analysis' : 'Interview Session'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {act.createdAt?.toLocaleDateString()} at {act.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-700" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <p className="text-slate-500 font-medium">No activity yet. Start by analyzing your resume!</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white tracking-tight">Job Recommendations</h2>
          <div className="bg-indigo-900/20 rounded-2xl p-8 border border-indigo-500/20 shadow-xl relative overflow-hidden group">
            <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
            
            <div className="relative z-10">
              <h3 className="font-semibold text-base text-white mb-4 uppercase tracking-widest text-[10px] opacity-60">Top Matches</h3>
              {loadingSuggestions ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-white/5 rounded-xl" />
                  <div className="h-10 bg-white/5 rounded-xl" />
                  <div className="h-10 bg-white/5 rounded-xl" />
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((job, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/5 text-sm font-medium text-slate-200">
                      {job}
                    </div>
                  ))}
                  <button 
                    onClick={() => setActiveTab('analysis')}
                    className="mt-4 w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Refresh Matches
                  </button>
                </div>
              ) : (
                <p className="text-slate-400 text-sm leading-relaxed italic">
                  Analyze your resume to see personalized job recommendations based on your skills.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
