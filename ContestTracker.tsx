import React, { useState } from 'react';
import { UserProfile, AptitudeProgress, APTITUDE_DATA } from '../types';
import { DbService } from '../services/db';
import { BrainCircuit, CheckSquare, Square, Trophy, Star, AlertCircle, RefreshCw, LayoutGrid, HelpCircle } from 'lucide-react';

interface AptitudeTrackerProps {
  user: UserProfile;
  onChange: () => void;
}

// Fixed mini practice test questions to let students interact and log scores
const MINI_QUIZ_QUESTIONS = [
  {
    id: 'apt_q1',
    category: 'Quantitative Aptitude',
    question: 'A can complete a project in 12 days. B is 50% more efficient than A. How many days will B take alone?',
    options: ['8 Days', '10 Days', '6 Days', '9 Days'],
    correct: 0,
    explanation: 'Efficiency ratio B:A = 150:100 = 3:2. Days ratio B:A = 2:3. Since A takes 12 days, B takes (2/3)*12 = 8 days.'
  },
  {
    id: 'apt_q2',
    category: 'Logical Reasoning',
    question: 'A is the brother of B. B is the daughter of C. D is the father of A. How is C related to D?',
    options: ['Sister', 'Mother', 'Wife', 'Daughter'],
    correct: 2,
    explanation: 'A and B are siblings (brother & daughter), so they share identical parents. Since D is the father, C must be the mother and therefore the Wife of D.'
  },
  {
    id: 'apt_q3',
    category: 'Verbal Ability',
    question: 'Identify the word with the CLOSEST meaning to the antonym of "Transient".',
    options: ['Temporary', 'Permanent', 'Fragile', 'Fleeting'],
    correct: 1,
    explanation: 'Transient means staying for only a short time (temporary/fleeting). Its antonym is Permanent.'
  }
];

export default function AptitudeTracker({ user, onChange }: AptitudeTrackerProps) {
  const [list, setList] = useState<AptitudeProgress[]>(() => DbService.getAptitudeProgress(user.uid));
  const [activeTab, setActiveTab] = useState<'track' | 'quiz'>('track');
  const [selectedCategory, setSelectedCategory] = useState<'Quantitative Aptitude' | 'Logical Reasoning' | 'Verbal Ability'>('Quantitative Aptitude');

  // Mini quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Toggle checklist
  const handleToggleTopic = (topic: string, currentVal: boolean) => {
    const updated = DbService.updateAptitudeTopic(user.uid, topic, !currentVal);
    setList(updated);
    onChange();
  };

  // Submit test and record the score dynamically
  const handleSubmitQuiz = () => {
    let correctCount = 0;
    MINI_QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / MINI_QUIZ_QUESTIONS.length) * 100);
    setQuizScore(scorePercentage);
    setQuizSubmitted(true);

    // Save final scores to related category topics (logically distributed)
    let updatedList = [...list];
    if (correctCount > 0) {
      // Simulate saving score to corresponding active topics (like percentages, blood relations, synonyms)
      updatedList = DbService.updateAptitudeTopic(user.uid, 'Percentages', true, scorePercentage);
      updatedList = DbService.updateAptitudeTopic(user.uid, 'Blood Relations', true, scorePercentage);
      updatedList = DbService.updateAptitudeTopic(user.uid, 'Synonyms & Antonyms', true, scorePercentage);
      setList(updatedList);
      onChange();
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setQuizScore(null);
    setQuizSubmitted(false);
  };

  // Derive Analytics Info
  const completedTopics = list.filter((a) => a.completed);
  const totalCompleted = completedTopics.length;
  const averageAccuracy = list.some((a) => (a.score || 0) > 0)
    ? Math.round(list.reduce((sum, item) => sum + (item.score || 0), 0) / list.filter(a => (a.score || 0) > 0).length)
    : 0;

  const bestScore = list.reduce((best, item) => Math.max(best, item.score || 0), 0);

  // Find weak areas (topics completed with score < 60% OR uncompleted topics if accuracy exists)
  const weakAreas = list.filter((a) => !a.completed || (a.score !== undefined && a.score < 60)).map(a => a.topic);
  const weakestTopic = weakAreas.length > 0 ? weakAreas[0] : 'None - All Strong!';

  return (
    <div className="space-y-6">
      {/* Aptitude Tracker Header */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Aptitude & Logical Reasoning Trainer</h2>
              <p className="text-xs text-slate-400">Qualify screening rounds of high-paying tech companies and service giants</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2 rounded-xl text-xs font-bold leading-none cursor-pointer transition ${
                activeTab === 'track' ? 'bg-blue-600 text-white' : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Topics Tracker
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 rounded-xl text-xs font-bold leading-none cursor-pointer transition ${
                activeTab === 'quiz' ? 'bg-blue-600 text-white' : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Practice Mini-Test
            </button>
          </div>
        </div>

        {/* Analytics row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50/60 rounded-2xl border border-slate-100/50">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Best Practice Score</span>
              <span className="text-sm font-extrabold text-slate-800">{bestScore > 0 ? `${bestScore}%` : 'Not tested'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50/60 rounded-2xl border border-slate-100/50">
            <Star className="w-8 h-8 text-indigo-500" />
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Section Completion</span>
              <span className="text-sm font-extrabold text-slate-800">{totalCompleted} / {list.length} topics</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50/60 rounded-2xl border border-slate-100/50">
            <AlertCircle className="w-8 h-8 text-rose-500 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Focus Weak Area</span>
              <span className="text-sm font-extrabold text-rose-600 truncate max-w-[150px] block">{weakestTopic}</span>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'track' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories select sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase mb-2">Categories</h3>
            {APTITUDE_DATA.map((catObj) => {
              const catCompleted = list.filter((a) => a.category === catObj.category && a.completed).length;
              const catTotal = catObj.topics.length;
              const isSelected = selectedCategory === catObj.category;

              return (
                <button
                  key={catObj.category}
                  onClick={() => setSelectedCategory(catObj.category)}
                  className={`w-full p-4 text-left rounded-2xl border transition flex flex-col gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-500 text-slate-800 shadow-xs'
                      : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{catObj.category}</span>
                  <div className="flex justify-between items-center w-full text-[10px] text-slate-400 font-mono">
                    <span>Progress:</span>
                    <span className="font-bold">{catCompleted} / {catTotal}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Topics Checklist within selected category */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase">
              {selectedCategory} Topics Checklist
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {list
                .filter((item) => item.category === selectedCategory)
                .map((item) => {
                  const isWeak = !item.completed || (item.score !== undefined && item.score < 60);

                  return (
                    <div
                      key={item.topic}
                      onClick={() => handleToggleTopic(item.topic, item.completed)}
                      className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-blue-500 cursor-pointer select-none group transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-blue-600">
                          {item.completed ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition" />
                          )}
                        </div>
                        <div>
                          <span className={`text-sm font-semibold ${item.completed ? 'text-slate-800 line-through decoration-slate-300' : 'text-slate-700'}`}>
                            {item.topic}
                          </span>
                          {item.score !== undefined && item.score > 0 && (
                            <span className="text-[9px] font-mono font-bold text-emerald-600 block bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/55 w-fit mt-1">
                              Acc: {item.score}%
                            </span>
                          )}
                        </div>
                      </div>

                      {isWeak && (
                        <span className="text-[8px] tracking-wider font-extrabold font-mono text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md shrink-0 uppercase select-none">
                          Needs Practise
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        /* PRACTICE MOCK QUIZ */
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">placement Aptitude Screening practice Test</h3>
              <p className="text-xs text-slate-400">Answer these foundational gate-exam questions to evaluate status</p>
            </div>
            
            {quizSubmitted && (
              <button
                onClick={resetQuiz}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-bold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-Take Test
              </button>
            )}
          </div>

          <div className="space-y-6">
            {MINI_QUIZ_QUESTIONS.map((q, qIndex) => {
              const isCorrectAnswer = selectedAnswers[q.id] === q.correct;

              return (
                <div key={q.id} className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 leading-normal flex gap-2">
                    <span className="text-blue-600 font-mono">Q{qIndex+1}.</span>
                    <span>{q.question}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl pl-6">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === optIdx;
                      const isRight = optIdx === q.correct;

                      let buttonClass = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700';
                      if (isSelected && !quizSubmitted) buttonClass = 'bg-blue-50 border-blue-600 text-blue-700';
                      if (quizSubmitted) {
                        if (isRight) buttonClass = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold';
                        else if (isSelected) buttonClass = 'bg-rose-50 border-rose-500 text-rose-800';
                        else buttonClass = 'bg-slate-50/50 border-slate-100 text-slate-400';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                          className={`p-3 border rounded-xl text-xs text-left cursor-pointer transition flex items-center justify-between ${buttonClass}`}
                        >
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="pl-6 pt-1 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-2xl">
                      <span className="font-bold text-blue-800 font-mono block">Explanation:</span>
                      <p className="mt-0.5 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 select-none">
            {!quizSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length < MINI_QUIZ_QUESTIONS.length}
                className="px-6 py-2.5 bg-blue-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Submit Practice Score
              </button>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800 font-bold block">Test Score Calculated!</span>
                  <p className="text-[11px] text-slate-500">Your score has been registered in the database, updating weak area parameters.</p>
                </div>
                <div className="text-right text-emerald-800 font-mono">
                  <span className="text-3xl font-black">{quizScore}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
