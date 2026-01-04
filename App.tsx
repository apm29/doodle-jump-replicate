
import React, { useState, useCallback, useEffect } from 'react';
import Game from './components/Game';
import { GameState } from './types';
import { translations, Lang } from './utils/i18n';
import { ASSETS } from './utils/assets';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [isPaused, setIsPaused] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [score, setScore] = useState(0);
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('doodle-jump-lang');
    if (saved === 'en' || saved === 'zh') return saved;
    return navigator.language.startsWith('zh') ? 'zh' : 'en';
  });
  
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('doodle-jump-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const t = translations[lang];

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setShowHowTo(false);
    setIsPaused(false);
  };

  const togglePause = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      setIsPaused(prev => !prev);
    }
  }, [gameState]);

  const changeLang = () => {
    const newLang = lang === 'en' ? 'zh' : 'en';
    setLang(newLang);
    localStorage.setItem('doodle-jump-lang', newLang);
  };

  const onGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('doodle-jump-highscore', finalScore.toString());
    }
    setGameState(GameState.GAMEOVER);
    setIsPaused(false);
  }, [highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 font-sans select-none overflow-hidden">
      <div className="relative w-full max-w-[400px] aspect-[400/650] bg-white rounded-xl shadow-2xl overflow-hidden ring-4 ring-slate-200">
        
        {/* HUD: Pause Button */}
        {gameState === GameState.PLAYING && !isPaused && (
          <button 
            onClick={togglePause}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/50 hover:bg-white/80 rounded-full flex items-center justify-center text-slate-700 transition-all backdrop-blur-sm"
          >
            <i className="fas fa-pause text-sm"></i>
          </button>
        )}

        {/* Language Switcher */}
        {gameState === GameState.START && (
          <button 
            onClick={changeLang}
            className="absolute top-4 left-4 z-20 px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-600 transition-all uppercase tracking-wider"
          >
            {lang === 'en' ? '中文' : 'EN'}
          </button>
        )}

        {gameState === GameState.START && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 p-8 text-center">
            <h1 className="text-5xl font-black text-green-600 mb-2 drop-shadow-sm">{t.title}</h1>
            <h2 className="text-4xl font-bold text-slate-700 mb-8 uppercase tracking-tighter">{t.subtitle}</h2>
            
            <div className="w-28 h-28 mb-10 flex items-center justify-center animate-bounce">
               {/* 修复点：直接引用 ASSETS.player */}
               <img src={ASSETS.player} className="w-full h-full drop-shadow-lg" alt="Doodler" />
            </div>

            <div className="flex flex-col gap-4 w-full px-4">
              <button 
                onClick={startGame}
                className="bg-green-500 hover:bg-green-600 text-white w-full py-4 rounded-full text-2xl font-bold shadow-xl transform active:scale-95 transition-all"
              >
                {t.play}
              </button>
              
              <button 
                onClick={() => setShowHowTo(true)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 w-full py-3 rounded-full text-lg font-bold transition-all"
              >
                {t.howTo}
              </button>
            </div>

            {highScore > 0 && (
              <div className="mt-10">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-black">{t.record}</p>
                <p className="text-3xl font-black text-slate-700 tracking-tight">{highScore}</p>
              </div>
            )}
          </div>
        )}

        {/* How To Play Modal */}
        {showHowTo && (
          <div className="absolute inset-0 z-20 bg-white p-6 flex flex-col animate-in slide-in-from-bottom duration-300">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800">{t.manual}</h3>
                <button onClick={() => setShowHowTo(false)} className="text-slate-400 hover:text-slate-800 text-2xl"><i className="fas fa-times"></i></button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-6 text-left">
                <section>
                  <h4 className="font-bold text-green-600 border-b pb-1 mb-2">{t.controls}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-lg">
                       <p className="font-bold mb-1">{t.desktop}</p>
                       <p className="text-slate-500">{t.desktopKeys}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                       <p className="font-bold mb-1">{t.mobile}</p>
                       <p className="text-slate-500">{t.mobileKeys}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="font-bold text-blue-600 border-b pb-1 mb-2">{t.powerups}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg p-1 flex items-center justify-center">
                        <img src={ASSETS.rocket} className="w-full h-full" alt="Rocket" />
                      </div>
                      <div><p className="font-bold text-sm leading-none">{t.rocket}</p><p className="text-xs text-slate-500 mt-1">{t.rocketDesc}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg p-1 flex items-center justify-center">
                        <img src={ASSETS.shield} className="w-full h-full" alt="Shield" />
                      </div>
                      <div><p className="font-bold text-sm leading-none">{t.shield}</p><p className="text-xs text-slate-500 mt-1">{t.shieldDesc}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg p-1 flex items-center justify-center">
                        <img src={ASSETS.spring} className="w-full h-full" alt="Spring" />
                      </div>
                      <div><p className="font-bold text-sm leading-none">{t.spring}</p><p className="text-xs text-slate-500 mt-1">{t.springDesc}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg p-1 flex items-center justify-center">
                        <img src={ASSETS.coin} className="w-full h-full" alt="Coin" />
                      </div>
                      <div><p className="font-bold text-sm leading-none">{t.coin}</p><p className="text-xs text-slate-500 mt-1">{t.coinDesc}</p></div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="font-bold text-orange-600 border-b pb-1 mb-2">{t.platforms}</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-4 shadow-sm border border-slate-200 rounded overflow-hidden flex-shrink-0">
                         <img src={ASSETS.platformNormal} className="w-full h-full object-cover" />
                       </div>
                       <p className="text-xs text-slate-600"><span className="font-bold text-slate-800">{t.pNormal.label}:</span> {t.pNormal.desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-4 shadow-sm border border-slate-200 rounded overflow-hidden flex-shrink-0">
                         <img src={ASSETS.platformMoving} className="w-full h-full object-cover" />
                       </div>
                       <p className="text-xs text-slate-600"><span className="font-bold text-slate-800">{t.pMoving.label}:</span> {t.pMoving.desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-4 shadow-sm border border-slate-200 rounded overflow-hidden flex-shrink-0">
                         <img src={ASSETS.platformBreaking} className="w-full h-full object-cover" />
                       </div>
                       <p className="text-xs text-slate-600"><span className="font-bold text-slate-800">{t.pBreaking.label}:</span> {t.pBreaking.desc}</p>
                    </div>
                  </div>
                </section>
             </div>
             
             <button onClick={startGame} className="mt-6 bg-green-500 text-white py-4 rounded-xl font-bold text-xl shadow-lg transform active:scale-95 transition-all">{t.startNow}</button>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && gameState === GameState.PLAYING && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-8 text-center animate-in fade-in duration-200">
            <h2 className="text-5xl font-black text-white mb-8 tracking-widest drop-shadow-lg">{t.paused}</h2>
            <div className="flex flex-col gap-4 w-full max-w-[200px]">
              <button 
                onClick={togglePause}
                className="bg-green-500 hover:bg-green-600 text-white w-full py-4 rounded-full text-xl font-bold shadow-xl transition-all"
              >
                {t.resume}
              </button>
              <button 
                onClick={() => { setIsPaused(false); setGameState(GameState.START); }}
                className="bg-white hover:bg-slate-100 text-slate-700 w-full py-3 rounded-full text-lg font-bold transition-all"
              >
                {t.quit}
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.GAMEOVER && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-50/95 p-8 text-center animate-in zoom-in duration-300">
            <h2 className="text-4xl font-black text-red-600 mb-2">{t.gameOver}</h2>
            <div className="my-8">
              <p className="text-slate-400 uppercase tracking-widest font-black text-xs">{t.distance}</p>
              <p className="text-7xl font-black text-slate-800 tracking-tighter">{score}</p>
            </div>
            
            {score >= highScore && score > 0 && (
              <div className="mb-8 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full text-sm font-black animate-bounce shadow-md uppercase">
                {t.newRecord}
              </div>
            )}

            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={startGame}
                className="bg-green-500 hover:bg-green-600 text-white w-full py-4 rounded-xl text-xl font-bold shadow-lg"
              >
                {t.retry}
              </button>
              <button 
                onClick={() => setGameState(GameState.START)}
                className="bg-white border-2 border-slate-200 text-slate-600 w-full py-3 rounded-xl text-lg font-bold"
              >
                {t.mainMenu}
              </button>
            </div>
          </div>
        )}

        <Game onGameOver={onGameOver} isPlaying={gameState === GameState.PLAYING} isPaused={isPaused} />
      </div>
    </div>
  );
};

export default App;
