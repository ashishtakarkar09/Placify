import React from 'react';
import { UserProfile, INITIAL_COMPANIES, INITIAL_CONTESTS } from '../types';
import { DbService } from '../services/db';
import {
  Trophy,
  Award,
  Code2,
  FileSpreadsheet,
  BrainCircuit,
  UserCheck,
  CalendarDays,
  Target,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  Briefcase
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  onNavigateToTab: (tab: string) => void;
  triggerRefresh: number;
}

export default function Dashboard({ user, onNavigateToTab, triggerRefresh }: DashboardProps) {
  // Use current values recalculated from database collections
  const dsaProgressList = DbService.getDSAProgress(user.uid);
  const aptProgressList = DbService.getAptitudeProgress(user.uid);
  const interviewProgressList = DbService.getInterviewProgress(user.uid);
  const resumeData = DbService.getResumeData(user.uid);

  // Derive individual module percentages
  const dsaCompleted = dsaProgressList.filter((d) => d.status === 'Completed').length;
  const dsaInProgress = dsaProgressList.filter((d) => d.status === 'In Progress').length;
  const dsaMax = dsaProgressList.length || 1;
  const dsaPercent = Math.round(((dsaCompleted + dsaInProgress * 0.4) / dsaMax) * 100);

  const aptCompleted = aptProgressList.filter((a) => a.completed).length;
  const aptMax = aptProgressList.length || 1;
  const aptPercent = Math.round((aptCompleted / aptMax) * 100);

  const resumePercent = DbService.calculateResumeCompleteness(resumeData);

  const intLearned = interviewProgressList.filter((i) => i.learned).length;
  const intMax = interviewProgressList.length || 1;
  const intPercent = Math.round((intLearned / intMax) * 100);

  // Dynamic placement readiness score formula:
  const readiness = DbService.calculatePlacementReadiness(user.uid);

  // Circular calculations for dynamic progress SVG
  const strokeRadius = 50;
  const circumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = circumference - (readiness.score / 100) * circumference;

  // Set up seconds ticks to run dynamic countdown on the dashboard
  const [tickerSeconds, setTickerSeconds] = React.useState<number>(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTickerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute contests with modern timer structures
  const contests = React.useMemo(() => {
    const base = INITIAL_CONTESTS();
    return base.map((c) => {
      const now = new Date();
      const target = new Date(c.startTime);
      const diffMs = target.getTime() - now.getTime();
      const secondsLeft = Math.max(0, Math.round(diffMs / 1000));
      return { ...c, secondsLeft };
    });
  }, [tickerSeconds]);

  const nearestContest = contests[0] || null;

  // Format dynamic ticking clock
  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return 'Live Now!';
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    parts.push(`${hours.toString().padStart(2, '0')}h`);
    parts.push(`${minutes.toString().padStart(2, '0')}m`);
    parts.push(`${seconds.toString().padStart(2, '0')}s`);
    return parts.join(' ');
  };

  // Verify eligible companies dynamically from INITIAL_COMPANIES list matching stats
  const eligibleCompanies = React.useMemo(() => {
    return INITIAL_COMPANIES.filter((company) => {
      const isAllowedBranch =
        company.allowedBranches.includes('All Branches') ||
        company.allowedBranches.includes('All') ||
        company.allowedBranches.some(
          (b) => b.toLowerCase().trim() === user.branch.toLowerCase().trim()
        );
      return user.currentCGPA >= company.minCGPA && user.activeBacklogs <= company.maxBacklogs && isAllowedBranch;
    });
  }, [user.currentCGPA, user.activeBacklogs, user.branch]);

  // Visual formatting of placement categories
  const getCategoryClass = (cat: string) => {
    switch (cat) {
      case 'Highly Competitive':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
      case 'Placement Ready':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Intermediate':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Row - Welcome & CGPA */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl font-display shadow-md shadow-blue-500/10">
            {user.fullName ? user.fullName.split(' ').map((n) => n.charAt(0)).join('').substring(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 font-display">
              Welcome back, {user.fullName}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5 font-medium">
              B.Tech {user.branch} • Semester {user.semester}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right md:border-r md:border-slate-100 md:pr-6">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-mono">Current CGPA</p>
            <p className="text-2xl md:text-3xl font-black text-blue-600 font-display mt-0.5">
              {user.currentCGPA.toFixed(2)}
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-mono">Backlogs State</p>
            <p className={`text-sm font-bold mt-1.5 px-3 py-1 rounded-xl border ${user.activeBacklogs === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-150'}`}>
              {user.activeBacklogs === 0 ? 'Clear History' : `${user.activeBacklogs} Active`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Bento Grid Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Bento Cell 1: Score Card (Spans 1 Col, Spans 2 Rows vertically) */}
        <div className="lg:col-span-1 lg:row-span-2 bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-950 rounded-3xl p-6 flex flex-col justify-between text-white shadow-xl shadow-blue-500/5 relative overflow-hidden">
          {/* Subtle Background decor curves */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/[0.04] rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-white/[0.04] rounded-full blur-xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-1.5 opacity-90 select-none">
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-indigo-200">Readiness Assessment</span>
            </div>
            <h3 className="text-xl font-bold font-display mt-1 tracking-tight">Placement Quotient</h3>
            <p className="text-[11px] text-indigo-200/80 mt-0.5">Interactive evaluation score</p>
          </div>

          <div className="relative w-40 h-40 mx-auto my-6 flex items-center justify-center">
            {/* Countdown SVG gauge circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={strokeRadius}
                className="stroke-indigo-650 fill-none"
                strokeWidth="9"
              />
              <circle
                cx="80"
                cy="80"
                r={strokeRadius}
                className="stroke-amber-400 fill-none transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-extrabold tracking-tight text-white font-display">
                {readiness.score}
              </span>
              <span className="text-xs text-indigo-200 font-semibold block font-mono mt-0.5">/ 100</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/5">
              <div className="text-[9px] text-indigo-200 uppercase font-bold font-mono tracking-wider">Placement Tier</div>
              <div className="text-xs font-bold text-white mt-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-300" />
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryClass(readiness.category)}`}>
                  {readiness.category}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-indigo-200 select-none text-center leading-relaxed opacity-75">
              Reflects cumulative progress and achievements on all platform features.
            </p>
          </div>
        </div>

        {/* Bento Cell 2: DSA Milestone Card (Spans 2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1 text-blue-600">
                <Code2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Algorithm Mastery</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-1 font-display">Data Structures & Algos</h3>
              <p className="text-xs text-slate-500 mt-0.5">Track core coding templates for top tech interview questions</p>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-100">
              {dsaCompleted} / {dsaMax} Conquered
            </span>
          </div>

          <div className="my-5 space-y-4">
            {/* Master Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-600">Syllabus Completion</span>
                <span className="font-bold text-slate-850 font-mono">{dsaPercent}%</span>
              </div>
              <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500 shadow-inner" 
                  style={{ width: `${dsaPercent}%` }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-2xl hover:bg-slate-50 transition cursor-pointer" onClick={() => onNavigateToTab('dsa')}>
                <span className="text-[10px] font-bold font-mono text-slate-400 block uppercase">In Progress</span>
                <span className="text-xl font-bold text-slate-800 font-display mt-0.5 block">{dsaInProgress}</span>
                <span className="text-[10px] text-slate-500">active tracks</span>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-2xl hover:bg-slate-50 transition cursor-pointer" onClick={() => onNavigateToTab('dsa')}>
                <span className="text-[10px] font-bold font-mono text-slate-400 block uppercase">Unexplored</span>
                <span className="text-xl font-bold text-slate-800 font-display mt-0.5 block">{dsaMax - dsaCompleted - dsaInProgress}</span>
                <span className="text-[10px] text-slate-500">topics remain</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('dsa')}
            className="w-full py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold rounded-2xl border border-slate-200 hover:border-blue-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer select-none"
          >
            Open Interactive Roadmap <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bento Cell 3: Quick Action Launchpad (Spans 1 Col) */}
        <div className="lg:col-span-1 grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigateToTab('cgpa')}
            className="p-4 bg-white border border-slate-200 rounded-3xl text-left hover:border-blue-400 hover:shadow-md hover:scale-[1.02] transition-all duration-350 group cursor-pointer"
          >
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:scale-105 transition duration-300">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-slate-800 mt-3 leading-tight block">Predictor</h4>
            <span className="text-[9px] text-slate-400 mt-1 block">Goal SGPA</span>
          </button>

          <button
            onClick={() => onNavigateToTab('resume')}
            className="p-4 bg-white border border-slate-200 rounded-3xl text-left hover:border-indigo-400 hover:shadow-md hover:scale-[1.02] transition-all duration-350 group cursor-pointer"
          >
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit group-hover:scale-105 transition duration-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-slate-800 mt-3 leading-tight block">ATS Resume</h4>
            <span className="text-[9px] text-slate-400 mt-1 block">Build & Export PDF</span>
          </button>

          <button
            onClick={() => onNavigateToTab('interview')}
            className="p-4 bg-white border border-slate-200 rounded-3xl text-left hover:border-emerald-400 hover:shadow-md hover:scale-[1.02] transition-all duration-350 group cursor-pointer"
          >
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit group-hover:scale-105 transition duration-300">
              <UserCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-slate-800 mt-3 leading-tight block">Prep Q&As</h4>
            <span className="text-[9px] text-slate-400 mt-1 block">Learn questions</span>
          </button>

          <button
            onClick={() => onNavigateToTab('contests')}
            className="p-4 bg-white border border-slate-200 rounded-3xl text-left hover:border-rose-400 hover:shadow-md hover:scale-[1.02] transition-all duration-350 group cursor-pointer"
          >
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl w-fit group-hover:scale-105 transition duration-300">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-slate-800 mt-3 leading-tight block">Contests</h4>
            <span className="text-[9px] text-slate-400 mt-1 block">Ticking timers</span>
          </button>
        </div>

        {/* Bento Cell 4: Live Contest Counting Ticket (Spans 1 Col) */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold font-mono tracking-wider text-rose-500 uppercase">Coding Contest Tickets</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>
            {nearestContest ? (
              <>
                <h3 className="text-base font-extrabold text-slate-900 mt-2 font-display leading-tight line-clamp-1">
                  {nearestContest.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Platform: <strong className="text-slate-700">{nearestContest.platform}</strong> • {nearestContest.duration}
                </p>
              </>
            ) : (
              <h3 className="text-base font-bold text-slate-800 mt-2">No Active Contests</h3>
            )}
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-4 my-4.5 text-center border border-slate-800 shadow-inner">
            <span className="text-[9px] text-slate-400 uppercase font-mono tracking-widest block">Starts In Countdown</span>
            <span className="text-base md:text-lg font-black font-mono tracking-tight text-amber-300 block mt-1">
              {nearestContest ? formatCountdown(nearestContest.secondsLeft) : '00:00:00'}
            </span>
          </div>

          <button
            onClick={() => onNavigateToTab('contests')}
            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-center text-xs flex items-center justify-center gap-1.5 transition select-none cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" /> Open Arena Cal <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Bento Cell 5: Aptitude and Resume Dual Box (Spans 2 Cols) */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row gap-6">
          {/* Aptitude card container */}
          <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">Aptitude logic</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-800 mt-3">Quant & Aptitude</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Practiced: {aptCompleted} / {aptMax} topics</p>
            </div>

            <div className="my-4">
              <div className="flex justify-between text-[11px] mb-1 font-medium text-slate-600">
                <span>Task coverage</span>
                <span className="font-bold text-emerald-600 font-mono">{aptPercent}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-300" style={{ width: `${aptPercent}%` }} />
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('aptitude')}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition select-none cursor-pointer"
            >
              Practice MCQs <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Resume card container */}
          <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-650 rounded-lg">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">Resume optimization</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-800 mt-3">Professional ATS Score</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{resumePercent}% detailed sections</p>
            </div>

            <div className="my-4">
              <div className="flex justify-between text-[11px] mb-1 font-medium text-slate-600">
                <span>Completeness</span>
                <span className="font-bold text-indigo-650 font-mono">{resumePercent}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${resumePercent}%` }} />
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('resume')}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition select-none cursor-pointer"
            >
              Optimize PDF Content <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Cell 6: Dynamic Company Eligibility Preview (Spans 1 Col) */}
        <div className="lg:col-span-1 bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between min-h-[220px]">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/[0.08] rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-300">
                <Briefcase className="w-4 h-4" />
                <span className="text-[9px] font-bold font-mono uppercase tracking-widest">Live Campus Intake</span>
              </div>
              <span className="text-[9px] font-bold font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/10 select-none">
                {eligibleCompanies.length} Eligible
              </span>
            </div>
            
            <h3 className="text-base font-bold font-display mt-2.5">Corporate Gateway</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Instant branch and CGPA metrics lookup</p>
          </div>

          {/* Middle: eligible company small tags list */}
          <div className="my-3 space-y-1.5 max-h-[85px] overflow-hidden">
            {eligibleCompanies.slice(0, 3).map((comp) => (
              <div key={comp.id} className="flex items-center justify-between p-1.5 bg-white/5 rounded-lg border border-white/[0.03] text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-slate-100">{comp.name}</span>
                </div>
                <span className="font-mono text-[9px] text-indigo-300">{comp.expectedSalary}</span>
              </div>
            ))}
            {eligibleCompanies.length === 0 && (
              <div className="p-2 text-center text-xs text-rose-300 bg-rose-500/10 rounded-xl border border-rose-500/15">
                Adjust eligibility indicators
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateToTab('cgpa')}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl text-center text-xs flex items-center justify-center gap-1 transition select-none cursor-pointer"
          >
            Check Company Requirements <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
