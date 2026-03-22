import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic2, Layout } from 'lucide-react';
import InterviewSetup from './components/InterviewSetup';
import VoiceInterview from './components/VoiceInterview';
import Feedback from './components/Feedback';
import { InterviewStatus, InterviewConfig, InterviewMessage } from './types';

export default function App() {
  const [status, setStatus] = useState<InterviewStatus>(InterviewStatus.SETUP);
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [transcript, setTranscript] = useState<InterviewMessage[]>([]);

  const handleStart = (newConfig: InterviewConfig) => {
    setConfig(newConfig);
    setStatus(InterviewStatus.INTERVIEWING);
  };

  const handleEnd = (messages: InterviewMessage[]) => {
    setTranscript(messages);
    setStatus(InterviewStatus.FEEDBACK);
  };

  const handleRestart = () => {
    setStatus(InterviewStatus.SETUP);
    setConfig(null);
    setTranscript([]);
  };

  const Logo = () => (
    <button 
      onClick={handleRestart}
      className="flex items-center gap-2 group cursor-pointer"
    >
      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
        <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45" />
      </div>
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tighter">RECRUIT<span className="text-blue-600">AI</span></h1>
        <p className="text-[8px] uppercase tracking-[0.3em] text-slate-400 font-black">Premium Mock Interviews</p>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Logo />
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">How it works</a>
          <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Pricing</a>
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md hover:shadow-xl active:scale-95 cursor-pointer">
            Sign In
          </button>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {status === InterviewStatus.SETUP && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="py-12"
            >
              <InterviewSetup onStart={handleStart} />
            </motion.div>
          )}

          {status === InterviewStatus.INTERVIEWING && config && (
            <motion.div
              key="interviewing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="py-12"
            >
              <VoiceInterview config={config} onEnd={handleEnd} />
            </motion.div>
          )}

          {status === InterviewStatus.FEEDBACK && config && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12"
            >
              <Feedback transcript={transcript} config={config} onRestart={handleRestart} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 p-6 text-center text-slate-400 text-xs">
        <div className="flex items-center justify-center gap-4 mb-2">
          <a href="#" className="hover:text-slate-600">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600">Terms of Service</a>
          <a href="#" className="hover:text-slate-600">Contact Support</a>
        </div>
        <p>© 2024 RecruitAI. Powered by Gemini Flash 2.5 Live API.</p>
      </footer>
    </div>
  );
}
