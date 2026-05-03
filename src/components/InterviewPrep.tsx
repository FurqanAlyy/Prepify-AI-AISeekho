import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Play, 
  Settings, 
  MessageSquare, 
  Brain, 
  ChevronRight, 
  ChevronLeft,
  RotateCcw,
  Star,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateInterviewQuestions, getMockFeedback, InterviewQuestion } from '../services/gemini';

interface InterviewPrepProps {
  user: User;
}

export const InterviewPrep: React.FC<InterviewPrepProps> = ({ user }) => {
  const [mode, setMode] = useState<'setup' | 'practice' | 'results'>('setup');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ feedback: string; score: number }[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<{ feedback: string; score: number } | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const startPractice = async () => {
    setLoading(true);
    try {
      // In a real app, we'd fetch the last resume and a relevant JD
      // For demo, we'll ask the model to generate relevant ones if we don't have them
      const qs = await generateInterviewQuestions("Professional Software Engineer", "General developer role", difficulty);
      setQuestions(qs);
      setUserAnswers(new Array(qs.length).fill(''));
      setMode('practice');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const evaluateAnswer = async () => {
    if (!userAnswers[currentIndex]) return;
    
    setEvaluating(true);
    try {
      const res = await getMockFeedback(questions[currentIndex].question, userAnswers[currentIndex]);
      setCurrentFeedback(res);
      const newFeedback = [...feedback];
      newFeedback[currentIndex] = res;
      setFeedback(newFeedback);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const finishSession = async () => {
    setMode('results');
    await addDoc(collection(db, 'interviews'), {
      userId: user.uid,
      type: 'Mixed',
      difficulty,
      questions: questions.map((q, i) => ({
        ...q,
        userResponse: userAnswers[i],
        feedback: feedback[i]?.feedback,
        score: feedback[i]?.score
      })),
      createdAt: serverTimestamp()
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 font-sans pb-20">
      <AnimatePresence mode="wait">
        {mode === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-10"
          >
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-semibold text-white tracking-tight">AI Simulator</h1>
              <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed font-medium">
                Step into a high-stakes practice environment with adaptive vectoring.
              </p>
            </div>

            <div className="bg-[#141414] rounded-[40px] p-12 border border-white/5 shadow-2xl text-center space-y-12">
              <div className="flex justify-center -space-x-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-16 h-16 rounded-2xl bg-indigo-500/10 border-4 border-[#141414] flex items-center justify-center">
                    <Brain className="w-8 h-8 text-indigo-400" />
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h3 className="text-white font-bold uppercase tracking-[0.3em] text-[10px] opacity-60">Session Difficulty</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`px-8 py-4 rounded-xl font-bold text-xs transition-all border ${
                        difficulty === level 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/20' 
                          : 'bg-white/5 text-slate-400 border-white/5 hover:border-indigo-500/30'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={loading}
                onClick={startPractice}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-5 rounded-[24px] font-bold text-lg transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3 mx-auto"
              >
                {loading ? 'Initializing Core...' : <>Enter Simulator <Play className="w-5 h-5 fill-current" /></>}
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'practice' && (
          <motion.div 
            key="practice"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-slate-600 font-bold uppercase text-[10px] tracking-[0.4em]">Index</span>
                <div className="flex gap-1.5">
                  {questions.map((_, i) => (
                    <div key={i} className={`w-8 h-1 rounded-full transition-all ${i === currentIndex ? 'bg-indigo-500 w-12' : i < currentIndex ? 'bg-emerald-500' : 'bg-white/5'}`} />
                  ))}
                </div>
              </div>
              <div className="bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/10">
                <span className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest">{difficulty} PARAMETER</span>
              </div>
            </div>

            <div className="bg-[#141414] rounded-[40px] p-12 border border-white/5 shadow-2xl relative">
              <div className="absolute top-8 left-8 opacity-[0.02]">
                <MessageSquare className="w-48 h-48 text-white" />
              </div>

              <div className="relative z-10 space-y-10">
                <div className="space-y-4 text-center md:text-left">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${questions[currentIndex].type === 'technical' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                    {questions[currentIndex].type}
                  </span>
                  <h2 className="text-3xl font-semibold text-white leading-tight">
                    {questions[currentIndex].question}
                  </h2>
                </div>

                <div className="space-y-4">
                  <label className="text-slate-600 font-bold uppercase text-[10px] tracking-[0.3em]">Response Window</label>
                  <textarea
                    value={userAnswers[currentIndex]}
                    onChange={(e) => {
                      const newAnswers = [...userAnswers];
                      newAnswers[currentIndex] = e.target.value;
                      setUserAnswers(newAnswers);
                      setCurrentFeedback(null);
                    }}
                    placeholder="Input detailed response..."
                    className="w-full h-48 bg-white/[0.02] border border-white/5 rounded-[32px] p-8 focus:ring-2 focus:ring-indigo-600 focus:bg-white/[0.04] outline-none resize-none transition-all text-slate-300 placeholder:text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => { setCurrentIndex(c => c - 1); setCurrentFeedback(null); }}
                    className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-400 disabled:opacity-0 transition-all uppercase text-[10px] tracking-[0.3em]"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>

                  <div className="flex gap-4">
                    {!currentFeedback ? (
                      <button
                        disabled={!userAnswers[currentIndex] || evaluating}
                        onClick={evaluateAnswer}
                        className={`px-8 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${evaluating ? 'bg-white/5 text-slate-600' : 'bg-white/5 text-indigo-400 border border-indigo-500/30 hover:bg-white/10'}`}
                      >
                        {evaluating ? 'Evaluating...' : 'Run Scan'}
                        <Cpu className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="bg-emerald-500/10 text-emerald-500 px-6 py-3 rounded-xl border border-emerald-500/10 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Vector Locked
                      </div>
                    )}

                    {currentIndex === questions.length - 1 ? (
                      <button
                        onClick={finishSession}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 uppercase tracking-widest"
                      >
                        Finalize
                      </button>
                    ) : (
                      <button
                        onClick={() => { setCurrentIndex(c => c + 1); setCurrentFeedback(null); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 uppercase tracking-widest"
                      >
                        Next Vector <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {currentFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-500/5 border border-indigo-500/10 rounded-[32px] p-8 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-indigo-400 uppercase text-[10px] tracking-[0.4em]">Real-time Heuristics</h4>
                  <div className="flex items-center gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-1.5 h-3 rounded-full ${i < currentFeedback.score ? 'bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.4)]' : 'bg-white/5'}`} />
                    ))}
                    <span className="ml-2 font-bold text-indigo-400 font-mono text-sm">{currentFeedback.score}/10</span>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed italic font-medium text-sm">{currentFeedback.feedback}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {mode === 'results' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-500/20">
                <Star className="w-10 h-10 fill-current" />
              </div>
              <h1 className="text-4xl font-semibold text-white tracking-tight">Mission Debrief</h1>
              <p className="text-slate-500 font-medium">Analytics gathered for the {difficulty} simulation.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {questions.map((q, i) => (
                <div key={i} className="bg-[#141414] rounded-[32px] p-8 border border-white/5 shadow-sm space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-xl font-semibold text-white leading-tight">{q.question}</h3>
                    <div className="bg-indigo-500/10 px-4 py-2 rounded-xl text-indigo-400 font-mono font-bold text-sm">
                      {feedback[i]?.score || 0}/10
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <span className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em]">AI Reference Model</span>
                       <p className="text-sm text-slate-400 bg-white/[0.02] p-4 rounded-2xl italic border border-white/5 leading-relaxed">{q.answer}</p>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em]">Performance Metrics</span>
                       <p className="text-sm text-slate-300 bg-indigo-500/5 p-4 rounded-2xl leading-relaxed border border-indigo-500/10">{feedback[i]?.feedback || "No feedback generated."}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-10">
              <button
                onClick={() => setMode('setup')}
                className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[10px] tracking-[0.4em] hover:text-white transition-all underline underline-offset-8"
              >
                <RotateCcw className="w-4 h-4" /> Reboot Simulator
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
