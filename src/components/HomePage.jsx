import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const [showOptions, setShowOptions] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

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
      window.removeEventListener('click', playAudio);
      window.removeEventListener('mousedown', playAudio);
      window.removeEventListener('keydown', playAudio);
      window.removeEventListener('touchstart', playAudio);
    };

    window.addEventListener('click', playAudio);
    window.addEventListener('mousedown', playAudio);
    window.addEventListener('keydown', playAudio);
    window.addEventListener('touchstart', playAudio);
    
    playAudio();

    return () => {
      removeInteractionListeners();
    };
  }, []);

  const handleInteraction = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log("Audio play blocked by browser auto-play policy:", err);
      });
    }
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
