
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

//Vibe coded by ammaar@google.com

import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import { Artifact, Session, ComponentVariation, LayoutOption } from './types';
import { INITIAL_PLACEHOLDERS } from './constants';
import { generateId } from './utils';

import DottedGlowBackground from './components/DottedGlowBackground';
import ArtifactCard from './components/ArtifactCard';
import SideDrawer from './components/SideDrawer';
import { 
    ThinkingIcon, 
    CodeIcon, 
    SparklesIcon, 
    ArrowLeftIcon, 
    ArrowRightIcon, 
    ArrowUpIcon, 
    GridIcon 
} from './components/Icons';

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
  const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);
  
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholders, setPlaceholders] = useState<string[]>(INITIAL_PLACEHOLDERS);
  
  // Track if API is configured to avoid blank page crash
  const [isApiConfigured, setIsApiConfigured] = useState<boolean>(true);

  const [drawerState, setDrawerState] = useState<{
      isOpen: boolean;
      mode: 'code' | 'variations' | null;
      title: string;
      data: any; 
  }>({ isOpen: false, mode: null, title: '', data: null });

  const inputRef = useRef<HTMLInputElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      // Safely check for API key
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === '') {
        setIsApiConfigured(false);
      }
      inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (focusedArtifactIndex !== null && window.innerWidth <= 1024) {
        if (gridScrollRef.current) {
            gridScrollRef.current.scrollTop = 0;
        }
        window.scrollTo(0, 0);
    }
  }, [focusedArtifactIndex]);

  useEffect(() => {
      const interval = setInterval(() => {
          setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
      }, 3000);
      return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = useCallback(async (manualPrompt?: string) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === '' || !isApiConfigured) {
      setIsApiConfigured(false);
      return;
    }

    const promptToUse = manualPrompt || inputValue;
    const trimmedInput = promptToUse.trim();
    
    if (!trimmedInput || isLoading) return;
    if (!manualPrompt) setInputValue('');

    setIsLoading(true);
    const baseTime = Date.now();
    const sessionId = generateId();

    const placeholderArtifacts: Artifact[] = Array(3).fill(null).map((_, i) => ({
        id: `${sessionId}_${i}`,
        styleName: 'Designing...',
        html: '',
        status: 'streaming',
    }));

    const newSession: Session = {
        id: sessionId,
        prompt: trimmedInput,
        timestamp: baseTime,
        artifacts: placeholderArtifacts
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionIndex(sessions.length); 
    setFocusedArtifactIndex(null); 

    try {
        const ai = new GoogleGenAI({ apiKey });

        const MY_CONTEXT = `
MY IDENTITY: Urwan Mir (@urwanmir). An aspiring Web3 Security Researcher.
MY SOCIALS:
- Instagram: https://www.instagram.com/urwanmir/
- Cyfrin: https://profiles.cyfrin.io/u/urwanmir
- X: https://x.com/urwanmir
- GitHub: https://github.com/urwanmir

MY CURRENT STATUS & TRAJECTORY:
- **Current State**: I am actively learning Web Development (HTML, CSS, JS, React).
- **Next Phase**: Shifting to Web3 Security & Development (S&D) once foundations are solid.
- **Long-term Goal**: Professional Smart Contract Auditor / Web3 Security Researcher.

MY JOURNEY PHASES:
- Phase 1: Mobile-Only Foundation (Tech Basics, Technical English).
- Phase 2: Hardware Acquisition (Saving for my Research Laptop).
- Phase 3: Web3 Foundations (Solidity, Auditing basics).
- Phase 4: Full-time Web3 S&D and Professional Auditing.

TONE: Confident, minimal, first-person ("I", "Me", "My").
        `;

        const stylePrompt = `
${MY_CONTEXT}

Generate 3 distinct, professional design directions for my request: "${trimmedInput}". 
Make it feel like a professional portfolio I built myself. Use high-tech, futuristic metaphors.

Required JSON Output Format:
["Direction 1 Name", "Direction 2 Name", "Direction 3 Name"]
        `.trim();

        const styleResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { role: 'user', parts: [{ text: stylePrompt }] }
        });

        let generatedStyles: string[] = [];
        const styleText = styleResponse.text || '[]';
        const jsonMatch = styleText.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
            try {
                generatedStyles = JSON.parse(jsonMatch[0]);
            } catch (e) {
                generatedStyles = ["Researcher Alpha", "The Security Node", "The Infinite Roadmap"];
            }
        }

        setSessions(prev => prev.map(s => {
            if (s.id !== sessionId) return s;
            return {
                ...s,
                artifacts: s.artifacts.map((art, i) => ({
                    ...art,
                    styleName: generatedStyles[i] || "My Portfolio View"
                }))
            };
        }));

        const generateArtifact = async (artifact: Artifact, styleInstruction: string) => {
            try {
                const prompt = `
${MY_CONTEXT}

You are Flash UI. Create a professional, high-fidelity personal portfolio website for me. 
PROMPT: "${trimmedInput}"

**CONCEPTUAL DIRECTION: ${styleInstruction}**

**REQUIRED SECTIONS:**
1. **Hero**: Urwan Mir | Future Web3 Security Researcher. 
2. **Current Status Note**: Clearly display: "I am currently learning web development, and will later shift to Web3 S&D."
3. **Connect Section**: Include my social links (Instagram, Cyfrin, X, GitHub) with clean icons.
4. **My Roadmap**: A visual path showing my progression from Web Dev basics to Web3 Security & Development.
5. **Milestone Tracker**: Mention my hardware goal (Laptop) as a foundation for my research.

**VISUAL RULES:**
- Theme: Dark, minimalist, high-tech (Obsidian/Slate/Indigo).
- Professional Tone: Use "I", "Me", "My".
- Fast & Responsive: Look great on mobile.

Return ONLY RAW HTML. No markdown fences.
          `.trim();
          
                const responseStream = await ai.models.generateContentStream({
                    model: 'gemini-3-flash-preview',
                    contents: [{ parts: [{ text: prompt }], role: "user" }],
                });

                let accumulatedHtml = '';
                for await (const chunk of responseStream) {
                    const text = chunk.text;
                    if (typeof text === 'string') {
                        accumulatedHtml += text;
                        setSessions(prev => prev.map(sess => 
                            sess.id === sessionId ? {
                                ...sess,
                                artifacts: sess.artifacts.map(art => 
                                    art.id === artifact.id ? { ...art, html: accumulatedHtml } : art
                                )
                            } : sess
                        ));
                    }
                }
                
                let finalHtml = accumulatedHtml.trim();
                if (finalHtml.startsWith('```html')) finalHtml = finalHtml.substring(7).trimStart();
                if (finalHtml.startsWith('```')) finalHtml = finalHtml.substring(3).trimStart();
                if (finalHtml.endsWith('```')) finalHtml = finalHtml.substring(0, finalHtml.length - 3).trimEnd();

                setSessions(prev => prev.map(sess => 
                    sess.id === sessionId ? {
                        ...sess,
                        artifacts: sess.artifacts.map(art => 
                            art.id === artifact.id ? { ...art, html: finalHtml, status: finalHtml ? 'complete' : 'error' } : art
                        )
                    } : sess
                ));

            } catch (e: any) {
                console.error('Error generating artifact:', e);
            }
        };

        await Promise.all(placeholderArtifacts.map((art, i) => generateArtifact(art, generatedStyles[i])));

    } catch (e) {
        console.error("Fatal error", e);
    } finally {
        setIsLoading(false);
    }
  }, [inputValue, isLoading, sessions.length, isApiConfigured]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      event.preventDefault();
      handleSendMessage();
    } else if (event.key === 'Tab' && !inputValue && !isLoading) {
        event.preventDefault();
        setInputValue(placeholders[placeholderIndex]);
    }
  };

  const nextItem = useCallback(() => {
      if (focusedArtifactIndex !== null) {
          if (focusedArtifactIndex < 2) setFocusedArtifactIndex(focusedArtifactIndex + 1);
      } else {
          if (currentSessionIndex < sessions.length - 1) setCurrentSessionIndex(currentSessionIndex + 1);
      }
  }, [currentSessionIndex, sessions.length, focusedArtifactIndex]);

  const prevItem = useCallback(() => {
      if (focusedArtifactIndex !== null) {
          if (focusedArtifactIndex > 0) setFocusedArtifactIndex(focusedArtifactIndex - 1);
      } else {
           if (currentSessionIndex > 0) setCurrentSessionIndex(currentSessionIndex - 1);
      }
  }, [currentSessionIndex, focusedArtifactIndex]);

  const hasStarted = sessions.length > 0 || isLoading;
  const currentSession = sessions[currentSessionIndex];

  let canGoBack = false;
  let canGoForward = false;

  if (hasStarted) {
      if (focusedArtifactIndex !== null) {
          canGoBack = focusedArtifactIndex > 0;
          canGoForward = focusedArtifactIndex < (currentSession?.artifacts.length || 0) - 1;
      } else {
          canGoBack = currentSessionIndex > 0;
          canGoForward = currentSessionIndex < sessions.length - 1;
      }
  }

  return (
    <>
        <SideDrawer 
            isOpen={drawerState.isOpen} 
            onClose={() => setDrawerState(s => ({...s, isOpen: false}))} 
            title={drawerState.title}
        >
            {drawerState.mode === 'code' && (
                <pre className="code-block"><code>{drawerState.data}</code></pre>
            )}
        </SideDrawer>

        <div className="immersive-app">
            <DottedGlowBackground gap={24} radius={1.5} color="rgba(255, 255, 255, 0.02)" glowColor="rgba(255, 255, 255, 0.15)" speedScale={0.5} />

            <div className={`stage-container ${focusedArtifactIndex !== null ? 'mode-focus' : 'mode-split'}`}>
                 <div className={`empty-state ${hasStarted ? 'fade-out' : ''}`}>
                     <div className="empty-content">
                         <h1>My Portfolio</h1>
                         <p>Visualizing my journey from Web Dev to Web3 Security Research.</p>
                         
                         {isApiConfigured ? (
                            <button className="surprise-button" onClick={() => handleSendMessage("Generate my professional Web3 Security Portfolio with my socials")} disabled={isLoading}>
                                <SparklesIcon /> Build My Website
                            </button>
                         ) : (
                            <div style={{ padding: '20px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '12px', marginTop: '20px', color: '#ff6b6b' }}>
                                <strong>⚠️ Action Required:</strong> API Key is not configured. Add <code>GEMINI_API_KEY</code> to your Netlify environment variables to enable generation.
                            </div>
                         )}
                     </div>
                 </div>

                {sessions.map((session, sIndex) => {
                    let positionClass = 'hidden';
                    if (sIndex === currentSessionIndex) positionClass = 'active-session';
                    else if (sIndex < currentSessionIndex) positionClass = 'past-session';
                    return (
                        <div key={session.id} className={`session-group ${positionClass}`}>
                            <div className="artifact-grid" ref={sIndex === currentSessionIndex ? gridScrollRef : null}>
                                {session.artifacts.map((artifact, aIndex) => (
                                    <ArtifactCard 
                                        key={artifact.id}
                                        artifact={artifact}
                                        isFocused={focusedArtifactIndex === aIndex}
                                        onClick={() => setFocusedArtifactIndex(aIndex)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

             {canGoBack && <button className="nav-handle left" onClick={prevItem} aria-label="Previous"><ArrowLeftIcon /></button>}
             {canGoForward && <button className="nav-handle right" onClick={nextItem} aria-label="Next"><ArrowRightIcon /></button>}

            <div className={`action-bar ${focusedArtifactIndex !== null ? 'visible' : ''}`}>
                 <div className="active-prompt-label">{currentSession?.prompt}</div>
                 <div className="action-buttons">
                    <button onClick={() => setFocusedArtifactIndex(null)}><GridIcon /> Grid View</button>
                    <button onClick={() => {
                         const currentSession = sessions[currentSessionIndex];
                         if (currentSession && focusedArtifactIndex !== null) {
                             const artifact = currentSession.artifacts[focusedArtifactIndex];
                             setDrawerState({ isOpen: true, mode: 'code', title: 'Source Code', data: artifact.html });
                         }
                    }}><CodeIcon /> Source</button>
                 </div>
            </div>

            <div className="floating-input-container">
                <div className={`input-wrapper ${isLoading ? 'loading' : ''} ${!isApiConfigured ? 'disabled' : ''}`}>
                    {(!inputValue && !isLoading && isApiConfigured) && (
                        <div className="animated-placeholder" key={placeholderIndex}>
                            <span className="placeholder-text">{placeholders[placeholderIndex]}</span>
                            <span className="tab-hint">Tab</span>
                        </div>
                    )}
                    
                    {!isApiConfigured && (
                        <div className="animated-placeholder">
                            <span className="placeholder-text" style={{ color: '#ff6b6b' }}>Setup Required: Connect Gemini API Key</span>
                        </div>
                    )}

                    {!isLoading ? (
                        <input 
                            ref={inputRef} 
                            type="text" 
                            value={inputValue} 
                            onChange={handleInputChange} 
                            onKeyDown={handleKeyDown} 
                            disabled={isLoading || !isApiConfigured} 
                        />
                    ) : (
                        <div className="input-generating-label">
                            <span className="generating-prompt-text">{currentSession?.prompt}</span>
                            <ThinkingIcon />
                        </div>
                    )}
                    <button className="send-button" onClick={() => handleSendMessage()} disabled={isLoading || !inputValue.trim() || !isApiConfigured}>
                        <ArrowUpIcon />
                    </button>
                </div>
            </div>
        </div>
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
