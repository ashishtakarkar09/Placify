import {
  UserProfile,
  DSAProgress,
  AptitudeProgress,
  InterviewProgress,
  ResumeData,
  NoteItem,
  DSA_TOPICS,
  APTITUDE_DATA,
  INITIAL_INTERVIEW_QUESTIONS
} from '../types';

// Constants representing key names in LocalStorage (matching the requested Firebase Collections)
const COLLECTION_USERS = 'Users';
const COLLECTION_DSA = 'DSAProgress';
const COLLECTION_APTITUDE = 'AptitudeProgress';
const COLLECTION_INTERVIEW = 'InterviewProgress';
const COLLECTION_RESUME = 'ResumeData';
const COLLECTION_NOTES = 'Notes';

// Helper to get from localStorage safely
const getLocal = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const DbService = {
  // --- AUTH AND USERS ---
  getUsers: (): UserProfile[] => {
    return getLocal<UserProfile[]>(COLLECTION_USERS, []);
  },

  getCurrentUser: (): UserProfile | null => {
    const session = localStorage.getItem('current_user_session');
    if (!session) return null;
    const users = DbService.getUsers();
    return users.find((u) => u.email === session) || null;
  },

  setCurrentUserSession: (email: string | null): void => {
    if (email) {
      localStorage.setItem('current_user_session', email);
    } else {
      localStorage.removeItem('current_user_session');
    }
  },

  saveUser: (user: UserProfile): void => {
    const users = DbService.getUsers();
    const index = users.findIndex((u) => u.uid === user.uid || u.email === user.email);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    setLocal(COLLECTION_USERS, users);
    // If the saved user is the current session, update session cache
    const current = DbService.getCurrentUser();
    if (current && (current.uid === user.uid || current.email === user.email)) {
      DbService.setCurrentUserSession(user.email);
    }
  },

  registerUser: (user: Omit<UserProfile, 'uid'>): UserProfile => {
    const uid = 'u_' + Math.random().toString(36).substr(2, 9);
    const fullUser: UserProfile = { ...user, uid };
    DbService.saveUser(fullUser);
    DbService.initializeUserData(uid);
    return fullUser;
  },

  // --- INITIALIZERS FOR NEW USER REGISTRATION ---
  initializeUserData: (uid: string): void => {
    // 1. Initialize DSA Tracker to 'Not Started'
    const initialDSA: DSAProgress[] = DSA_TOPICS.map((topic) => ({
      topic,
      status: 'Not Started',
      lastUpdated: new Date().toISOString()
    }));
    DbService.saveDSAProgress(uid, initialDSA);

    // 2. Initialize Aptitude Tracker
    const initialApt: AptitudeProgress[] = [];
    APTITUDE_DATA.forEach((catObj) => {
      catObj.topics.forEach((topic) => {
        initialApt.push({
          category: catObj.category,
          topic,
          completed: false,
          score: 0,
          attempts: 0
        });
      });
    });
    DbService.saveAptitudeProgress(uid, initialApt);

    // 3. Initialize Interview Questions Progress (Unlearned, Unbookmarked)
    const initialInt: InterviewProgress[] = INITIAL_INTERVIEW_QUESTIONS.map((q) => ({
      questionId: q.id,
      category: q.category,
      learned: false,
      bookmarked: false
    }));
    DbService.saveInterviewProgress(uid, initialInt);

    // 4. Initialize Resume builder blank data
    const initialResume: ResumeData = {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        github: '',
        linkedin: '',
        summary: ''
      },
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      achievements: [],
      languages: [],
      interests: []
    };
    DbService.saveResumeData(uid, initialResume);

    // 5. Initialize Notes with first sample welcome note
    const userNotes: NoteItem[] = [
      {
        id: 'note_welcome',
        title: 'Placement Preparation Roadmap',
        content: `Welcome to your Placement Companion. Here is a quick 3-step action plan:\n1. Maintain a CGPA above 8.0 for eligibility.\n2. Complete at least 4 DSA topics a week.\n3. Create your resume using our builder.\nBest of luck!`,
        category: 'DSA Notes',
        createdAt: new Date().toISOString()
      }
    ];
    DbService.saveNotes(uid, userNotes);
  },

  // --- DSA TRACKER PERSISTENCE ---
  getDSAProgress: (uid: string): DSAProgress[] => {
    return getLocal<DSAProgress[]>(`${COLLECTION_DSA}_${uid}`, []);
  },

  saveDSAProgress: (uid: string, data: DSAProgress[]): void => {
    setLocal(`${COLLECTION_DSA}_${uid}`, data);
  },

  updateDSATopicStatus: (uid: string, topic: string, status: 'Not Started' | 'In Progress' | 'Completed'): DSAProgress[] => {
    const list = DbService.getDSAProgress(uid);
    const item = list.find((d) => d.topic === topic);
    if (item) {
      item.status = status;
      item.lastUpdated = new Date().toISOString();
    } else {
      list.push({ topic, status, lastUpdated: new Date().toISOString() });
    }
    DbService.saveDSAProgress(uid, list);
    return list;
  },

  // --- APTITUDE TRACKER PERSISTENCE ---
  getAptitudeProgress: (uid: string): AptitudeProgress[] => {
    return getLocal<AptitudeProgress[]>(`${COLLECTION_APTITUDE}_${uid}`, []);
  },

  saveAptitudeProgress: (uid: string, data: AptitudeProgress[]): void => {
    setLocal(`${COLLECTION_APTITUDE}_${uid}`, data);
  },

  updateAptitudeTopic: (uid: string, topic: string, completed: boolean, score?: number): AptitudeProgress[] => {
    const list = DbService.getAptitudeProgress(uid);
    const item = list.find((a) => a.topic === topic);
    if (item) {
      item.completed = completed;
      if (score !== undefined) {
        item.attempts = (item.attempts || 0) + 1;
        item.score = Math.max(item.score || 0, score); // save best score
      }
    }
    DbService.saveAptitudeProgress(uid, list);
    return list;
  },

  // --- INTERVIEW PROGRESS PERSISTENCE ---
  getInterviewProgress: (uid: string): InterviewProgress[] => {
    return getLocal<InterviewProgress[]>(`${COLLECTION_INTERVIEW}_${uid}`, []);
  },

  saveInterviewProgress: (uid: string, data: InterviewProgress[]): void => {
    setLocal(`${COLLECTION_INTERVIEW}_${uid}`, data);
  },

  toggleInterviewLearned: (uid: string, questionId: string): InterviewProgress[] => {
    const list = DbService.getInterviewProgress(uid);
    const item = list.find((i) => i.questionId === questionId);
    if (item) {
      item.learned = !item.learned;
    } else {
      list.push({ questionId, category: 'HR', learned: true, bookmarked: false });
    }
    DbService.saveInterviewProgress(uid, list);
    return list;
  },

  toggleInterviewBookmark: (uid: string, questionId: string): InterviewProgress[] => {
    const list = DbService.getInterviewProgress(uid);
    const item = list.find((i) => i.questionId === questionId);
    if (item) {
      item.bookmarked = !item.bookmarked;
    } else {
      list.push({ questionId, category: 'HR', learned: false, bookmarked: true });
    }
    DbService.saveInterviewProgress(uid, list);
    return list;
  },

  // --- RESUME PERSISTENCE ---
  getResumeData: (uid: string): ResumeData => {
    const defaultResume: ResumeData = {
      personalInfo: { fullName: '', email: '', phone: '', location: '', github: '', linkedin: '', summary: '' },
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      achievements: [],
      languages: [],
      interests: []
    };
    return getLocal<ResumeData>(`${COLLECTION_RESUME}_${uid}`, defaultResume);
  },

  saveResumeData: (uid: string, data: ResumeData): void => {
    setLocal(`${COLLECTION_RESUME}_${uid}`, data);
  },

  // Calculate Resume Builder completeness percentage (estimate between 0 and 100 based on sections filled)
  calculateResumeCompleteness: (resume: ResumeData): number => {
    let score = 0;
    if (resume.personalInfo.fullName && resume.personalInfo.email && resume.personalInfo.phone) score += 20;
    if (resume.personalInfo.summary) score += 10;
    if (resume.education && resume.education.length > 0) score += 20;
    if (resume.skills && resume.skills.length > 0) score += 15;
    if (resume.projects && resume.projects.length > 0) score += 20;
    if (resume.certifications && resume.certifications.length > 0) score += 5;
    if (resume.achievements && resume.achievements.length > 0) score += 5;
    if ((resume.languages && resume.languages.length > 0) || (resume.interests && resume.interests.length > 0)) score += 5;
    return score;
  },

  // --- NOTES CRUD ---
  getNotes: (uid: string): NoteItem[] => {
    return getLocal<NoteItem[]>(`${COLLECTION_NOTES}_${uid}`, []);
  },

  saveNotes: (uid: string, notes: NoteItem[]): void => {
    setLocal(`${COLLECTION_NOTES}_${uid}`, notes);
  },

  addOrUpdateNote: (uid: string, note: Omit<NoteItem, 'createdAt'>): NoteItem[] => {
    const notes = DbService.getNotes(uid);
    const existingIndex = notes.findIndex((n) => n.id === note.id);
    if (existingIndex >= 0) {
      notes[existingIndex] = {
        ...notes[existingIndex],
        ...note
      };
    } else {
      const newNote: NoteItem = {
        ...note,
        createdAt: new Date().toISOString()
      };
      notes.unshift(newNote);
    }
    DbService.saveNotes(uid, notes);
    return notes;
  },

  deleteNote: (uid: string, noteId: string): NoteItem[] => {
    const notes = DbService.getNotes(uid);
    const filtered = notes.filter((n) => n.id !== noteId);
    DbService.saveNotes(uid, filtered);
    return filtered;
  },

  // --- PLACEMENT READINESS METRICS CALCULATOR ---
  calculatePlacementReadiness: (uid: string): { score: number; category: string } => {
    const dsa = DbService.getDSAProgress(uid);
    const aptitude = DbService.getAptitudeProgress(uid);
    const resume = DbService.getResumeData(uid);
    const interview = DbService.getInterviewProgress(uid);

    // 1. DSA completed % (out of DSA topics)
    const dsaCompleted = dsa.filter((d) => d.status === 'Completed').length;
    const dsaInProgress = dsa.filter((d) => d.status === 'In Progress').length;
    const dsaMax = dsa.length || 1;
    const dsaPercentage = ((dsaCompleted + dsaInProgress * 0.4) / dsaMax) * 100;

    // 2. Aptitude completed %
    const aptCompleted = aptitude.filter((a) => a.completed).length;
    const aptMax = aptitude.length || 1;
    const aptPercentage = (aptCompleted / aptMax) * 100;

    // 3. Resume completeness %
    const resumePercentage = DbService.calculateResumeCompleteness(resume);

    // 4. Interview preparation learned %
    const interviewLearned = interview.filter((i) => i.learned).length;
    const interviewMax = INITIAL_INTERVIEW_QUESTIONS.length || 1;
    const interviewPercentage = (interviewLearned / interviewMax) * 100;

    // Formula:
    // DSA Progress = 40%
    // Aptitude Progress = 20%
    // Resume Completion = 20%
    // Interview Preparation = 20%
    const finalScore = Math.round(
      (dsaPercentage * 0.40) +
      (aptPercentage * 0.20) +
      (resumePercentage * 0.20) +
      (interviewPercentage * 0.20)
    );

    // Categories: Beginner, Intermediate, Placement Ready, Highly Competitive
    let category = 'Beginner';
    if (finalScore > 85) {
      category = 'Highly Competitive';
    } else if (finalScore > 60) {
      category = 'Placement Ready';
    } else if (finalScore > 30) {
      category = 'Intermediate';
    }

    return {
      score: Math.min(100, Math.max(0, finalScore)),
      category
    };
  }
};
