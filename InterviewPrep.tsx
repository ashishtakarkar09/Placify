import React, { useState } from 'react';
import { UserProfile, DSAProgress } from '../types';
import { DbService } from '../services/db';
import { Code2, CheckCircle, Flame, Clock, Hammer, HelpCircle, LayoutGrid, ChevronRight, BookOpen } from 'lucide-react';

interface DSATrackerProps {
  user: UserProfile;
  onChange: () => void;
}

// Map prepopulated sample questions for each DSA topic to enrich the educational content
const TOPIC_QUESTIONS: Record<string, string[]> = {
  Arrays: ['Two Sum', 'Container With Most Water', 'Merge Intervals'],
  Strings: ['Longest Substring Without Repeating Characters', 'Anagram Checks', 'Group Anagrams'],
  Searching: ['Binary Search', 'Search in Rotated Sorted Array', 'Square Root (x)'],
  Sorting: ['Kth Largest Element', 'Merge Sort implementation', 'Quick Sort on Lists'],
  'Linked Lists': ['Reverse Linked List', 'Detect Loop in Linked List', 'Merge Two Sorted Lists'],
  Stack: ['Valid Parentheses', 'Min Stack Implementation', 'Largest Rectangle in Histogram'],
  Queue: ['Implement Queue using Stacks', 'Sliding Window Maximum', 'First Non-repeating Character'],
  Hashing: ['Two Sum (Optimal)', 'Subarray Sum Equals K', 'Isomorphic Strings'],
  Trees: ['Inorder/Preorder Traversals', 'Maximum Depth of Binary Tree', 'Same Tree'],
  'Binary Search Trees': ['Validate BST', 'Lowest Common Ancestor in BST', 'Insert into a BST'],
  Heaps: ['Find Median from Data Stream', 'K Closest Points to Origin', 'Merge K Sorted Lists'],
  Graphs: ['BFS and DFS traversals', 'NumberOf Islands', 'Clone Graph'],
  'Greedy Algorithms': ['Activity Selection Problem', 'Fractional Knapsack', 'Jump Game'],
  'Dynamic Programming': ['Climbing Stairs', '0-1 Knapsack', 'Longest Common Subsequence'],
  Recursion: ['Fibonacci Numbers', 'Subset Generation (Power Set)', 'Generate Parentheses']
};

export default function DSATracker({ user, onChange }: DSATrackerProps) {
  const [list, setList] = useState<DSAProgress[]>(() => DbService.getDSAProgress(user.uid));
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const handleStatusChange = (topic: string, status: 'Not Started' | 'In Progress' | 'Completed') => {
    const updated = DbService.updateDSATopicStatus(user.uid, topic, status);
    setList(updated);
    onChange(); // trigger parent re-renders for core statistics sync
  };

  // Derive tracking totals
  const totalCompleted = list.filter((d) => d.status === 'Completed').length;
  const totalInProgress = list.filter((d) => d.status === 'In Progress').length;
  const totalRemaining = list.length - totalCompleted;
  const overallPercentage = list.length > 0 ? Math.round(((totalCompleted + totalInProgress * 0.4) / list.length) * 100) : 0;

  // Render status chips
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'In Progress':
        return 'text-amber-700 bg-amber-50 border-amber-100';
      default:
        return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Analytics Banner */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Data Structures & Algorithms Tracker</h2>
              <p className="text-xs text-slate-400">Master the 15 core disciplines tested in top coding evaluations</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 min-w-[90px]">
              <span className="text-xs text-slate-400 uppercase font-mono block">COMPLETED</span>
              <span className="text-lg font-extrabold text-slate-800">{totalCompleted} / {list.length}</span>
            </div>
            <div className="text-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 min-w-[90px]">
              <span className="text-xs text-slate-400 uppercase font-mono block">IN PROGRESS</span>
              <span className="text-lg font-extrabold text-indigo-600">{totalInProgress}</span>
            </div>
            <div className="text-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 min-w-[90px]">
              <span className="text-xs text-slate-400 uppercase font-mono block">READY %</span>
              <span className="text-lg font-extrabold text-emerald-600">{overallPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Big progress bar */}
        <div className="mt-5 space-y-1.5">
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500" style={{ width: `${overallPercentage}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 text-right">Estimated readiness weight: 40% of standard placements eligibility score</p>
        </div>
      </div>

      {/* Grid of Topics split beautifully */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((item) => {
          const isExpanded = expandedTopic === item.topic;
          const questions = TOPIC_QUESTIONS[item.topic] || [];

          return (
            <div
              key={item.topic}
              className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden ${
                isExpanded ? 'border-blue-500 shadow-sm' : 'border-slate-100 hover:border-slate-300'
              }`}
            >
              <div
                onClick={() => setExpandedTopic(isExpanded ? null : item.topic)}
                className="p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition ${
                    item.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.status === 'In Progress'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-slate-50 text-slate-400'
                  }`}>
                    {item.status === 'Completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Flame className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.topic}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Questions: {questions.length} cards</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border font-mono ${renderStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expanded topic questions checklists */}
              {isExpanded && (
                <div className="bg-slate-50/50 p-4 border-t border-slate-100 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase block">Mark Topic Completion Status:</span>
                    <div className="flex gap-2 pt-1">
                      {(['Not Started', 'In Progress', 'Completed'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleStatusChange(item.topic, opt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            item.status === opt
                              ? opt === 'Completed'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : opt === 'In Progress'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                : 'bg-slate-600 text-white border-slate-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100/60">
                    <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> High-frequency Interview Questions:
                    </span>
                    <ul className="space-y-1.5 pt-1">
                      {questions.map((q, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 p-2 bg-white rounded-lg border border-slate-100">
                          <span className="text-[9px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">Q{idx+1}</span>
                          <span className="font-medium truncate">{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
