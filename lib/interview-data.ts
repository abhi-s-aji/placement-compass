/**
 * Placement Compass — Static Mock Interview Data with Local Evaluation
 * 50 companies × multiple categories × representative questions
 * Plus local evaluation enrichment rules.
 */

import { InterviewQuestion, InterviewCategory } from './types';


// Enriches a question with dynamic or static expected concepts, key points, common mistakes, and explanations
export function enrichQuestion(q: Omit<InterviewQuestion, 'expected_concepts' | 'key_points' | 'common_mistakes' | 'explanation'>): InterviewQuestion {
  const text = q.question.toLowerCase();
  
  // ─── Core DSA specific matches ─────────────────────────────────────────────
  if (text.includes('reverse') && text.includes('list')) {
    return {
      ...q,
      expected_concepts: ['pointer manipulation', 'three pointer approach', 'reverse next reference', 'linked list traversal'],
      key_points: ['prev pointer initialized to null', 'temporary next pointer storage', 'update current to next', 'return prev as new head'],
      common_mistakes: ['losing head reference', 'creating cycles / infinite loops', 'dereferencing null pointer'],
      explanation: 'Use three pointers: prev (null), current (head), and next. Iterate through the list, store the next node, reverse the current node\'s next pointer to prev, move prev to current, and current to next. Repeat until current is null.'
    };
  }
  
  if (text.includes('two sum') || (text.includes('sum') && text.includes('indices'))) {
    return {
      ...q,
      expected_concepts: ['hash map lookup', 'complement calculation', 'time complexity optimization', 'one-pass hash map'],
      key_points: ['store visited numbers and indices', 'calculate target minus current', 'check map for complement existence', 'return index pair'],
      common_mistakes: ['o(n^2) brute force nested loops', 'using the same index twice', 'not handling duplicate values'],
      explanation: 'Maintain a hash map mapping values to their indices. For each number, calculate its complement (target - num). If the complement is in the map, return the index pair. Otherwise, insert the current number and index into the map.'
    };
  }

  if (text.includes('lru cache')) {
    return {
      ...q,
      expected_concepts: ['doubly linked list', 'hash map lookup', 'constant time o(1) operations', 'cache eviction policy'],
      key_points: ['hashmap for o(1) key-to-node mapping', 'doubly linked list to track usage order', 'evict least recently used from tail', 'insert new elements at head'],
      common_mistakes: ['o(n) eviction searches', 'pointer updating errors (dangling pointers)', 'thread safety issues'],
      explanation: 'Combine a hash map for constant time key lookup with a doubly linked list. Nodes are moved to the head on access. When capacity is exceeded, evict the node at the tail (least recently used) and delete its entry from the hash map.'
    };
  }

  if (text.includes('binary search') || text.includes('search a rotated')) {
    return {
      ...q,
      expected_concepts: ['divide and conquer', 'binary search', 'boundary pointer manipulation', 'logarithmic time complexity'],
      key_points: ['calculate mid index safely', 'determine which half is sorted', 'check if target lies in sorted range', 'update left or right boundaries'],
      common_mistakes: ['integer overflow in mid calculation', 'incorrect boundary updates (infinite loop)', 'not handling search mismatch cases'],
      explanation: 'Perform binary search. Even in a rotated array, one half is always sorted. Find the mid node. If mid is target, return. Else, check if the left half is sorted. If so, check if target is inside its boundaries; otherwise search right half.'
    };
  }

  // ─── System Design specific matches ────────────────────────────────────────
  if (text.includes('teams') || text.includes('whatsapp') || text.includes('chat') || text.includes('real-time messaging')) {
    return {
      ...q,
      expected_concepts: ['websockets protocol', 'load balancing', 'message queue queuing', 'presence service', 'chat storage scale'],
      key_points: ['websocket persistent connections', 'message broker (e.g. kafka or rabbitmq)', 'nosql database for chat history', 'push notifications for offline users'],
      common_mistakes: ['polling database for new messages', 'single server connection bottleneck', 'lack of database partitioning'],
      explanation: 'Establish persistent duplex WebSocket connections through a load balancer. Route messages through a message queue/broker to worker processes. Store histories in a high-write database like Cassandra, and check user presence.'
    };
  }

  if (text.includes('youtube') || text.includes('video streaming') || text.includes('streaming')) {
    return {
      ...q,
      expected_concepts: ['cdn distribution', 'video transcoding', 'hls/dash protocols', 'blob storage file management', 'metadata databases'],
      key_points: ['cdn edge servers for cached streams', 'video file splitting (chunks)', 'encoding pipeline for resolutions', 'blob store storage (e.g. s3)'],
      common_mistakes: ['streaming directly from application servers', 'no multi-resolution support', 'poor cdn cache policies'],
      explanation: 'Upload video to raw blob storage, trigger asynchronous transcoding workers to generate multiple resolutions and formats (HLS/DASH). Store segments in CDN cache nodes close to users. Save video metadata in a distributed DB.'
    };
  }

  if (text.includes('shortener') || text.includes('bit.ly')) {
    return {
      ...q,
      expected_concepts: ['base62 encoding', 'unique id generator', 'distributed caching', 'rest redirects (302 vs 301)'],
      key_points: ['hash function or auto-incrementing id', 'convert number to base62 string', 'redis cache for mapping', 'http 302 redirect for stats tracking'],
      common_mistakes: ['hashing collisions not handled', 'unscalable database queries', 'incorrect redirect status codes'],
      explanation: 'Generate a unique 64-bit ID using a distributed generator (like Snowflake) and encode it to Base62. Store the mapping `Base62 -> Long URL` in a relational DB, and cache hot links in Redis. Return a 302 Found redirect.'
    };
  }

  if (text.includes('search engine') || text.includes('crawler') || text.includes('crawling')) {
    return {
      ...q,
      expected_concepts: ['web crawling', 'inverted index search', 'pagerank algorithm', 'document parser', 'distributed queuing'],
      key_points: ['url frontier queue', 'inverted index matching terms to doc ids', 'tf-idf or pagerank ranking', 'robots.txt compliance checks'],
      common_mistakes: ['infinite loops in page links', 'excessive requests (no rate limit)', 'inefficient full-text search'],
      explanation: 'Build a web crawler that downloads pages recursively obeying robots.txt. Parse links and content. Store index terms in a distributed Inverted Index (`word -> list of document IDs`). Rank search matches using PageRank.'
    };
  }

  // ─── DBMS specific matches ─────────────────────────────────────────────────
  if (text.includes('acid') || text.includes('transaction')) {
    return {
      ...q,
      expected_concepts: ['database transaction integrity', 'acid properties', 'isolation levels', 'concurrency controls'],
      key_points: ['atomicity all or nothing execution', 'consistency valid state transitions', 'isolation independent transactions', 'durability permanent commits'],
      common_mistakes: ['failing to define durability correctly', 'not mentioning write-ahead logging (wal)', 'unaware of dirty read anomalies'],
      explanation: 'ACID guarantees database reliability. Atomicity (rollback on failure), Consistency (rules/constraints enforced), Isolation (using locking/MVCC to separate transactions), and Durability (WAL logged to disk before transaction complete).'
    };
  }

  if (text.includes('normal') || text.includes('nf')) {
    return {
      ...q,
      expected_concepts: ['database normalization', 'data redundancy removal', 'functional dependencies', 'anomalies prevention'],
      key_points: ['1nf atomic column values', '2nf no partial dependencies', '3nf no transitive dependencies', 'foreign keys mapping relations'],
      common_mistakes: ['over-normalizing leading to slow join operations', 'not knowing bcnf definition', 'confusing composite keys dependencies'],
      explanation: 'Normalization organizes columns to reduce redundancy. 1NF ensures columns contain atomic values. 2NF removes partial key dependencies. 3NF removes transitive dependencies (non-key columns depend only on primary key).'
    };
  }

  if (text.includes('index') || text.includes('indexing') || text.includes('b-tree')) {
    return {
      ...q,
      expected_concepts: ['database search indexes', 'b-tree and b+tree nodes', 'clustered index physical storage', 'search time complexity'],
      key_points: ['reduce scan time from o(n) to o(log n)', 'b+ tree holds keys in internal nodes and data in leaves', 'pointer links in leaf nodes', 'write performance overhead'],
      common_mistakes: ['index updates overhead in high-write systems', 'creating redundant indices', 'confusing clustered vs non-clustered structure'],
      explanation: 'Indexes speed up query searches. A B+Tree index splits data into a balanced search tree. Leaves are linked to allow range scans. Clustered index stores data rows physically ordered by key; non-clustered index stores pointers to rows.'
    };
  }

  // ─── OS specific matches ───────────────────────────────────────────────────
  if (text.includes('process') && text.includes('thread')) {
    return {
      ...q,
      expected_concepts: ['operating system process execution', 'thread lightweight execution', 'address space memory isolation', 'context switching overhead'],
      key_points: ['process owns separate memory virtual space', 'threads share process memory space', 'context switching of processes is heavier', 'inter-process communication (ipc) methods'],
      common_mistakes: ['assuming threads have isolated memory spaces', 'assuming processes share variables easily', 'unaware of thread sync necessity'],
      explanation: 'A process is an independent execution unit with its own virtual address space, memory, and system resources. A thread is a lightweight sub-unit within a process that shares the process\'s address space but has its own stack.'
    };
  }

  if (text.includes('virtual memory') || text.includes('paging')) {
    return {
      ...q,
      expected_concepts: ['memory paging segmentation', 'virtual address mapping', 'page faults handling', 'tlb translation cache'],
      key_points: ['page table maps virtual page to physical frame', 'tlb cache for speed', 'disk swap space fallback', 'page eviction algorithms (lru, fifo)'],
      common_mistakes: ['assuming memory is contiguous in RAM', 'confusing page frame and page table', 'unaware of thrashing issues'],
      explanation: 'Virtual memory maps program virtual addresses to physical RAM frames using page tables. When a virtual address page is not in RAM, a Page Fault hardware exception triggers, loading the page from swap disk space.'
    };
  }

  if (text.includes('deadlock') && text.includes('condition')) {
    return {
      ...q,
      expected_concepts: ['deadlock deadlock conditions', 'coffman deadlock conditions', 'resource allocation graph', 'mutual exclusion locks'],
      key_points: ['mutual exclusion restricted access', 'hold and wait locks', 'no preemption locks release', 'circular wait dependency graph'],
      common_mistakes: ['listing only 3 conditions', 'failing to explain circular wait dependency', 'unable to suggest Bankers algorithm prevention'],
      explanation: 'Deadlock happens when processes cannot proceed. The four Coffman conditions must hold: Mutual Exclusion (one process per resource), Hold & Wait (retains resource while waiting), No Preemption (cannot steal resource), and Circular Wait.'
    };
  }

  // ─── Computer Networks specific matches ────────────────────────────────────
  if (text.includes('osi') || text.includes('layer')) {
    return {
      ...q,
      expected_concepts: ['osi networking layers', 'protocol encapsulation headers', 'network routing transport layer', 'packet routing data transmission'],
      key_points: ['physical and data link layers', 'network layer routing packets', 'transport layer ports (tcp/udp)', 'application session presentation layer'],
      common_mistakes: ['scrambling layer numbers', 'associating routing with transport layer', 'unaware of data unit names (frames, packets, segments)'],
      explanation: 'The OSI model has 7 layers: Physical, Data Link (frames), Network (packets/routing), Transport (segments/ports), Session, Presentation (encryption/encoding), and Application (HTTP/DNS protocol payload).'
    };
  }

  if (text.includes('tcp') && text.includes('udp')) {
    return {
      ...q,
      expected_concepts: ['tcp connection protocols', 'udp connectionless transport', 'transmission control protocol reliability', 'handshake protocol flow control'],
      key_points: ['tcp reliable connection-oriented', 'three-way handshake connection establishment', 'udp lightweight connectionless packet broadcast', 'flow control congestion window sliding window'],
      common_mistakes: ['assuming udp is slower than tcp', 'forgetting handshake steps (syn, syn-ack, ack)', 'associating tcp with physical cables'],
      explanation: 'TCP is connection-oriented, offering reliable, ordered delivery via a 3-way handshake (SYN, SYN-ACK, ACK), checksums, and flow control. UDP is connectionless and lightweight, sending packets without verification, ideal for media.'
    };
  }

  // ─── OOP specific matches ──────────────────────────────────────────────────
  if (text.includes('solid') || text.includes('principle')) {
    return {
      ...q,
      expected_concepts: ['solid design principles', 'single responsibility pattern', 'open closed design pattern', 'dependency injection interface segregation'],
      key_points: ['s: single responsibility', 'o: open-closed extension', 'l: liskov substitution interface subclasses', 'i: interface segregation, d: dependency inversion code against interfaces'],
      common_mistakes: ['unable to recall liskhov definition', 'confusing open-closed extension vs modification', 'misstating dependency inversion'],
      explanation: 'SOLID represents clean design. Single Responsibility (one reason to change), Open-Closed (extendable, not modifiable), Liskov Substitution (subclasses replace parent classes), Interface Segregation, and Dependency Inversion.'
    };
  }

  // ─── HR specific matches ───────────────────────────────────────────────────
  if (text.includes('yourself') || text.includes('introduce')) {
    return {
      ...q,
      expected_concepts: ['professional elevator pitch', 'experience background summary', 'key skills highlight', 'career alignment interest'],
      key_points: ['structured past-present-future structure', 'relevant technical qualifications', 'interest in this company placement', 'clear confident vocal communication'],
      common_mistakes: ['re-reading resume chronologically word for word', 'sharing personal details over professional accomplishments', 'rambling without a clear conclusion'],
      explanation: 'Answer using Past-Present-Future. State your current role/studies and major skills (Present), mention a highlight project or internship (Past), and explain why this specific role/company matches your goals (Future).'
    };
  }

  // ─── Fallback Category Generators ──────────────────────────────────────────
  if (q.category === 'DSA') {
    return {
      ...q,
      expected_concepts: ['algorithmic time complexity', 'optimal data structures', 'edge case parameters evaluation', 'code optimization'],
      key_points: ['efficient lookup storage', 'loops index bounds checks', 'asymptotic analysis big-O notation', 'space complexity tradeoffs'],
      common_mistakes: ['inefficient time complexity nested loops', 'out of bounds index reference exceptions', 'not handling null or empty inputs'],
      explanation: 'To solve DSA problems, define a clear algorithmic approach, check indices and constraints, minimize helper structures, and analyze runtime big-O bounds.'
    };
  }

  if (q.category === 'System Design') {
    return {
      ...q,
      expected_concepts: ['distributed systems scalability', 'microservices high availability', 'caching storage load balancing', 'system bottlenecks design'],
      key_points: ['api endpoints mapping', 'database selection sql vs nosql', 'caching layers redis cdn', 'avoid single point of failure (spof)'],
      common_mistakes: ['proposing monolithic non-scalable design', 'no caching layer lookup speedups', 'ignoring network latency and server failure'],
      explanation: 'System design requires clarifying requirements, high-level layouts, detail database schema choices, caching mapping, load-balancer routing, and failover checks.'
    };
  }

  if (q.category === 'DBMS') {
    return {
      ...q,
      expected_concepts: ['database schema design', 'query syntax optimization', 'data safety transaction limits', 'normalization mappings'],
      key_points: ['structured indexes search lookup', 'sql joins inner outer left', 'foreign keys relations integrity', 'acid properties commits rollbacks'],
      common_mistakes: ['unindexed search queries full table scans', 'redundant schema layout', 'ignoring concurrency lock conflicts'],
      explanation: 'Analyze relational tables, construct optimal indexes, write joins correctly, and check transaction boundaries to guarantee data integrity.'
    };
  }

  if (q.category === 'OS') {
    return {
      ...q,
      expected_concepts: ['operating system processes memory', 'resource allocation cpu scheduling', 'synchronization locks mutexes semaphores', 'virtual address layout'],
      key_points: ['processes separation space address', 'context switching runtime overhead', 'multithreading context threads', 'deadlock condition prevention'],
      common_mistakes: ['confusing process context with thread memory shares', 'race condition synchronizations missing', 'unaware of memory page translation caches'],
      explanation: 'Identify processes resource spaces, explain scheduling mechanics, map memory page table frames, and prevent deadlock conditions.'
    };
  }

  if (q.category === 'Computer Networks') {
    return {
      ...q,
      expected_concepts: ['networking protocols packets', 'handshake handshake protocol reliability', 'routing headers frames network', 'osi transport layer port'],
      key_points: ['osi layers protocol mapping', 'tcp udp connection reliability', 'http transaction cycle dns mapping', 'packet routing data transmission'],
      common_mistakes: ['confusing reliable tcp with fast raw udp stream', 'misunderstanding dns search path routing', 'forgetting ssl tls handshakes details'],
      explanation: 'Map packet encapsulation headers, follow layers, route paths via ip and gateway masks, and use TCP checks for session reliability.'
    };
  }

  if (q.category === 'OOP') {
    return {
      ...q,
      expected_concepts: ['object design classes interfaces', 'pillars of oop', 'solid patterns coupling inheritance', 'design patterns logic'],
      key_points: ['encapsulation data hiding methods', 'inheritance composition interfaces reuse', 'polymorphism override overload execution', 'design patterns strategy observer'],
      common_mistakes: ['tightly coupled structure layout', 'deep nested inheritance hierarchy trees', 'violating single responsibility'],
      explanation: 'Construct interfaces, write classes wrapping states, decouple connections using dependency injection, and apply SOLID design patterns.'
    };
  }

  if (q.category === 'HR') {
    return {
      ...q,
      expected_concepts: ['behavioral evaluation fit', 'communication STAR framework', 'culture alignment company goals', 'teamwork coordination leadership'],
      key_points: ['situation task target outline', 'action specific project operations', 'result quantifiable outcomes numbers', 'professional vocal expressions confidence'],
      common_mistakes: ['rambling answers without structural summaries', 'criticizing past partners or teachers', 'no clear focus on individual actions'],
      explanation: 'Structure behavioral answers with the STAR framework: explain the Situation/Task, state your Actions, and finish with the quantitative Result.'
    };
  }

  if (q.category === 'Projects') {
    return {
      ...q,
      expected_concepts: ['project software architectures', 'technology selection framework databases', 'individual contribution dev logs', 'technical challenges debugs'],
      key_points: ['stack frameworks reasoning justification', 'scaling operations loads performance', 'testing coverages pipelines', 'challenges resolutions detailed descriptions'],
      common_mistakes: ['unfamiliar with own listed resume codebase', 'vague project explanations', 'underplaying problems solved'],
      explanation: 'Explain your technology stack choice, diagram flow structures, point out personal developer achievements, and describe how you solved complex bugs.'
    };
  }

  // Final fallback
  return {
    ...q,
    expected_concepts: ['problem solving concepts', 'key topics fundamentals', 'communication articulation'],
    key_points: ['logical correctness', 'structured structure layout', 'detailed explanations reasoning'],
    common_mistakes: ['vague explanations', 'incorrect logic', 'skipping details'],
    explanation: 'Address the core query directly, detail the implementation logic, mention complexity bounds, and structure the explanation.'
  };
}

const dsaShared: Omit<InterviewQuestion, 'id' | 'company'>[] = [
  { category: 'DSA', difficulty: 'Easy',   question: 'Reverse a linked list.' },
  { category: 'DSA', difficulty: 'Easy',   question: 'Check if a string is a palindrome.' },
  { category: 'DSA', difficulty: 'Easy',   question: 'Find the maximum element in an array.' },
  { category: 'DSA', difficulty: 'Medium', question: 'Find the longest substring without repeating characters.' },
  { category: 'DSA', difficulty: 'Medium', question: 'Detect a cycle in a linked list.' },
  { category: 'DSA', difficulty: 'Medium', question: 'Implement binary search on a rotated sorted array.' },
  { category: 'DSA', difficulty: 'Medium', question: 'Two Sum — find indices of two numbers that add to target.' },
  { category: 'DSA', difficulty: 'Medium', question: 'Merge two sorted linked lists.' },
  { category: 'DSA', difficulty: 'Hard',   question: 'Find the median of two sorted arrays in O(log n).' },
  { category: 'DSA', difficulty: 'Hard',   question: 'Serialize and deserialize a binary tree.' },
  { category: 'DSA', difficulty: 'Hard',   question: 'Solve the Trapping Rain Water problem.' },
  { category: 'DSA', difficulty: 'Hard',   question: 'Find the kth largest element using a min-heap.' },
];

const sdShared: Omit<InterviewQuestion, 'id' | 'company'>[] = [
  { category: 'System Design', difficulty: 'Medium', question: 'Design a URL shortener (like bit.ly).' },
  { category: 'System Design', difficulty: 'Medium', question: 'Design a rate limiter for an API.' },
  { category: 'System Design', difficulty: 'Medium', question: 'Design a notification service (push/email/SMS).' },
  { category: 'System Design', difficulty: 'Hard',   question: 'Design YouTube — video upload, storage, streaming.' },
  { category: 'System Design', difficulty: 'Hard',   question: 'Design Twitter — tweet posting, feed generation, search.' },
  { category: 'System Design', difficulty: 'Hard',   question: 'Design a distributed key-value store like DynamoDB.' },
  { category: 'System Design', difficulty: 'Hard',   question: 'Design a global CDN for static assets.' },
  { category: 'System Design', difficulty: 'Hard',   question: 'Design a ride-sharing backend (Uber/Ola).' },
  { category: 'System Design', difficulty: 'Medium', question: 'Design an e-commerce cart and checkout system.' },
  { category: 'System Design', difficulty: 'Hard',   question: 'Design a search autocomplete system.' },
];

const dbShared: Omit<InterviewQuestion, 'id' | 'company'>[] = [
  { category: 'DBMS', difficulty: 'Easy',   question: 'What is the difference between INNER JOIN and OUTER JOIN?' },
  { category: 'DBMS', difficulty: 'Easy',   question: 'Explain the ACID properties of a database.' },
  { category: 'DBMS', difficulty: 'Easy',   question: 'What is database normalization? Explain 1NF, 2NF, 3NF.' },
  { category: 'DBMS', difficulty: 'Medium', question: 'What is indexing? How does a B-tree index work?' },
  { category: 'DBMS', difficulty: 'Medium', question: 'Explain the difference between clustered and non-clustered indexes.' },
  { category: 'DBMS', difficulty: 'Medium', question: 'What are transactions? Explain isolation levels.' },
  { category: 'DBMS', difficulty: 'Hard',   question: 'How does a database handle deadlocks? How to prevent them?' },
  { category: 'DBMS', difficulty: 'Hard',   question: 'Explain CAP theorem and its implications in distributed systems.' },
];

const osShared: Omit<InterviewQuestion, 'id' | 'company'>[] = [
  { category: 'OS', difficulty: 'Easy',   question: 'What is the difference between a process and a thread?' },
  { category: 'OS', difficulty: 'Easy',   question: 'What is virtual memory? How does paging work?' },
  { category: 'OS', difficulty: 'Medium', question: 'Explain CPU scheduling algorithms: FCFS, SJF, Round Robin.' },
  { category: 'OS', difficulty: 'Medium', question: 'What is a deadlock? State the necessary conditions.' },
  { category: 'OS', difficulty: 'Medium', question: 'What is the difference between mutex and semaphore?' },
  { category: 'OS', difficulty: 'Hard',   question: 'How does the Linux kernel manage memory with mmap?' },
  { category: 'OS', difficulty: 'Hard',   question: 'Explain the boot process from BIOS to user space.' },
];

const cnShared: Omit<InterviewQuestion, 'id' | 'company'>[] = [
  { category: 'Computer Networks', difficulty: 'Easy',   question: 'What is the OSI model? Explain each layer.' },
  { category: 'Computer Networks', difficulty: 'Easy',   question: 'What is the difference between TCP and UDP?' },
  { category: 'Computer Networks', difficulty: 'Medium', question: 'Explain the HTTP request-response cycle.' },
  { category: 'Computer Networks', difficulty: 'Medium', question: 'What is DNS? How does DNS resolution work?' },
  { category: 'Computer Networks', difficulty: 'Medium', question: 'What is a CDN and how does it reduce latency?' },
  { category: 'Computer Networks', difficulty: 'Hard',   question: 'How does HTTPS/TLS handshake work?' },
  { category: 'Computer Networks', difficulty: 'Hard',   question: 'What is BGP? How does routing work on the internet?' },
];

const oopShared: Omit<InterviewQuestion, 'id' | 'company'>[] = [
  { category: 'OOP', difficulty: 'Easy',   question: 'What are the four pillars of OOP?' },
  { category: 'OOP', difficulty: 'Easy',   question: 'What is the difference between abstraction and encapsulation?' },
  { category: 'OOP', difficulty: 'Medium', question: 'Explain the SOLID principles with examples.' },
  { category: 'OOP', difficulty: 'Medium', question: 'What is the difference between composition and inheritance?' },
  { category: 'OOP', difficulty: 'Medium', question: 'Explain the Strategy, Observer, and Factory design patterns.' },
  { category: 'OOP', difficulty: 'Hard',   question: 'Design a parking lot system using OOP principles.' },
  { category: 'OOP', difficulty: 'Hard',   question: 'Design a chess game with all classes and interactions.' },
];

const hrShared: Omit<InterviewQuestion, 'id' | 'company'>[] = [
  { category: 'HR', difficulty: 'Easy', question: 'Tell me about yourself.' },
  { category: 'HR', difficulty: 'Easy', question: 'Why do you want to work at this company?' },
  { category: 'HR', difficulty: 'Easy', question: 'What are your greatest strengths and weaknesses?' },
  { category: 'HR', difficulty: 'Medium', question: 'Describe a challenging situation you faced and how you resolved it.' },
  { category: 'HR', difficulty: 'Medium', question: 'Tell me about a time you worked in a team and faced conflict.' },
  { category: 'HR', difficulty: 'Medium', question: 'Where do you see yourself in 5 years?' },
  { category: 'HR', difficulty: 'Medium', question: 'Why are you leaving your current role / why placement?' },
];

const projShared: Omit<InterviewQuestion, 'id' | 'company'>[] = [
  { category: 'Projects', difficulty: 'Easy',   question: 'Walk me through your most significant project.' },
  { category: 'Projects', difficulty: 'Easy',   question: 'What technologies did you choose and why?' },
  { category: 'Projects', difficulty: 'Medium', question: 'What was the hardest technical challenge you faced in your project?' },
  { category: 'Projects', difficulty: 'Medium', question: 'How did you ensure code quality and testing in your project?' },
  { category: 'Projects', difficulty: 'Hard',   question: 'How would you scale your project to handle 1 million users?' },
];

// ─── Company definitions ──────────────────────────────────────────────────────

export type CompanyEntry = {
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  domain: string;
  categories: string[];
  tips: string[];
  specificQuestions: Omit<InterviewQuestion, 'id' | 'company'>[];
};

export const companies: CompanyEntry[] = [
  {
    name: 'Google',
    difficulty: 'Hard',
    domain: 'Technology',
    categories: ['DSA', 'System Design', 'OOP', 'HR', 'Projects'],
    tips: [
      'Focus heavily on DSA — LeetCode Hard is expected.',
      'System Design rounds require scalability thinking (millions of users).',
      'Practice Googleyness behavioral questions — leadership, ambiguity handling.',
      'Know Big-O for every solution you propose.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Hard', question: 'Given a list of words, find the shortest word ladder from start to end.' },
      { category: 'DSA', difficulty: 'Hard', question: 'Design an algorithm to find all permutations of a string.' },
      { category: 'System Design', difficulty: 'Hard', question: 'Design Google Search — crawling, indexing, ranking.' },
      { category: 'System Design', difficulty: 'Hard', question: 'Design Google Maps — real-time routing and traffic.' },
      { category: 'HR', difficulty: 'Medium', question: 'Describe a time you had to make a technical decision with incomplete information.' },
    ],
  },
  {
    name: 'Microsoft',
    difficulty: 'Hard',
    domain: 'Technology',
    categories: ['DSA', 'System Design', 'OOP', 'OS', 'HR'],
    tips: [
      'Growth mindset is central to Microsoft culture — highlight learning from failure.',
      'Expect OOP and design pattern questions alongside DSA.',
      'Azure cloud architecture knowledge is a plus.',
      'Be prepared to walk through your code line by line.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Medium', question: 'Clone a directed graph with cycles.' },
      { category: 'System Design', difficulty: 'Hard', question: 'Design Microsoft Teams — real-time messaging and video calls.' },
      { category: 'OOP', difficulty: 'Hard', question: 'Design an elevator system for a 100-floor building.' },
      { category: 'HR', difficulty: 'Medium', question: 'Tell me about a time you had to learn a new technology under tight deadlines.' },
    ],
  },
  {
    name: 'Amazon',
    difficulty: 'Hard',
    domain: 'E-Commerce / Cloud',
    categories: ['DSA', 'System Design', 'DBMS', 'HR', 'Projects'],
    tips: [
      'Amazon LP (Leadership Principles) are heavily weighted — prepare STAR format for all 16 LPs.',
      'System Design focuses on AWS services and distributed systems.',
      'Expect questions on customer obsession and ownership principles.',
      'Coding bar is LeetCode Medium–Hard.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Medium', question: 'LRU Cache implementation.' },
      { category: 'DSA', difficulty: 'Hard', question: 'Find the largest rectangle in a histogram.' },
      { category: 'System Design', difficulty: 'Hard', question: "Design Amazon's order management and fulfillment system." },
      { category: 'HR', difficulty: 'Medium', question: 'Tell me about a time you disagreed with your team and what you did.' },
      { category: 'HR', difficulty: 'Medium', question: 'Describe a time you took ownership of a critical issue.' },
    ],
  },
  {
    name: 'Meta',
    difficulty: 'Hard',
    domain: 'Social Media / Technology',
    categories: ['DSA', 'System Design', 'HR', 'Projects'],
    tips: [
      'Meta emphasizes moving fast — show execution speed in coding rounds.',
      'Graph and tree problems are extremely common.',
      'Social network system design is a key area (news feed, friend recommendation).',
      'Behavioral rounds focus on collaboration and impact.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Hard', question: 'Number of Islands — count connected components in a grid.' },
      { category: 'DSA', difficulty: 'Medium', question: 'Flatten a nested list iterator.' },
      { category: 'System Design', difficulty: 'Hard', question: 'Design Facebook News Feed — ranking and real-time updates.' },
      { category: 'HR', difficulty: 'Medium', question: 'Tell me about your most impactful technical contribution.' },
    ],
  },
  {
    name: 'Apple',
    difficulty: 'Hard',
    domain: 'Technology / Hardware',
    categories: ['DSA', 'System Design', 'OOP', 'OS', 'HR'],
    tips: [
      'Apple values deep OS and hardware knowledge — know Swift/Objective-C for iOS roles.',
      'Design questions focus on privacy and security.',
      'Expect questions on memory management and low-level systems.',
      'Passion for Apple products is noticed in behavioral rounds.',
    ],
    specificQuestions: [
      { category: 'OS', difficulty: 'Hard', question: 'How does iOS manage memory — ARC vs garbage collection?' },
      { category: 'DSA', difficulty: 'Medium', question: 'Implement an autocomplete feature using a Trie.' },
      { category: 'System Design', difficulty: 'Hard', question: 'Design iCloud — file storage, sync, and conflict resolution.' },
      { category: 'HR', difficulty: 'Medium', question: 'Why Apple? What Apple product would you improve and how?' },
    ],
  },
  {
    name: 'Netflix',
    difficulty: 'Hard',
    domain: 'Streaming / Technology',
    categories: ['System Design', 'DSA', 'DBMS', 'HR'],
    tips: [
      'Netflix has a high-performance culture — show independent judgment.',
      'Streaming architecture, encoding pipelines, and CDN are core topics.',
      'Expect questions on recommendation systems and personalization.',
      'Chaos Engineering philosophy — be ready to discuss resilience.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design Netflix — video ingestion, encoding, CDN, and adaptive bitrate streaming.' },
      { category: 'System Design', difficulty: 'Hard', question: 'Design a recommendation engine for movie suggestions.' },
      { category: 'DBMS', difficulty: 'Hard', question: 'How would you handle globally consistent data in a distributed database at Netflix scale?' },
      { category: 'HR', difficulty: 'Medium', question: 'Describe a time you disagreed with a process and influenced change.' },
    ],
  },
  {
    name: 'Adobe',
    difficulty: 'Medium',
    domain: 'Creative Software',
    categories: ['DSA', 'OOP', 'System Design', 'HR', 'Projects'],
    tips: [
      'Adobe values creative problem solving — describe product thinking in behavioral rounds.',
      'OOP design patterns are heavily tested.',
      'Image processing and graphics-related DSA questions appear.',
      'Collaboration and cross-functional teamwork are key LP themes.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Medium', question: 'Implement image rotation by 90 degrees in place.' },
      { category: 'OOP', difficulty: 'Hard', question: "Design Adobe Photoshop's layer and canvas system using OOP." },
      { category: 'System Design', difficulty: 'Medium', question: 'Design Adobe Sign — digital document signing workflow.' },
      { category: 'HR', difficulty: 'Easy', question: 'What creative project are you most proud of?' },
    ],
  },
  {
    name: 'Oracle',
    difficulty: 'Medium',
    domain: 'Enterprise Software / Cloud',
    categories: ['DBMS', 'DSA', 'OOP', 'System Design', 'HR'],
    tips: [
      'Deep DBMS knowledge is essential — SQL optimization, stored procedures, indexes.',
      'Java is the primary language — OOP and design patterns are key.',
      'Oracle Cloud questions are increasingly common.',
      'Be prepared for thorough technical deep dives.',
    ],
    specificQuestions: [
      { category: 'DBMS', difficulty: 'Hard', question: "Explain Oracle's MVCC (Multi-Version Concurrency Control)." },
      { category: 'DBMS', difficulty: 'Medium', question: 'Write a SQL query to find the second highest salary in each department.' },
      { category: 'DSA', difficulty: 'Medium', question: 'Implement a stack that supports getMin() in O(1) time.' },
      { category: 'OOP', difficulty: 'Medium', question: 'Explain the difference between abstract class and interface in Java.' },
    ],
  },
  {
    name: 'Salesforce',
    difficulty: 'Medium',
    domain: 'CRM / Cloud',
    categories: ['System Design', 'DSA', 'OOP', 'DBMS', 'HR'],
    tips: [
      'Salesforce values Ohana culture — expect team-first behavioral questions.',
      'Know Salesforce Platform concepts for product roles.',
      'Multi-tenancy architecture is a key system design topic.',
      'DSA is LeetCode Easy to Medium range.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design a multi-tenant CRM like Salesforce — data isolation and customization.' },
      { category: 'DSA', difficulty: 'Medium', question: 'Group anagrams together from a list of strings.' },
      { category: 'HR', difficulty: 'Medium', question: 'How do you handle competing priorities from multiple stakeholders?' },
    ],
  },
  {
    name: 'Nvidia',
    difficulty: 'Hard',
    domain: 'Semiconductors / AI Hardware',
    categories: ['DSA', 'OS', 'System Design', 'OOP', 'HR'],
    tips: [
      'GPU architecture and parallel computing knowledge is a differentiator.',
      'C++ proficiency is expected for most engineering roles.',
      'Deep learning hardware optimization questions may appear.',
      'Show passion for computing performance.',
    ],
    specificQuestions: [
      { category: 'OS', difficulty: 'Hard', question: 'How does GPU differ from CPU in terms of parallelism and architecture?' },
      { category: 'DSA', difficulty: 'Hard', question: 'Implement a parallel merge sort for multi-core systems.' },
      { category: 'System Design', difficulty: 'Hard', question: 'Design a distributed training system for large AI models.' },
    ],
  },
  {
    name: 'Tesla',
    difficulty: 'Hard',
    domain: 'Automotive / AI',
    categories: ['DSA', 'System Design', 'OS', 'Projects', 'HR'],
    tips: [
      'Embedded systems and real-time OS knowledge is critical.',
      'Autonomous driving and computer vision concepts may appear.',
      'Show strong ownership mindset — Tesla expects self-driven individuals.',
      'Backend distributed systems for fleet management are key topics.',
    ],
    specificQuestions: [
      { category: 'OS', difficulty: 'Hard', question: 'How do real-time operating systems differ from general-purpose OS?' },
      { category: 'System Design', difficulty: 'Hard', question: 'Design a fleet management system for 1 million connected vehicles.' },
      { category: 'DSA', difficulty: 'Hard', question: "Implement Dijkstra's algorithm for route optimization." },
    ],
  },
  {
    name: 'Uber',
    difficulty: 'Hard',
    domain: 'Ride-Sharing / Technology',
    categories: ['System Design', 'DSA', 'DBMS', 'Computer Networks', 'HR'],
    tips: [
      'Geospatial algorithms and real-time matching are core topics.',
      'Distributed systems at scale — millions of rides per day.',
      'SQL and NoSQL trade-off discussions are common.',
      'Be ready to discuss surge pricing algorithms.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design Uber — driver matching, ETA calculation, surge pricing.' },
      { category: 'DSA', difficulty: 'Hard', question: 'Find the nearest driver to a user using geospatial data structures.' },
      { category: 'DBMS', difficulty: 'Medium', question: 'How would you store and query location data efficiently?' },
    ],
  },
  {
    name: 'Airbnb',
    difficulty: 'Hard',
    domain: 'Travel / Marketplace',
    categories: ['System Design', 'DSA', 'DBMS', 'HR', 'Projects'],
    tips: [
      'Marketplace design (supply and demand matching) is a core topic.',
      'Search ranking and filtering systems are commonly asked.',
      'Focus on host and guest experience in behavioral rounds.',
      'Distributed transaction handling for bookings is important.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design Airbnb — property listing, search, booking, payment.' },
      { category: 'DSA', difficulty: 'Medium', question: 'Given a list of bookings, find overlapping reservations.' },
      { category: 'HR', difficulty: 'Medium', question: 'Tell me about a time you improved user experience through data.' },
    ],
  },
  {
    name: 'LinkedIn',
    difficulty: 'Hard',
    domain: 'Professional Network / Technology',
    categories: ['System Design', 'DSA', 'DBMS', 'HR'],
    tips: [
      'Graph algorithms (connections, recommendations) are very common.',
      'Feed ranking and relevance systems are key design topics.',
      'Know search systems — type-ahead, full-text search.',
      'Culture-fit questions around professional growth and mentorship.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design LinkedIn feed — post ranking, connections, and notifications.' },
      { category: 'DSA', difficulty: 'Hard', question: 'Find all people within K degrees of connection in a social graph.' },
      { category: 'System Design', difficulty: 'Medium', question: 'Design a job recommendation engine for LinkedIn.' },
    ],
  },
  {
    name: 'Atlassian',
    difficulty: 'Medium',
    domain: 'Developer Tools / SaaS',
    categories: ['System Design', 'DSA', 'OOP', 'HR', 'Projects'],
    tips: [
      'Collaboration tooling is core — think Jira, Confluence design patterns.',
      'Distributed systems for SaaS multi-tenancy.',
      'Open-source contribution and developer empathy are valued.',
      'Values-based interviews are thorough — know Atlassian\'s values.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design Jira — issue tracking, workflow states, and permissions.' },
      { category: 'DSA', difficulty: 'Medium', question: 'Implement a basic version control diff algorithm.' },
      { category: 'HR', difficulty: 'Medium', question: 'How do you prioritize features when working with multiple teams?' },
    ],
  },
  {
    name: 'Cisco',
    difficulty: 'Medium',
    domain: 'Networking / Hardware',
    categories: ['Computer Networks', 'OS', 'DSA', 'System Design', 'HR'],
    tips: [
      'Networking protocols (TCP/IP, BGP, OSPF) are core knowledge areas.',
      'Network security topics appear frequently.',
      'Embedded firmware and hardware interaction questions for hardware roles.',
      'Show structured problem-solving for network troubleshooting.',
    ],
    specificQuestions: [
      { category: 'Computer Networks', difficulty: 'Hard', question: 'How does BGP (Border Gateway Protocol) work? What is an AS?' },
      { category: 'Computer Networks', difficulty: 'Medium', question: 'Explain VLAN, VPN, and their use cases in enterprise networks.' },
      { category: 'System Design', difficulty: 'Hard', question: 'Design a network monitoring system for 10,000 routers.' },
    ],
  },
  {
    name: 'Intel',
    difficulty: 'Hard',
    domain: 'Semiconductors / Hardware',
    categories: ['OS', 'DSA', 'OOP', 'Computer Networks', 'HR'],
    tips: [
      'Computer architecture and microprocessor design knowledge is key.',
      'Know cache coherency, memory hierarchy, and pipeline stages.',
      'C and C++ proficiency expected for most roles.',
      'Deep system-level programming questions.',
    ],
    specificQuestions: [
      { category: 'OS', difficulty: 'Hard', question: 'Explain the MESI cache coherence protocol.' },
      { category: 'OS', difficulty: 'Hard', question: 'What is speculative execution? Explain Spectre/Meltdown at a high level.' },
      { category: 'DSA', difficulty: 'Medium', question: 'Implement a circular buffer used in hardware drivers.' },
    ],
  },
  {
    name: 'IBM',
    difficulty: 'Medium',
    domain: 'Enterprise Technology / Cloud',
    categories: ['System Design', 'DBMS', 'OOP', 'DSA', 'HR'],
    tips: [
      'IBM focuses on enterprise-grade solutions — reliability and maintainability.',
      'Know IBM Cloud and hybrid cloud architecture.',
      'AI/ML integration with enterprise systems is a growing area.',
      'Behavioral rounds focus on client-facing communication.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design an enterprise hybrid cloud data synchronization system.' },
      { category: 'DBMS', difficulty: 'Medium', question: 'Explain the difference between row-oriented and column-oriented databases.' },
      { category: 'HR', difficulty: 'Medium', question: 'Describe a situation where you had to communicate a complex technical issue to a non-technical stakeholder.' },
    ],
  },
  {
    name: 'Accenture',
    difficulty: 'Easy',
    domain: 'IT Consulting / Services',
    categories: ['DSA', 'OOP', 'DBMS', 'HR', 'Projects'],
    tips: [
      'Aptitude and reasoning sections are heavily weighted.',
      'Communication skills matter as much as technical skills.',
      'Know basic SQL, Java/Python OOP fundamentals.',
      'Expect questions on your projects and teamwork.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Easy', question: 'Find all duplicates in an array.' },
      { category: 'OOP', difficulty: 'Easy', question: 'What is polymorphism? Give an example in Java.' },
      { category: 'DBMS', difficulty: 'Easy', question: 'Write a SQL query to count employees per department.' },
      { category: 'HR', difficulty: 'Easy', question: 'Why do you want to work in IT consulting?' },
    ],
  },
  {
    name: 'Deloitte',
    difficulty: 'Easy',
    domain: 'Consulting / Technology',
    categories: ['DSA', 'DBMS', 'HR', 'Projects', 'OOP'],
    tips: [
      'Problem-solving case studies are part of consulting interviews.',
      'Show analytical thinking and structured communication.',
      'Basic programming proficiency in Python or Java.',
      'Know data analysis concepts — SQL is critical.',
    ],
    specificQuestions: [
      { category: 'DBMS', difficulty: 'Easy', question: 'What is a view in SQL? How is it different from a table?' },
      { category: 'HR', difficulty: 'Easy', question: 'How do you handle working on multiple projects simultaneously?' },
      { category: 'DSA', difficulty: 'Easy', question: 'Find the missing number from 1 to N in an array.' },
    ],
  },
  {
    name: 'TCS',
    difficulty: 'Easy',
    domain: 'IT Services',
    categories: ['DSA', 'OOP', 'DBMS', 'HR', 'Computer Networks'],
    tips: [
      'TCS National Qualifier Test (NQT) is aptitude-heavy — practice verbal, quant, reasoning.',
      'Basic coding in C/C++/Java/Python is expected.',
      'HR rounds focus on adaptability and willingness to relocate.',
      'Know fundamentals: OOP, DBMS, OS, networking.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Easy', question: 'Check if two strings are anagrams.' },
      { category: 'OOP', difficulty: 'Easy', question: 'Explain inheritance with a real-world example.' },
      { category: 'DBMS', difficulty: 'Easy', question: 'What is a primary key? What is a foreign key?' },
      { category: 'HR', difficulty: 'Easy', question: 'Are you willing to relocate? How do you adapt to new environments?' },
    ],
  },
  {
    name: 'Infosys',
    difficulty: 'Easy',
    domain: 'IT Services',
    categories: ['DSA', 'OOP', 'DBMS', 'HR', 'Projects'],
    tips: [
      'InfyTQ certification helps — cover Java and Database tracks.',
      'Puzzle and logical reasoning questions are common.',
      'Campus interviews focus heavily on HR fit.',
      'Group discussions test communication and leadership.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Easy', question: 'Print the Fibonacci series up to N terms.' },
      { category: 'OOP', difficulty: 'Easy', question: 'What is method overloading vs method overriding?' },
      { category: 'HR', difficulty: 'Easy', question: 'Tell us about a project you built. What was your contribution?' },
    ],
  },
  {
    name: 'Wipro',
    difficulty: 'Easy',
    domain: 'IT Services',
    categories: ['DSA', 'OOP', 'DBMS', 'HR', 'Computer Networks'],
    tips: [
      'WILP and NLTH exams test aptitude and basic programming.',
      'Object-oriented concepts in Java are frequently asked.',
      'Show enthusiasm for learning and adaptability.',
      'Group activities and communication assessments are part of the process.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Easy', question: 'Implement bubble sort and explain its time complexity.' },
      { category: 'OOP', difficulty: 'Easy', question: 'What is a constructor? Explain types of constructors.' },
      { category: 'Computer Networks', difficulty: 'Easy', question: 'What is the difference between a hub, switch, and router?' },
    ],
  },
  {
    name: 'Cognizant',
    difficulty: 'Easy',
    domain: 'IT Services',
    categories: ['DSA', 'OOP', 'DBMS', 'HR', 'Projects'],
    tips: [
      'GenC and GenC Pro tracks have different difficulty levels.',
      'Basic data structures and algorithms are tested.',
      'SQL queries and normalization are common DBMS topics.',
      'Soft skills and team collaboration are highly valued.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Easy', question: 'Implement a queue using two stacks.' },
      { category: 'DBMS', difficulty: 'Easy', question: 'Explain the difference between DELETE, DROP, and TRUNCATE.' },
      { category: 'HR', difficulty: 'Easy', question: 'Describe your final year project and the challenges you faced.' },
    ],
  },
  {
    name: 'Capgemini',
    difficulty: 'Easy',
    domain: 'IT Consulting / Services',
    categories: ['DSA', 'OOP', 'DBMS', 'HR', 'Computer Networks'],
    tips: [
      'GAME (Global Aptitude and Merit Exam) covers pseudocode, reasoning, and behavioral.',
      'Technical Mcqs test core CS concepts.',
      'Show problem-solving with a structured approach.',
      'HR values culture-fit and long-term commitment.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Easy', question: 'What is the time complexity of binary search?' },
      { category: 'OOP', difficulty: 'Easy', question: 'What is an interface? How is it different from an abstract class?' },
      { category: 'HR', difficulty: 'Easy', question: 'Why Capgemini? What interests you about the IT services industry?' },
    ],
  },
  {
    name: 'Spotify',
    difficulty: 'Hard',
    domain: 'Music Streaming / Technology',
    categories: ['System Design', 'DSA', 'DBMS', 'HR'],
    tips: [
      'Streaming and audio pipeline architecture are key design areas.',
      'Recommendation systems and collaborative filtering are popular topics.',
      'Know event-driven architecture and Kafka.',
      'Spotify values data-driven product thinking.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design Spotify — music streaming, playlists, and personalized recommendations.' },
      { category: 'DSA', difficulty: 'Medium', question: 'Design a data structure for autocomplete on song titles.' },
    ],
  },
  {
    name: 'Twitter / X',
    difficulty: 'Hard',
    domain: 'Social Media / Technology',
    categories: ['System Design', 'DSA', 'Computer Networks', 'HR'],
    tips: [
      'Tweet fan-out and timeline generation are classic system design topics.',
      'Know distributed caching strategies (Redis, Memcached).',
      'High throughput write systems and read-heavy timelines.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: "Design Twitter's tweet posting and home timeline generation system." },
      { category: 'DSA', difficulty: 'Hard', question: 'Design a real-time trending hashtags algorithm.' },
    ],
  },
  {
    name: 'Flipkart',
    difficulty: 'Hard',
    domain: 'E-Commerce',
    categories: ['System Design', 'DSA', 'DBMS', 'HR'],
    tips: [
      'E-commerce platform design is the core system design topic.',
      'Inventory management and flash sale handling are popular.',
      'Know distributed transaction patterns for payments.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: "Design Flipkart's flash sale system handling 1 million concurrent users." },
      { category: 'DBMS', difficulty: 'Medium', question: 'How would you design the inventory database for an e-commerce platform?' },
      { category: 'DSA', difficulty: 'Medium', question: 'Implement a shopping cart with coupon discount logic.' },
    ],
  },
  {
    name: 'Paytm',
    difficulty: 'Medium',
    domain: 'FinTech / Payments',
    categories: ['System Design', 'DSA', 'DBMS', 'Computer Networks', 'HR'],
    tips: [
      'Payment systems — wallets, UPI, transaction consistency.',
      'Know fraud detection patterns at scale.',
      'Microservices and event sourcing architecture.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: "Design PhonePe's UPI payment system handling 500M transactions/month." },
      { category: 'DBMS', difficulty: 'Medium', question: 'How do you ensure exactly-once payment processing in a distributed system?' },
    ],
  },
  {
    name: 'Swiggy',
    difficulty: 'Medium',
    domain: 'Food Delivery / Technology',
    categories: ['System Design', 'DSA', 'DBMS', 'HR'],
    tips: [
      'Real-time delivery tracking and dispatch optimization.',
      'Location-based services and routing algorithms.',
      'Order matching and delivery partner allocation.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design Swiggy — restaurant listing, order placement, real-time tracking.' },
      { category: 'DSA', difficulty: 'Medium', question: 'Find the shortest delivery route given a set of delivery points.' },
    ],
  },
  {
    name: 'Zomato',
    difficulty: 'Medium',
    domain: 'Food Tech / Technology',
    categories: ['System Design', 'DSA', 'DBMS', 'HR'],
    tips: [
      'Restaurant discovery, search ranking, and reviews.',
      'Real-time order lifecycle management.',
      'Geospatial queries for nearby restaurants.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design Zomato — restaurant search, rating system, and delivery tracking.' },
      { category: 'DSA', difficulty: 'Medium', question: 'Given a list of restaurants with coordinates, find the top-5 closest to a user.' },
    ],
  },
  {
    name: 'Razorpay',
    difficulty: 'Medium',
    domain: 'FinTech / Payments',
    categories: ['System Design', 'DSA', 'DBMS', 'Computer Networks', 'HR'],
    tips: [
      'Deep dive on payment gateway internals — webhooks, retries, idempotency.',
      'Know PCI-DSS compliance at a high level.',
      'Microservices for transaction processing.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design a payment gateway handling 10,000 TPS with idempotency.' },
      { category: 'Computer Networks', difficulty: 'Medium', question: 'How does HTTPS/TLS secure payment transactions end to end?' },
    ],
  },
  {
    name: 'CRED',
    difficulty: 'Hard',
    domain: 'FinTech',
    categories: ['System Design', 'DSA', 'HR', 'Projects'],
    tips: [
      'CRED hires senior engineers — show depth not breadth.',
      'Credit score systems and financial data pipelines.',
      'Product thinking is as important as engineering.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design a credit card bill payment and reward management system.' },
      { category: 'HR', difficulty: 'Hard', question: 'What product decision would you reverse at CRED and why?' },
    ],
  },
  {
    name: 'PhonePe',
    difficulty: 'Medium',
    domain: 'FinTech / UPI',
    categories: ['System Design', 'DBMS', 'DSA', 'HR'],
    tips: [
      'UPI payment flows and settlement cycles.',
      'High availability systems for financial transactions.',
      'Database sharding for scale.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: "Design PhonePe's UPI payment system handling 500M transactions/month." },
      { category: 'DBMS', difficulty: 'Hard', question: 'How do you shard a transactions database while maintaining query performance?' },
    ],
  },
  {
    name: 'Zepto',
    difficulty: 'Medium',
    domain: 'Quick Commerce',
    categories: ['System Design', 'DSA', 'HR'],
    tips: [
      '10-minute delivery routing optimization.',
      'Dark store inventory management.',
      'Real-time demand prediction.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design a 10-minute grocery delivery system with dark store inventory.' },
      { category: 'DSA', difficulty: 'Medium', question: 'Optimize delivery routes for multiple simultaneous orders in a 3km radius.' },
    ],
  },
  {
    name: 'Meesho',
    difficulty: 'Medium',
    domain: 'Social Commerce',
    categories: ['System Design', 'DSA', 'DBMS', 'HR'],
    tips: [
      'Reseller marketplace architecture.',
      'Catalog management at scale.',
      'Supply chain and logistics optimization.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Medium', question: 'Design a reseller marketplace with supplier catalog and commission tracking.' },
    ],
  },
  {
    name: 'Dream11',
    difficulty: 'Hard',
    domain: 'Fantasy Sports / Technology',
    categories: ['System Design', 'DSA', 'DBMS', 'HR'],
    tips: [
      'Real-time leaderboard and score computation at scale.',
      'Match event streaming and in-memory scoring.',
      'Contest management and prize distribution.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design Dream11 — real-time leaderboard for 10 million concurrent users during IPL.' },
      { category: 'DSA', difficulty: 'Hard', question: 'Design an efficient real-time ranking data structure with frequent updates.' },
    ],
  },
  {
    name: 'Byju\'s',
    difficulty: 'Medium',
    domain: 'EdTech',
    categories: ['System Design', 'DSA', 'HR', 'Projects'],
    tips: [
      'Video content delivery and adaptive learning systems.',
      'Student progress tracking and personalization.',
      'Content recommendation engines.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Medium', question: 'Design a personalized learning platform with adaptive content delivery.' },
      { category: 'HR', difficulty: 'Easy', question: 'How would you improve an online learning experience for rural students?' },
    ],
  },
  {
    name: 'Ola',
    difficulty: 'Medium',
    domain: 'Mobility / Technology',
    categories: ['System Design', 'DSA', 'DBMS', 'HR'],
    tips: [
      'Real-time cab matching and dispatch optimization.',
      'Geospatial queries and routing.',
      'Driver incentive and surge pricing algorithms.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: "Design Ola's driver dispatch system for a city of 1 million daily rides." },
      { category: 'DSA', difficulty: 'Medium', question: 'Implement a priority queue for driver dispatch based on proximity and rating.' },
    ],
  },
  {
    name: 'Freshworks',
    difficulty: 'Medium',
    domain: 'SaaS / CRM',
    categories: ['System Design', 'DSA', 'OOP', 'DBMS', 'HR'],
    tips: [
      'Multi-tenant SaaS architecture.',
      'Customer support ticketing systems.',
      'REST API design and microservices.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Medium', question: 'Design Freshdesk — a multi-tenant customer support ticketing system.' },
      { category: 'OOP', difficulty: 'Medium', question: 'Design a plugin architecture for a SaaS product using the Strategy pattern.' },
    ],
  },
  {
    name: 'Zoho',
    difficulty: 'Medium',
    domain: 'Business Software / SaaS',
    categories: ['DSA', 'OOP', 'DBMS', 'System Design', 'HR'],
    tips: [
      'Zoho builds products in-house — expect product-oriented thinking.',
      'Deep Java/C++ knowledge for backend roles.',
      'Database design and optimization are key areas.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Medium', question: 'Implement a text search engine supporting AND, OR, NOT queries.' },
      { category: 'DBMS', difficulty: 'Medium', question: 'Design the schema for a CRM storing companies, contacts, and deals.' },
      { category: 'OOP', difficulty: 'Medium', question: 'Design a workflow engine for a business process automation tool.' },
    ],
  },
  {
    name: 'Nutanix',
    difficulty: 'Hard',
    domain: 'Cloud Infrastructure / HCI',
    categories: ['System Design', 'OS', 'DSA', 'Computer Networks', 'HR'],
    tips: [
      'Hyperconverged infrastructure and distributed storage.',
      'Virtualization (KVM, VMware) concepts.',
      'Storage replication and fault tolerance at the storage layer.',
    ],
    specificQuestions: [
      { category: 'System Design', difficulty: 'Hard', question: 'Design a distributed storage system with replication and fault tolerance.' },
      { category: 'OS', difficulty: 'Hard', question: 'Explain how virtualization works — Type 1 vs Type 2 hypervisors.' },
    ],
  },
  {
    name: 'Palo Alto Networks',
    difficulty: 'Hard',
    domain: 'Cybersecurity',
    categories: ['Computer Networks', 'OS', 'System Design', 'DSA', 'HR'],
    tips: [
      'Deep network security knowledge — firewalls, IDS/IPS.',
      'Zero-trust architecture is a key design topic.',
      'Threat detection algorithms and log analysis.',
    ],
    specificQuestions: [
      { category: 'Computer Networks', difficulty: 'Hard', question: 'Explain how a next-generation firewall (NGFW) differs from traditional firewalls.' },
      { category: 'System Design', difficulty: 'Hard', question: 'Design a cloud-based intrusion detection system at enterprise scale.' },
    ],
  },
  {
    name: 'VMware',
    difficulty: 'Hard',
    domain: 'Virtualization / Cloud',
    categories: ['OS', 'System Design', 'Computer Networks', 'DSA', 'HR'],
    tips: [
      'Deep virtualization and containerization knowledge.',
      'Kubernetes and cloud-native architecture.',
      'Network virtualization (NSX, SDN).',
    ],
    specificQuestions: [
      { category: 'OS', difficulty: 'Hard', question: 'How does live VM migration work without downtime?' },
      { category: 'System Design', difficulty: 'Hard', question: 'Design a Kubernetes cluster autoscaler for a multi-cloud environment.' },
    ],
  },
  {
    name: 'Qualcomm',
    difficulty: 'Hard',
    domain: 'Semiconductors / Mobile',
    categories: ['OS', 'DSA', 'Computer Networks', 'OOP', 'HR'],
    tips: [
      'Mobile chipset architecture and wireless protocols.',
      'DSP and signal processing algorithms.',
      'Embedded C and RTOS proficiency.',
      '5G and LTE network stack knowledge.',
    ],
    specificQuestions: [
      { category: 'OS', difficulty: 'Hard', question: 'How does an RTOS guarantee deterministic response times?' },
      { category: 'Computer Networks', difficulty: 'Hard', question: 'Explain how 5G NR (New Radio) differs from 4G LTE in architecture.' },
      { category: 'DSA', difficulty: 'Medium', question: 'Implement a circular buffer for audio stream processing.' },
    ],
  },
  {
    name: 'Samsung',
    difficulty: 'Medium',
    domain: 'Electronics / Technology',
    categories: ['OS', 'OOP', 'DSA', 'Computer Networks', 'HR'],
    tips: [
      'Embedded systems for mobile and consumer electronics.',
      'Android platform internals for software roles.',
      'Hardware-software co-design thinking.',
    ],
    specificQuestions: [
      { category: 'OS', difficulty: 'Medium', question: 'How does Android manage application lifecycle and memory?' },
      { category: 'OOP', difficulty: 'Medium', question: 'Design a camera app architecture using MVVM pattern.' },
    ],
  },
  {
    name: 'SAP',
    difficulty: 'Medium',
    domain: 'Enterprise Software / ERP',
    categories: ['DBMS', 'System Design', 'OOP', 'HR', 'Projects'],
    tips: [
      'ABAP and SAP HANA knowledge for product roles.',
      'Enterprise integration patterns (ESB, messaging).',
      'Large-scale ERP deployment and data migration.',
    ],
    specificQuestions: [
      { category: 'DBMS', difficulty: 'Hard', question: 'What makes SAP HANA an in-memory database? How does it differ from traditional RDBMS?' },
      { category: 'System Design', difficulty: 'Hard', question: 'Design an ERP integration layer connecting SAP with 50 legacy enterprise systems.' },
    ],
  },
  {
    name: 'HCL Technologies',
    difficulty: 'Easy',
    domain: 'IT Services',
    categories: ['DSA', 'OOP', 'DBMS', 'HR', 'Computer Networks'],
    tips: [
      'HCL values technical breadth — cover all CS fundamentals.',
      'Client-facing roles require strong communication skills.',
      'Know Java, .NET, or Python at a proficient level.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Easy', question: 'Implement binary search.' },
      { category: 'OOP', difficulty: 'Easy', question: 'Explain the concept of encapsulation with a real-world example.' },
      { category: 'HR', difficulty: 'Easy', question: 'How do you stay updated with new technologies?' },
    ],
  },
  {
    name: 'Tech Mahindra',
    difficulty: 'Easy',
    domain: 'IT Services / Telecom',
    categories: ['DSA', 'OOP', 'DBMS', 'HR', 'Computer Networks'],
    tips: [
      'Telecom domain knowledge is a differentiator.',
      'Basic programming and reasoning tests.',
      'Group discussions on technology topics.',
    ],
    specificQuestions: [
      { category: 'Computer Networks', difficulty: 'Easy', question: 'What is the difference between circuit switching and packet switching?' },
      { category: 'DSA', difficulty: 'Easy', question: 'Find the factorial of a number recursively and iteratively.' },
      { category: 'HR', difficulty: 'Easy', question: 'Describe a time you showed leadership in a group project.' },
    ],
  },
  {
    name: 'Mphasis',
    difficulty: 'Easy',
    domain: 'IT Services / BPO',
    categories: ['DSA', 'OOP', 'DBMS', 'HR'],
    tips: [
      'BFSI (Banking, Financial Services) domain focus.',
      'Basic Java and .NET skills.',
      'Communication and analytical ability.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Easy', question: 'Implement a stack using arrays.' },
      { category: 'DBMS', difficulty: 'Easy', question: 'What is a stored procedure? Write a simple example.' },
    ],
  },
  {
    name: 'L&T Technology Services',
    difficulty: 'Medium',
    domain: 'Engineering Services / IoT',
    categories: ['OS', 'Computer Networks', 'DSA', 'OOP', 'HR'],
    tips: [
      'Embedded systems and IoT platform design.',
      'Industry 4.0 and smart manufacturing context.',
      'C/C++ for embedded roles.',
    ],
    specificQuestions: [
      { category: 'OS', difficulty: 'Medium', question: 'How does an embedded OS schedule tasks differently from a desktop OS?' },
      { category: 'Computer Networks', difficulty: 'Medium', question: 'Explain MQTT protocol and its use in IoT devices.' },
    ],
  },
  {
    name: 'Persistent Systems',
    difficulty: 'Medium',
    domain: 'IT Services / Product Engineering',
    categories: ['DSA', 'OOP', 'System Design', 'DBMS', 'HR'],
    tips: [
      'Product engineering focus — show ownership of complete features.',
      'Agile methodology and CI/CD knowledge.',
      'Cloud platforms (AWS, Azure) are valued.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Medium', question: 'Word Break Problem — can a string be segmented using dictionary words?' },
      { category: 'System Design', difficulty: 'Medium', question: 'Design a CI/CD pipeline for a microservices application.' },
    ],
  },
  {
    name: 'Hexaware',
    difficulty: 'Easy',
    domain: 'IT Services / BPO',
    categories: ['DSA', 'OOP', 'DBMS', 'HR'],
    tips: [
      'Aptitude test with coding assessment.',
      'Focus on Java, SQL, and basic data structures.',
      'Positive attitude and willingness to learn matter.',
    ],
    specificQuestions: [
      { category: 'DSA', difficulty: 'Easy', question: 'Swap two numbers without a temporary variable.' },
      { category: 'DBMS', difficulty: 'Easy', question: 'What is normalization? Why is it important?' },
    ],
  },
  {
    name: 'Mindtree',
    difficulty: 'Easy',
    domain: 'IT Services',
    categories: ['DSA', 'OOP', 'DBMS', 'HR', 'Projects'],
    tips: [
      'Online test with pseudocode and reasoning.',
      'Technical interview on OOP, DBMS, and one coding problem.',
      'HR round focuses on work-life balance expectations and team fit.',
    ],
    specificQuestions: [
      { category: 'OOP', difficulty: 'Easy', question: 'What is the difference between compile-time and run-time polymorphism?' },
      { category: 'HR', difficulty: 'Easy', question: 'Where do you see yourself in the next 3 years?' },
    ],
  },
];

// ─── Build flat question list ─────────────────────────────────────────────────

let _questionCounter = 1;
function makeId(company: string, category: string, i: number) {
  return `q-${_questionCounter++}`;
}

function buildQuestionsForCompany(entry: CompanyEntry): InterviewQuestion[] {
  const all: InterviewQuestion[] = [];

  const categorySet = new Set(entry.categories);

  // Pull from shared banks that match this company's categories
  const sharedBanks: Omit<InterviewQuestion, 'id' | 'company'>[][] = [];
  if (categorySet.has('DSA'))              sharedBanks.push(dsaShared);
  if (categorySet.has('System Design'))    sharedBanks.push(sdShared);
  if (categorySet.has('DBMS'))             sharedBanks.push(dbShared);
  if (categorySet.has('OS'))               sharedBanks.push(osShared);
  if (categorySet.has('Computer Networks'))sharedBanks.push(cnShared);
  if (categorySet.has('OOP'))              sharedBanks.push(oopShared);
  if (categorySet.has('HR'))               sharedBanks.push(hrShared);
  if (categorySet.has('Projects'))         sharedBanks.push(projShared);

  for (const bank of sharedBanks) {
    // Include up to 4 shared questions per category
    bank.slice(0, 4).forEach((q, i) => {
      all.push(enrichQuestion({ id: makeId(entry.name, q.category, i), company: entry.name, ...q }));
    });
  }

  // Add company-specific questions
  entry.specificQuestions.forEach((q, i) => {
    all.push(enrichQuestion({ id: makeId(entry.name, q.category, i), company: entry.name, ...q }));
  });

  return all;
}

// Build the full flat list lazily (once per module load)
export const interviewQuestions: InterviewQuestion[] = companies.flatMap(buildQuestionsForCompany);

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCompanyNames(): string[] {
  return companies.map(c => c.name);
}

export function getQuestionsForCompany(companyName: string): InterviewQuestion[] {
  return interviewQuestions.filter(q => q.company === companyName);
}

export function getQuestionsForCompanyAndCategory(companyName: string, category: string): InterviewQuestion[] {
  return interviewQuestions.filter(q => q.company === companyName && q.category === category);
}

export function getCategoriesForCompany(companyName: string): string[] {
  const entry = companies.find(c => c.name === companyName);
  return entry ? entry.categories : [];
}

export function getCompanyEntry(companyName: string): CompanyEntry | undefined {
  return companies.find(c => c.name === companyName);
}

