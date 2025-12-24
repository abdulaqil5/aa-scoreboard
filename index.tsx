import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Minus, Trash2, Image as ImageIcon, ExternalLink, Settings, Monitor, Copy, Palette, Trophy } from 'lucide-react';

// --- Styles ---
const styles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #1C1C1C;
    background-image: radial-gradient(circle at 50% 0%, #2a2a2a 0%, #1C1C1C 70%);
    color: #e5e7eb;
    margin: 0;
    min-height: 100vh;
  }

  /* Shared Components */
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  
  .scoreboard-view-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .team-card {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    padding: 24px;
    border-radius: 16px;
    background: linear-gradient(145deg, #2a2a2a, #232323);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.05);
    gap: 24px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  /* Subtle hover effect for the card itself */
  .team-card:hover {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .team-card.scoreboard-mode {
    background: transparent;
    box-shadow: none;
    border: none;
    padding: 10px;
    margin-bottom: 60px;
    gap: 50px;
  }

  .image-box {
    width: 200px;
    aspect-ratio: 16 / 9;
    background-color: #1a1a1a;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
    border: 2px dashed #404040;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .image-box:not(:has(.uploaded-image)) {
    background-image: repeating-linear-gradient(45deg, #1a1a1a 0, #1a1a1a 10px, #202020 10px, #202020 20px);
  }
  
  .image-box.editable:hover {
    border-color: #737373;
    border-style: solid;
    transform: scale(1.02);
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  }
  
  /* Remove dashed border if image exists */
  .image-box:has(.uploaded-image) {
    border-style: solid;
    border-width: 1px;
    border-color: rgba(255,255,255,0.1);
  }

  .uploaded-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .progress-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0; 
  }

  .progress-bar-bg {
    height: 20px;
    background-color: #111;
    width: 100%;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  
  .scoreboard-mode .progress-bar-bg {
    height: 40px;
    background-color: #0f0f0f;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
  }

  .progress-bar-fill {
    height: 100%;
    transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
    border-radius: 10px;
    position: relative;
    /* Striped pattern overlay */
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 20px 20px;
    box-shadow: 2px 0 10px rgba(0,0,0,0.3);
  }
  
  .progress-bar-fill::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(to bottom, rgba(255,255,255,0.2), transparent);
    border-radius: inherit;
  }

  .scoreboard-mode .progress-bar-fill {
    border-radius: 20px;
  }

  .score-number {
    font-size: 56px;
    font-weight: 800;
    color: #f3f4f6;
    min-width: 140px;
    text-align: right;
    font-variant-numeric: tabular-nums;
    letter-spacing: -2px;
    user-select: none;
    text-shadow: 0 4px 8px rgba(0,0,0,0.3);
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
  }
  
  .scoreboard-mode .score-number {
    font-size: 100px;
    color: #fff;
    text-shadow: 0 4px 12px rgba(0,0,0,0.6);
  }

  /* Admin Controls */
  .controls-row {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    align-items: center;
    flex-wrap: wrap;
  }

  .icon-btn {
    background: #333;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    color: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 42px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .icon-btn:hover {
    background: #444;
    border-color: rgba(255,255,255,0.2);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  .icon-btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }
  
  .icon-btn.danger {
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(127, 29, 29, 0.2);
  }
  .icon-btn.danger:hover {
    background: rgba(127, 29, 29, 0.5);
    border-color: #ef4444;
    color: #fee2e2;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-dark {
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 8px 12px;
    width: 70px;
    font-size: 14px;
    font-weight: 600;
    color: #e5e7eb;
    text-align: center;
    transition: border-color 0.2s;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .input-dark:focus {
    outline: none;
    border-color: #60a5fa;
    background: #202020;
  }
  
  /* Remove number spinners */
  .input-dark::-webkit-outer-spin-button,
  .input-dark::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .color-picker-wrapper {
    position: relative;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(255,255,255,0.1);
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    cursor: pointer;
    transition: transform 0.2s;
  }
  .color-picker-wrapper:hover {
    transform: scale(1.1);
    border-color: rgba(255,255,255,0.3);
  }

  .color-picker {
    -webkit-appearance: none;
    border: none;
    width: 150%;
    height: 150%;
    position: absolute;
    top: -25%;
    left: -25%;
    cursor: pointer;
    background: none;
    padding: 0;
  }

  .add-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 30px;
    background: rgba(255,255,255,0.03);
    border: 2px dashed rgba(255,255,255,0.1);
    color: #a3a3a3;
    padding: 20px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .add-btn:hover {
    border-color: #525252;
    color: #e5e7eb;
    background: rgba(255,255,255,0.06);
    transform: scale(1.01);
  }

  .nav-bar {
    background: rgba(28, 28, 28, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    flex-wrap: wrap;
    gap: 1rem;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-title {
    font-weight: 800;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(to right, #fff, #a3a3a3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .nav-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .nav-btn {
    background: #333;
    color: #d1d5db;
    border: 1px solid rgba(255,255,255,0.1);
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .nav-btn:hover {
    background: #444;
    color: white;
    border-color: rgba(255,255,255,0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  }
  
  .nav-btn svg {
    opacity: 0.8;
  }
  .nav-btn:hover svg {
    opacity: 1;
  }

  .custom-points-group {
    display: flex;
    align-items: center;
    gap: 0;
    background: #1a1a1a;
    padding: 0;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
  }
  .custom-points-group input {
    background: transparent;
    border: none;
    color: white;
    width: 48px;
    padding: 8px;
    font-size: 14px;
    text-align: center;
    font-weight: 600;
  }
  .custom-points-group input:focus {
    outline: none;
    background: rgba(255,255,255,0.05);
  }
  .custom-points-group button {
    background: rgba(255,255,255,0.05);
    border: none;
    border-left: 1px solid rgba(255,255,255,0.1);
    color: #a3a3a3;
    cursor: pointer;
    padding: 0 12px;
    height: 34px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    transition: background 0.2s;
  }
  .custom-points-group button:hover {
    background: rgba(255,255,255,0.15);
    color: white;
  }

  /* Floating Edit Button for Scoreboard View */
  .floating-edit {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: rgba(50, 50, 50, 0.4);
    backdrop-filter: blur(8px);
    color: white;
    padding: 12px;
    border-radius: 50%;
    opacity: 0; /* Hidden by default to be cleaner */
    transition: opacity 0.3s, background 0.3s;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.1);
    z-index: 50;
  }
  .scoreboard-view-container:hover .floating-edit {
    opacity: 0.5;
  }
  .floating-edit:hover {
    opacity: 1 !important;
    background: rgba(50, 50, 50, 0.8);
    transform: scale(1.1);
  }
  
  .stats-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #737373;
  }

  /* --- Responsive Styles --- */
  @media (max-width: 768px) {
    .container {
      padding: 20px 15px;
    }
    
    .nav-bar {
      padding: 1rem;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    
    .nav-actions {
      justify-content: center;
    }
    
    .nav-btn {
      flex: 1;
      justify-content: center;
    }

    /* Admin View Mobile */
    .team-card {
      flex-direction: column;
      align-items: stretch;
      padding: 20px;
      gap: 20px;
    }

    .image-box {
      width: 100%;
      max-width: 340px;
      margin: 0 auto;
    }
    
    .progress-container {
      margin: 0;
      width: 100%;
    }
    
    .controls-row {
      justify-content: space-between;
      gap: 8px;
    }

    /* Make buttons bigger/easier to tap on mobile */
    .icon-btn {
      padding: 12px;
      flex: 1; /* evenly distribute */
    }
    
    .custom-points-group {
      flex-grow: 2;
      justify-content: space-between;
      height: 42px;
    }
    .custom-points-group input {
        width: 100%;
        height: 100%;
    }
    .custom-points-group button {
        height: 100%;
        padding: 0 16px;
    }
    
    .color-picker-wrapper {
        width: 44px;
        height: 44px;
    }

    /* Scoreboard View Mobile */
    .scoreboard-view-container {
      padding: 20px 10px;
      justify-content: flex-start;
    }

    .team-card.scoreboard-mode {
      flex-direction: column;
      align-items: center;
      gap: 24px;
      margin-bottom: 40px;
    }

    .scoreboard-mode .image-box {
      width: 100%;
      max-width: 100%; /* Full width */
      border-radius: 8px;
    }

    .scoreboard-mode .score-number {
      font-size: 72px;
      text-align: center;
      min-width: auto;
    }
    
    .controls-row > div[style*="flex-grow"] {
      display: none; 
    }
    
    .input-wrapper label {
        display: none; /* Hide 'Goal:' label on super small screens if needed, keeping icon */
    }
  }
`;

// --- Hooks ---

const useAnimatedNumber = (value: number) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    const duration = 1000;

    if (startValue === endValue) return;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startValue + (endValue - startValue) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return displayValue;
};

// Hook to manage teams state via localStorage
const STORAGE_KEY = 'scoreboard_data_v3'; 

const useScoreboardData = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load initial data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTeams(JSON.parse(saved));
    } else {
      // Default state
      setTeams([
        { id: '1', image: null, score: 0, goal: 100, color: '#3b82f6' },
        { id: '2', image: null, score: 0, goal: 100, color: '#ef4444' },
        { id: '3', image: null, score: 0, goal: 100, color: '#10b981' },
      ]);
    }
    setLoaded(true);
  }, []);

  // Sync to local storage whenever state changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    }
  }, [teams, loaded]);

  // Listen for storage events (updates from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setTeams(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateTeam = (id: string, data: Partial<Team>) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const deleteTeam = (id: string) => {
    setTeams(prev => prev.filter(t => t.id !== id));
  };

  const addTeam = () => {
    // Random bright color for new teams
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    setTeams(prev => [
      ...prev, 
      { id: Date.now().toString(), image: null, score: 0, goal: 100, color: randomColor }
    ]);
  };

  return { teams, updateTeam, deleteTeam, addTeam, loaded };
};

// --- Types ---

interface Team {
  id: string;
  image: string | null;
  score: number;
  goal: number;
  color: string;
}

// --- Components ---

const AdminTeamRow: React.FC<{ 
  team: Team; 
  onUpdate: (id: string, data: Partial<Team>) => void; 
  onDelete: (id: string) => void; 
}> = ({ team, onUpdate, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customPoints, setCustomPoints] = useState('');
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdate(team.id, { image: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomAdd = () => {
    const val = parseInt(customPoints);
    if (!isNaN(val) && val !== 0) {
      onUpdate(team.id, { score: Math.max(0, team.score + val) });
      setCustomPoints('');
    }
  };

  const progress = Math.min(100, Math.max(0, (team.score / team.goal) * 100));

  return (
    <div className="team-card">
      {/* Image Uploader */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange}
      />
      <div className="image-box editable" onClick={() => fileInputRef.current?.click()} title="Click to upload image">
        {team.image ? (
          <img src={team.image} alt="Team" className="uploaded-image" />
        ) : (
          <div style={{textAlign: 'center'}}>
            <ImageIcon size={28} color="#525252" />
            <div style={{fontSize: '13px', fontWeight: 500, color: '#525252', marginTop: '6px'}}>UPLOAD LOGO</div>
          </div>
        )}
      </div>

      <div className="progress-container">
        {/* Progress Bar (Visual Feedback) */}
        <div className="stats-label">
          <span><span style={{color: team.color}}>●</span> Progress {Math.round(progress)}%</span>
          <span>Score {team.score}</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ 
                width: `${progress}%`, 
                backgroundColor: team.color,
                boxShadow: `0 0 15px ${team.color}66` // Dynamic glow based on team color
            }} 
          />
        </div>

        {/* Controls */}
        <div className="controls-row">
          <div className="color-picker-wrapper" title="Team Color">
             <input 
                type="color" 
                className="color-picker" 
                value={team.color} 
                onChange={(e) => onUpdate(team.id, { color: e.target.value })}
              />
          </div>

           <button className="icon-btn" onClick={() => onUpdate(team.id, { score: Math.max(0, team.score - 10) })} title="-10">
            <Minus size={16} /> <span style={{marginLeft: 4, display: 'none'}}>10</span>
            <span style={{fontSize: '11px', fontWeight: 'bold'}}>-10</span>
          </button>
           <button className="icon-btn" onClick={() => onUpdate(team.id, { score: Math.max(0, team.score - 1) })} title="-1">
            <Minus size={16} /> <span style={{marginLeft: 4, display: 'none'}}>1</span>
          </button>
          
          <button className="icon-btn" onClick={() => onUpdate(team.id, { score: team.score + 1 })} title="+1">
            <Plus size={16} /> <span style={{marginLeft: 4, display: 'none'}}>1</span>
          </button>
          <button className="icon-btn" onClick={() => onUpdate(team.id, { score: team.score + 10 })} title="+10">
             <Plus size={16} /> <span style={{marginLeft: 4, display: 'none'}}>10</span>
             <span style={{fontSize: '11px', fontWeight: 'bold'}}>+10</span>
          </button>

          <div className="custom-points-group">
            <input 
              type="number" 
              placeholder="#" 
              value={customPoints}
              onChange={(e) => setCustomPoints(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
            />
            <button onClick={handleCustomAdd}>ADD</button>
          </div>

          <div style={{ flexGrow: 1 }}></div>

          <div className="input-wrapper" title="Target Goal">
            <Trophy size={16} color="#737373" style={{marginRight: 8}} />
            <input 
                type="number" 
                className="input-dark"
                value={team.goal}
                onChange={(e) => onUpdate(team.id, { goal: parseInt(e.target.value) || 100 })}
            />
          </div>

          <button className="icon-btn danger" onClick={() => onDelete(team.id)} title="Remove Team">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ScoreboardTeamRow: React.FC<{ team: Team }> = ({ team }) => {
  const displayScore = useAnimatedNumber(team.score);
  const progress = Math.min(100, Math.max(0, (team.score / team.goal) * 100));

  return (
    <div className="team-card scoreboard-mode">
      <div className="image-box">
        {team.image ? (
          <img src={team.image} alt="Team" className="uploaded-image" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Trophy size={48} color="#333" />
          </div>
        )}
      </div>

      <div className="progress-container">
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ 
                width: `${progress}%`, 
                backgroundColor: team.color,
                boxShadow: `0 0 20px ${team.color}80`
            }} 
          />
        </div>
      </div>

      <div className="score-number">
        {displayScore}
      </div>
    </div>
  );
};

// --- Views ---

const AdminView = () => {
  const { teams, updateTeam, deleteTeam, addTeam, loaded } = useScoreboardData();

  const openScoreboardPopup = () => {
    // Calculate position for a centered window, but user will likely move it
    const width = 1024;
    const height = 768;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      '#scoreboard', 
      'ScoreboardPopup', 
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
  };

  const copyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#scoreboard`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Scoreboard link copied to clipboard!");
    });
  };

  if (!loaded) return null;

  return (
    <div>
      <div className="nav-bar">
        <div className="nav-title">
          <Settings size={22} />
          <span style={{letterSpacing: '-0.5px'}}>SCOREBOARD ADMIN</span>
        </div>
        <div className="nav-actions">
           <button onClick={copyLink} className="nav-btn" title="Copy link for other device">
            <Copy size={16} />
            Copy Link
          </button>
          <button onClick={openScoreboardPopup} className="nav-btn">
            <Monitor size={18} />
            Launch Scoreboard
            <ExternalLink size={14} style={{ opacity: 0.5, marginLeft: 4 }} />
          </button>
        </div>
      </div>
      
      <div className="container">
        <div style={{ marginBottom: '30px', color: '#737373', textAlign: 'center', fontSize: '14px' }}>
          <p>Configure teams, set goals, and update scores below.</p>
        </div>

        {teams.map(team => (
          <AdminTeamRow 
            key={team.id} 
            team={team} 
            onUpdate={updateTeam} 
            onDelete={deleteTeam}
          />
        ))}
        
        <button className="add-btn" onClick={addTeam}>
          <Plus size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
          ADD NEW TEAM
        </button>
      </div>
    </div>
  );
};

const ScoreboardView = () => {
  const { teams, loaded } = useScoreboardData();

  if (!loaded) return null;

  return (
    <div className="scoreboard-view-container">
      {teams.map(team => (
        <ScoreboardTeamRow key={team.id} team={team} />
      ))}
      
      {/* Hidden/Subtle link to go back to admin if needed */}
      <a href="#admin" className="floating-edit" title="Edit Scoreboard">
        <Settings size={24} />
      </a>
    </div>
  );
};

const App = () => {
  const [route, setRoute] = useState<'admin' | 'scoreboard'>('admin');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#scoreboard') {
        setRoute('scoreboard');
      } else {
        setRoute('admin');
      }
    };

    // Set initial
    handleHashChange();

    // Listen
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <>
      <style>{styles}</style>
      {route === 'admin' ? <AdminView /> : <ScoreboardView />}
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);