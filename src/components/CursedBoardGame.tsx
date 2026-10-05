import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SoccerCard, PackDefinition } from '../types/card';
import { CardItem } from './CardItem';
import {
  GERMANY_NATIONS_COLLECTIBLE_CARDS,
  GERMANY_ALL_TIME_XI_LEGENDS,
  GERMAN_TRIVIA_POOL,
  TriviaQuestion,
  generateBoardTiles,
  BoardTile,
  CURSED_LADDERS,
  CURSED_SNAKES,
  OUIJA_CENTER_TILE,
  CARD_CHEST_TILES,
  PACK_VAULT_TILES,
  COIN_TILES,
} from '../data/nationsGermany';
import { horrorAudio } from '../utils/horrorAudio';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { safeSetItem } from '../utils/safeStorage';
import {
  Skull,
  Ghost,
  Flame,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  Coins,
  ArrowRight,
  Shield,
  HelpCircle,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Zap,
  Award,
} from 'lucide-react';

interface CursedBoardGameProps {
  coins: number;
  clubCards: SoccerCard[];
  onAddCoins: (amount: number) => void;
  onAddCardsToClub: (cards: SoccerCard[]) => void;
  onAddUnopenedPack?: (pack: PackDefinition, sourceTitle: string, sourceType: 'high_low' | 'guess_who' | 'daily_objective' | 'bonus' | 'sbc' | 'pack_duo') => void;
  onMiniGamePlayed?: () => void;
}

interface BatParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface GhostParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export const CursedBoardGame: React.FC<CursedBoardGameProps> = ({
  coins,
  clubCards,
  onAddCoins,
  onAddCardsToClub,
  onAddUnopenedPack,
  onMiniGamePlayed,
}) => {
  // Board tiles
  const tiles = useMemo(() => generateBoardTiles(), []);

  // Player position on board: 1 to 100
  const [playerTile, setPlayerTile] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('apex_fut_cursed_board_pos');
      return saved ? Math.max(1, Math.min(100, Number(saved))) : 1;
    } catch {
      return 1;
    }
  });

  // Sound enabled state
  const [horrorAudioEnabled, setHorrorAudioEnabled] = useState<boolean>(() => {
    return horrorAudio.enabled;
  });

  // Game action states
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null);
  const [turnLog, setTurnLog] = useState<string>('Roll the bone dice to start your cursed journey...');

  // Flying bat and ghost particles
  const [bats, setBats] = useState<BatParticle[]>([]);
  const [ghosts, setGhosts] = useState<GhostParticle[]>([]);

  // 3-Question Trivia Modal State
  const [triviaModal, setTriviaModal] = useState<{
    questions: TriviaQuestion[];
    currentIndex: number;
    score: number;
    pendingTargetTile: number;
    answeredCurrent: boolean;
    selectedAnswer: number | null;
  } | null>(null);

  // Ouija Nightmare Full-Screen Event State
  const [showOuijaNightmare, setShowOuijaNightmare] = useState<boolean>(false);
  const [ouijaSpelledWord, setOuijaSpelledWord] = useState<string>('');

  // Reward Card Modal (when uncovering Germany cards or finishing board)
  const [rewardCardModal, setRewardCardModal] = useState<{
    cards: SoccerCard[];
    title: string;
    description: string;
    isGrandVictory?: boolean;
    bonusCoins?: number;
  } | null>(null);

  // Screen shake trigger state
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Track owned Germany cards in Club
  const ownedGermanyCards = useMemo(() => {
    return GERMANY_NATIONS_COLLECTIBLE_CARDS.filter((card) => {
      return clubCards.some(
        (c) =>
          c.id === card.id ||
          c.id.startsWith(card.id) ||
          (c.name.toLowerCase() === card.name.toLowerCase() && c.nation === 'Germany')
      );
    });
  }, [clubCards]);

  // Sync position to localStorage
  useEffect(() => {
    safeSetItem('apex_fut_cursed_board_pos', playerTile.toString());
  }, [playerTile]);

  // Ambient Flying Bats & Ghosts Generator
  useEffect(() => {
    const batInterval = setInterval(() => {
      if (Math.random() < 0.6) {
        const newBat: BatParticle = {
          id: Date.now() + Math.random(),
          x: Math.random() < 0.5 ? -40 : 105,
          y: 20 + Math.random() * 60,
          vx: Math.random() < 0.5 ? 2 + Math.random() * 2 : -(2 + Math.random() * 2),
          vy: (Math.random() - 0.5) * 1.5,
          size: 24 + Math.random() * 20,
          opacity: 0.7 + Math.random() * 0.3,
        };
        setBats((prev) => [...prev.slice(-6), newBat]);
        if (Math.random() < 0.3) {
          horrorAudio.playBatScreech();
        }
      }
    }, 4500);

    const ghostInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        const newGhost: GhostParticle = {
          id: Date.now() + Math.random(),
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 70,
          size: 40 + Math.random() * 30,
          opacity: 0.6,
        };
        setGhosts((prev) => [...prev.slice(-3), newGhost]);
        if (Math.random() < 0.25) {
          horrorAudio.playGhostWail();
        }
      }
    }, 7000);

    return () => {
      clearInterval(batInterval);
      clearInterval(ghostInterval);
    };
  }, []);

  // Shake trigger helper
  const triggerScreenShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 900);
  };

  // Toggle Audio
  const toggleAudio = () => {
    const next = !horrorAudioEnabled;
    horrorAudio.enabled = next;
    setHorrorAudioEnabled(next);
    if (next) horrorAudio.playBatScreech();
  };

  // Pick 3 unique random trivia questions from the pool
  const getRandomTriviaQuestions = (): TriviaQuestion[] => {
    const shuffled = [...GERMAN_TRIVIA_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Roll Dice Action
  const handleRollDice = () => {
    if (isRolling || triviaModal || showOuijaNightmare || rewardCardModal) return;

    setIsRolling(true);
    horrorAudio.playDiceRoll();
    triggerScreenShake();

    if (onMiniGamePlayed) onMiniGamePlayed();

    // Roll bone dice between 1 and 6
    const roll = Math.floor(Math.random() * 6) + 1;
    setLastDiceRoll(roll);

    setTimeout(() => {
      setIsRolling(false);
      const target = Math.min(100, playerTile + roll);
      setTurnLog(`Rolled a ${roll}! Advancing to Tile ${target}...`);

      // Spawn 3 trivia questions required for landing on this tile
      const questions = getRandomTriviaQuestions();
      setTriviaModal({
        questions,
        currentIndex: 0,
        score: 0,
        pendingTargetTile: target,
        answeredCurrent: false,
        selectedAnswer: null,
      });
    }, 850);
  };

  // Trivia Answer Handler
  const handleAnswerTrivia = (answerIndex: number) => {
    if (!triviaModal || triviaModal.answeredCurrent) return;

    const currentQ = triviaModal.questions[triviaModal.currentIndex];
    const isCorrect = answerIndex === currentQ.correctIndex;

    if (isCorrect) {
      horrorAudio.playTriviaCorrect();
    } else {
      horrorAudio.playTriviaWrong();
    }

    const nextScore = isCorrect ? triviaModal.score + 1 : triviaModal.score;

    setTriviaModal((prev) =>
      prev
        ? {
            ...prev,
            answeredCurrent: true,
            selectedAnswer: answerIndex,
            score: nextScore,
          }
        : null
    );

    // After review delay, advance to next question or complete trivia
    setTimeout(() => {
      if (!triviaModal) return;
      if (triviaModal.currentIndex < 2) {
        // Next question
        setTriviaModal((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: prev.currentIndex + 1,
                answeredCurrent: false,
                selectedAnswer: null,
              }
            : null
        );
      } else {
        // All 3 answered! Complete turn landing
        completeTileLanding(triviaModal.pendingTargetTile, nextScore);
        setTriviaModal(null);
      }
    }, 1800);
  };

  // Complete Tile Landing after answering the 3 Trivia questions
  const completeTileLanding = (targetTileIndex: number, triviaScore: number) => {
    setPlayerTile(targetTileIndex);

    // Bonus coins based on trivia score
    const triviaCoinBonus = triviaScore * 2500;
    if (triviaCoinBonus > 0) {
      onAddCoins(triviaCoinBonus);
    }

    const tile = tiles.find((t) => t.index === targetTileIndex) || tiles[0];

    // Case 1: Finish Line (Tile 100) -> Claim All-Time Germany Legendary XI Pack!
    if (targetTileIndex >= 100) {
      handleReachFinish();
      return;
    }

    // Case 2: Central Ouija Board Tile 50 -> TRIGGER REAL NIGHTMARE!
    if (targetTileIndex === OUIJA_CENTER_TILE) {
      triggerOuijaNightmareSequence();
      return;
    }

    // Case 3: Bone Ladder (+ shortcut)
    if (CURSED_LADDERS[targetTileIndex]) {
      const ladderTarget = CURSED_LADDERS[targetTileIndex];
      horrorAudio.playLadderClimb();
      setTurnLog(`🦴 Bone Ladder! Ascended from Tile ${targetTileIndex} up to Tile ${ladderTarget}!`);
      setTimeout(() => {
        setPlayerTile(ladderTarget);
      }, 700);
      return;
    }

    // Case 4: Cursed Serpent (- hazard)
    if (CURSED_SNAKES[targetTileIndex]) {
      const snakeTarget = CURSED_SNAKES[targetTileIndex];
      // Trivia mastery can disarm snakes! If 3/3 correct, player resists the hazard!
      if (triviaScore === 3) {
        horrorAudio.playTriviaCorrect();
        setTurnLog(`✨ Trivia Mastery (3/3)! Your German football knowledge charmed the serpent! Hazard disarmed.`);
      } else {
        horrorAudio.playTrapSnap();
        triggerScreenShake();
        setTurnLog(`🐍 Cursed Serpent strike! Slid back from Tile ${targetTileIndex} down to Tile ${snakeTarget}!`);
        setTimeout(() => {
          setPlayerTile(snakeTarget);
        }, 800);
      }
      return;
    }

    // Case 5: Germany Card Relic Chest Tile
    if (tile.type === 'card_chest') {
      sound.playLevelUp();
      // Pick a random Germany collectible card (prefer one user doesn't own yet)
      const missingCards = GERMANY_NATIONS_COLLECTIBLE_CARDS.filter(
        (c) => !clubCards.some((cc) => cc.id === c.id || cc.id.startsWith(c.id))
      );
      const pool = missingCards.length > 0 ? missingCards : GERMANY_NATIONS_COLLECTIBLE_CARDS;
      const rewardedCard = pool[Math.floor(Math.random() * pool.length)];

      onAddCardsToClub([rewardedCard]);
      onAddCoins(10000);

      setRewardCardModal({
        cards: [rewardedCard],
        title: '🇩🇪 Germany Relic Chest Uncovered!',
        description: `Your trivia performance unlocked ${rewardedCard.name} (${rewardedCard.rating} ${rewardedCard.position}) with German Flag Shield design for your Club inventory!`,
        bonusCoins: 10000,
      });
      return;
    }

    // Case 6: Haunted Pack Vault
    if (tile.type === 'pack_vault') {
      sound.playWalkoutFanfare();
      onAddCoins(15000);
      setTurnLog(`📦 Haunted Pack Vault unlocked! +15,000 Coins awarded to your club balance.`);
      return;
    }

    // Case 7: Grave Coin Vault
    if (tile.type === 'coins' && tile.coinReward) {
      sound.playCoinClink();
      onAddCoins(tile.coinReward);
      setTurnLog(`🪙 Grave Vault opened! Found +${tile.coinReward.toLocaleString()} gold coins!`);
      return;
    }

    setTurnLog(`Landed safely on Tile ${targetTileIndex}. Trivia Score: ${triviaScore}/3 (+${triviaCoinBonus} 🪙).`);
  };

  // The Terrifying Central Ouija Board Nightmare Sequence
  const triggerOuijaNightmareSequence = () => {
    setShowOuijaNightmare(true);
    horrorAudio.playNightmareShocker();
    triggerScreenShake();

    const ominousWords = ['N-I-G-H-T-M-A-R-E', 'B-A-N-I-S-H', 'C-U-R-S-E-D', 'T-O-R-M-E-N-T', 'D-O-O-M'];
    const chosenWord = ominousWords[Math.floor(Math.random() * ominousWords.length)];
    setOuijaSpelledWord(chosenWord);

    // After 4.5 seconds of horror, drag player back down to tile 35
    setTimeout(() => {
      setShowOuijaNightmare(false);
      setPlayerTile(35);
      horrorAudio.playTrapSnap();
      setTurnLog('💀 The Ouija Board nightmare consumed your soul! Banished back to Tile 35.');
    }, 4500);
  };

  // Grand Finish: Valhalla Sanctuary Ceremony (Tile 100)
  const handleReachFinish = () => {
    horrorAudio.playGrandTrophyVictory();
    sound.playLevelUp();

    confetti({
      particleCount: 260,
      spread: 140,
      origin: { y: 0.5 },
      colors: ['#facc15', '#dc2626', '#09090b', '#ffffff', '#eab308'],
    });

    // Grant all 11 All-Time Germany Legendary XI cards
    onAddCardsToClub(GERMANY_ALL_TIME_XI_LEGENDS);
    onAddCoins(150000);

    setRewardCardModal({
      cards: GERMANY_ALL_TIME_XI_LEGENDS,
      title: '👑 VALHALLA SANCTUARY: ALL-TIME GERMANY XI CLAIMED!',
      description:
        'You have conquered the Cursed Horror Snakes & Ladders Board! All 11 immortal 98–99 rated German legends featuring the German Flag Shield have been deposited directly into your Club roster, plus 150,000 Coins!',
      isGrandVictory: true,
      bonusCoins: 150000,
    });

    setTurnLog('🏆 VICTORY! Reached Tile 100 and claimed the All-Time Germany Legendary XI Pack!');
  };

  // Reset Board Run
  const handleResetRun = () => {
    sound.playClick();
    setPlayerTile(1);
    setLastDiceRoll(null);
    setTurnLog('The cursed board has reset. Roll the bone dice to begin anew...');
  };

  // Matrix coordinate calculation for 10x10 Snake & Ladder layout
  // Tile 1 is bottom-left, Tile 100 is top-left
  const getTileGridPosition = (index: number) => {
    const zeroBased = index - 1;
    const rowFromBottom = Math.floor(zeroBased / 10);
    const colInRow = zeroBased % 10;
    const actualCol = rowFromBottom % 2 === 0 ? colInRow : 9 - colInRow;
    const actualRow = 9 - rowFromBottom;
    return { row: actualRow, col: actualCol };
  };

  return (
    <div className={`space-y-6 relative ${isShaking ? 'animate-bounce' : ''}`}>
      {/* =================================================================== */}
      {/* TOP HEADER: CURSED BOARD CONTROLS & GERMANY THEME                   */}
      {/* =================================================================== */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 bg-gradient-to-r from-slate-950 via-[#180909] to-slate-950 p-6 shadow-[0_0_50px_rgba(220,38,38,0.35)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-red-600 to-yellow-400 p-0.5 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] flex-shrink-0 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-red-500">
              <Skull className="w-8 h-8" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                <span>Cursed Snakes &amp; Ladders</span>
                <span className="text-xl">🇩🇪</span>
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-500/40 px-3 py-1 rounded-full">
                Germany Horror Board Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Survive the haunted 100-tile gauntlet! Answer German national football trivia on every landing, dodge cursed snakes, climb spectral ladders, survive the <strong>Central Ouija Nightmare</strong>, and claim the <strong>All-Time Germany Legendary XI (99 OVR)</strong>!
            </p>
          </div>
        </div>

        {/* Action Controls & Sound Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${
              horrorAudioEnabled
                ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle Horror Sound Effects"
          >
            {horrorAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-xs font-bold uppercase">{horrorAudioEnabled ? 'Horror Audio ON' : 'Audio Muted'}</span>
          </button>

          <button
            onClick={handleResetRun}
            className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Run</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* STATUS HUD: PLAYER TILE, DICE ROLLER, COLLECTION COUNTER           */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 font-mono font-black text-lg">
            {playerTile}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Tile</span>
            <strong className="text-lg font-black text-white">{playerTile} / 100</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-black text-lg">
            {lastDiceRoll !== null ? lastDiceRoll : '🎲'}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Last Roll</span>
            <strong className="text-lg font-black text-amber-400">
              {lastDiceRoll ? `${lastDiceRoll} Steps` : 'Ready to Roll'}
            </strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Germany Cards Found</span>
            <strong className="text-sm font-black text-emerald-400">
              {ownedGermanyCards.length} / {GERMANY_NATIONS_COLLECTIBLE_CARDS.length} Collected
            </strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Finish Line Prize</span>
            <strong className="text-xs font-black text-yellow-300">All-Time 99 XI</strong>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* INTERACTIVE CONTROLS & BONE DICE ROLL BANNER                       */}
      {/* =================================================================== */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/40 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-300">
            <span className="font-bold text-amber-400 uppercase block text-[10px] tracking-wider">Status Lore</span>
            <p className="font-mono text-xs">{turnLog}</p>
          </div>
        </div>

        <button
          onClick={handleRollDice}
          disabled={isRolling || Boolean(triviaModal) || showOuijaNightmare}
          className={`py-3.5 px-8 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-3 ${
            isRolling
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 shadow-[0_0_30px_rgba(239,68,68,0.6)] active:scale-95 animate-pulse'
          }`}
        >
          <Skull className="w-5 h-5 stroke-[2.5]" />
          <span>{isRolling ? 'Rolling Bone Dice...' : 'ROLL BONE DICE (1-6)'}</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* THE 100-TILE CURSED COBBLESTONE BOARD (10x10 GRID)                 */}
      {/* =================================================================== */}
      <div className="relative rounded-3xl border-2 border-red-900/60 bg-gradient-to-b from-slate-950 via-[#0d0707] to-black p-4 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Atmospheric Floating Ghosts & Bats */}
        {bats.map((bat) => (
          <div
            key={bat.id}
            className="absolute pointer-events-none transition-all duration-3000 ease-out z-20 text-red-500/80 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            style={{
              left: `${bat.x}%`,
              top: `${bat.y}%`,
              fontSize: `${bat.size}px`,
              opacity: bat.opacity,
            }}
          >
            🦇
          </div>
        ))}

        {ghosts.map((ghost) => (
          <div
            key={ghost.id}
            className="absolute pointer-events-none transition-opacity duration-1000 ease-in-out z-20 text-cyan-400/70 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse"
            style={{
              left: `${ghost.x}%`,
              top: `${ghost.y}%`,
              fontSize: `${ghost.size}px`,
              opacity: ghost.opacity,
            }}
          >
            👻
          </div>
        ))}

        {/* Board 10x10 Grid */}
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2.5 max-w-5xl mx-auto">
          {Array.from({ length: 100 }, (_, i) => {
            // Render from row 9 down to 0, matching classic Snakes & Ladders:
            // Top row: 91 to 100 (left-to-right) or 100 to 91 (right-to-left)
            const rowFromTop = Math.floor(i / 10);
            const colInRow = i % 10;
            const rowFromBottom = 9 - rowFromTop;
            const tileNumber =
              rowFromBottom % 2 === 0
                ? rowFromBottom * 10 + (colInRow + 1)
                : rowFromBottom * 10 + (10 - colInRow);

            const tile = tiles.find((t) => t.index === tileNumber) || tiles[0];
            const isPlayerHere = playerTile === tileNumber;
            const isLadder = Boolean(CURSED_LADDERS[tileNumber]);
            const isSnake = Boolean(CURSED_SNAKES[tileNumber]);
            const isOuija = tileNumber === OUIJA_CENTER_TILE;
            const isChest = CARD_CHEST_TILES.includes(tileNumber);
            const isPack = PACK_VAULT_TILES.includes(tileNumber);
            const isCoin = COIN_TILES.includes(tileNumber);

            return (
              <div
                key={tileNumber}
                className={`relative aspect-square rounded-xl p-1 sm:p-2 border transition-all flex flex-col justify-between items-center text-center select-none overflow-hidden ${
                  isPlayerHere
                    ? 'border-yellow-400 bg-red-950/90 shadow-[0_0_25px_rgba(250,204,21,0.9)] scale-105 z-30'
                    : isOuija
                    ? 'border-purple-500 bg-purple-950/70 shadow-[0_0_25px_rgba(168,85,247,0.7)] animate-pulse'
                    : isSnake
                    ? 'border-red-600/70 bg-red-950/40'
                    : isLadder
                    ? 'border-emerald-500/70 bg-emerald-950/40'
                    : isChest
                    ? 'border-amber-400/80 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : tileNumber === 100
                    ? 'border-yellow-300 bg-gradient-to-tr from-amber-600 to-yellow-300 text-slate-950 font-black'
                    : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/80'
                }`}
              >
                {/* Tile Number Header */}
                <div className="w-full flex items-center justify-between text-[8px] sm:text-[10px] font-mono font-bold">
                  <span
                    className={
                      tileNumber === 100
                        ? 'text-slate-950'
                        : isPlayerHere
                        ? 'text-yellow-300'
                        : 'text-slate-500'
                    }
                  >
                    {tileNumber}
                  </span>
                  {isOuija && <span className="text-[10px] animate-spin">👁️</span>}
                  {isSnake && <span className="text-red-400 text-xs">🐍</span>}
                  {isLadder && <span className="text-emerald-400 text-xs">🪜</span>}
                  {isChest && <span className="text-amber-400 text-xs">🇩🇪</span>}
                  {isPack && <span className="text-cyan-400 text-xs">📦</span>}
                  {isCoin && <span className="text-yellow-400 text-xs">🪙</span>}
                </div>

                {/* Central Tile Graphic or Player Pawn */}
                <div className="flex-1 flex items-center justify-center my-auto">
                  {isPlayerHere ? (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-red-500 p-0.5 shadow-[0_0_20px_rgba(250,204,21,1)] animate-bounce flex items-center justify-center">
                      <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-xs sm:text-sm">
                        ⚽
                      </div>
                    </div>
                  ) : isOuija ? (
                    <div className="text-center font-black leading-tight text-purple-300 text-[8px] sm:text-[9px] uppercase tracking-tighter">
                      OUIJA
                    </div>
                  ) : isSnake ? (
                    <div className="text-[8px] sm:text-[9px] font-mono text-red-400 font-bold">
                      -{tileNumber - (CURSED_SNAKES[tileNumber] || 0)}
                    </div>
                  ) : isLadder ? (
                    <div className="text-[8px] sm:text-[9px] font-mono text-emerald-300 font-bold">
                      +{(CURSED_LADDERS[tileNumber] || 0) - tileNumber}
                    </div>
                  ) : tileNumber === 100 ? (
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
                  ) : (
                    <span className="text-[10px] text-slate-700">·</span>
                  )}
                </div>

                {/* Bottom Indicator */}
                <div className="text-[7px] sm:text-[8px] font-bold text-slate-500 truncate w-full text-center">
                  {tileNumber === 1
                    ? 'START'
                    : tileNumber === 100
                    ? 'ALL-TIME XI'
                    : isOuija
                    ? 'NIGHTMARE'
                    : isChest
                    ? 'RELIC'
                    : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3-QUESTION GERMAN TRIVIA MODAL (POPS UP ON EVERY LANDING)          */}
      {/* =================================================================== */}
      {triviaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-xl w-full rounded-3xl border-2 border-red-500/80 bg-gradient-to-b from-slate-950 via-[#180808] to-slate-950 p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(220,38,38,0.7)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-red-900/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇩🇪</span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  German National Trivia Challenge
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-[10px] font-mono font-bold text-red-300">
                Question {triviaModal.currentIndex + 1} of 3 · Score: {triviaModal.score}
              </span>
            </div>

            {/* Question Body */}
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                {triviaModal.questions[triviaModal.currentIndex].question}
              </h3>
              <p className="text-xs text-slate-400">
                Every landing tests your German football knowledge! Answering correctly disarms deadly hazards and unlocks national card relics.
              </p>
            </div>

            {/* 4 Answer Choice Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {triviaModal.questions[triviaModal.currentIndex].options.map((opt, oIdx) => {
                const isSelected = triviaModal.selectedAnswer === oIdx;
                const isCorrect = oIdx === triviaModal.questions[triviaModal.currentIndex].correctIndex;

                let btnStyle = 'bg-slate-900/90 border-slate-700 text-white hover:border-amber-400 hover:bg-slate-800';
                if (triviaModal.answeredCurrent) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-950/90 border-red-500 text-red-200';
                  } else {
                    btnStyle = 'bg-slate-950/70 border-slate-800 text-slate-500 opacity-50';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswerTrivia(oIdx)}
                    disabled={triviaModal.answeredCurrent}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {triviaModal.answeredCurrent && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    )}
                    {triviaModal.answeredCurrent && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Note after answer */}
            {triviaModal.answeredCurrent && (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 animate-fadeIn">
                <span className="font-bold text-amber-400 uppercase text-[10px] block">Historical Lore:</span>
                {triviaModal.questions[triviaModal.currentIndex].explanation}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* THE CENTRAL OUIJA BOARD REAL NIGHTMARE SEQUENCE MODAL               */}
      {/* =================================================================== */}
      {showOuijaNightmare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-pulse">
          <div className="relative max-w-lg w-full rounded-3xl border-4 border-red-600 bg-gradient-to-b from-[#1f0202] via-black to-[#2b0000] p-8 text-center space-y-6 shadow-[0_0_100px_rgba(220,38,38,1)]">
            <div className="w-24 h-24 mx-auto rounded-full bg-red-950/90 border-2 border-red-500 flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(239,68,68,0.9)] animate-spin">
              👁️
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-red-400 bg-red-950/80 px-4 py-1 rounded-full border border-red-500/50">
                ⚠️ REAL NIGHTMARE TRIGGERED! ⚠️
              </span>
              <h2 className="text-3xl font-black text-white uppercase tracking-wider">
                The Ouija Spirits Awaken
              </h2>
              <p className="text-sm text-red-200">
                You landed on the cursed central Ouija board! Ghostly planchette is moving violently across the board...
              </p>
            </div>

            {/* Moving Planchette Word */}
            <div className="py-4 px-6 rounded-2xl bg-black/90 border border-red-500/60 font-mono font-black text-2xl tracking-[0.35em] text-red-400 animate-pulse">
              {ouijaSpelledWord}
            </div>

            <div className="text-xs font-mono text-red-300/80">
              Dragging your soul back 15 tiles into the darkness...
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* REWARD CARD / GRAND VICTORY MODAL                                   */}
      {/* =================================================================== */}
      {rewardCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-lg animate-fade-in overflow-y-auto">
          <div className="relative max-w-3xl w-full rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-slate-950 via-[#1a0a05] to-slate-950 p-6 sm:p-8 text-center space-y-6 shadow-[0_0_80px_rgba(245,158,11,0.8)] my-8">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-4 py-1 rounded-full border border-amber-500/40">
                {rewardCardModal.isGrandVictory ? '⭐ GRAND VICTORY: TILE 100 CONQUERED! ⭐' : '⭐ RELIC UNLOCKED! ⭐'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {rewardCardModal.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                {rewardCardModal.description}
              </p>
              {rewardCardModal.bonusCoins && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono font-black text-sm">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>+{rewardCardModal.bonusCoins.toLocaleString()} Bonus Coins Added!</span>
                </div>
              )}
            </div>

            {/* Card(s) Showcase Grid */}
            <div className={`grid gap-4 py-2 justify-center ${
              rewardCardModal.cards.length > 1
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 max-h-[50vh] overflow-y-auto p-2'
                : 'grid-cols-1'
            }`}>
              {rewardCardModal.cards.map((c) => (
                <div key={c.id} className="flex flex-col items-center text-center space-y-1">
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <CardItem card={c} size="sm" interactive={true} />
                  </div>
                  <strong className="text-amber-300 text-xs truncate max-w-[120px]">{c.name}</strong>
                  <span className="text-[10px] text-slate-400">{c.rating} {c.position}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setRewardCardModal(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
