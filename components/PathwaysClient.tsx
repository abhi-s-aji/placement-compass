'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from './ProgressBar';
import { createClient } from '@/lib/supabase/client';
import {
  saveCustomPathwayAction,
  getUserPathwaysAction,
  deletePathwayAction,
  sharePathwayAction,
  importSharedPathwayAction,
  getSharedPathwayAction
} from '@/app/actions/resume-templates';

interface PathwaysClientProps {
  userId: string;
}

// ----------------------------------------------------
// 20 PREBUILT LEARNING PATHWAYS CONFIG
// ----------------------------------------------------
const PREBUILT_PATHWAYS = [
  {
    id: 'pb-fullstack',
    title: 'Full Stack Developer',
    description: 'Master frontend styling, interactive frameworks, and backend API routing.',
    difficulty: 'Intermediate',
    steps: [
      { id: 'pb-fs-1', title: 'Learn Web Fundamentals', description: 'Study HTML, CSS, and basic JavaScript layouts.', url: 'https://developer.mozilla.org', resourceName: 'MDN Web Docs' },
      { id: 'pb-fs-2', title: 'Learn Modern CSS Styling', description: 'Design responsive grids and layouts with Tailwind.', url: 'https://tailwindcss.com/docs', resourceName: 'Tailwind CSS Docs' },
      { id: 'pb-fs-3', title: 'Learn Frontend React Library', description: 'Understand component states, hooks, and lifecycle events.', url: 'https://react.dev', resourceName: 'React Docs' },
      { id: 'pb-fs-4', title: 'Learn Server-Side Next.js Framework', description: 'Master Server Components, client routing, and optimization.', url: 'https://nextjs.org/docs', resourceName: 'Next.js Docs' }
    ]
  },
  {
    id: 'pb-frontend',
    title: 'Frontend Developer',
    description: 'Focus on user interfaces, responsive design, React states, and Tailwind.',
    difficulty: 'Beginner',
    steps: [
      { id: 'pb-fe-1', title: 'HTML & CSS Layouts', description: 'Develop structured and responsive pages.', url: 'https://www.w3schools.com/html/', resourceName: 'W3Schools HTML' },
      { id: 'pb-fe-2', title: 'Modern CSS Flexbox & Grids', description: 'Master alignment and grid layouts.', url: 'https://css-tricks.com/', resourceName: 'CSS Tricks' },
      { id: 'pb-fe-3', title: 'React Hooks & State', description: 'Learn context and custom state management.', url: 'https://react.dev', resourceName: 'React Docs' }
    ]
  },
  {
    id: 'pb-backend',
    title: 'Backend Developer',
    description: 'Learn database designs, API routing, server frameworks, and security.',
    difficulty: 'Intermediate',
    steps: [
      { id: 'pb-be-1', title: 'Express & Node APIs', description: 'Implement REST APIs and middlewares.', url: 'https://expressjs.com', resourceName: 'Express Docs' },
      { id: 'pb-be-2', title: 'Relational Database Queries', description: 'Design SQL structures and execute optimizations.', url: 'https://www.w3schools.com/sql/', resourceName: 'SQL Tutorial' },
      { id: 'pb-be-3', title: 'Enterprise Backend Architectures', description: 'Use Java Spring Boot models.', url: 'https://spring.io', resourceName: 'Spring Docs' }
    ]
  },
  {
    id: 'pb-devops',
    title: 'DevOps Engineer',
    description: 'Build automated CI/CD pipelines, containerize projects, and configure servers.',
    difficulty: 'Advanced',
    steps: [
      { id: 'pb-do-1', title: 'Static Deployment', description: 'Deploy serverless and frontend builds.', url: 'https://vercel.com/docs', resourceName: 'Vercel Docs' },
      { id: 'pb-do-2', title: 'Docker Containers', description: 'Isolate software environments via Dockerfiles.', url: 'https://docs.docker.com', resourceName: 'Docker Guides' },
      { id: 'pb-do-3', title: 'GitHub Actions pipelines', description: 'Automate build and test integrations.', url: 'https://docs.github.com', resourceName: 'GitHub Actions Docs' }
    ]
  },
  {
    id: 'pb-cloud',
    title: 'Cloud Engineer',
    description: 'Manage virtual infrastructure, S3 storage, and serverless execution units.',
    difficulty: 'Intermediate',
    steps: [
      { id: 'pb-cl-1', title: 'Cloud Architectures', description: 'Provision computing servers and instances.', url: 'https://aws.amazon.com', resourceName: 'AWS Portal' },
      { id: 'pb-cl-2', title: 'Object Storage Buckets', description: 'Store and secure static assets in S3.', url: 'https://docs.aws.amazon.com/s3/', resourceName: 'AWS S3 Docs' },
      { id: 'pb-cl-3', title: 'Serverless Functions', description: 'Deploy triggered serverless code.', url: 'https://www.serverless.com', resourceName: 'Serverless Framework' }
    ]
  },
  {
    id: 'pb-cyber',
    title: 'Cybersecurity Analyst',
    description: 'Monitor system security compliance, evaluate network routes, and stop threats.',
    difficulty: 'Intermediate',
    steps: [
      { id: 'pb-cy-1', title: 'Network Protocols', description: 'Study TCP/IP, sockets, and standard routings.', url: 'https://www.cloudflare.com/learning/', resourceName: 'Cloudflare Learning' },
      { id: 'pb-cy-2', title: 'Exploit Vectors & OWASP', description: 'Mitigate injection and session leaks.', url: 'https://owasp.org', resourceName: 'OWASP Security List' },
      { id: 'pb-cy-3', title: 'Cryptography', description: 'Understand symmetric and asymmetric keys.', url: 'https://en.wikipedia.org/wiki/Cryptography', resourceName: 'Crypto Intro' }
    ]
  },
  {
    id: 'pb-hacking',
    title: 'Ethical Hacking',
    description: 'Perform penetration checks, scan ports, and compile security audits.',
    difficulty: 'Advanced',
    steps: [
      { id: 'pb-eh-1', title: 'Penetration Testing environments', description: 'Master Kali Linux utility arrays.', url: 'https://www.kali.org', resourceName: 'Kali Linux Manual' },
      { id: 'pb-eh-2', title: 'Network Scans & Audits', description: 'Scan ports and network topologies with Nmap.', url: 'https://nmap.org', resourceName: 'Nmap Manual' },
      { id: 'pb-eh-3', title: 'Metasploit Exploits', description: 'Audit security endpoints for software vulnerabilities.', url: 'https://www.metasploit.com', resourceName: 'Metasploit Tutorials' }
    ]
  },
  {
    id: 'pb-data-analyst',
    title: 'Data Analyst',
    description: 'Execute analytical queries, build clean dashboard visuals, and clean tables.',
    difficulty: 'Beginner',
    steps: [
      { id: 'pb-da-1', title: 'Database SQL Queries', description: 'Write standard select statements and joins.', url: 'https://mode.com/sql-tutorial/', resourceName: 'Mode SQL Guide' },
      { id: 'pb-da-2', title: 'Data Visualizations', description: 'Construct interactive visuals in Tableau.', url: 'https://public.tableau.com', resourceName: 'Tableau Public' },
      { id: 'pb-da-3', title: 'Python Pandas Dataframes', description: 'Import and clean structured CSV files.', url: 'https://pandas.pydata.org', resourceName: 'Pandas Documentation' }
    ]
  },
  {
    id: 'pb-data-scientist',
    title: 'Data Scientist',
    description: 'Build predictive statistical models, clean tabular sets, and run calculations.',
    difficulty: 'Intermediate',
    steps: [
      { id: 'pb-ds-1', title: 'Statistical Analysis', description: 'Master matrices and vectors with NumPy.', url: 'https://numpy.org', resourceName: 'NumPy Guides' },
      { id: 'pb-ds-2', title: 'Tabular manipulation', description: 'Transform datasets via Pandas arrays.', url: 'https://pandas.pydata.org', resourceName: 'Pandas Sheets' },
      { id: 'pb-ds-3', title: 'Predictive Modeling', description: 'Fit linear models and classifications with Scikit-Learn.', url: 'https://scikit-learn.org', resourceName: 'Scikit-Learn Docs' }
    ]
  },
  {
    id: 'pb-aiml',
    title: 'AI/ML Engineer',
    description: 'Train neural models, write deep logic pipelines, and integrate LLM pipelines.',
    difficulty: 'Advanced',
    steps: [
      { id: 'pb-ai-1', title: 'Mathematics for Machine Learning', description: 'Understand calculus and probability distributions.', url: 'https://www.coursera.org/specializations/mathematics-machine-learning', resourceName: 'Math for ML' },
      { id: 'pb-ai-2', title: 'Deep Learning frameworks', description: 'Build and train neural nodes with PyTorch.', url: 'https://pytorch.org', resourceName: 'PyTorch Tutorials' },
      { id: 'pb-ai-3', title: 'LLM & Transformers integrations', description: 'Use Hugging Face API pipelines.', url: 'https://huggingface.co/learn', resourceName: 'Hugging Face Course' }
    ]
  },
  {
    id: 'pb-mobile',
    title: 'Mobile App Developer',
    description: 'Build cross-platform client interfaces for mobile iOS and Android.',
    difficulty: 'Intermediate',
    steps: [
      { id: 'pb-mo-1', title: 'Native UI Layouts', description: 'Design native layouts using React Native components.', url: 'https://reactnative.dev', resourceName: 'React Native Docs' },
      { id: 'pb-mo-2', title: 'Redux State Controls', description: 'Track client parameters across app screens.', url: 'https://redux-toolkit.js.org', resourceName: 'Redux Toolkit' },
      { id: 'pb-mo-3', title: 'Store Publishing', description: 'Prepare assets and bundles for app stores.', url: 'https://developer.apple.com', resourceName: 'Apple Developer' }
    ]
  },
  {
    id: 'pb-game',
    title: 'Game Developer',
    description: 'Write physics engines, build 2D/3D interactions, and manage assets.',
    difficulty: 'Intermediate',
    steps: [
      { id: 'pb-gd-1', title: 'C# Programming Language', description: 'Learn class structures, types, and logic flow.', url: 'https://learn.microsoft.com', resourceName: 'Microsoft Learn' },
      { id: 'pb-gd-2', title: 'Unity Game Engine', description: 'Understand objects, scenes, and editor UI.', url: 'https://learn.unity.com', resourceName: 'Unity Learn' },
      { id: 'pb-gd-3', title: '3D Game Physics', description: 'Configure colliders, force scripts, and rigid bodies.', url: 'https://unity.com', resourceName: 'Unity Guides' }
    ]
  },
  {
    id: 'pb-swe-core',
    title: 'Software Engineer Core',
    description: 'Master core computer science algorithms, systems, and memory constraints.',
    difficulty: 'Intermediate',
    steps: [
      { id: 'pb-sw-1', title: 'Computer Science fundamentals', description: 'Outline data types, architectures, and networks.', url: 'https://roadmap.sh/computer-science', resourceName: 'CS Roadmap' },
      { id: 'pb-sw-2', title: 'Object-Oriented Design (OOP)', description: 'Master encapsulation, polymorphism, and classes.', url: 'https://en.wikipedia.org/wiki/Object-oriented_programming', resourceName: 'OOP Wiki' },
      { id: 'pb-sw-3', title: 'Operating Systems & Memory', description: 'Study process virtualization and memory cycles.', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', resourceName: 'Three Easy Pieces Book' }
    ]
  },
  {
    id: 'pb-dsa-mastery',
    title: 'DSA Mastery',
    description: 'Study complex graphs, trees, search nodes, and dynamic programming.',
    difficulty: 'Advanced',
    steps: [
      { id: 'pb-dsam-1', title: 'Practice Problems', description: 'Solve string and array problems.', url: 'https://neetcode.io', resourceName: 'NeetCode Patterns' },
      { id: 'pb-dsam-2', title: 'Solve Graph Algorithms', description: 'Master BFS, DFS, and Tree traversals.', url: 'https://takeuforward.org', resourceName: 'Striver Sheets' },
      { id: 'pb-dsam-3', title: 'Competitive Challenges', description: 'Run timed contests.', url: 'https://codeforces.com', resourceName: 'Codeforces Rounds' }
    ]
  },
  {
    id: 'pb-sysdesign',
    title: 'System Design',
    description: 'Scale databases, design proxy routing tiers, and cache requests.',
    difficulty: 'Advanced',
    steps: [
      { id: 'pb-sd-1', title: 'Scalability Foundations', description: 'Avoid single-point failures and balance load.', url: 'https://github.com/donnemartin/system-design-primer', resourceName: 'System Design Primer' },
      { id: 'pb-sd-2', title: 'High-Volume Systems', description: 'Study CDN and cache layer designs.', url: 'https://bytebytego.com/', resourceName: 'ByteByteGo' },
      { id: 'pb-sd-3', title: 'Distributed Microservices', description: 'Master message streams and consistency rules.', url: 'https://martinfowler.com', resourceName: 'Martin Fowler Guides' }
    ]
  },
  {
    id: 'pb-linux',
    title: 'Linux Mastery',
    description: 'Master bash navigation syntax, process listings, and shell scripts.',
    difficulty: 'Beginner',
    steps: [
      { id: 'pb-li-1', title: 'Shell Command Basics', description: 'Learn cd, ls, permissions, and htop.', url: 'https://linuxcommand.org', resourceName: 'Linux Commands' },
      { id: 'pb-li-2', title: 'Bash scripting automations', description: 'Write automated routines and scripts.', url: 'https://tldp.org/LDP/Bash-Beginners-Guide/html/', resourceName: 'Bash Guide' },
      { id: 'pb-li-3', title: 'Systemd & Process states', description: 'Manage background daemons.', url: 'https://systemd.io', resourceName: 'Systemd Docs' }
    ]
  },
  {
    id: 'pb-git',
    title: 'Git and GitHub',
    description: 'Manage codebase version control history, branches, and conflict merges.',
    difficulty: 'Beginner',
    steps: [
      { id: 'pb-gt-1', title: 'Distributed Version Controls', description: 'Understand commits, branching, and origin link setup.', url: 'https://git-scm.com/doc', resourceName: 'Git Handbook' },
      { id: 'pb-gt-2', title: 'GitHub Pull Requests', description: 'Open, review, and merge code segments.', url: 'https://docs.github.com', resourceName: 'GitHub Manual' },
      { id: 'pb-gt-3', title: 'Resolving Merge Conflicts', description: 'Use git diff to align parallel branches.', url: 'https://git-scm.com/docs/git-merge', resourceName: 'Merge Manual' }
    ]
  },
  {
    id: 'pb-web-beginner',
    title: 'Web Development Beginner',
    description: 'Learn semantic HTML formatting, responsive CSS styling, and JS click interactions.',
    difficulty: 'Beginner',
    steps: [
      { id: 'pb-wb-1', title: 'HTML Document tags', description: 'Format document nodes, forms, and headers.', url: 'https://www.w3schools.com/html/', resourceName: 'HTML Tutorial' },
      { id: 'pb-wb-2', title: 'CSS Layout alignments', description: 'Learn style sheets, padding, margins, and layouts.', url: 'https://www.w3schools.com/css/', resourceName: 'CSS Guide' },
      { id: 'pb-wb-3', title: 'JavaScript DOM Events', description: 'Add click triggers and basic state swaps.', url: 'https://www.w3schools.com/js/', resourceName: 'JS Basics' }
    ]
  },
  {
    id: 'pb-python-dev',
    title: 'Python Developer',
    description: 'Learn core Python scripting, script automations, and Django backend code.',
    difficulty: 'Beginner',
    steps: [
      { id: 'pb-py-1', title: 'Python syntax rules', description: 'Write basic loops, variables, and arrays.', url: 'https://docs.python.org/3/', resourceName: 'Python Docs' },
      { id: 'pb-py-2', title: 'Web frameworks', description: 'Deploy MVC server logic using Django views.', url: 'https://docs.djangoproject.com', resourceName: 'Django Docs' },
      { id: 'pb-py-3', title: 'Routines automations', description: 'Compile system scripts and API requests.', url: 'https://realpython.com', resourceName: 'Real Python' }
    ]
  },
  {
    id: 'pb-java-dev',
    title: 'Java Developer',
    description: 'Master object oriented Java classes, Spring Boot endpoints, and Maven builds.',
    difficulty: 'Intermediate',
    steps: [
      { id: 'pb-ja-1', title: 'Java Core Class rules', description: 'Implement interfaces, lists, and exception blocks.', url: 'https://dev.java', resourceName: 'Dev Java Portal' },
      { id: 'pb-ja-2', title: 'Spring Boot REST APIs', description: 'Expose REST routes and inject beans.', url: 'https://spring.io', resourceName: 'Spring Guides' },
      { id: 'pb-ja-3', title: 'Maven Build dependencies', description: 'Declare library scopes and compile JARs.', url: 'https://maven.apache.org', resourceName: 'Maven Manual' }
    ]
  }
];

// ----------------------------------------------------
// PREBUILT LEARNING TODO LISTS CONFIG
// ----------------------------------------------------
const PREBUILT_TODOS = [
  {
    id: 'todo-git',
    title: 'Git & GitHub Basics',
    steps: [
      { id: 'td-git-1', text: 'Initialize repository (git init)' },
      { id: 'td-git-2', text: 'Stage and commit files (git add ., git commit)' },
      { id: 'td-git-3', text: 'Link origin and push code (git push origin main)' },
      { id: 'td-git-4', text: 'Create branching layout (git checkout -b feature)' }
    ]
  },
  {
    id: 'todo-linux',
    title: 'Linux Essentials',
    steps: [
      { id: 'td-lin-1', text: 'Navigation controls (ls, cd, pwd)' },
      { id: 'td-lin-2', text: 'Files creation & copy (mkdir, touch, cp, mv)' },
      { id: 'td-lin-3', text: 'Terminal deletions (rm, rmdir)' },
      { id: 'td-lin-4', text: 'Access and permissions (chmod, chown)' }
    ]
  },
  {
    id: 'todo-cloud',
    title: 'Cloud Fundamentals',
    steps: [
      { id: 'td-cld-1', text: 'Deploy static hosting (Vercel or Netlify)' },
      { id: 'td-cld-2', text: 'Configure a virtual server machine (AWS EC2)' },
      { id: 'td-cld-3', text: 'Study cloud storage Buckets (AWS S3)' }
    ]
  },
  {
    id: 'todo-web',
    title: 'Web Development Basics',
    steps: [
      { id: 'td-web-1', text: 'Structure semantic HTML elements' },
      { id: 'td-web-2', text: 'Apply media queries styling for mobile view' },
      { id: 'td-web-3', text: 'Add interactive element click events in JS' }
    ]
  },
  {
    id: 'todo-prog',
    title: 'Programming Fundamentals',
    steps: [
      { id: 'td-prg-1', text: 'Understand variables declarations and datatypes' },
      { id: 'td-prg-2', text: 'Write standard for/while loop sequences' },
      { id: 'td-prg-3', text: 'Define modular functions with parameters' }
    ]
  },
  {
    id: 'todo-system',
    title: 'System Design Basics',
    steps: [
      { id: 'td-sys-1', text: 'Understand Client-Server requests model' },
      { id: 'td-sys-2', text: 'Study Redis cache storage applications' },
      { id: 'td-sys-3', text: 'Study Load Balancer traffic routing features' }
    ]
  }
];

export default function PathwaysClient({ userId }: PathwaysClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'prebuilt' | 'custom' | 'todos' | 'import'>('prebuilt');
  const [isPending, startTransition] = useTransition();

  // Progress mapping for checklists
  const [progressMap, setProgressMap] = useState<Record<string, string[]>>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Custom Todo Lists State (representing Custom Todo Lists)
  const [customPathways, setCustomPathways] = useState<any[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customSteps, setCustomSteps] = useState<Array<{ id: string; title: string; description: string; url: string; resourceName: string; completed: boolean }>>([]);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepUrl, setNewStepUrl] = useState('');
  const [newStepResourceName, setNewStepResourceName] = useState('');

  // Import states
  const [importCode, setImportCode] = useState('');
  const [sharedPathway, setSharedPathway] = useState<any | null>(null);
  const [shareCodeParam, setShareCodeParam] = useState<string | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // ----------------------------------------------------
  // LOAD DATA & PROGRESS ON MOUNT
  // ----------------------------------------------------
  useEffect(() => {
    async function loadData() {
      setIsLoadingProgress(true);
      const supabase = createClient();

      // 1. Fetch prebuilt & todo progress from database
      try {
        const { data, error } = await supabase
          .from('career_path_progress')
          .select('*')
          .eq('user_id', userId);

        if (!error && data) {
          const map: Record<string, string[]> = {};
          for (const row of data) {
            map[row.path_id] = row.completed_steps || [];
          }
          setProgressMap(map);
        }
      } catch (err) {
        console.warn('Failed to load database progress, loading local cache:', err);
      }

      // Offline localStorage fallback with try/catch
      try {
        const local = localStorage.getItem(`pathways_progress_${userId}`);
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && typeof parsed === 'object') {
            setProgressMap(prev => ({ ...prev, ...parsed }));
          }
        }
      } catch (e) {
        console.error('Local storage read error:', e);
      }

      // 2. Fetch custom pathways
      const pathRes = await getUserPathwaysAction();
      if (pathRes.success && pathRes.data) {
        setCustomPathways(pathRes.data);
      }

      setIsLoadingProgress(false);
    }

    loadData();

    // Check shared query parameter
    const searchParams = new URLSearchParams(window.location.search);
    const share = searchParams.get('share');
    if (share && share.startsWith('P-')) {
      setShareCodeParam(share);
      setActiveTab('import');
      async function loadShared() {
        const res = await getSharedPathwayAction(share as string);
        if (res.success && res.data) {
          setSharedPathway(res.data);
          setMessage({ type: 'success', text: `Shared learning path "${res.data.title}" loaded in preview!` });
        } else {
          setMessage({ type: 'error', text: res.error || 'Failed to load shared pathway.' });
        }
      }
      loadShared();
    }
  }, [userId]);

  // ----------------------------------------------------
  // PREBUILT STEP CHECKBOX HANDLERS
  // ----------------------------------------------------
  async function handleTogglePrebuiltStep(pathwayId: string, stepId: string) {
    const current = progressMap[pathwayId] || [];
    const updated = current.includes(stepId)
      ? current.filter(id => id !== stepId)
      : [...current, stepId];

    // Optimistic Update
    const newMap = { ...progressMap, [pathwayId]: updated };
    setProgressMap(newMap);

    // Save to local storage cache
    try {
      localStorage.setItem(`pathways_progress_${userId}`, JSON.stringify(newMap));
    } catch (e) {
      console.error(e);
    }

    // Save to database
    const supabase = createClient();
    try {
      await supabase
        .from('career_path_progress')
        .upsert({
          user_id: userId,
          path_id: pathwayId,
          completed_steps: updated,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,path_id' });
    } catch (e) {
      console.warn('Supabase sync offline:', e);
    }
  }

  // ----------------------------------------------------
  // CUSTOM PATHWAYS OPERATIONS
  // ----------------------------------------------------
  function addStepToBuilder() {
    if (!newStepTitle.trim()) return;
    setCustomSteps(prev => [
      ...prev,
      {
        id: 'step-' + Math.random().toString(36).substring(2, 9),
        title: newStepTitle.trim(),
        description: newStepDesc.trim(),
        url: newStepUrl.trim(),
        resourceName: newStepResourceName.trim() || 'Link',
        completed: false
      }
    ]);
    setNewStepTitle('');
    setNewStepDesc('');
    setNewStepUrl('');
    setNewStepResourceName('');
  }

  function removeStepFromBuilder(index: number) {
    setCustomSteps(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSaveCustomPathway() {
    if (!customTitle.trim()) {
      setMessage({ type: 'error', text: 'Todo list title is required.' });
      return;
    }

    startTransition(async () => {
      const res = await saveCustomPathwayAction(undefined, customTitle, customDescription, customSteps);
      if (res.success && res.data) {
        setCustomPathways(prev => [res.data, ...prev]);
        setCustomTitle('');
        setCustomDescription('');
        setCustomSteps([]);
        setMessage({ type: 'success', text: 'Custom todo list saved successfully!' });
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to save todo list.' });
      }
    });
  }

  async function handleDeletePathway(id: string) {
    startTransition(async () => {
      const res = await deletePathwayAction(id);
      if (res.success) {
        setCustomPathways(prev => prev.filter(p => p.id !== id));
        setMessage({ type: 'success', text: 'Todo list deleted.' });
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to delete.' });
      }
    });
  }

  async function handleSharePathway(id: string) {
    const res = await sharePathwayAction(id);
    if (res.success && res.shareCode) {
      const url = `${window.location.origin}/student/pathways?share=${res.shareCode}`;
      setShareUrl(url);
      setMessage({ type: 'success', text: 'Share link generated and displayed below.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to share.' });
    }
  }

  // Handle step checks on custom pathways
  async function handleToggleCustomStep(pathway: any, stepId: string) {
    const updatedSteps = pathway.steps.map((s: any) => {
      if (s.id === stepId) {
        return { ...s, completed: !s.completed };
      }
      return s;
    });

    const completedCount = updatedSteps.filter((s: any) => s.completed).length;
    const progressPct = Math.round((completedCount / updatedSteps.length) * 100);

    // Optimistic UI update
    setCustomPathways(prev =>
      prev.map(p => {
        if (p.id === pathway.id) {
          return { ...p, steps: updatedSteps, progress: progressPct };
        }
        return p;
      })
    );

    // Save to database
    await saveCustomPathwayAction(pathway.id, pathway.title, pathway.description, updatedSteps, progressPct);
  }

  // ----------------------------------------------------
  // IMPORT PIPELINE
  // ----------------------------------------------------
  async function handleLoadCode() {
    if (!importCode.trim()) return;
    const code = importCode.trim().split('share=').pop() || importCode.trim();
    setShareCodeParam(code);

    const res = await getSharedPathwayAction(code);
    if (res.success && res.data) {
      setSharedPathway(res.data);
      setMessage({ type: 'success', text: 'Shared pathway loaded successfully!' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Shared pathway not found.' });
    }
  }

  async function handleImportShared() {
    if (!shareCodeParam) return;
    startTransition(async () => {
      const res = await importSharedPathwayAction(shareCodeParam);
      if (res.success && res.data) {
        setCustomPathways(prev => [res.data, ...prev]);
        setSharedPathway(null);
        setShareCodeParam(null);
        setImportCode('');
        setActiveTab('custom');
        setMessage({ type: 'success', text: 'Pathway cloned and imported to your account!' });
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to import pathway.' });
      }
    });
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Learning Pathways</h1>
        </div>
      </div>

      <div className="page-body flex flex-col gap-6">
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        
        {shareUrl && (
          <div className="alert alert-success flex flex-col gap-2">
            <span>Pathway Share Link:</span>
            <input type="text" readOnly className="input" value={shareUrl} onClick={e => (e.target as any).select()} />
          </div>
        )}

        {/* Tab Selection */}
        <div className="card card-sm flex" style={{ flexDirection: 'row', gap: '0.25rem', overflowX: 'auto', padding: '0.5rem' }}>
          <button onClick={() => setActiveTab('prebuilt')} className={`btn btn-sm ${activeTab === 'prebuilt' ? 'btn-primary' : 'btn-ghost'}`}>
            Prebuilt Pathways
          </button>
          <button onClick={() => setActiveTab('custom')} className={`btn btn-sm ${activeTab === 'custom' ? 'btn-primary' : 'btn-ghost'}`}>
            Custom Todo Lists
          </button>
          <button onClick={() => setActiveTab('todos')} className={`btn btn-sm ${activeTab === 'todos' ? 'btn-primary' : 'btn-ghost'}`}>
            Learning Todo Lists
          </button>
          <button onClick={() => setActiveTab('import')} className={`btn btn-sm ${activeTab === 'import' ? 'btn-primary' : 'btn-ghost'}`}>
            Import Shared Link
          </button>
        </div>

        {/* PREBUILT TAB */}
        {activeTab === 'prebuilt' && (
          <div className="grid-2" style={{ gap: 'var(--space-6)' }}>
            {PREBUILT_PATHWAYS.map(path => {
              const completed = progressMap[path.id] || [];
              const pct = Math.round((completed.length / path.steps.length) * 100);

              return (
                <div key={path.id} className="card flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="badge badge-brand">{path.difficulty}</span>
                      <span className="text-xs text-muted">{pct}% Done</span>
                    </div>
                    <h3 className="card-title text-md font-semibold text-primary">{path.title}</h3>
                    <p className="card-subtitle mt-1 text-xs">{path.description}</p>

                    <div className="my-4">
                      <ProgressBar value={completed.length} max={path.steps.length} label={`${pct}%`} />
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      {path.steps.map(step => {
                        const isChecked = completed.includes(step.id);
                        return (
                          <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 10px', backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              style={{ marginTop: 2, cursor: 'pointer' }}
                              onChange={() => handleTogglePrebuiltStep(path.id, step.id)}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="text-xs font-semibold text-primary" style={{ textDecoration: isChecked ? 'line-through' : 'none' }}>
                                {step.title}
                              </div>
                              <p className="text-xxs text-muted mt-0.5">{step.description}</p>
                              {step.url && (
                                <a href={step.url} target="_blank" rel="noopener noreferrer" className="text-xxs text-brand hover:underline mt-1 block">
                                  Reference: {step.resourceName} ↗
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CUSTOM TODO LISTS TAB */}
        {activeTab === 'custom' && (
          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-6)', alignItems: 'start' }}>
            {/* Left Side: Create List */}
            <div className="card flex flex-col gap-4">
              <h3 className="text-md font-semibold text-primary">Create Custom Todo List</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="cw-title">Todo List Title</label>
                <input id="cw-title" className="input" placeholder="e.g. Master Django" value={customTitle} onChange={e => setCustomTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cw-desc">Description</label>
                <input id="cw-desc" className="input" placeholder="e.g. Topics to study this month" value={customDescription} onChange={e => setCustomDescription(e.target.value)} />
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 className="text-xs font-bold text-secondary uppercase">Add Tasks</h4>
                <input className="input" placeholder="Task Title" value={newStepTitle} onChange={e => setNewStepTitle(e.target.value)} />
                <input className="input" placeholder="Task Description" value={newStepDesc} onChange={e => setNewStepDesc(e.target.value)} />
                <input className="input" placeholder="Learning Resource Link (URL)" value={newStepUrl} onChange={e => setNewStepUrl(e.target.value)} />
                <input className="input" placeholder="Resource Label (e.g. Python Docs)" value={newStepResourceName} onChange={e => setNewStepResourceName(e.target.value)} />
                <button className="btn btn-secondary btn-sm" onClick={addStepToBuilder}>+ Add Task</button>
              </div>

              {customSteps.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {customSteps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                      <span className="text-xs text-primary">{step.title}</span>
                      <button className="btn btn-ghost btn-sm text-error" onClick={() => removeStepFromBuilder(idx)}>&times; Remove</button>
                    </div>
                  ))}
                </div>
              )}

              <button className="btn btn-primary" onClick={handleSaveCustomPathway} disabled={isPending || !customTitle.trim()}>
                Save Todo List
              </button>
            </div>

            {/* Right Side: Saved Lists */}
            <div className="flex flex-col gap-4">
              <h3 className="text-md font-semibold text-primary">Your Custom Todo Lists</h3>
              {customPathways.length === 0 ? (
                <p className="text-sm text-muted card text-center p-6">You have not created any custom todo lists yet.</p>
              ) : (
                customPathways.map(pathway => (
                  <div key={pathway.id} className="card flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-md font-bold text-primary">{pathway.title}</h4>
                        <p className="text-xs text-secondary mt-1">{pathway.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={() => handleSharePathway(pathway.id)}>Share</button>
                        <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDeletePathway(pathway.id)}>Delete</button>
                      </div>
                    </div>

                    <div className="my-2">
                      <ProgressBar value={pathway.progress} max={100} label={`${pathway.progress}% Completed`} />
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      {(pathway.steps || []).map((step: any) => (
                        <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                          <input
                            type="checkbox"
                            checked={step.completed}
                            onChange={() => handleToggleCustomStep(pathway, step.id)}
                            style={{ cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span className="text-xs font-semibold text-primary" style={{ textDecoration: step.completed ? 'line-through' : 'none' }}>{step.title}</span>
                            {step.description && <p className="text-xxs text-muted mt-0.5">{step.description}</p>}
                            {step.url && (
                              <a href={step.url} target="_blank" rel="noopener noreferrer" className="text-xxs text-brand hover:underline mt-0.5 block">
                                Reference: {step.resourceName} ↗
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* LEARNING TODO LISTS TAB */}
        {activeTab === 'todos' && (
          <div className="grid-3" style={{ gap: 'var(--space-6)' }}>
            {PREBUILT_TODOS.map(todo => {
              const completed = progressMap[todo.id] || [];
              const pct = Math.round((completed.length / todo.steps.length) * 100);

              return (
                <div key={todo.id} className="card flex flex-col justify-between">
                  <div>
                    <h3 className="card-title text-sm font-semibold text-primary">{todo.title}</h3>
                    
                    <div className="my-3">
                      <ProgressBar value={completed.length} max={todo.steps.length} label={`${pct}%`} />
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      {todo.steps.map(step => {
                        const isChecked = completed.includes(step.id);
                        return (
                          <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              style={{ cursor: 'pointer' }}
                              onChange={() => handleTogglePrebuiltStep(todo.id, step.id)}
                            />
                            <span className="text-xs text-primary" style={{ textDecoration: isChecked ? 'line-through' : 'none' }}>
                              {step.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* IMPORT TAB */}
        {activeTab === 'import' && (
          <div className="card flex flex-col gap-4">
            <h3 className="text-md font-semibold text-primary">Import Shared Pathway</h3>
            <p className="text-xs text-muted">Paste the share code or share URL of a learning pathway to import it instantly into your profile.</p>

            <div className="flex gap-2">
              <input className="input" placeholder="e.g. P-ABC123D or copy-pasted URL" value={importCode} onChange={e => setImportCode(e.target.value)} />
              <button className="btn btn-secondary" onClick={handleLoadCode}>Load Link</button>
            </div>

            {sharedPathway && (
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'rgba(99, 102, 241, 0.02)', marginTop: '1rem' }} className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-md font-bold text-primary">{sharedPathway.title}</h4>
                    <p className="text-xs text-secondary mt-1">{sharedPathway.description}</p>
                  </div>
                  <button className="btn btn-primary" onClick={handleImportShared} disabled={isPending}>
                    Copy to My Account
                  </button>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  {(sharedPathway.steps || []).map((step: any) => (
                    <div key={step.id} style={{ padding: '6px 10px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                      <div className="text-xs font-semibold text-primary">{step.title}</div>
                      {step.description && <p className="text-xxs text-muted mt-0.5">{step.description}</p>}
                      {step.url && <span className="text-xxs text-brand mt-0.5 block">Resource: {step.resourceName}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
