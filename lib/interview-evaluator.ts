import { InterviewQuestion } from './types';

export interface EvaluationResult {
  score: number;
  level: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor';
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  feedback: string;
  reason: string;
}

// Map concepts to related words/synonyms for semantic checks
const conceptSynonyms: Record<string, string[]> = {
  'pointer manipulation': ['pointer', 'reference', 'link', 'next', 'prev', 'current', 'node', 'dereference', 'assign'],
  'three pointer approach': ['three', '3', 'prev', 'curr', 'current', 'next', 'temp', 'pointer', 'reference'],
  'reverse next reference': ['reverse', 'flip', 'invert', 'change', 'next', 'point', 'reference', 'link'],
  'linked list traversal': ['traverse', 'iterate', 'loop', 'while', 'current', 'next', 'head', 'node'],
  'hash map lookup': ['hash', 'map', 'dictionary', 'dict', 'lookup', 'key', 'value', 'o(1)'],
  'complement calculation': ['complement', 'target', 'minus', 'difference', 'subtract'],
  'time complexity optimization': ['optimize', 'efficient', 'time complexity', 'o(n)', 'o(log n)', 'linear', 'fast'],
  'one-pass hash map': ['one pass', 'single pass', 'one-loop', 'hashmap', 'visited'],
  'doubly linked list': ['doubly', 'double link', 'prev', 'next', 'node', 'head', 'tail'],
  'cache eviction policy': ['evict', 'remove', 'discard', 'capacity', 'delete', 'full', 'least recently used'],
  'constant time o(1) operations': ['constant', 'o(1)', 'instant', 'fast', 'hashmap'],
  'divide and conquer': ['divide', 'conquer', 'half', 'split', 'binary'],
  'binary search': ['binary search', 'mid', 'middle', 'half', 'left', 'right', 'sorted'],
  'boundary pointer manipulation': ['boundary', 'left', 'right', 'low', 'high', 'pointer', 'index'],
  'logarithmic time complexity': ['logarithmic', 'o(log n)', 'binary search'],
  'websockets protocol': ['websocket', 'socket', 'persistent', 'duplex', 'bi-directional', 'ws', 'wss'],
  'load balancing': ['load balance', 'lb', 'nginx', 'distribute', 'traffic', 'gateway'],
  'message queue queuing': ['queue', 'mq', 'kafka', 'rabbitmq', 'pub/sub', 'broker'],
  'presence service': ['presence', 'online', 'status', 'active', 'heartbeat'],
  'chat storage scale': ['cassandra', 'nosql', 'storage', 'database', 'partition', 'history'],
  'cdn distribution': ['cdn', 'edge', 'cache', 'cloudflare', 'cloudfront', 'geographical'],
  'video transcoding': ['transcode', 'encode', 'format', 'resolution', 'ffmpeg', 'convert'],
  'hls/dash protocols': ['hls', 'dash', 'adaptive', 'stream', 'manifest', 'm3u8'],
  'blob storage file management': ['blob', 's3', 'bucket', 'file', 'storage', 'object'],
  'base62 encoding': ['base62', 'base 62', 'encode', 'shorten', 'character'],
  'unique id generator': ['unique id', 'snowflake', 'uuid', 'sequence', 'generator'],
  'distributed caching': ['redis', 'memcached', 'cache', 'distributed'],
  'rest redirects (302 vs 301)': ['redirect', '302', '301', 'http status', 'found', 'permanent'],
  'web crawling': ['crawler', 'crawl', 'download', 'scrape', 'link', 'dfs', 'bfs'],
  'inverted index search': ['inverted', 'index', 'term', 'word', 'document', 'mapping', 'postings list'],
  'pagerank algorithm': ['pagerank', 'page rank', 'link analysis', 'rank', 'authority'],
  'database transaction integrity': ['transaction', 'acid', 'integrity', 'lock', 'mvcc'],
  'acid properties': ['acid', 'atomicity', 'consistency', 'isolation', 'durability'],
  'isolation levels': ['isolation', 'serializable', 'repeatable read', 'read committed', 'dirty read'],
  'database normalization': ['normaliz', '1nf', '2nf', '3nf', 'bcnf', 'redundancy', 'dependency'],
  'database search indexes': ['index', 'b-tree', 'b+tree', 'search', 'seek', 'scan'],
  'operating system process execution': ['process', 'memory', 'space', 'address', 'virtual', 'pcb'],
  'thread lightweight execution': ['thread', 'lightweight', 'share', 'stack', 'concurrency'],
  'memory paging segmentation': ['page', 'segment', 'virtual memory', 'frame', 'ram'],
  'deadlock deadlock conditions': ['deadlock', 'coffman', 'mutex', 'lock', 'starvation'],
  'osi networking layers': ['osi', 'layer', 'physical', 'transport', 'network', 'application'],
  'tcp connection protocols': ['tcp', 'connection', 'handshake', 'reliable', 'syn', 'ack'],
  'solid design principles': ['solid', 'responsibility', 'open-closed', 'liskov', 'interface', 'dependency'],
  'behavioral evaluation fit': ['star', 'behavioral', 'conflict', 'experience', 'situation'],
  'project software architectures': ['architecture', 'structure', 'backend', 'frontend', 'database', 'framework']
};

export function evaluateAnswer(answer: string, question: InterviewQuestion): EvaluationResult {
  const ansLower = answer.toLowerCase();
  
  const expectedConcepts = question.expected_concepts || [];
  const keyPoints = question.key_points || [];
  const commonMistakes = question.common_mistakes || [];

  let matchedConceptsCount = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvementTips: string[] = [];

  // 1. Concept Coverage (50% of total score)
  expectedConcepts.forEach(concept => {
    let matched = false;
    // Check exact match
    if (ansLower.includes(concept.toLowerCase())) {
      matched = true;
    } else {
      // Check individual words or synonyms
      const synonyms = conceptSynonyms[concept.toLowerCase()] || [];
      const hasSynonym = synonyms.some(syn => ansLower.includes(syn));
      if (hasSynonym) {
        matched = true;
      }
    }

    if (matched) {
      matchedConceptsCount++;
      strengths.push(`Addressed core concept: "${concept}"`);
    } else {
      weaknesses.push(`Missed concept coverage: "${concept}"`);
      improvementTips.push(`Elaborate on "${concept}" and explain its role in your solution.`);
    }
  });

  const conceptWeight = expectedConcepts.length > 0 ? (matchedConceptsCount / expectedConcepts.length) * 50 : 50;

  // 2. Important Key Points (25% of total score)
  let matchedPointsCount = 0;
  keyPoints.forEach(point => {
    // Check if some words in the point description match
    const pointWords = point.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matchScore = pointWords.filter(w => ansLower.includes(w)).length;
    
    // If at least 40% of key words in the point description are mentioned, count it
    const threshold = Math.max(1, Math.floor(pointWords.length * 0.4));
    if (matchScore >= threshold || ansLower.includes(point.toLowerCase())) {
      matchedPointsCount++;
    }
  });

  const pointsWeight = keyPoints.length > 0 ? (matchedPointsCount / keyPoints.length) * 25 : 25;

  // 3. Mistake Detection (15% of total score)
  let mistakesDetected = 0;
  commonMistakes.forEach(mistake => {
    const mistakeWords = mistake.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    // If user explicitly writes the mistake keywords (e.g. "forget to update", "lose pointer"), detect it
    const matchCount = mistakeWords.filter(w => ansLower.includes(w)).length;
    const threshold = Math.max(2, Math.floor(mistakeWords.length * 0.6));
    
    if (matchCount >= threshold) {
      mistakesDetected++;
      weaknesses.push(`Possible issue: "${mistake}"`);
      improvementTips.push(`Ensure your explanation avoids "${mistake}" and clearly outlines how you handle it.`);
    }
  });

  // Start with full 15 points, subtract proportion per mistake detected
  const mistakeDeduction = commonMistakes.length > 0 ? (mistakesDetected / commonMistakes.length) * 15 : 0;
  const mistakeWeight = Math.max(0, 15 - mistakeDeduction);

  // 4. Completeness (10% of total score)
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  let completenessWeight = 0;
  if (wordCount >= 100) completenessWeight = 10;
  else if (wordCount >= 50) completenessWeight = 7;
  else if (wordCount >= 20) completenessWeight = 4;
  else completenessWeight = 1;

  // Calculate overall score
  const rawScore = conceptWeight + pointsWeight + mistakeWeight + completenessWeight;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Determine evaluation level
  let level: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor';
  let reason = '';
  let feedback = '';

  if (score >= 90) {
    level = 'Excellent';
    reason = 'The response is comprehensive, technically precise, and covers all expected concepts thoroughly.';
    feedback = 'Excellent job! You demonstrated deep technical clarity. Your explanation is structured, targets the core components directly, and correctly avoids common pitfalls. To improve even further, consider walking through a concrete dry-run example.';
  } else if (score >= 75) {
    level = 'Good';
    reason = 'The response shows good knowledge of the topic, but misses minor details or code/design edge cases.';
    feedback = 'Very solid answer. You have a clear grasp of the main mechanism. To get to the next level, describe boundary conditions (e.g. empty inputs or concurrent lookups) and justify your choice of structures/protocols.';
  } else if (score >= 50) {
    level = 'Needs Improvement';
    reason = 'The response addresses the question partially but lacks details on core concepts or contains potential issues.';
    feedback = 'Your answer covers the basic definition, but is too high-level. Interviewers expect a deeper walk-through. Spend more time explaining how the components interact, outline step-by-step algorithms, and focus on the topics in the feedback lists.';
  } else {
    level = 'Poor';
    reason = 'The response is too brief, misses the core algorithmic/architectural concepts, or has major flaws.';
    feedback = 'The explanation is incomplete or incorrect. Review the model explanation and key concepts. Try to practice listing the individual steps first, define the memory/complexity bounds, and expand your response with descriptive logic.';
  }

  // Construct default lists if empty
  if (strengths.length === 0) {
    strengths.push('Identified basic terminology related to the question.');
  }
  if (weaknesses.length === 0 && score < 90) {
    weaknesses.push('Could provide a more detailed step-by-step walkthrough.');
  }
  if (improvementTips.length === 0) {
    improvementTips.push('Review the expected concepts and practice writing out full code structure or structural diagrams.');
  }

  return {
    score,
    level,
    strengths: strengths.slice(0, 3), // limit lists to prevent UI overflow
    weaknesses: weaknesses.slice(0, 3),
    improvementTips: improvementTips.slice(0, 3),
    feedback,
    reason
  };
}
