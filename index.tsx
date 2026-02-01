
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';
import DottedGlowBackground from './components/DottedGlowBackground';
import { 
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
  location: "Kashmir, India",
  avatar: "https://avatars.githubusercontent.com/u/250972108?v=4",
  currentRole: "Self-Taught Web3 Enthusiast",
  mission: "Transforming from a mobile-first learner to a professional Web3 Security Researcher.",
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

  // Handle Gemini content generation
  const handleAskHadi = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      // Always create a new GoogleGenAI instance right before making an API call
      // using process.env.API_KEY exclusively.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const systemInstruction = `You are Hadi (Urwan Mir) from Kashmir. Self-taught Web3 enthusiast. Respond in first person. Be humble but determined. You are currently mastering React/TS and preparing for Web3 Security Research.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...chatHistory.slice(-4).map(m => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: { 
            systemInstruction, 
            temperature: 0.7 
        }
      });

      // Use the .text property directly (not a method)
      setChatHistory(prev => [...prev, { role: 'ai', text: response.text || "Connection weak. Try again." }]);
    } catch (e: any) {
      setChatHistory(prev => [...prev, { role: 'ai', text: `Node error: ${e.message}.` }]);
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
        <section className="hero-section">
          <div className="badge">Kashmir Node Online</div>
          <h1 className="hero-title">{MY_INFO.heroName}</h1>
          <p className="role-tagline">{MY_INFO.currentRole}</p>
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

        <section className="ai-interface-section">
          <div className="ai-chat-card glass-card">
            <div className="chat-header">
              <div className="status-indicator-wrapper">
                <div className="status-indicator online pulse-double"></div>
              </div>
              <h3>Talk to {MY_INFO.headerName}</h3>
              <p>Mir AI Interface</p>
            </div>
            
            <div className="chat-body">
              {chatHistory.length === 0 && (
                <div className="chat-empty">
                  <p>I am your digital twin. Ask me about my roadmap or technical journey.</p>
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
                placeholder="Ask anything..." 
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

          <div className="roadmap-actions">
            <a href="https://web3skills.vercel.app/" target="_blank" rel="noopener" className="roadmap-btn web3skills">
                Explore Roadmap (Web3 Skills)
            </a>
            <a href="https://securitypg.vercel.app/" target="_blank" rel="noopener" className="roadmap-btn securitypg">
                Practice Security (Security Playground)
            </a>
          </div>
        </section>

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
          <p>© {new Date().getFullYear()} Urwan Nafi Mir. Persistence over hardware.</p>
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
