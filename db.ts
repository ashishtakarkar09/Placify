export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  branch: string;
  semester: number; // 1 to 8
  currentCGPA: number; // 0 to 10
  activeBacklogs: number;
}

export interface DSAProgress {
  topic: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  lastUpdated: string;
}

export interface AptitudeProgress {
  category: 'Quantitative Aptitude' | 'Logical Reasoning' | 'Verbal Ability';
  topic: string;
  completed: boolean;
  score?: number; // Last practiced score %
  attempts?: number;
}

export interface InterviewProgress {
  questionId: string;
  category: 'HR' | 'Java' | 'OOP' | 'DBMS' | 'OS' | 'CN' | 'SE';
  learned: boolean;
  bookmarked: boolean;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    github: string;
    linkedin: string;
    summary: string;
  };
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    year: string;
    cgpaOrPercentage: string;
  }>;
  skills: string[]; // split by comma
  projects: Array<{
    id: string;
    title: string;
    techStack: string;
    description: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    year: string;
  }>;
  achievements: string[];
  languages: string[];
  interests: string[];
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'DSA Notes' | 'Aptitude Notes' | 'Interview Notes' | 'Resume Notes';
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  minCGPA: number;
  allowedBranches: string[];
  maxBacklogs: number;
  type: 'Product Based' | 'Service Based' | 'Startup';
  expectedSalary: string;
}

export interface Contest {
  id: string;
  title: string;
  platform: 'Codeforces' | 'LeetCode' | 'CodeChef';
  startTime: string; // ISO string or relative time
  duration: string;
  link: string;
  secondsLeft: number; // calculated countdown
}

export interface InterviewQuestion {
  id: string;
  category: 'HR' | 'Java' | 'OOP' | 'DBMS' | 'OS' | 'CN' | 'SE';
  question: string;
  sampleAnswer: string;
}

// Prepopulated static datasets
export const DSA_TOPICS = [
  'Arrays',
  'Strings',
  'Searching',
  'Sorting',
  'Linked Lists',
  'Stack',
  'Queue',
  'Hashing',
  'Trees',
  'Binary Search Trees',
  'Heaps',
  'Graphs',
  'Greedy Algorithms',
  'Dynamic Programming',
  'Recursion'
];

export const APTITUDE_DATA: { category: 'Quantitative Aptitude' | 'Logical Reasoning' | 'Verbal Ability', topics: string[] }[] = [
  {
    category: 'Quantitative Aptitude',
    topics: ['Percentages', 'Profit & Loss', 'Time & Work', 'Ratio & Proportion', 'Speed & Distance', 'Permutations & Combinations', 'Simple & Compound Interest']
  },
  {
    category: 'Logical Reasoning',
    topics: ['Blood Relations', 'Seating Arrangement', 'Syllogisms', 'Coding-Decoding', 'Number Series', 'Directions Sense', 'Clocks & Calendars']
  },
  {
    category: 'Verbal Ability',
    topics: ['Sentence Correction', 'Reading Comprehension', 'Synonyms & Antonyms', 'Tenses & Grammar', 'Idioms & Phrases', 'Active & Passive Voice']
  }
];

export const TECHNICAL_SUBJECT_TITLES = {
  HR: 'HR Interview Prep',
  Java: 'Java Language Core',
  OOP: 'Object Oriented Programming',
  DBMS: 'Database Management Systems',
  OS: 'Operating Systems (OS)',
  CN: 'Computer Networks (CN)',
  SE: 'Software Engineering (SE)'
};

export const INITIAL_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // HR Questions
  {
    id: 'hr_1',
    category: 'HR',
    question: 'Tell me about yourself.',
    sampleAnswer: 'Keep it structured: focus on your background, college achievements, core tech stack (e.g., DSA, Java/React), notable projects, and close with why you are excited about this role.'
  },
  {
    id: 'hr_2',
    category: 'HR',
    question: 'What are your strengths?',
    sampleAnswer: 'Emphasize soft or hard skills with continuous proof. For example: "My key strength is logical problem solving, which I demonstrate through daily DSA practice on LeetCode and resolving complex build bugs in projects."'
  },
  {
    id: 'hr_3',
    category: 'HR',
    question: 'What are your weaknesses?',
    sampleAnswer: 'Always list a real but harmless weakness, followed by your structured effort to overcome it. For example: "I used to struggle with public presentations, so I joined college student clubs and regularly present project updates to improve."'
  },
  {
    id: 'hr_4',
    category: 'HR',
    question: 'Where do you see yourself in 5 years?',
    sampleAnswer: 'Show realistic career progression, commitment to learning, and contributing to high-performance groups, eventually moving to senior development or system architecture roles.'
  },
  // Java Questions
  {
    id: 'java_1',
    category: 'Java',
    question: 'What are the main differences between JDK, JRE, and JVM?',
    sampleAnswer: 'JVM (Java Virtual Machine) executes the bytecode. JRE (Java Runtime Environment) bundles JVM + core libraries to run apps. JDK (Java Development Kit) is the complete developer bundle including JRE, compiler (javac), and debugger.'
  },
  {
    id: 'java_2',
    category: 'Java',
    question: 'Why is Java not a 100% purely object-oriented language?',
    sampleAnswer: 'Because it supports primitive data types (like int, float, double, char, boolean, etc.) which are not objects, for efficiency reasons.'
  },
  {
    id: 'java_3',
    category: 'Java',
    question: 'What is the utility of the "static" keyword in Java?',
    sampleAnswer: 'The static keyword belongs to the class itself rather than instances of the class. It is used to declare variables or methods that are shared across all instances of the class and can be accessed without creating an object.'
  },
  // OOP Questions
  {
    id: 'oop_1',
    category: 'OOP',
    question: 'Explain the four core pillars of Object-Oriented Programming.',
    sampleAnswer: '1. Encapsulation (data hiding via private variables and public getters/setters); 2. Abstraction (hiding implementation details using interfaces or abstract classes); 3. Inheritance (subclasses inheriting properties of parent classes for reusability); 4. Polymorphism (overloading and overriding methods).'
  },
  {
    id: 'oop_2',
    category: 'OOP',
    question: 'What is the difference between Method Overloading and Method Overriding?',
    sampleAnswer: 'Method Overloading happens within the same class with identical names but different argument lists (Compile-time Polymorphism). Method Overriding happens between a superclass and subclass with fully identical signatures and parameters (Runtime Polymorphism).'
  },
  // DBMS Questions
  {
    id: 'dbms_1',
    category: 'DBMS',
    question: 'What are ACID properties in database management?',
    sampleAnswer: 'ACID guarantees database transaction reliability. A: Atomicity (all or nothing); C: Consistency (valid state transition); I: Isolation (concurrent executions do not affect each other); D: Durability (committed data survives system crashes).'
  },
  {
    id: 'dbms_2',
    category: 'DBMS',
    question: 'What is Database Normalization and why do we need it?',
    sampleAnswer: 'Normalization is the process of structuring relational databases to reduce data redundancy and improve data integrity (e.g., 1NF, 2NF, 3NF, BCNF) by partitioning tables appropriately.'
  },
  // OS Questions
  {
    id: 'os_1',
    category: 'OS',
    question: 'What is a Deadlock and what are the four necessary conditions for it?',
    sampleAnswer: 'A deadlock is a state where a set of processes are blocked because each process is holding a resource and waiting for another resource held by another process. The 4 Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.'
  },
  {
    id: 'os_2',
    category: 'OS',
    question: 'What is virtual memory and paging?',
    sampleAnswer: 'Virtual memory allows the execution of processes which are larger than physical memory (RAM). Paging is a memory management scheme that stores/retrieves processes from secondary storage in fixed-size blocks called pages.'
  },
  // CN Questions
  {
    id: 'cn_1',
    category: 'CN',
    question: 'What is the difference between TCP and UDP?',
    sampleAnswer: 'TCP (Transmission Control Protocol) is connection-oriented, highly reliable, performs error checking, guarantees packet ordering, but is slower. UDP (User Datagram Protocol) is connectionless, faster, lighter, but does not guarantee delivery (ideal for streaming/gaming).'
  },
  {
    id: 'cn_2',
    category: 'CN',
    question: 'Describe the main layers of the OSI model.',
    sampleAnswer: 'The 7 layers of the OSI model from bottom to top are: Physical, Data Link, Network, Transport, Session, Presentation, and Application. ("Please Do Not Throw Sausage Pizza Away").'
  },
  // SE Questions
  {
    id: 'se_1',
    category: 'SE',
    question: 'What is Agile Software Development?',
    sampleAnswer: 'Agile is an iterative, lightweight approach to software development focused on collaborative cross-functional self-organizing teams, frequent delivery of small working features, rapid response to change, and constant customer feedback.'
  }
];

export const INITIAL_COMPANIES: Company[] = [
  { id: 'c_1', name: 'Google', minCGPA: 8.5, allowedBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication'], maxBacklogs: 0, type: 'Product Based', expectedSalary: '32-45 LPA' },
  { id: 'c_2', name: 'Microsoft', minCGPA: 8.0, allowedBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical'], maxBacklogs: 0, type: 'Product Based', expectedSalary: '28-40 LPA' },
  { id: 'c_3', name: 'Amazon', minCGPA: 7.5, allowedBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical', 'Mechanical'], maxBacklogs: 1, type: 'Product Based', expectedSalary: '24-32 LPA' },
  { id: 'c_4', name: 'TCS Digital', minCGPA: 7.0, allowedBranches: ['All Branches'], maxBacklogs: 0, type: 'Service Based', expectedSalary: '7-9 LPA' },
  { id: 'c_5', name: 'Infosys Power Programmer', minCGPA: 7.0, allowedBranches: ['Computer Science', 'Information Technology', 'Electronics'], maxBacklogs: 1, type: 'Service Based', expectedSalary: '8-10 LPA' },
  { id: 'c_6', name: 'Wipro Turbo', minCGPA: 6.5, allowedBranches: ['All Branches'], maxBacklogs: 2, type: 'Service Based', expectedSalary: '5.5-7 LPA' },
  { id: 'c_7', name: 'Cred', minCGPA: 8.0, allowedBranches: ['Computer Science', 'Information Technology'], maxBacklogs: 0, type: 'Startup', expectedSalary: '18-25 LPA' },
  { id: 'c_8', name: 'Razorpay', minCGPA: 7.5, allowedBranches: ['Computer Science', 'Information Technology', 'Electronics'], maxBacklogs: 0, type: 'Startup', expectedSalary: '16-22 LPA' },
  { id: 'c_9', name: 'Zomato', minCGPA: 7.0, allowedBranches: ['All Branches'], maxBacklogs: 1, type: 'Startup', expectedSalary: '15-20 LPA' },
  { id: 'c_10', name: 'Accenture ASE', minCGPA: 6.0, allowedBranches: ['All Branches'], maxBacklogs: 2, type: 'Service Based', expectedSalary: '4.5 LPA' },
  { id: 'c_11', name: 'Cognizant GenC Elevate', minCGPA: 6.0, allowedBranches: ['All Branches'], maxBacklogs: 2, type: 'Service Based', expectedSalary: '4.2-5.5 LPA' },
  { id: 'c_12', name: 'Adobe', minCGPA: 8.5, allowedBranches: ['Computer Science', 'Information Technology'], maxBacklogs: 0, type: 'Product Based', expectedSalary: '30-38 LPA' }
];

export const INITIAL_CONTESTS = (): Contest[] => {
  const now = new Date();
  
  // Set up 3 beautiful, realistic upcoming contests with realistic countdown offsets
  return [
    {
      id: 'ct_1',
      title: 'LeetCode Weekly Contest 428',
      platform: 'LeetCode',
      startTime: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), // starts in 4 hours
      duration: '1.5 Hours',
      link: 'https://leetcode.com/contest/',
      secondsLeft: 4 * 60 * 60
    },
    {
      id: 'ct_2',
      title: 'Codeforces Round #995 (Div. 2)',
      platform: 'Codeforces',
      startTime: new Date(now.getTime() + 14 * 60 * 60 * 1000).toISOString(), // starts in 14 hours
      duration: '2 Hours',
      link: 'https://codeforces.com/contests',
      secondsLeft: 14 * 60 * 60
    },
    {
      id: 'ct_3',
      title: 'CodeChef Starters 168 (Div. 3)',
      platform: 'CodeChef',
      startTime: new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString(), // starts in 25 hours
      duration: '3 Hours',
      link: 'https://www.codechef.com/contests',
      secondsLeft: 25 * 60 * 60
    }
  ];
};
