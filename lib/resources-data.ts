export interface Resource {
  id: string;
  name: string;
  category: 'dsa' | 'web-dev' | 'backend' | 'system-design' | 'dev-tools';
  description: string;
  url: string;
  skills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'docs' | 'video' | 'practice' | 'article';
}

export const SKILL_LIST = [
  'DSA',
  'React',
  'Python',
  'Django',
  'Java',
  'SQL',
  'System Design',
  'HTML',
  'CSS',
  'JavaScript',
  'Node.js',
  'C++',
  'Git'
];

export const RESOURCES_DATA: Resource[] = [
  // ==========================================
  // PYTHON RESOURCES (Category: backend)
  // ==========================================
  {
    id: 'py-docs',
    name: 'Python Official Documentation',
    category: 'backend',
    description: 'Official Python standard library documentation, language reference, and tutorials.',
    url: 'https://docs.python.org/3/',
    skills: ['Python'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'py-video-fcc',
    name: 'Python for Beginners Video Course',
    category: 'backend',
    description: 'Comprehensive 4-hour video course on Python fundamentals by freeCodeCamp.',
    url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    skills: ['Python'],
    difficulty: 'Beginner',
    type: 'video'
  },
  {
    id: 'py-learn-interactive',
    name: 'Learn Python Interactive Tutorial',
    category: 'backend',
    description: 'Free interactive Python tutorial with in-browser code execution.',
    url: 'https://www.learnpython.org/',
    skills: ['Python'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'py-realpython',
    name: 'Real Python Tutorials',
    category: 'backend',
    description: 'High-quality, in-depth articles and guides for Python programmers of all levels.',
    url: 'https://realpython.com/',
    skills: ['Python'],
    difficulty: 'Intermediate',
    type: 'article'
  },
  {
    id: 'py-w3schools',
    name: 'W3Schools Python Course',
    category: 'backend',
    description: 'Easy-to-follow Python exercises, references, and quizzes.',
    url: 'https://www.w3schools.com/python/',
    skills: ['Python'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'py-py4e',
    name: 'Python for Everybody (PY4E)',
    category: 'backend',
    description: 'Comprehensive open textbook and lecture resource for learning Python database integration.',
    url: 'https://www.py4e.com/',
    skills: ['Python', 'SQL'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'py-fcc-prep',
    name: 'FreeCodeCamp Scientific Computing with Python',
    category: 'backend',
    description: 'Structured Python certification curriculum featuring projects and algorithms.',
    url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
    skills: ['Python', 'DSA'],
    difficulty: 'Intermediate',
    type: 'practice'
  },
  {
    id: 'py-cheatsheet',
    name: 'Python Cheat Sheet',
    category: 'backend',
    description: 'Reference sheet covering comprehensive Python syntax, style guides, and common modules.',
    url: 'https://www.pythoncheatsheet.org/',
    skills: ['Python'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'py-runestone',
    name: 'Interactive Runestone Python Course',
    category: 'backend',
    description: 'Open-source interactive learning textbooks on Python programming logic.',
    url: 'https://runestone.academy/',
    skills: ['Python'],
    difficulty: 'Intermediate',
    type: 'practice'
  },
  {
    id: 'py-gfg',
    name: 'GeeksforGeeks Python Programming Language',
    category: 'backend',
    description: 'Wide library of articles covering Python basics, libraries, and advanced constructs.',
    url: 'https://www.geeksforgeeks.org/python-programming-language/',
    skills: ['Python'],
    difficulty: 'Intermediate',
    type: 'article'
  },
  {
    id: 'py-google',
    name: "Google's Python Class",
    category: 'backend',
    description: 'Free class for people with a little programming experience who want to learn Python.',
    url: 'https://developers.google.com/edu/python/',
    skills: ['Python'],
    difficulty: 'Intermediate',
    type: 'docs'
  },
  {
    id: 'py-programiz',
    name: 'Programiz Python Guide',
    category: 'backend',
    description: 'Step-by-step Python tutorials with examples, compilers, and reference manuals.',
    url: 'https://www.programiz.com/python-programming',
    skills: ['Python'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'py-corey',
    name: 'Corey Schafer Python Tutorials',
    category: 'backend',
    description: 'Detailed video playlist covering OOP, scripting, deployment, and Django.',
    url: 'https://www.youtube.com/user/schafer5',
    skills: ['Python', 'Django'],
    difficulty: 'Advanced',
    type: 'video'
  },

  // ==========================================
  // JAVA RESOURCES (Category: backend)
  // ==========================================
  {
    id: 'java-docs',
    name: 'Java Official Documentation',
    category: 'backend',
    description: 'Oracle official guides, APIs specification, and tutorial packages for Java.',
    url: 'https://docs.oracle.com/en/java/',
    skills: ['Java'],
    difficulty: 'Intermediate',
    type: 'docs'
  },
  {
    id: 'java-fcc-video',
    name: 'Java Programming for Beginners fcc',
    category: 'backend',
    description: 'Full video course to master object-oriented concepts and Java syntax.',
    url: 'https://www.youtube.com/watch?v=grEKMHGYyns',
    skills: ['Java'],
    difficulty: 'Beginner',
    type: 'video'
  },
  {
    id: 'java-baeldung',
    name: 'Baeldung Java Tutorials',
    category: 'backend',
    description: 'Highly detailed Java guides focusing on Spring, Spring Boot, and modern Java features.',
    url: 'https://www.baeldung.com/',
    skills: ['Java', 'Spring Boot'],
    difficulty: 'Advanced',
    type: 'article'
  },
  {
    id: 'java-w3schools',
    name: 'W3Schools Java Course',
    category: 'backend',
    description: 'Structured tutorials, interactive exercises, and reference code for Java developers.',
    url: 'https://www.w3schools.com/java/',
    skills: ['Java'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'java-gfg',
    name: 'GeeksforGeeks Java Programming',
    category: 'backend',
    description: 'Extensive directory of Java programming articles, standard libraries, and frameworks.',
    url: 'https://www.geeksforgeeks.org/java/',
    skills: ['Java'],
    difficulty: 'Intermediate',
    type: 'article'
  },
  {
    id: 'java-brains',
    name: 'Java Brains Tutorials',
    category: 'backend',
    description: 'Professional video courses covering Spring Boot, Hibernate, and microservices.',
    url: 'https://javabrains.io/',
    skills: ['Java', 'Spring Boot'],
    difficulty: 'Advanced',
    type: 'video'
  },
  {
    id: 'java-helsinki',
    name: 'Helsinki MOOC Java Course',
    category: 'backend',
    description: 'Highly rated programming course covering Java syntax, OOP, and data structures.',
    url: 'https://java-programming.mooc.fi/',
    skills: ['Java', 'DSA'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'java-programiz',
    name: 'Programiz Java Programming',
    category: 'backend',
    description: 'Reference-based Java tutorial targeting classes, inheritance, and exception flows.',
    url: 'https://www.programiz.com/java-programming',
    skills: ['Java'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'java-banas',
    name: 'Derek Banas Java Video Tutorial',
    category: 'backend',
    description: 'Comprehensive, fast-paced video walk-through of Java core elements.',
    url: 'https://www.youtube.com/watch?v=WPvGqX-TxP0',
    skills: ['Java'],
    difficulty: 'Intermediate',
    type: 'video'
  },
  {
    id: 'java-learn-online',
    name: 'Learn Java Online',
    category: 'backend',
    description: 'Interactive Java tutorial where you can write and execute code in real-time.',
    url: 'https://www.learnjavaonline.org/',
    skills: ['Java'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'java-dev-oracle',
    name: 'Dev.java by Oracle',
    category: 'backend',
    description: 'Official Java developer portal filled with articles, release updates, and learning paths.',
    url: 'https://dev.java/',
    skills: ['Java'],
    difficulty: 'Intermediate',
    type: 'docs'
  },
  {
    id: 'java-tutorialspoint',
    name: 'Tutorialspoint Java Guide',
    category: 'backend',
    description: 'Step-by-step developer guides covering basic utility libraries and Java networking.',
    url: 'https://www.tutorialspoint.com/java/index.htm',
    skills: ['Java'],
    difficulty: 'Intermediate',
    type: 'docs'
  },
  {
    id: 'java-jetbrains',
    name: 'JetBrains Academy Java Track',
    category: 'backend',
    description: 'Project-based Java learning path with IDE integrations and interactive coding tests.',
    url: 'https://hyperskill.org/tracks/8',
    skills: ['Java'],
    difficulty: 'Advanced',
    type: 'practice'
  },

  // ==========================================
  // WEB DEVELOPMENT (Category: web-dev)
  // ==========================================
  {
    id: 'web-mdn',
    name: 'MDN Web Docs',
    category: 'web-dev',
    description: 'The premier reference for web technologies including HTML5, CSS3, and JavaScript APIs.',
    url: 'https://developer.mozilla.org',
    skills: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'web-react-docs',
    name: 'React Documentation',
    category: 'web-dev',
    description: 'Official reference docs for hooks, rendering, state management, and modern patterns.',
    url: 'https://react.dev',
    skills: ['React', 'JavaScript'],
    difficulty: 'Intermediate',
    type: 'docs'
  },
  {
    id: 'web-next-docs',
    name: 'Next.js App Router Guide',
    category: 'web-dev',
    description: 'Comprehensive Next.js reference on routing, server components, and optimizations.',
    url: 'https://nextjs.org/docs',
    skills: ['React', 'JavaScript'],
    difficulty: 'Advanced',
    type: 'docs'
  },
  {
    id: 'web-tailwind-docs',
    name: 'Tailwind CSS Style Docs',
    category: 'web-dev',
    description: 'Utility-first styling utility documentation for custom, responsive layouts.',
    url: 'https://tailwindcss.com/docs',
    skills: ['CSS'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'web-fcc-design',
    name: 'FreeCodeCamp Responsive Web Design',
    category: 'web-dev',
    description: 'Complete hands-on certification curriculum focused on HTML5/CSS layouts and grids.',
    url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    skills: ['HTML', 'CSS'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'web-js-info',
    name: 'JavaScript.info Comprehensive',
    category: 'web-dev',
    description: 'Detailed, modular articles covering JavaScript from basics to advanced patterns.',
    url: 'https://javascript.info/',
    skills: ['JavaScript'],
    difficulty: 'Intermediate',
    type: 'article'
  },
  {
    id: 'web-css-tricks',
    name: 'CSS-Tricks Grid & Flexbox Guide',
    category: 'web-dev',
    description: 'Detailed, highly visual layout guides covering Flexbox grids and alignment.',
    url: 'https://css-tricks.com/',
    skills: ['CSS'],
    difficulty: 'Intermediate',
    type: 'article'
  },
  {
    id: 'web-femasters',
    name: 'Frontend Masters Learning Paths',
    category: 'web-dev',
    description: 'Expert-led video courses covering frontend performance, system architecture, and frameworks.',
    url: 'https://frontendmasters.com/',
    skills: ['JavaScript', 'React'],
    difficulty: 'Advanced',
    type: 'video'
  },
  {
    id: 'web-fmentor',
    name: 'Frontend Mentor Practice Projects',
    category: 'web-dev',
    description: 'Challenge platform with mock designs to practice layout implementations.',
    url: 'https://www.frontendmentor.io/',
    skills: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'Intermediate',
    type: 'practice'
  },
  {
    id: 'web-w3schools',
    name: 'W3Schools HTML & CSS',
    category: 'web-dev',
    description: 'Reference tutorials, code editors, and starter templates for HTML, CSS, and basic scripts.',
    url: 'https://www.w3schools.com/html/',
    skills: ['HTML', 'CSS'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'web-google-dev',
    name: 'Web.dev by Google',
    category: 'web-dev',
    description: 'Engineering articles targeting web metrics, accessibility, and performance optimizations.',
    url: 'https://web.dev/',
    skills: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'Advanced',
    type: 'article'
  },
  {
    id: 'web-odin',
    name: 'The Odin Project Web Course',
    category: 'web-dev',
    description: 'Full-stack curriculum teaching HTML, CSS, JavaScript, and Node from the ground up.',
    url: 'https://www.theodinproject.com/',
    skills: ['HTML', 'CSS', 'JavaScript', 'Node.js'],
    difficulty: 'Intermediate',
    type: 'practice'
  },
  {
    id: 'web-react-video',
    name: 'React Video Course for Beginners',
    category: 'web-dev',
    description: 'Comprehensive video introduction covering states, hooks, and conditional rendering.',
    url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    skills: ['React'],
    difficulty: 'Beginner',
    type: 'video'
  },

  // ==========================================
  // DSA RESOURCES (Category: dsa)
  // ==========================================
  {
    id: 'dsa-leetcode',
    name: 'LeetCode Interview Prep',
    category: 'dsa',
    description: 'The premier practice environment for algorithms, structures, and dynamic programming.',
    url: 'https://leetcode.com',
    skills: ['DSA'],
    difficulty: 'Intermediate',
    type: 'practice'
  },
  {
    id: 'dsa-codeforces',
    name: 'Codeforces Competitive Contests',
    category: 'dsa',
    description: 'Algorithmic contest platform hosting live code challenges and competitive matches.',
    url: 'https://codeforces.com',
    skills: ['DSA'],
    difficulty: 'Advanced',
    type: 'practice'
  },
  {
    id: 'dsa-codechef',
    name: 'CodeChef Practice Dashboard',
    category: 'dsa',
    description: 'Practice challenges, competitive rounds, and editorial solutions for algorithms.',
    url: 'https://www.codechef.com',
    skills: ['DSA'],
    difficulty: 'Intermediate',
    type: 'practice'
  },
  {
    id: 'dsa-hackerrank',
    name: 'HackerRank Coding Practice',
    category: 'dsa',
    description: 'Checklist of basic computer science, arrays, strings, and SQL problems.',
    url: 'https://www.hackerrank.com',
    skills: ['DSA', 'SQL'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'dsa-atcoder',
    name: 'AtCoder Contest Arena',
    category: 'dsa',
    description: 'Competitive programming challenges with highly mathematical algorithms problems.',
    url: 'https://atcoder.jp',
    skills: ['DSA', 'C++'],
    difficulty: 'Advanced',
    type: 'practice'
  },
  {
    id: 'dsa-gfg',
    name: 'GeeksforGeeks Data Structures',
    category: 'dsa',
    description: 'Reference material covering basic trees, graphs, lists, and complexity analytics.',
    url: 'https://www.geeksforgeeks.org/data-structures/',
    skills: ['DSA'],
    difficulty: 'Intermediate',
    type: 'article'
  },
  {
    id: 'dsa-striver-sheet',
    name: 'Striver A2Z DSA Prep Sheet',
    category: 'dsa',
    description: 'Structured roadmap mapping intermediate, recursion, and dynamic programming algorithms.',
    url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    skills: ['DSA'],
    difficulty: 'Intermediate',
    type: 'article'
  },
  {
    id: 'dsa-neetcode',
    name: 'NeetCode Roadmap & Solutions',
    category: 'dsa',
    description: 'Structured coding sheets, step-by-step algorithms guides, and tutorial videos.',
    url: 'https://neetcode.io',
    skills: ['DSA'],
    difficulty: 'Intermediate',
    type: 'video'
  },
  {
    id: 'dsa-programiz',
    name: 'Programiz DSA Tutorials',
    category: 'dsa',
    description: 'Beginner guides explaining search algorithms and data structural formats with code.',
    url: 'https://www.programiz.com/dsa',
    skills: ['DSA'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'dsa-visualgo',
    name: 'Visualgo Algorithmic Animations',
    category: 'dsa',
    description: 'Interactive animations visualising sorting, search trees, graphs, and hashes.',
    url: 'https://visualgo.net/',
    skills: ['DSA'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'dsa-abdul-bari',
    name: 'Abdul Bari Algorithms Playlist',
    category: 'dsa',
    description: 'Highly acclaimed videos detailing analysis, asymptotic math, and greedy models.',
    url: 'https://www.youtube.com/watch?v=0IAPZzGSbME',
    skills: ['DSA'],
    difficulty: 'Advanced',
    type: 'video'
  },
  {
    id: 'dsa-coding-ninjas',
    name: 'Coding Ninjas DSA Track',
    category: 'dsa',
    description: 'Practical coding studio with tutorials and structured interview prep pathways.',
    url: 'https://www.codingninjas.com/studio',
    skills: ['DSA'],
    difficulty: 'Intermediate',
    type: 'practice'
  },
  {
    id: 'dsa-cs-roadmap',
    name: 'Computer Science Roadmap',
    category: 'dsa',
    description: 'Detailed visual roadmap mapping programming structures, databases, and algorithms.',
    url: 'https://roadmap.sh/computer-science',
    skills: ['DSA'],
    difficulty: 'Beginner',
    type: 'docs'
  },

  // ==========================================
  // SYSTEM DESIGN (Category: system-design)
  // ==========================================
  {
    id: 'sd-primer',
    name: 'System Design Primer',
    category: 'system-design',
    description: 'An open-source handbook outlining structural patterns for building highly scalable systems.',
    url: 'https://github.com/donnemartin/system-design-primer',
    skills: ['System Design'],
    difficulty: 'Advanced',
    type: 'docs'
  },
  {
    id: 'sd-bytebytego',
    name: 'ByteByteGo Scale Guides',
    category: 'system-design',
    description: 'Visual system design explainers covering architecture, caching, and database scaling.',
    url: 'https://bytebytego.com/',
    skills: ['System Design'],
    difficulty: 'Intermediate',
    type: 'article'
  },
  {
    id: 'sd-educative',
    name: 'Grokking System Design Interview',
    category: 'system-design',
    description: 'Checklist of architectural problems like scaling TinyURL, YouTube, and Messenger.',
    url: 'https://www.educative.io/courses/grokking-modern-system-design-interview',
    skills: ['System Design'],
    difficulty: 'Advanced',
    type: 'practice'
  },
  {
    id: 'sd-highscalability',
    name: 'High Scalability Architecture Blog',
    category: 'system-design',
    description: 'Case studies mapping how real-world tech systems handle traffic scales.',
    url: 'http://highscalability.com/',
    skills: ['System Design'],
    difficulty: 'Advanced',
    type: 'article'
  },
  {
    id: 'sd-sdi-channel',
    name: 'System Design Interview YouTube Channel',
    category: 'system-design',
    description: 'Video system designs analyzing database splits, load routing, and proxies.',
    url: 'https://www.youtube.com/c/SystemDesignInterview',
    skills: ['System Design'],
    difficulty: 'Intermediate',
    type: 'video'
  },
  {
    id: 'sd-gaurav-sen',
    name: 'Gaurav Sen System Design Series',
    category: 'system-design',
    description: 'Video playlist detailing load balancers, database sharding, and CDN setups.',
    url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTrhqC_5du2AskTKm677K21MR',
    skills: ['System Design'],
    difficulty: 'Intermediate',
    type: 'video'
  },
  {
    id: 'sd-infoq',
    name: 'InfoQ Architecture & Design',
    category: 'system-design',
    description: 'Professional articles covering server setups, cloud logic, and API trends.',
    url: 'https://www.infoq.com/development/',
    skills: ['System Design'],
    difficulty: 'Advanced',
    type: 'article'
  },
  {
    id: 'sd-ddia-book',
    name: 'Designing Data-Intensive Applications Book',
    category: 'system-design',
    description: 'Reference resources and reading guides for Martin Kleppmann\'s definitive systems textbook.',
    url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/',
    skills: ['System Design'],
    difficulty: 'Advanced',
    type: 'docs'
  },
  {
    id: 'sd-roadmap',
    name: 'System Design Interactive Roadmap',
    category: 'system-design',
    description: 'Interactive visual directory mapping network protocols, API types, and databases.',
    url: 'https://roadmap.sh/system-design',
    skills: ['System Design'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'sd-awesome-repo',
    name: 'Awesome System Design GitHub Repo',
    category: 'system-design',
    description: 'Curated collection of case studies, diagrams, and prep sheets for systems engineering.',
    url: 'https://github.com/maddygoround/Awesome-System-Design',
    skills: ['System Design'],
    difficulty: 'Intermediate',
    type: 'docs'
  },
  {
    id: 'sd-pragmatic',
    name: 'Pragmatic Engineer Architecture Blog',
    category: 'system-design',
    description: 'Articles on software scaling, real-world systems growth, and engineering practices.',
    url: 'https://blog.pragmaticengineer.com/',
    skills: ['System Design'],
    difficulty: 'Intermediate',
    type: 'article'
  },
  {
    id: 'sd-microservices',
    name: 'Microservices Patterns & Principles',
    category: 'system-design',
    description: 'Architectural database reference for microservice communication, event queues, and gateways.',
    url: 'https://microservices.io/',
    skills: ['System Design'],
    difficulty: 'Advanced',
    type: 'docs'
  },
  {
    id: 'sd-martin-fowler',
    name: 'Martin Fowler Software Architecture',
    category: 'system-design',
    description: 'Authoritative articles on enterprise design patterns, dependency injection, and architecture.',
    url: 'https://martinfowler.com/architecture/',
    skills: ['System Design'],
    difficulty: 'Advanced',
    type: 'article'
  },
  // ==========================================
  // EXTRA GIT & DEV TOOLS RESOURCES (Category: dev-tools)
  // ==========================================
  {
    id: 'git-docs',
    name: 'Git Official Documentation',
    category: 'dev-tools',
    description: 'Official Git command reference, books, and user manuals.',
    url: 'https://git-scm.com/doc',
    skills: ['Git'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'git-atlassian',
    name: 'Atlassian Git Tutorials',
    category: 'dev-tools',
    description: 'Comprehensive tutorials covering Git workflows, branches, and collaboration.',
    url: 'https://www.atlassian.com/git/tutorials',
    skills: ['Git'],
    difficulty: 'Intermediate',
    type: 'article'
  },
  {
    id: 'git-guides',
    name: 'GitHub Git Guides',
    category: 'dev-tools',
    description: 'Practical quick-start guides for Git and GitHub concepts.',
    url: 'https://github.com/git-guides',
    skills: ['Git'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'git-w3schools',
    name: 'W3Schools Git Course',
    category: 'dev-tools',
    description: 'Interactive exercises, cheatsheets, and examples for Git.',
    url: 'https://www.w3schools.com/git/',
    skills: ['Git'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'git-fcc-video',
    name: 'FreeCodeCamp Git and GitHub for Beginners',
    category: 'dev-tools',
    description: 'Video course covering Git version control basics and repository syncing.',
    url: 'https://www.freecodecamp.org/news/git-and-github-for-beginners/',
    skills: ['Git'],
    difficulty: 'Beginner',
    type: 'video'
  },
  {
    id: 'git-branching',
    name: 'Learn Git Branching Interactive',
    category: 'dev-tools',
    description: 'Interactive visual playground to master Git branch trees and merging.',
    url: 'https://learngitbranching.js.org/',
    skills: ['Git'],
    difficulty: 'Intermediate',
    type: 'practice'
  },
  // ==========================================
  // EXTRA REACT RESOURCES (Category: web-dev)
  // ==========================================
  {
    id: 'react-w3schools',
    name: 'W3Schools React Course',
    category: 'web-dev',
    description: 'Interactive React tutorials covering components, state, props, and hooks.',
    url: 'https://www.w3schools.com/react/',
    skills: ['React'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'react-cheatsheet',
    name: 'React Developer Cheat Sheet',
    category: 'web-dev',
    description: 'Quick reference guide for React syntax, hook rules, and state updates.',
    url: 'https://reactcheatsheet.com/',
    skills: ['React'],
    difficulty: 'Intermediate',
    type: 'docs'
  },
  {
    id: 'react-scrimba',
    name: 'Scrimba Learn React Interactively',
    category: 'web-dev',
    description: 'Screencast-based interactive coding lessons for mastering React core.',
    url: 'https://scrimba.com/learn/learnreact',
    skills: ['React'],
    difficulty: 'Intermediate',
    type: 'practice'
  },
  // ==========================================
  // EXTRA DJANGO RESOURCES (Category: backend)
  // ==========================================
  {
    id: 'django-docs',
    name: 'Django Official Documentation',
    category: 'backend',
    description: 'Official Python Django framework documentation, API reference, and guides.',
    url: 'https://docs.djangoproject.com/',
    skills: ['Django'],
    difficulty: 'Intermediate',
    type: 'docs'
  },
  {
    id: 'django-w3schools',
    name: 'W3Schools Django Course',
    category: 'backend',
    description: 'Introductory Django lessons, server setups, and templates implementation.',
    url: 'https://www.w3schools.com/django/',
    skills: ['Django'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'django-sibtc',
    name: 'Simple Is Better Than Complex Django',
    category: 'backend',
    description: 'Excellent articles covering authentication, custom user models, and deployment.',
    url: 'https://simpleisbetterthancomplex.com/',
    skills: ['Django'],
    difficulty: 'Intermediate',
    type: 'article'
  },
  {
    id: 'django-fcc-video',
    name: 'FreeCodeCamp Django for Beginners',
    category: 'backend',
    description: 'Full course walk-through showing model designs, views, and form validation in Django.',
    url: 'https://www.youtube.com/watch?v=F5mRW0q-A0o',
    skills: ['Django'],
    difficulty: 'Beginner',
    type: 'video'
  },
  {
    id: 'django-mdn',
    name: 'MDN Server-Side Django Web Framework',
    category: 'backend',
    description: 'Structured tutorials mapping Django libraries, models, and deployment paths.',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django',
    skills: ['Django'],
    difficulty: 'Intermediate',
    type: 'docs'
  },
  // ==========================================
  // EXTRA SQL RESOURCES (Category: backend)
  // ==========================================
  {
    id: 'sql-w3schools',
    name: 'W3Schools SQL Tutorial',
    category: 'backend',
    description: 'Reference, interactive editor, and quiz sheets for learning SQL keywords and joins.',
    url: 'https://www.w3schools.com/sql/',
    skills: ['SQL'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'sql-bolt',
    name: 'SQLBolt Interactive Lessons',
    category: 'backend',
    description: 'Interactive SQL coding tutorials with immediate feedback and data queries.',
    url: 'https://sqlbolt.com/',
    skills: ['SQL'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'sql-mode',
    name: 'Mode Analytics SQL Tutorial',
    category: 'backend',
    description: 'Step-by-step SQL tutorials covering aggregate formulas, subqueries, and table windowing.',
    url: 'https://mode.com/sql-tutorial/',
    skills: ['SQL'],
    difficulty: 'Intermediate',
    type: 'article'
  },
  {
    id: 'sql-leetcode',
    name: 'LeetCode Top SQL 50 Study Plan',
    category: 'backend',
    description: 'Curated 50 database questions for mastering SQL queries and performance.',
    url: 'https://leetcode.com/studyplan/top-sql-50/',
    skills: ['SQL'],
    difficulty: 'Intermediate',
    type: 'practice'
  },
  {
    id: 'sql-khan',
    name: 'Khan Academy Intro to SQL Course',
    category: 'backend',
    description: 'Free classes covering SQL database creation, updates, and indexing designs.',
    url: 'https://www.khanacademy.org/computing/computer-programming/sql',
    skills: ['SQL'],
    difficulty: 'Beginner',
    type: 'video'
  },
  // ==========================================
  // EXTRA NODE.JS RESOURCES (Category: backend)
  // ==========================================
  {
    id: 'node-docs',
    name: 'Node.js Official Documentation',
    category: 'backend',
    description: 'Official API documentation for filesystem, streams, and HTTP servers in Node.',
    url: 'https://nodejs.org/docs/',
    skills: ['Node.js'],
    difficulty: 'Intermediate',
    type: 'docs'
  },
  {
    id: 'node-w3schools',
    name: 'W3Schools Node.js Course',
    category: 'backend',
    description: 'Basic introduction to Node filesystems, modules, and database adapters.',
    url: 'https://www.w3schools.com/nodejs/',
    skills: ['Node.js'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'node-fcc-video',
    name: 'FreeCodeCamp Node.js and Express Course',
    category: 'backend',
    description: 'Video series explaining backend server architecture, REST endpoints, and middleware.',
    url: 'https://www.freecodecamp.org/news/freecodecamp-nodejs-course/',
    skills: ['Node.js'],
    difficulty: 'Intermediate',
    type: 'video'
  },
  {
    id: 'node-patterns',
    name: 'Node.js Design Patterns Guides',
    category: 'backend',
    description: 'In-depth reference guides for asynchronous architecture, streams, and event emitters in Node.',
    url: 'https://www.nodejsdesignpatterns.com/',
    skills: ['Node.js'],
    difficulty: 'Advanced',
    type: 'article'
  },
  {
    id: 'node-school',
    name: 'Node School Workshops',
    category: 'backend',
    description: 'Self-guided interactive terminal workshops for learning node stream mechanics.',
    url: 'https://nodeschool.io/',
    skills: ['Node.js'],
    difficulty: 'Intermediate',
    type: 'practice'
  },
  // ==========================================
  // EXTRA C++ RESOURCES (Category: backend)
  // ==========================================
  {
    id: 'cpp-reference',
    name: 'C++ Reference Docs (cppreference)',
    category: 'backend',
    description: 'Standard library reference for C++ containers, algorithms, and syntax guidelines.',
    url: 'https://en.cppreference.com/w/',
    skills: ['C++'],
    difficulty: 'Intermediate',
    type: 'docs'
  },
  {
    id: 'cpp-learn',
    name: 'learncpp.com In-depth C++ Tutorials',
    category: 'backend',
    description: 'Comprehensive tutorials covering C++ compiler setups, variables, pointers, and OOP.',
    url: 'https://www.learncpp.com/',
    skills: ['C++'],
    difficulty: 'Beginner',
    type: 'docs'
  },
  {
    id: 'cpp-w3schools',
    name: 'W3Schools C++ Tutorial',
    category: 'backend',
    description: 'Easy exercises and code examples for C++ functions, structures, and classes.',
    url: 'https://www.w3schools.com/cpp/',
    skills: ['C++'],
    difficulty: 'Beginner',
    type: 'practice'
  },
  {
    id: 'cpp-fcc-video',
    name: 'FreeCodeCamp C++ Course',
    category: 'backend',
    description: 'Complete video course walking through basic constructs up to object classes.',
    url: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y',
    skills: ['C++'],
    difficulty: 'Beginner',
    type: 'video'
  },
  {
    id: 'cpp-gfg',
    name: 'GeeksforGeeks C++ Guides',
    category: 'backend',
    description: 'Standard repository of C++ guides covering STL libraries, memory management, and pointers.',
    url: 'https://www.geeksforgeeks.org/c-plus-plus/',
    skills: ['C++'],
    difficulty: 'Intermediate',
    type: 'article'
  }
];
