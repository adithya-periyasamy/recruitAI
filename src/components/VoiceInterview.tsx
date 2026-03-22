import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, PhoneOff, MessageSquare, User, Layout, AlertCircle } from 'lucide-react';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { InterviewConfig } from '../types';

interface Props {
  config: InterviewConfig;
  onEnd: (transcript: any[]) => void;
}

export default function VoiceInterview({ config, onEnd }: Props) {
  const { isConnected, messages, isAiSpeaking, userVolume, error, connect, disconnect } = useGeminiLive();
  const [isConnecting, setIsConnecting] = useState(false);

  const systemInstruction = `
    You are an expert technical interviewer at a top-tier tech company.
    You are conducting a mock interview for the role of ${config.role} at a ${config.difficulty} level.
    The interview should consist of approximately ${config.questionCount} questions.
    
    CRITICAL INSTRUCTIONS:
    1. LANGUAGES: You MUST ONLY speak in English. Do not use any other languages.
    2. GREETING: You MUST start the interview by greeting the user first. Do not wait for them to speak.
    
    Your goal:
    1. Start by introducing yourself briefly and welcoming the candidate.
    2. Ask one question at a time.
    3. Listen carefully to the candidate's response.
    4. Provide brief, encouraging feedback or follow-up questions if necessary.
    5. After ${config.questionCount} questions, conclude the interview and tell the candidate that you will now process their feedback.
    
    Maintain a professional, supportive, and realistic interview tone.
    Since this is a voice-based interview, keep your responses concise and conversational.
  `;

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  useEffect(() => {
    if (isConnected) {
      setIsConnecting(false);
    }
  }, [isConnected]);

  const handleStart = () => {
    setIsConnecting(true);
    connect(systemInstruction);
  };

  const handleEnd = () => {
    disconnect();
    onEnd(messages);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-8 md:mb-12">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{config.role} Interview</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-100">{config.difficulty}</span>
            <span className="text-slate-400 text-xs font-bold">• {config.questionCount} Questions</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-3xl">
          {/* AI Interviewer Card */}
          <div className={`relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white border-2 transition-all duration-500 ${isAiSpeaking ? 'border-blue-500 shadow-2xl scale-105' : 'border-slate-100 shadow-lg opacity-80'}`}>
            <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-2xl md:rounded-3xl flex items-center justify-center relative overflow-hidden">
                {isAiSpeaking && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-blue-500 blur-xl"
                  />
                )}
                <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-white rounded-md rotate-45 relative z-10" />
              </div>
              <div>
                <h4 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-widest">RecruitAI</h4>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Interviewer</p>
              </div>
              
              {/* AI Volume Bar */}
              <div className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: isAiSpeaking ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>
            {isAiSpeaking && (
              <div className="absolute top-4 right-4">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                      className="w-1 bg-blue-500 rounded-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Candidate Card - Hidden on Mobile */}
          <div className={`hidden md:block relative p-8 rounded-[2.5rem] bg-white border-2 transition-all duration-500 ${userVolume > 15 ? 'border-blue-500 shadow-2xl scale-105' : 'border-slate-100 shadow-lg opacity-80'}`}>
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center relative overflow-hidden">
                {userVolume > 15 && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-blue-400 blur-xl"
                  />
                )}
                <User size={40} className="text-blue-600 relative z-10" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">You</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Candidate</p>
              </div>

              {/* User Volume Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: `${Math.min(userVolume * 2, 100)}%` }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>
            {userVolume > 15 && (
              <div className="absolute top-4 right-4">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                      className="w-1 bg-blue-500 rounded-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 md:mt-12 text-center">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 max-w-md mx-auto">
              <AlertCircle size={16} />
              {error}
            </div>
          ) : (
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">
              {isConnected ? "Connection Active" : isConnecting ? "Establishing Connection..." : "Ready to Start"}
            </p>
          )}
        </div>
      </div>

      {/* Action Button Section */}
      <div className="mt-8 md:mt-12 flex justify-center">
        {!isConnected && isConnecting ? (
          <button
            disabled
            className="w-full max-w-md px-8 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 cursor-not-allowed"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full"
            />
            Connecting...
          </button>
        ) : isConnected ? (
          <button
            onClick={handleEnd}
            className="w-full max-w-md px-8 py-5 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 active:scale-95 cursor-pointer"
          >
            <PhoneOff size={20} />
            End Session
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="w-full max-w-md px-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95 cursor-pointer"
          >
            <Mic size={20} />
            Start Interview
          </button>
        )}
      </div>
    </div>
  );
}
