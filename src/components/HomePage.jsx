import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const [showOptions, setShowOptions] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('musicVolume');
    return saved !== null ? parseFloat(saved) : 0.5;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.5);
  const [showSlider, setShowSlider] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const ensurePlay = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(err => {
        console.log("Audio play blocked/failed:", err);
      });
    }
  };

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            removeInteractionListeners();
          })
          .catch(err => {
            console.log("Audio playback waiting for interaction:", err);
          });
      }
    };

    const removeInteractionListeners = () => {
      window.removeEventListener('click', playAudio, { capture: true });
      window.removeEventListener('mousedown', playAudio, { capture: true });
      window.removeEventListener('keydown', playAudio, { capture: true });
      window.removeEventListener('touchstart', playAudio, { capture: true });
    };

    window.addEventListener('click', playAudio, { capture: true });
    window.addEventListener('mousedown', playAudio, { capture: true });
    window.addEventListener('keydown', playAudio, { capture: true });
    window.addEventListener('touchstart', playAudio, { capture: true });
    
    playAudio();

    return () => {
      removeInteractionListeners();
    };
  }, []);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('musicVolume', newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (isMuted) {
      setIsMuted(false);
      if (volume === 0) {
        const restored = prevVolume > 0 ? prevVolume : 0.5;
        setVolume(restored);
        localStorage.setItem('musicVolume', restored);
      }
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
    }
  };

  const handleInteraction = () => {
    ensurePlay();
  };

  const handleStart = (e) => {
    e.stopPropagation();
    setShowOptions(true);
    handleInteraction();
  };

  const handleNormalGame = (e) => {
    e.stopPropagation();
    navigate('/play?mode=normal');
  };

  const handleQuickplay = (e) => {
    e.stopPropagation();
    navigate('/play?mode=quick');
  };

  return (
    <div 
      className="hp-game-container" 
      onClick={handleInteraction} 
      onKeyDown={handleInteraction} 
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <div className="hp-overlay"></div>
      
      <audio ref={audioRef} src="/maangas_bg.mp3" loop autoPlay preload="auto" />
      
      {/* Retro Volume Controller */}
      <div 
        className={`hp-volume-control ${showSlider ? 'expanded' : ''}`} 
        onClick={(e) => {
          e.stopPropagation();
          ensurePlay();
        }}
      >
        <button 
          className="hp-mute-btn" 
          onClick={(e) => {
            e.stopPropagation();
            ensurePlay();
            if (!showSlider) {
              setShowSlider(true);
            } else {
              toggleMute(e);
            }
          }}
          title={!showSlider ? "Volume Control" : isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? '🔇' : volume < 0.3 ? '🔈' : volume < 0.7 ? '🔉' : '🔊'}
        </button>

        {showSlider && (
          <>
            <div className="hp-slider-wrapper hp-pop-in">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange} 
                className="hp-volume-slider"
              />
            </div>
            <span className="hp-volume-percentage hp-pop-in">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
            <button 
              className="hp-volume-close-btn hp-pop-in"
              onClick={(e) => {
                e.stopPropagation();
                setShowSlider(false);
              }}
              title="Close Slider"
            >
              ◀
            </button>
          </>
        )}
      </div>
      
      <h1 className="hp-game-title">STATE OF AFFAIRS</h1>
      
      {!showOptions ? (
        <button className="hp-pixel-btn hp-start-btn" onClick={handleStart}>
          START
        </button>
      ) : (
        <div className="hp-options-layout">
          <div className="hp-options-container">
            <button className="hp-pixel-btn hp-option-btn hp-normal-game-btn hp-pop-in hp-pop-delay-1" onClick={handleNormalGame}>Normal Game<span className="hp-btn-subtitle">Win at 10DP</span></button>
            <button className="hp-pixel-btn hp-option-btn hp-quickplay-btn hp-pop-in hp-pop-delay-2" onClick={handleQuickplay}>Quickplay<span className="hp-btn-subtitle">Win at 5DP</span></button>
          </div>
          <button className="hp-binder-container hp-pop-in hp-pop-delay-3" onClick={(e) => e.stopPropagation()}>
            <img src="/BINDER.jpg" alt="Card Binder" className="hp-binder-img" />
            <span className="hp-binder-label">Card Binder</span>
          </button>
        </div>
      )}
    </div>
  );
}
