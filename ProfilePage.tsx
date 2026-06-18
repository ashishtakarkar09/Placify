import React, { useState } from 'react';
import { UserProfile, InterviewProgress, INITIAL_INTERVIEW_QUESTIONS, TECHNICAL_SUBJECT_TITLES } from '../types';
import { DbService } from '../services/db';
import { ShieldCheck, Search, Filter, Bookmark, CheckCircle2, Circle, GraduationCap, ArrowRight, HelpCircle, Eye, EyeOff } from 'lucide-react';

interface InterviewPrepProps {
  user: UserProfile;
  onChange: () => void;
}

export default function InterviewPrep({ user, onChange }: InterviewPrepProps) {
  const [progressList, setProgressList] = useState<InterviewProgress[]>(() => DbService.getInterviewProgress(user.uid));
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Toggle bookmark / learned flags
  const handleToggleLearned = (questionId: string) => {
    const updated = DbService.toggleInterviewLearned(user.uid, questionId);
    setProgressList(updated);
    onChange(); // sync dynamic analytics
  };

  const handleToggleBookmark = (questionId: string) => {
    const updated = DbService.toggleInterviewBookmark(user.uid, questionId);
    setProgressList(updated);
    onChange();
  };

  // Compile list with dynamic bookmarks / learned state
  const compiledQuestions = INITIAL_INTERVIEW_QUESTIONS.map((q) => {
    const progress = progressList.find((p) => p.questionId === q.id);
    return {
      ...q,
      learned: progress ? progress.learned : false,
      bookmarked: progress ? progress.bookmarked : false
    };
  });

  // Filter list
  const filteredQuestions = compiledQuestions.filter((q) => {
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.sampleAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Unique categories list
  const categoriesList = ['All', 'HR', 'Java', 'OOP', 'DBMS', 'OS', 'CN', 'SE'];

  const learnedCount = progressList.filter((p) => p.learned).length;
  const bookmarkedCount = progressList.filter((p) => p.bookmarked).length;

  return (
    <div className="space-y-6">
      {/* Overview stats info */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Interview Q&A Vault</h2>
              <p className="text-xs text-slate-400">Review high-frequency HR and Core Subject questions curated by corporate recruiters</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 min-w-[100px]">
              <span className="text-xs text-slate-400 uppercase font-mono block">LEARNED</span>
              <span className="text-base font-extrabold text-emerald-600">{learnedCount} / {INITIAL_INTERVIEW_QUESTIONS.length}</span>
            </div>
            <div className="text-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 min-w-[100px]">
              <span className="text-xs text-slate-400 uppercase font-mono block">BOOKMARKS</span>
              <span className="text-base font-extrabold text-blue-600">{bookmarkedCount} saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
          />
        </div>

        {/* Categories slider */}
        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 select-none max-w-full">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'All' ? 'All Subjects' : TECHNICAL_SUBJECT_TITLES[cat as keyof typeof TECHNICAL_SUBJECT_TITLES] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 bg-white rounded-3xl text-center text-slate-400 text-xs">
            No questions matched your search filters.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedQuestion === q.id;

            return (
              <div
                key={q.id}
                className={`bg-white border rounded-2xl overflow-hidden transition ${
                  q.learned ? 'border-emerald-100 bg-emerald-50/5' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="p-5 flex justify-between items-start gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-mono uppercase font-black rounded border border-blue-100">
                        {q.category}
                      </span>
                      {q.learned && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-mono uppercase font-black rounded">
                          Learned
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 leading-normal leading-relaxed pr-6 select-text">
                      {q.question}
                    </h4>
                  </div>

                  {/* Bookmark and action toggles */}
                  <div className="flex items-center gap-1.5 shrink-0 select-none">
                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        q.bookmarked
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                          : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current text-indigo-500" />
                    </button>

                    <button
                      onClick={() => handleToggleLearned(q.id)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        q.learned
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {q.learned ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                      className="p-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold font-mono cursor-pointer flex items-center gap-1"
                    >
                      {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{isExpanded ? 'Hide' : 'Answer'}</span>
                    </button>
                  </div>
                </div>

                {/* Answer drawer */}
                {isExpanded && (
                  <div className="bg-slate-50 px-5 py-4 border-t border-slate-100 space-y-2 select-text">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 pb-1.5 border-b border-slate-200/50">
                      <span>Recruiter Recommended Guidance:</span>
                      <span className="text-emerald-700">Perfect Candidate Metric</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans mt-2 whitespace-pre-line">
                      {q.sampleAnswer}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
