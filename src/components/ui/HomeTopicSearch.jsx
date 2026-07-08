import { useState, useEffect, useRef, useMemo } from 'react';
import { Search } from 'lucide-react';

const ALL_TOPICS = [
  "learn HTML", "master CSS", "learn JavaScript", "master React", "build with Node.js",
  "learn TypeScript", "build with Vue", "web development", "frontend dev", "backend APIs",
  "REST APIs", "design databases", "learn algorithms", "data structures", "linked lists",
  "binary trees", "sorting algorithms", "design patterns", "functional programming",
  "simulate physics", "orbital mechanics", "gravity simulation", "kinematics", "explore chemistry",
  "stoichiometry", "molecular structure", "learn calculus", "linear algebra", "geometry",
  "probability", "statistics", "combinatorics", "group theory", "discrete math", "robotics",
  "PID control", "CNC & G-Code", "industrial automation", "PLC programming", "digital logic",
  "circuit design", "CPU architecture", "3D modeling", "CAD design", "parametric design",
  "data science", "machine learning", "python programming", "MATLAB", "Three.js", "WebGL graphics",
  "game development", "audio DSP", "music production", "vector graphics", "SVG design",
  "I want to build a robot", "show me how to make games", "I need to learn math",
  "help me understand physics", "how do APIs work?", "simulate a coordinate measuring machine",
  "I want to learn 3D modeling", "teach me data science", "how does a CPU work?",
  "I want to build a website", "show me machine learning", "learn to calculate probabilities",
  "simulate celestial mechanics", "build a physics engine from scratch", "learn to code in Python",
  "master frontend web development", "build a backend server", "design digital logic circuits",
  "explore molecular chemistry", "learn advanced calculus", "master linear transformations"
];

const PILL_COLORS = [
  'from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-700 dark:text-indigo-300',
  'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
  'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-700 dark:text-rose-300',
  'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300',
  'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-700 dark:text-violet-300',
  'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 text-cyan-700 dark:text-cyan-300',
];

function getPillColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PILL_COLORS[Math.abs(hash) % PILL_COLORS.length];
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function HomeTopicSearch({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Select 4 random topics on mount
  const randomTopics = useMemo(() => shuffle(ALL_TOPICS).slice(0, 4), []);
  
  const [topicIndex, setTopicIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentTopic = ALL_TOPICS[topicIndex];

  useEffect(() => {
    if (isFocused || query.length > 0) return;

    let timeoutId;
    
    // We handle state updates inside the timeout so the re-render doesn't cancel the pause
    if (!isDeleting && charIndex === currentTopic.length) {
      timeoutId = setTimeout(() => setIsDeleting(true), 1500); // Wait 1.5s at end of word
    } else if (isDeleting && charIndex === 0) {
      timeoutId = setTimeout(() => {
        setIsDeleting(false);
        setTopicIndex((prev) => (prev + 1) % ALL_TOPICS.length);
      }, 500); // Wait 0.5s before next word
    } else {
      const speed = isDeleting ? 30 : 80;
      timeoutId = setTimeout(() => {
        setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
      }, speed);
    }

    return () => clearTimeout(timeoutId);
  }, [charIndex, isDeleting, isFocused, query, topicIndex, currentTopic.length]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleTopicClick = (topic) => {
    // Strip conversational filler for the actual search term
    let keyword = topic.toLowerCase();
    
    // An aggressive list of prefixes to remove to get to the meat of the topic
    const prefixes = [
      "i want to learn ", "i want to build a ", "i want to build ", "show me how to make ",
      "show me ", "i need to learn ", "help me understand ", "how do ", "how does a ",
      "simulate a ", "teach me ", "learn to calculate ", "learn to code in ",
      "build a ", "build ", "learn ", "master ", "simulate ", "explore ", "design ",
      "visualise ", "visualize "
    ];
    
    for (const p of prefixes) {
      if (keyword.startsWith(p)) {
        keyword = keyword.substring(p.length);
        break;
      }
    }
    
    // Also remove suffix noise like " work?", " from scratch"
    keyword = keyword.replace(" work?", "").replace(" from scratch", "");
    
    setQuery(keyword);
    onSearch(keyword);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center my-10">
      <form onSubmit={(e) => e.preventDefault()} className="relative w-full group">
        <div className="relative p-[3px] rounded-[2rem] bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-cyan-500/30 hover:from-indigo-500/50 hover:via-fuchsia-500/50 hover:to-cyan-500/50 transition-all duration-500 shadow-lg hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]">
          <div className="relative w-full bg-white/90 dark:bg-slate-900/90 rounded-[29px] backdrop-blur-xl">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            
            {!query && !isFocused && (
              <div className="absolute inset-y-0 left-14 flex items-center pointer-events-none z-10">
                <span className="text-slate-500 dark:text-slate-400 text-xl font-medium">{currentTopic.substring(0, charIndex)}</span>
                <span className="text-indigo-500 dark:text-indigo-400 text-xl font-medium animate-[pulse_0.8s_ease-in-out_infinite] ml-0.5">|</span>
              </div>
            )}

            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isFocused ? "Search the universe..." : ""}
              className="relative w-full pl-14 pr-14 py-5 text-xl font-medium bg-transparent rounded-[29px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  onSearch('');
                }}
                className="absolute inset-y-0 right-5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors z-10"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </form>
      
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        {randomTopics.map((topic) => (
          <button
            key={topic}
            onClick={() => handleTopicClick(topic)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r border transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_20px_rgb(0,0,0,0.3)] active:translate-y-0 backdrop-blur-md shadow-sm ${getPillColor(topic)}`}
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}
