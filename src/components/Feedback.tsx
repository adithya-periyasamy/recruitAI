import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Trophy, RefreshCw, Star, Layout, MessageSquare } from 'lucide-react';
import Markdown from 'react-markdown';
import { GoogleGenAI, Type } from "@google/genai";
import { InterviewFeedback, InterviewMessage, InterviewConfig } from '../types';

interface Props {
  transcript: InterviewMessage[];
  config: InterviewConfig;
  onRestart: () => void;
}

const FEEDBACK_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite-preview"
];

export default function Feedback({ transcript, config, onRestart }: Props) {
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateFeedback = async (attempt = 0) => {
      if (attempt >= FEEDBACK_MODELS.length) {
        setLoading(false);
        return;
      }

      const modelName = FEEDBACK_MODELS[attempt];

      try {
        const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = `
          As RecruitAI, a high-level executive technical interviewer at a top-tier firm, analyze the following interview transcript for a ${config.role} role at ${config.difficulty} difficulty.
          
          STRICTNESS GUIDELINES:
          - Difficulty: ${config.difficulty}. Be extremely critical for 'Advanced' level, moderate for 'Intermediate', and supportive but firm for 'Beginner'.
          - Scoring: Be realistic. A score of 90+ should be rare and reserved for perfect performance.
          
          Analyze:
          1. Technical Understanding: How deep is their knowledge of ${config.role}?
          2. Communication Skills: Clarity, confidence, and structure of answers.
          3. Detailed Question Analysis: For each question, identify what was wrong in the candidate's answer and provide the correct/ideal answer.
          
          Transcript:
          ${transcript.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')}
        `;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER, description: "Overall score out of 100" },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-4 key strengths" },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-4 areas for improvement" },
                technicalUnderstanding: { type: Type.STRING, description: "Detailed analysis of technical knowledge" },
                communicationSkills: { type: Type.STRING, description: "Analysis of communication effectiveness" },
                detailedAnalysis: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      userAnswer: { type: Type.STRING },
                      whatWasWrong: { type: Type.STRING },
                      correctAnswer: { type: Type.STRING }
                    },
                    required: ["question", "userAnswer", "whatWasWrong", "correctAnswer"]
                  },
                  description: "Question-by-question breakdown of errors and corrections"
                },
                summary: { type: Type.STRING, description: "A concise 2-3 paragraph summary of the performance" }
              },
              required: ["score", "strengths", "improvements", "technicalUnderstanding", "communicationSkills", "detailedAnalysis", "summary"]
            }
          }
        });

        const data = JSON.parse(response.text || '{}');
        setFeedback(data);
        setLoading(false);
      } catch (error) {
        console.error(`Feedback generation error with ${modelName}:`, error);
        generateFeedback(attempt + 1);
      }
    };

    if (transcript.length > 0) {
      generateFeedback();
    } else {
      setLoading(false);
    }
  }, [transcript, config]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="inline-block mb-6"
        >
          <RefreshCw size={48} className="text-blue-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing your performance...</h2>
        <p className="text-slate-500">Our AI is reviewing your responses to provide detailed feedback.</p>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 mb-8">We couldn't generate your feedback report.</p>
        <button onClick={onRestart} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-4 md:p-8 space-y-12 pb-24"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-slate-200 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md">
            Official Report
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase">
            Interview <br className="hidden md:block" /> Performance
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
            {config.role} • {config.difficulty} Level
          </p>
        </div>
        
        <div className="flex items-center gap-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 w-full md:w-auto">
          <div className="space-y-1">
            <div className="text-5xl font-black text-slate-900 leading-none">{feedback.score}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Composite Score</div>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <Trophy size={48} className="text-slate-900" />
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
              <Star size={14} />
              Executive Summary
            </h3>
            <div className="text-lg text-slate-700 leading-relaxed font-medium italic border-l-4 border-slate-900 pl-6 py-2">
              <Markdown>{feedback.summary}</Markdown>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                <Layout size={14} />
                Technical Depth
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-bold bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {feedback.technicalUnderstanding}
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                <MessageSquare size={14} />
                Communication
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-bold bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {feedback.communicationSkills}
              </p>
            </section>
          </div>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Core Strengths
            </h3>
            <div className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50 text-emerald-900 text-xs font-black uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {s}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-500" />
              Growth Areas
            </h3>
            <div className="space-y-2">
              {feedback.improvements.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 text-amber-900 text-xs font-black uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  {s}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <section className="space-y-8 pt-12 border-t border-slate-200">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
          <AlertCircle size={14} />
          Detailed Question Audit
        </h3>
        
        <div className="space-y-4">
          {feedback.detailedAnalysis.map((item, i) => (
            <div key={i} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-slate-900 transition-all duration-300">
              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question {i + 1}</div>
                  <p className="text-lg font-black text-slate-900 leading-tight">{item.question}</p>
                </div>
                
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded">
                      Critique
                    </div>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">{item.whatWasWrong}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded">
                      Ideal Response
                    </div>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed italic">{item.correctAnswer}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-center gap-4 z-50">
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xl active:scale-95"
        >
          <RefreshCw size={16} />
          New Interview
        </button>
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-95"
        >
          Home
        </button>
      </div>
    </motion.div>
  );
}
