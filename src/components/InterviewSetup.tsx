import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, BarChart, HelpCircle, ArrowRight } from 'lucide-react';
import { InterviewConfig } from '../types';

interface Props {
  onStart: (config: InterviewConfig) => void;
}

export default function InterviewSetup({ onStart }: Props) {
  const [config, setConfig] = useState<InterviewConfig>({
    role: '',
    difficulty: 'Intermediate',
    questionCount: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.role && !isNaN(config.questionCount)) {
      onStart(config);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-8"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
          Prepare for your next big role
        </h1>
        <p className="text-slate-600 text-lg">
          Configure your mock interview session with RecruitAI.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Briefcase size={18} className="text-blue-500" />
            Target Role
          </label>
          <input
            required
            type="text"
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={config.role}
            onChange={(e) => setConfig({ ...config, role: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <BarChart size={18} className="text-blue-500" />
              Difficulty Level
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <HelpCircle size={18} className="text-blue-500" />
              Number of Questions
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={isNaN(config.questionCount) ? '' : config.questionCount}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setConfig({ ...config, questionCount: isNaN(val) ? NaN : val });
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors group cursor-pointer"
        >
          Start Interview
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </motion.div>
  );
}
