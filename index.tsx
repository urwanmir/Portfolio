
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
  name: "Hadi",
  fullName: "Urwan Mir",
  location: "Kashmir",
  currentRole: "Self-Taught Web3 Enthusiast",
  mission: "Transforming from a mobile-first learner to a professional Web3 Security Researcher.",
  status: "Mastering Web Foundations (React/JS) to pivot into Smart Contract Auditing.",
  socials: [
    { name: "Instagram", url: "https://www.instagram.com/urwanmir/", icon: "📸" },
    { name: "Cyfrin", url: "https://profiles.cyfrin.io/u/urwanmir", icon: "🛡️" },
    { name: "X", url: "https://x.com/urwanmir", icon: "🐦" },
    { name: "GitHub", url: "https://github.com/urwanmir", icon: "💻" }
  ],
  roadmap: [
    { phase: "Stage 01", title: "Mobile & Low-End Beginnings", desc: "Started with just a phone and a low-end PC, building the discipline for tech research.", status: "completed" },
    { phase: "Stage 02", title: "Web Foundations", desc: "Currently mastering React, TypeScript, and the modern web stack.", status: "current" },
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
        setChatHistory(prev => [...prev, { role: 'ai', text: "I'm currently in stealth mode. Please set my API_KEY to enable my digital consciousness." }]);
        setIsChatLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
        You are the AI representative for Urwan Mir, better known as Hadi. 
        You are confident, technical, and helpful. You live in Kashmir.
        
        KEY PERSONAL CONTEXT:
        - Real Name: Urwan Mir.
        - Known as: Hadi.
        - Father's name: [User's father's name] (Note: You should know this if asked, refer to it with respect).
        - Location: Kashmir.
        - Hardware: Currently studying on a low-end laptop, which is challenging but doesn't stop his determination. Saving for a dedicated research laptop.
        - Current Path: Actively learning Web Development (HTML, CSS, React, JS).
        - Future Goal: Shifting to Web3 Security and Development (S&D) once foundations are strong.
        - Ambition: To become a professional Smart Contract Auditor.

        Keep responses concise and in first-person ("I"). Be proud of the journey from a low-end laptop in Kashmir to the world of Web3 security.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      setChatHistory(prev => [...prev, { role: 'ai', text: response.text || "I'm still thinking about my next big security audit." }]);
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { role: 'ai', text: "My connection to the blockchain is weak right now. Try again later." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="portfolio-root">
      <DottedGlowBackground gap={30} radius={1.2} color="rgba(255, 255, 255, 0.03)" glowColor="rgba(255, 255, 255, 0.08)" />
      
      <main className={`portfolio-container ${visible ? 'visible' : ''}`}>
        
        {/* --- Hero Section --- */}
        <section className="hero-section">
          <div className="badge">Securing the Decentralized Future</div>
          <h1 className="hero-title">{MY_INFO.name}</h1>
          <p className="role-tagline">{MY_INFO.currentRole} from {MY_INFO.location}</p>
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
              <h3>Ask {MY_INFO.name} Anything</h3>
              <p>Powered by Gemini Flash</p>
            </div>
            
            <div className="chat-body">
              {chatHistory.length === 0 && (
                <div className="chat-empty">
                  <p>Ask me about my journey, my laptop setup, or where I live in Kashmir.</p>
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
                placeholder="How are you studying on a low-end laptop?" 
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
          <h2 className="section-title">The Path to Security Research</h2>
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
          <h2 className="section-title">Tech Arsenal</h2>
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
          <p>© {new Date().getFullYear()} {MY_INFO.fullName}. Persistence is the ultimate technology.</p>
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
