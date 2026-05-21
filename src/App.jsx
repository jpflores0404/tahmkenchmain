import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import AgendaBoard from './components/AgendaBoard';
import HandArea from './components/HandArea';
import AIHandArea from './components/AIHandArea';
import ChoiceModal from './components/ChoiceModal';
import GameOverScreen from './components/GameOverScreen';
import TurnControls from './components/TurnControls';
import DeckPile from './components/DeckPile';
import PlayerHUD from './components/PlayerHUD';
import CardPreview from './components/CardPreview';
import ToastManager from './components/ToastManager';
import TurnAnnouncer from './components/TurnAnnouncer';
import OpponentScanOverlay from './components/OpponentScanOverlay';
import AIThinkingOverlay from './components/AIThinkingOverlay';
import SupportCardLog from './components/SupportCardLog';
import DPBadge from './components/DPBadge';
import CorruptionWheelModal from './components/CorruptionWheelModal';
import GameFeedbackOverlay from './components/GameFeedbackOverlay';
import HomePage from './components/HomePage';
import GameMusic from './components/GameMusic';
import { LayoutGroup } from 'framer-motion';
import './App.css';

function GameBoard({ onToggleFullscreen, isFullscreen, onNavigateHome }) {
  const { volume, changeVolume } = useGame();
  const [previewCard, setPreviewCard] = useState(null);
  const [opponentScanning, setOpponentScanning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [prevVolume, setPrevVolume] = useState(() => {
    const saved = localStorage.getItem('musicVolume');
    const parsed = saved !== null ? parseFloat(saved) : 0.5;
    return parsed > 0 ? parsed : 0.5;
  });

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    changeVolume(newVolume);
    if (newVolume > 0) {
      setPrevVolume(newVolume);
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      changeVolume(0);
    } else {
      changeVolume(prevVolume);
    }
  };

  return (
    <LayoutGroup>
      <div className={`w-full h-full gov-shell gov-text overflow-hidden select-none relative ${isFullscreen ? 'fullscreen-mode' : ''}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gridTemplateRows: 'auto 1fr auto auto',
      }}
    >
      <AIHandArea />
      {/* ═══════ TOP-LEFT: (empty) ═══════ */}
      <div />

      {/* ═══════ TOP-CENTER: (empty, arena starts in middle row) ═══════ */}
      <div />

      {/* ═══════ TOP-RIGHT: Settings Gear ═══════ */}
      <div className="flex flex-col items-end px-4 pt-3 gap-3">
        <button 
          onClick={() => setShowSettings(true)}
          className="settings-gear-btn"
          title="Settings"
          style={{ pointerEvents: 'auto' }}
        >
          ⚙️
        </button>
      </div>

      {/* ═══════ SETTINGS OVERLAY ═══════ */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="settings-header">
              <span className="settings-title">⚙ SETTINGS</span>
            </div>

            {/* Divider */}
            <div className="settings-divider" />

            {/* Resume */}
            <button 
              onClick={() => setShowSettings(false)}
              className="settings-resume-btn"
            >
              ▶ RESUME
            </button>

            {/* Divider */}
            <div className="settings-divider" />

            {/* Volume Control */}
            <div className="settings-row settings-row-panel">
              <button 
                onClick={toggleMute}
                className="settings-row-icon settings-mute-btn"
                title={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? '🔇' : volume < 0.3 ? '🔈' : volume < 0.7 ? '🔉' : '🔊'}
              </button>
              <span className="settings-row-label">MUSIC</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={handleVolumeChange}
                className="gov-volume-slider"
              />
              <span className="settings-volume-pct">{Math.round(volume * 100)}%</span>
            </div>

            {/* Divider */}
            <div className="settings-divider" />

            {/* Fullscreen Toggle */}
            <button 
              onClick={onToggleFullscreen}
              className="settings-row settings-row-btn"
            >
              <span className="settings-row-icon">{isFullscreen ? '🗗' : '🖵'}</span>
              <span className="settings-row-label">{isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'}</span>
            </button>

            {/* Divider */}
            <div className="settings-divider" />

            {/* Main Menu */}
            <button 
              onClick={onNavigateHome}
              className="settings-row settings-row-btn settings-row-danger"
            >
              <span className="settings-row-icon"></span>
              <span className="settings-row-label">MAIN MENU</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══════ MIDDLE-LEFT: (empty) ═══════ */}
      <div />

      {/* ═══════ MIDDLE-CENTER: ARENA (the red-line area) ═══════ */}
      <div className="flex flex-col items-center justify-center pt-32 pb-4 gap-1 min-h-0 overflow-visible relative translate-y-10">
        {/* Opponent Chibi */}
        <div className="flex flex-col items-center justify-center relative z-10 -translate-y-2">
          <p className="text-[12px] text-slate-800 font-bold mb-0.5 tracking-widest drop-shadow-md">OPPONENT</p>
          <img 
            src="/ai_character.gif" 
            alt="A.I. Opponent" 
            className="w-10 h-auto drop-shadow-[0_6px_8px_rgba(0,0,0,0.6)] transition-transform hover:scale-105" 
            style={{ imageRendering: 'pixelated' }} 
          />
        </div>

        {/* AI Agenda Slots & Deck */}
        <div className="relative flex items-center justify-center w-fit mx-auto shrink-0">
          <AgendaBoard isAI={true} onSelectCard={setPreviewCard} />
          
          <div className="absolute min-w-max -left-36 sm:-left-48 top-1/2 -translate-y-[65%] origin-right pointer-events-none">
            <DeckPile isAI={true} />
          </div>
          
          <OpponentScanOverlay onActiveChange={setOpponentScanning} />
        </div>

        {/* Center Divider */}
        <div className="flex items-center justify-center py-2 w-full px-4 shrink-0">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
        </div>

        {/* Player Agenda Slots & Deck */}
        <div className="relative flex items-center justify-center w-fit mx-auto shrink-0 mt-1">
          <AgendaBoard isAI={false} onSelectCard={setPreviewCard} />
          
          <div
            className="absolute min-w-max -right-36 sm:-right-52 top-1/2 -translate-y-[35%] origin-left flex flex-col items-center gap-6"
            style={{ zIndex: 200, pointerEvents: 'auto' }}
          >
            <DeckPile />
            <TurnControls />
          </div>
        </div>

        {/* Player Chibi */}
        <div className="mt-2 flex flex-col items-center justify-center translate-y-3">
          <img 
            src="/player_character.gif" 
            alt="Player Character" 
            className="w-8 h-auto drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-transform hover:scale-105" 
            style={{ imageRendering: 'pixelated' }} 
          />
          <p className="text-[12px] text-slate-800 font-bold mt-0.5 tracking-widest drop-shadow-md">PLAYER</p>
        </div>
      </div>

      {/* ═══════ MIDDLE-RIGHT: Support Log ═══════ */}
      <div className="support-log-anchor">
        <SupportCardLog />
      </div>

      {/* ═══════ HUD: Player Stats Bar (Bottom Left) ═══════ */}
      <PlayerHUD />

      {/* ═══════ Card Preview (left side, on hover) ═══════ */}
      <div className="card-preview-anchor">
        <CardPreview card={previewCard} />
      </div>

      {/* ═══════ BOTTOM: Hand Area (spans full width) ═══════ */}
      <div className="col-span-3 flex items-end justify-center pb-0 relative z-50 pointer-events-auto">
        <HandArea onSelectCard={setPreviewCard} dimmed={opponentScanning} />
      </div>

      {/* ═══════ OVERLAYS ═══════ */}
      <ChoiceModal />
      <CorruptionWheelModal />
      <GameFeedbackOverlay />
      <GameOverScreen />
      <ToastManager />
      <TurnAnnouncer />
      <AIThinkingOverlay />

      {/* Opponent DP Badge (Top Left) */}
      <div className="absolute top-6 left-6 z-[90] flex items-start pointer-events-none">
        <DPBadge isAI={true} />
      </div>

      {/* Footer Area: DP Badge */}
      <div className="absolute bottom-6 right-6 z-[90] flex items-end pointer-events-none">
        {/* DP Badge */}
        <DPBadge />
      </div>
      </div>
    </LayoutGroup>
  );
}

function GamePage() {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Determine DP threshold from URL query param
  const mode = searchParams.get('mode');
  const dpThreshold = mode === 'normal' ? 10 : 5;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (wrapperRef.current) {
        wrapperRef.current.requestFullscreen().catch(err => {
          console.error(`Fullscreen error: ${err.message}`);
        });
      }
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      // Re-run scale calculation immediately after fullscreen change
      if (wrapperRef.current && containerRef.current) {
        if (isFull) {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const scaleX = vw / 1920;
          const scaleY = vh / 1080;
          const scale = Math.min(scaleX, scaleY);

          // Fullscreen: fluidly expand beyond 1920x1080 to fill all edges natively
          containerRef.current.style.width = (vw / scale) + 'px';
          containerRef.current.style.height = (vh / scale) + 'px';
          containerRef.current.style.transform = `scale(${scale})`;
        } else {
          // Windowed: Restrict to exactly 1920x1080 aspect ratio to preserve thick borders and layout style
          const vw = wrapperRef.current.clientWidth;
          const vh = wrapperRef.current.clientHeight;
          // Scale to fit nicely into 90% of the browser space, cap at 1.0 so it never stretches awkwardly huge
          const scaleX = (vw * 0.9) / 1920;
          const scaleY = (vh * 0.9) / 1080;
          const scale = Math.min(scaleX, scaleY, 1);
          
          containerRef.current.style.width = '1920px';
          containerRef.current.style.height = '1080px';
          containerRef.current.style.transform = `scale(${scale})`;
        }
        containerRef.current.style.transformOrigin = 'center center';
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Prevent zooming via Ctrl + Scroll and Keyboard
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) e.preventDefault();
    };
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '+' || e.key === '_' || e.keyCode === 187 || e.keyCode === 189)) {
        e.preventDefault();
      }
    };
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // UX 5: Scale game container proportionally based on viewport
  useEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current || !containerRef.current) return;
      
      const isFull = !!document.fullscreenElement;
      
      if (isFull) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const scaleX = vw / 1920;
        const scaleY = vh / 1080;
        const scale = Math.min(scaleX, scaleY);

        containerRef.current.style.width = (vw / scale) + 'px';
        containerRef.current.style.height = (vh / scale) + 'px';
        containerRef.current.style.transform = `scale(${scale})`;
      } else {
        const vw = wrapperRef.current.clientWidth;
        const vh = wrapperRef.current.clientHeight;
        const scaleX = (vw * 0.9) / 1920;
        const scaleY = (vh * 0.9) / 1080;
        const scale = Math.min(scaleX, scaleY, 1);
        
        containerRef.current.style.width = '1920px';
        containerRef.current.style.height = '1080px';
        containerRef.current.style.transform = `scale(${scale})`;
      }
      containerRef.current.style.transformOrigin = 'center center';
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  // Navigate back to homepage on restart
  const handleRestart = () => {
    navigate('/');
  };

  const handleNavigateHome = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    navigate('/');
  };

  return (
    <GameProvider dpThreshold={dpThreshold} onRestart={handleRestart}>
      <GameMusic />
      <div className={`game-container-wrapper ${isFullscreen ? 'fullscreen-mode' : ''}`} ref={wrapperRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="game-container" ref={containerRef}>
          <GameBoard onToggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen} onNavigateHome={handleNavigateHome} />
        </div>
      </div>
    </GameProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}
