import React, { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ResumeAnalysis } from './components/ResumeAnalysis';
import { InterviewPrep } from './components/InterviewPrep';
import { StudyPlan } from './components/StudyPlan';
import { ResumeOptimizer } from './components/ResumeOptimizer';
import { LogIn, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user to firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            userId: user.uid,
            name: user.displayName,
            email: user.email,
            role: 'Intern',
            createdAt: serverTimestamp(),
            lastActivity: serverTimestamp()
          });
        } else {
          await setDoc(userRef, { lastActivity: serverTimestamp() }, { merge: true });
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5] font-sans">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-center"
        >
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-semibold text-[#141414] mb-3 tracking-tight">Prepify-AI</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Revolutionize your career with AI-powered interview prep and resume analysis.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-2xl transition-colors shadow-sm"
          >
            <LogIn className="w-5 h-5" />
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={logout}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="p-6 lg:p-10 max-w-7xl mx-auto"
        >
          {activeTab === 'dashboard' && <Dashboard user={user} setActiveTab={setActiveTab} />}
          {activeTab === 'analysis' && <ResumeAnalysis user={user} />}
          {activeTab === 'prep' && <InterviewPrep user={user} />}
          {activeTab === 'plan' && <StudyPlan user={user} />}
          {activeTab === 'optimizer' && <ResumeOptimizer user={user} />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
