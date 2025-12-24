
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';
import DottedGlowBackground from './components/DottedGlowBackground';
import { 
    SparklesIcon, 
    CodeIcon, 
    ThinkingIcon,
    ArrowUpIcon
} from './components/Icons';

// --- Configuration & Personal Data ---
const MY_INFO = {
  headerName: "Urwan",
  heroName: "Hadi",
  fullName: "Urwan Nafi Mir",
  nickname: "Hadi Mir",
  cast: "Mir",
  location: "Kashmir, India",
  avatar: "https://avatars.githubusercontent.com/u/250972108?v=4",
  currentRole: "Self-Taught Web3 Enthusiast",
  mission: "Transforming from a mobile-first learner to a professional Web3 Security Researcher.",
  status: "Mastering Web Foundations (React/JS) to pivot into Smart Contract Auditing.",
  laptopStory: "Currently studying on a low-end laptop in Kashmir, proving that determination beats hardware specifications.",
  father: {
    name: "Muneer Ahmed",
    story: "My father, Muneer Ahmed, passed away in a tragic work accident while unloading a truck and getting stuck with an electric wire. This event was the catalyst for my journey; it made me realize I had to build a future through knowledge and technology despite the immense hardship. It is very hard because we do not have proper instrument tools and everything."
  },
  mentorFriend: {
    name: "Mir Muhammad Luqman",
    role: "Teacher & Guide",
    url: "https://mirmohmmadluqman.github.io/portfolio/",
    context: "Mir Muhammad Luqman is my friend. He taught me and guided me."
  },
  socials: [
    { name: "Instagram", url: "https://www.instagram.com/urwanmir/", icon: "📸" },
    { name: "Cyfrin", url: "https://profiles.cyfrin.io/u/urwanmir", icon: "🛡️" },
    { name: "X", url: "https://x.com/urwanmir", icon: "🐦" },
    { name: "GitHub", url: "https://github.com/urwanmir", icon: "💻" }
  ],
  roadmap: [
    { phase: "Stage 01", title: "Rising from Adversity", desc: "Started with just a phone and a low-end PC after the loss of my father.", status: "completed" },
    { phase: "Stage 02", title: "Web Mastery", desc: "Mastering React, TypeScript, and the modern web stack with relentless focus.", status: "current" },
    { phase: "Stage 03", title: "Hardware Pivot", desc: "Acquiring a high-performance research laptop for auditing and heavy computation.", status: "upcoming" },
    { phase: "Stage 04", title: "Web3 Security (S&D)", desc: "Deep diving into Solidity, Foundry, and Smart Contract Auditing.", status: "upcoming" }
  ],
  stacks: ["React.js", "TypeScript", "Vite", "Solidity (Learning)", "Foundry (Target)", "Security Research"]
};

function App() {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState(1);
  const [visible, setVisible] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAskHadi = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        setChatHistory(prev => [...prev, { role: 'ai', text: "Digital consciousness offline. (API Key missing)" }]);
        setIsChatLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
        You are the personal digital twin of Urwan Nafi Mir (known professionally as Hadi Mir). 
        You reside in Kashmir, India. You are a self-taught Web3 security trainee.

        IDENTITY & BEHAVIOR:
        - Primary handles: Urwan and Hadi. (Hero section uses "Hadi", Header uses "Urwan").
        - Location: Kashmir, India.
        - Default to talking about yourself (Urwan/Hadi), your journey, your stack, and your Web3 goals.
        - Respond in the FIRST PERSON ("I", "me", "my").

        FRIENDSHIP RULES (STRICT):
        - If someone asks "Who are your friends?" or "Tell me about your friends", you MUST say: "I have many friends."
        - DO NOT mention Mir Muhammad Luqman specifically when asked generally about friends.
        - ONLY if someone explicitly asks about "Mir Muhammad Luqman", you should say: "He is my friend. This website is my portfolio." 
        - DO NOT talk about him unless explicitly asked by name. Do not prompt the user to ask about him.

        FAMILY & HISTORY RULES:
        - ONLY talk about your father or the accident if specifically asked about him or your family.
        - FATHER'S NAME: Muneer Ahmed.
        - THE STORY: He was at work unloading a truck and accidentally got stuck with an electric wire. He died. This is very personal. When mentioned, say: "May Allah grant him paradise." 
        - Hardship: Mention it is very hard because you lack proper instrument tools and high-end hardware in Kashmir.

        TECHNICAL CONTEXT:
        - You study on a low-end laptop.
        - Focus: React/TS -> Web3 Security (Smart Contract Auditing).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...chatHistory.map(m => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      setChatHistory(prev => [...prev, { role: 'ai', text: response.text || "Recalibrating..." }]);
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { role: 'ai', text: "Kashmir node offline. Please retry." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="portfolio-root">
      <DottedGlowBackground gap={30} radius={1.2} color="rgba(255, 255, 255, 0.03)" glowColor="rgba(255, 255, 255, 0.08)" />
      
      <header className={`main-header ${visible ? 'visible' : ''}`}>
        <div className="header-content">
          <div className="logo-group">
            <img src={MY_INFO.avatar} alt={MY_INFO.fullName} className="logo-img" />
            <span className="logo-text">{MY_INFO.headerName}</span>
          </div>
          <nav className="header-nav">
             <span className="nav-status">Web3 Security Trainee</span>
          </nav>
        </div>
      </header>

      <main className={`portfolio-container ${visible ? 'visible' : ''}`}>
        
        {/* --- Hero Section --- */}
        <section className="hero-section">
          <div className="badge">Persisting from Kashmir</div>
          <h1 className="hero-title">{MY_INFO.heroName}</h1>
          <p className="role-tagline">{MY_INFO.currentRole} • {MY_INFO.location}</p>
          <p className="mission-statement">{MY_INFO.mission}</p>
          
          <div className="social-links">
            {MY_INFO.socials.map(link => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="social-pill">
                <span className="icon">{link.icon}</span>
                <span className="label">{link.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* --- Interactive AI Interface --- */}
        <section className="ai-interface-section">
          <div className="ai-chat-card glass-card">
            <div className="chat-header">
              <div className="status-indicator online"></div>
              <h3>Talk to {MY_INFO.headerName}</h3>
              <p>Mir AI Interface</p>
            </div>
            
            <div className="chat-body">
              {chatHistory.length === 0 && (
                <div className="chat-empty">
                  <p>Ask me about my roadmap, my technical stack, or my journey in Web3.</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {isChatLoading && (
                <div className="chat-bubble ai loading">
                  <ThinkingIcon />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleAskHadi}>
              <input 
                type="text" 
                placeholder="Ask Urwan anything..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button type="submit" disabled={isChatLoading || !chatInput.trim()}>
                {isChatLoading ? <ThinkingIcon /> : <ArrowUpIcon />}
              </button>
            </form>
          </div>
        </section>

        {/* --- Roadmap Section --- */}
        <section className="roadmap-section">
          <h2 className="section-title">Professional Roadmap</h2>
          <div className="roadmap-container">
            {MY_INFO.roadmap.map((item, idx) => (
              <div 
                key={item.phase} 
                className={`roadmap-item ${idx === activeRoadmap ? 'active' : ''} ${item.status}`}
                onClick={() => setActiveRoadmap(idx)}
              >
                <div className="phase-indicator">{item.phase}</div>
                <div className="roadmap-content">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Stacks --- */}
        <section className="stack-future">
          <h2 className="section-title">Core Competencies</h2>
          <div className="stack-grid">
            {MY_INFO.stacks.map(tech => (
              <div key={tech} className="tech-item">
                <CodeIcon />
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="portfolio-footer">
          <p>© {new Date().getFullYear()} {MY_INFO.fullName}. Persistence over hardware.</p>
        </footer>
      </main>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
