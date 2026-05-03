export interface AnalysisResult {
  matchScore: number;
  skillGaps: string[];
  improvementAreas: string[];
  explanation: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
  type: 'technical' | 'behavioral';
}

export interface PrepPlanDay {
  day: number;
  topic: string;
  tasks: string[];
}

export const analyzeResume = async (resumeText: string, jdText: string): Promise<AnalysisResult> => {
  console.log("AI analysis skipped. Resume and JD received.", { resumeTextLength: resumeText.length, jdTextLength: jdText.length });
  return {
    matchScore: 0,
    skillGaps: ["Feature disabled"],
    improvementAreas: ["AI functionality has been removed"],
    explanation: "The AI analysis engine is currently offline by design."
  };
};

export const generateInterviewQuestions = async (
  resumeText: string, 
  jdText: string, 
  difficulty: string
): Promise<InterviewQuestion[]> => {
  console.log("AI question generation skipped.", { difficulty });
  return [
    {
      question: "AI Simulator is currently offline.",
      answer: "No data available.",
      type: "behavioral"
    }
  ];
};

export const generatePrepPlan = async (
  jdText: string, 
  role: string, 
  duration: number
): Promise<PrepPlanDay[]> => {
  console.log("AI plan generation skipped.", { role, duration });
  return [
    {
      day: 1,
      topic: "System Offline",
      tasks: ["The preparation roadmap feature is currently disabled."]
    }
  ];
};

export const optimizeResume = async (resumeText: string, jdText: string): Promise<{ optimizedResume: string; tips: string[] }> => {
  console.log("AI resume optimization skipped.");
  return {
    optimizedResume: "# Optimized Resume\n\nAI optimization is currently unavailable.",
    tips: ["AI functionality has been removed from this deployment."]
  };
};

export const getMockFeedback = async (question: string, userAnswer: string): Promise<{ feedback: string; score: number }> => {
  console.log("AI feedback evaluation skipped.");
  return {
    feedback: "Real-time AI evaluation is currently offline.",
    score: 0
  };
};

export const suggestJobs = async (resumeText: string): Promise<string[]> => {
  console.log("AI job suggestion skipped.");
  return ["System Offline"];
};
