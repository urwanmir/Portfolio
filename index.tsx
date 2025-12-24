
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
  cast: "Mir",
  location: "Kashmir, India",
  avatar: "https://avatars.githubusercontent.com/u/250972108?v=4",
  currentRole: "Self-Taught Web3 Enthusiast",
  mission: "Transforming from a mobile-first learner to a professional Web3 Security Researcher.",
  status: "Mastering Web Foundations (React/JS) to pivot into Smart Contract Auditing.",
  laptopStory: "Currently studying on a low-end laptop in Kashmir, proving that determination beats hardware specifications.",
  father: {
    name: "Muneer Ahmed",
    story: "My father, Muneer Ahmed, passed away in a tragic work accident while unloading a truck and getting stuck with an electric wire. This event was the catalyst for my journey; it made me realize I had to build a future through knowledge and technology despite the immense hardship. It is very hard because we do not have proper instrument tools and everything. May Allah grant him paradise."
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
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [customKey, setCustomKey] = useState(localStorage.getItem('hadi_custom_api_key') || "");
  const [testStatus, setTestStatus] = useState<{type: 'idle' | 'loading' | 'success' | 'error', message: string}>({type: 'idle', message: ""});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const getActiveApiKey = () => {
    const stored = localStorage.getItem('hadi_custom_api_key');
    return stored || customKey || process.env.API_KEY || "";
  };

  const testApiKey = async () => {
    if (!customKey.trim()) {
        setTestStatus({type: 'error', message: "Please enter an API key."});
        return;
    }
    setTestStatus({type: 'loading', message: "Testing connection to Kashmir node..."});
    try {
        const ai = new GoogleGenAI({ apiKey: customKey.trim() });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Hi"
        });
        
        if (response.text) {
            setTestStatus({type: 'success', message: "Success! Your key is now active."});
            localStorage.setItem('hadi_custom_api_key', customKey.trim());
        }
    } catch (err: any) {
        setTestStatus({type: 'error', message: "Connection failed: " + (err.message || "Invalid Key")});
    }
  };

  const handleAskHadi = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const apiKey = getActiveApiKey();

      if (!apiKey || apiKey === "undefined" || apiKey === "") {
        throw new Error("No API key available. Please click the status indicator to enter your own Gemini key.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
        You are Urwan Nafi Mir (Hadi Mir). 
        You live in Kashmir, India. You are a self-taught Web3 security trainee.
        Answer in first person ("I"). 
        If anyone asks "Who are your friends?", say "I have many friends." and do not list names unless asked for specific people.
        If asked about your father Muneer Ahmed, say he passed away in a tragic accident and say "May Allah grant him paradise."
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...chatHistory.slice(-6).map(m => ({
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

      setChatHistory(prev => [...prev, { role: 'ai', text: response.text || "Connection lost. Please try again." }]);
    } catch (e: any) {
      console.error("Critical AI Error:", e);
      let errorDetail = e.message || "Service Interrupted.";
      if (e?.message?.includes("403")) errorDetail = "API Key Blocked/Leaked. You must use a personal key.";
      
      setChatHistory(prev => [...prev, { role: 'ai', text: `Node error: ${errorDetail}. Click the green indicator to update your configuration.` }]);
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
          <div className="badge">Rising from Kashmir</div>
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

        {/* --- Interactive AI Interface --- */}
        <section className="ai-interface-section">
          <div className="ai-chat-card glass-card">
            <div className="chat-header">
              {/* Trigger for the secret pop-up */}
              <div 
                className="status-trigger" 
                onClick={() => {
                    console.log("Opening Settings Modal...");
                    setIsKeyModalOpen(true);
                }}
              >
                <div className="status-indicator online"></div>
              </div>
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

      {/* --- Secret Key Override Modal (Rendered at top level) --- */}
      {isKeyModalOpen && (
        <div className="key-modal-overlay" onClick={() => setIsKeyModalOpen(false)}>
            <div className="key-modal glass-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Node Configuration</h3>
                    <button className="close-btn" onClick={() => setIsKeyModalOpen(false)}>&times;</button>
                </div>
                <div className="modal-body">
                    <p className="modal-desc">Enter your own Gemini API key to override the system defaults. This key will be saved locally in your browser.</p>
                    <div className="input-group">
                        <label>Your Gemini API Key</label>
                        <input 
                            type="text" 
                            placeholder="AIzaSy..." 
                            value={customKey}
                            onChange={e => setCustomKey(e.target.value)}
                        />
                    </div>
                    {testStatus.message && (
                        <div className={`test-status ${testStatus.type}`}>
                            {testStatus.message}
                        </div>
                    )}
                    <div className="modal-actions">
                        <button className="test-btn primary" onClick={testApiKey} disabled={testStatus.type === 'loading'}>
                            {testStatus.type === 'loading' ? <ThinkingIcon /> : "Test & Save Key"}
                        </button>
                        <button className="clear-btn" onClick={() => { setCustomKey(""); localStorage.removeItem('hadi_custom_api_key'); setTestStatus({type: 'idle', message: ""}); }}>
                            Clear Override
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
