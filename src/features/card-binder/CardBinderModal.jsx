import { useState, useEffect } from 'react';
import { 
  INFRASTRUCTURE_CARDS, 
  SUPPORT_CARDS, 
  SPECIAL_CARDS 
} from '../../data/deck';
import CARD_LORE from './cardLore';
import './CardBinderModal.css';

// Sound effect generator using Web Audio API
const playRetroSound = (type, soundEnabled) => {
  if (!soundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(950, now + 0.04);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'open') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'close') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.25);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.log('Sound error:', e);
  }
};

// Build complete list of cards with explicit categories as a static top-level array
const ALL_IN_GAME_CARDS = [
  ...INFRASTRUCTURE_CARDS.map(c => ({ ...c, category: 'infrastructure' })),
  ...SUPPORT_CARDS.map(c => ({ ...c, category: 'support' })),
  ...Object.values(SPECIAL_CARDS).map(c => ({ ...c, category: 'special' })),
];

// Helper to map card image correctly
const getCardImage = (card) => {
  if (!card) return '';
  
  // Infrastructure special case: use [card-name]-info.webp
  if (card.category === 'infrastructure') {
    if (card.name === 'Public Hospital') return '/hospital-info.webp';
    if (card.name === 'Transit System') return '/transit-info.webp';
    if (card.name === 'Public School') return '/school-info.webp';
    if (card.name === 'Power Grid') return '/powergrid-info.webp';
    if (card.name === 'Water Facility') return '/waterfacility-info.webp';
  }
  
  // Support cards
  if (card.name === 'Grassroots Initiative') return '/grassroots-initiative.webp';
  if (card.name === 'Human Capital Investment') return '/human-capital-investment.webp';
  if (card.name === 'Green Subsidy') return '/green-subsidy.webp';
  
  // Special cards
  if (card.name === 'Accountability') return '/accountability.webp';
  if (card.name === 'Economic Boom') return '/economic-boom.webp';
  if (card.name === 'Investigation') return '/investigation.webp';
  
  return '';
};

// Helper to chunk array
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export default function CardBinderModal({ isOpen, onClose }) {
  const [zoomImage, setZoomImage] = useState(null);
  const [zoomCard, setZoomCard] = useState(null);
  const soundEnabled = true;

  // Play open sound on load
  useEffect(() => {
    if (isOpen) {
      playRetroSound('open', soundEnabled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const allCards = ALL_IN_GAME_CARDS;
  const filteredCards = allCards;

  const handleClose = () => {
    playRetroSound('close', soundEnabled);
    onClose();
  };

  return (
    <div className="binder-overlay" onClick={handleClose}>
      <div className="binder-container" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER BAR */}
        <div className="binder-header">
          <div className="binder-title-area">
            <span className="binder-icon">📔</span>
            <h2 className="binder-title">STATE OF AFFAIRS — CARD BINDER</h2>
          </div>
          <button 
            className="binder-close-btn" 
            onClick={handleClose}
            onMouseEnter={() => playRetroSound('beep', soundEnabled)}
          >
            CLOSE
          </button>
        </div>

        {/* BINDER PAGES WORKSPACE */}
        <div className="binder-body">
          
          {/* PAGES WORKSPACE (TABLE ONLY) */}
          <div className="binder-content-wrapper">
            
            {/* LEFT PAGE: 3-COLUMN ALBUM SLOT GRID */}
            <div className="table-scroll-area">
              <table className="binder-table-grid">
                <tbody>
                  {filteredCards.length > 0 ? (
                    ['infrastructure', 'support', 'special'].map((cat) => {
                      const catCards = filteredCards.filter(c => c.category === cat);
                      if (catCards.length === 0) return null;

                      // Chunk category cards into rows of 3
                      const cardRows = chunkArray(catCards, 3);

                      return cardRows.map((row, rowIndex) => {
                        return (
                          <tr key={`${cat}-row-${rowIndex}`} className="binder-grid-row">
                            {/* Y-axis indicator of card type: spans across all chunked rows for this type */}
                            {rowIndex === 0 && (
                              <td 
                                rowSpan={cardRows.length} 
                                className={`col-grid-type-label category-${cat}`}
                              >
                                <div className="vertical-type-label">
                                  {cat === 'infrastructure' ? 'INFRASTRUCTURE' : cat === 'support' ? 'SUPPORT' : 'SPECIAL'}
                                </div>
                              </td>
                            )}
                            
                            {/* Render exactly 3 columns (slots) */}
                            {[0, 1, 2].map((slotIdx) => {
                              const card = row[slotIdx];
                              if (!card) {
                                return (
                                  <td key={slotIdx} className="col-grid-slot slot-empty">
                                    <div className="empty-slot-box">
                                      <span className="empty-slot-label">[ EMPTY SLOT ]</span>
                                    </div>
                                  </td>
                                );
                              }

                              const imageSrc = getCardImage(card);
                              
                              return (
                                <td 
                                  key={slotIdx} 
                                  className="col-grid-slot"
                                  onClick={() => {
                                    playRetroSound('open', soundEnabled);
                                    setZoomImage(imageSrc);
                                    setZoomCard(card);
                                  }}
                                  onMouseEnter={() => playRetroSound('beep', soundEnabled)}
                                  title="Click to Zoom Card"
                                >
                                  <div className="grid-slot-card-container">
                                    <div className="grid-slot-art-frame">
                                      {imageSrc ? (
                                        <img src={imageSrc} alt={card.name} className="grid-slot-art" />
                                      ) : (
                                        <span className="slot-fallback-art">❓</span>
                                      )}
                                    </div>
                                    <div className="grid-slot-name-plate">
                                      {card.name}
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      });
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#7d5431' }}>
                        NO CARDS IN BINDER
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>

      {/* FULL ART LIGHTBOX ZOOM OVERLAY */}
      {zoomImage && (() => {
        const lore = zoomCard ? CARD_LORE[zoomCard.name] : null;
        return (
          <div
            className="zoom-modal-overlay"
            onClick={(e) => {
              e.stopPropagation();
              playRetroSound('close', soundEnabled);
              setZoomImage(null);
              setZoomCard(null);
            }}
          >
            {/* Card image */}
            <img src={zoomImage} alt="Card Info Zoom" className="zoom-image" />

            {/* Lore panel */}
            {lore && (
              <div
                className={`zoom-lore-panel lore-panel-${zoomCard.category}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="lore-header">
                  <span className="lore-card-name">{zoomCard.name}</span>
                  <span className="lore-card-type">{lore.type}</span>
                </div>

                <div className="lore-cost-row">{lore.cost}</div>

                <div className="lore-divider" />

                <div className="lore-section">
                  <span className="lore-section-label">✦ Best Case</span>
                  <p className="lore-section-text">{lore.bestCase}</p>
                </div>

                <div className="lore-divider" />

                <div className="lore-section">
                  <span className="lore-section-label">✦ Worst Case</span>
                  <p className="lore-section-text">{lore.worstCase}</p>
                </div>

                <div className="lore-divider" />

                <div className="lore-section">
                  <span className="lore-section-label">✦ Real-Life Connection</span>
                  <p className="lore-section-text">{lore.realLife}</p>
                </div>
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
}
