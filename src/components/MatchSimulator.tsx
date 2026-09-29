import React, { useState, useEffect, useRef } from 'react';
import { SoccerCard, MatchSimulationLog } from '../types/card';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, Trophy, Coins, Flame, Shield, ArrowRight } from 'lucide-react';

interface OpponentTeam {
  id: string;
  name: string;
  rating: number;
  badge: string;
  difficulty: 'Amateur' | 'Professional' | 'World Class' | 'Legendary';
  rewardCoins: number;
  rewardPackName?: string;
  playersSummary: string;
}

export const OPPONENT_TEAMS: OpponentTeam[] = [
  {
    id: 'opp-brazil-national',
    name: 'Brazil Seleção Canarinho XI',
    rating: 94,
    badge: '🇧🇷',
    difficulty: 'Legendary',
    rewardCoins: 25000,
    rewardPackName: 'Seleção Canarinho Pack 🇧🇷',
    playersSummary: 'Pelé, Ronaldo R9, Ronaldinho, Neymar, and Cafu in supreme Joga Bonito harmony.',
  },
  {
    id: 'opp-argentina-national',
    name: 'Argentina Albiceleste XI',
    rating: 93,
    badge: '🇦🇷',
    difficulty: 'Legendary',
    rewardCoins: 22000,
    rewardPackName: 'Albiceleste Champions Pack 🇦🇷',
    playersSummary: 'Diego Maradona, Lionel Messi, Enzo Fernández, and De Paul leading relentless tournament attack.',
  },
  {
    id: 'opp-belgium-national',
    name: 'Belgium Red Devils XI',
    rating: 91,
    badge: '🇧🇪',
    difficulty: 'World Class',
    rewardCoins: 18000,
    rewardPackName: 'Red Devils Golden Era Pack 🇧🇪',
    playersSummary: 'Kevin De Bruyne laser passes, Eden Hazard dribbling wizardry, and Courtois fortress in net.',
  },
  {
    id: 'opp-1',
    name: 'Metropolis FC',
    rating: 77,
    badge: '⚡',
    difficulty: 'Amateur',
    rewardCoins: 2500,
    playersSummary: 'Balanced regional squad with solid counter-attack tempo.',
  },
  {
    id: 'opp-2',
    name: 'Continental Galacticos',
    rating: 84,
    badge: '👑',
    difficulty: 'Professional',
    rewardCoins: 5000,
    rewardPackName: 'Premium Gold Pack',
    playersSummary: 'Star-studded midfield playmakers and high-pressing fullbacks.',
  },
  {
    id: 'opp-3',
    name: 'Obsidian Icons XI',
    rating: 89,
    badge: '🛡️',
    difficulty: 'World Class',
    rewardCoins: 10000,
    rewardPackName: 'Prime Mega Pack',
    playersSummary: 'Historical legends with clinical finishing and stone wall defense.',
  },
  {
    id: 'opp-4',
    name: 'Creator All-Stars',
    rating: 93,
    badge: '🌟',
    difficulty: 'Legendary',
    rewardCoins: 16000,
    rewardPackName: 'Creator Showcase Pack',
    playersSummary: 'Community custom creations armed with 99 pace and thunder strikes.',
  },
];

interface MatchSimulatorProps {
  userSquadCards: SoccerCard[];
  userSquadRating: number;
  userSquadChemistry: number;
  onAwardMatchPrize: (coins: number, packName?: string) => void;
  onNavigateToSquadBuilder: () => void;
}

export const MatchSimulator: React.FC<MatchSimulatorProps> = ({
  userSquadCards,
  userSquadRating,
  userSquadChemistry,
  onAwardMatchPrize,
  onNavigateToSquadBuilder,
}) => {
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentTeam>(OPPONENT_TEAMS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [minute, setMinute] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [logs, setLogs] = useState<MatchSimulationLog[]>([]);
  const [matchFinished, setMatchFinished] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Match Simulation Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && minute < 90) {
      timer = setTimeout(() => {
        const nextMin = minute + Math.floor(Math.random() * 8) + 4;
        const currentMin = Math.min(90, nextMin);
        setMinute(currentMin);

        // Active PlayStyle Plus calculation
        const psPlusPlayers = userSquadCards.filter(c => !!c.playStylePlus);
        const psPlusBonusRating = Math.min(6, psPlusPlayers.length * 0.8);

        // Simulation event probability with tactical PS+ boost
        const userRatingAdvantage = (userSquadRating + userSquadChemistry * 0.3 + psPlusBonusRating) - selectedOpponent.rating;
        const userGoalChance = 0.16 + (userRatingAdvantage * 0.015);
        const oppGoalChance = 0.14 - (userRatingAdvantage * 0.015);

        const roll = Math.random();

        // Pick user players for realistic commentary
        const strikers = userSquadCards.filter(c => ['ST', 'CF', 'LW', 'RW'].includes(c.position));
        const midfielders = userSquadCards.filter(c => ['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(c.position));
        const defenders = userSquadCards.filter(c => ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(c.position));
        const keepers = userSquadCards.filter(c => c.position === 'GK');

        const activeAttacker = strikers.length ? strikers[Math.floor(Math.random() * strikers.length)] : userSquadCards[0];
        const activeMidfielder = midfielders.length ? midfielders[Math.floor(Math.random() * midfielders.length)] : userSquadCards[0];
        const activeDefender = defenders.length ? defenders[Math.floor(Math.random() * defenders.length)] : userSquadCards[0];
        const activeKeeper = keepers.length ? keepers[0] : userSquadCards[0];

        if (roll < userGoalChance) {
          // User Goal
          const newScore = userScore + 1;
          setUserScore(newScore);
          sound.playGoalCheer();

          let goalMsg = '';
          const activePs = activeAttacker?.playStyles?.[0] || activeAttacker?.playStylePlus;
          const midPs = activeMidfielder?.playStyles?.[0] || activeMidfielder?.playStylePlus;

          if (activePs) {
            if (activePs.id === 'quick_step') {
              goalMsg = `⚡ [QUICK STEP+ ACTIVATED] ${activeAttacker.name} (+14 Pace) bursts past the backline with ferocious acceleration to score!`;
            } else if (activePs.id === 'finesse_shot') {
              goalMsg = `🎯 [FINESSE SHOT+ ACTIVATED] ${activeAttacker.name} (+16 Shooting) curls an unstoppable dipping rocket into the top 90!`;
            } else if (activePs.id === 'rapid') {
              goalMsg = `💨 [RAPID+ ACTIVATED] ${activeAttacker.name} (+14 Dribbling) breezes past two defenders and slots a clinical finish!`;
            } else if (activePs.id === 'dead_ball') {
              goalMsg = `☄️ [DEAD BALL+ ACTIVATED] ${activeAttacker.name} (+18 Passing) curls a breathtaking set-piece into the top corner!`;
            } else if (activePs.id === 'technical') {
              goalMsg = `👟 [TECHNICAL+ ACTIVATED] ${activeAttacker.name} (+15 Dribbling) glides through three defenders with razor touch before finding the net!`;
            } else if (activePs.id === 'trickster') {
              goalMsg = `🪄 [TRICKSTER+ ACTIVATED] ${activeAttacker.name} executes a sensational deceptive flick and buries the finish!`;
            } else if (activePs.id === 'poacher') {
              goalMsg = `🥅 [POACHER+ ACTIVATED] ${activeAttacker.name} pounces on the rebound with lethal first-time finishing instinct!`;
            } else if (activePs.id === 'acrobatic') {
              goalMsg = `🤸 [ACROBATIC+ ACTIVATED] ${activeAttacker.name} meets the cross with a breathtaking mid-air scissor volley!`;
            } else if (activePs.id === 'power_header') {
              goalMsg = `💥 [POWER HEADER+ ACTIVATED] ${activeAttacker.name} rises above everyone to slam a bullet header past the keeper!`;
            } else {
              goalMsg = `👑 [${activePs.name.toUpperCase()} ACTIVATED] ${activeAttacker.name} converts with supreme International Moment mastery!`;
            }
          } else if (midPs && (midPs.id === 'whipped_pass' || midPs.id === 'incisive_pass' || midPs.id === 'long_ball_pass')) {
            goalMsg = `🎯 [${midPs.name.toUpperCase()} ACTIVATED] ${activeMidfielder.name} dissects the defense with laser vision for ${activeAttacker?.name || 'the forward'} to finish!`;
          } else if (activeAttacker?.isCustom) {
            goalMsg = `⚽ GOOOAL! Custom creation ${activeAttacker.name} fires an unstoppable rocket into the net!`;
          } else {
            goalMsg = `⚽ GOAL! ${activeAttacker ? activeAttacker.name : 'Your forward'} finishes a clinical chance after great buildup from ${activeMidfielder ? activeMidfielder.name : 'midfield'}!`;
          }

          setLogs(prev => [
            ...prev,
            {
              minute: currentMin,
              text: goalMsg,
              type: 'goal',
              team: 'user',
              score: [newScore, oppScore],
            },
          ]);
        } else if (roll < userGoalChance + oppGoalChance) {
          // Opponent Goal
          const newOpp = oppScore + 1;
          setOppScore(newOpp);
          sound.playPackRip(); // dramatic thud
          setLogs(prev => [
            ...prev,
            {
              minute: currentMin,
              text: `⚽ GOAL! ${selectedOpponent.name} capitalizes on a quick counter and slots past the keeper.`,
              type: 'goal',
              team: 'opponent',
              score: [userScore, newOpp],
            },
          ]);
        } else {
          // Normal match event (save, chance, tackle)
          const eventRoll = Math.random();
          let eventText = '';
          let eventType: MatchSimulationLog['type'] = 'chance';

          if (eventRoll < 0.35) {
            eventType = 'save';
            if (activeKeeper?.playStylePlus && activeKeeper.playStylePlus.id === 'cat_reflexes') {
              eventText = `🧤 [CAT REFLEXES+ ACTIVATED] ${activeKeeper.name} (+15 Reflexes) pulls off a miraculous diving reaction save!`;
            } else if (activeDefender?.playStylePlus && activeDefender.playStylePlus.id === 'anticipate') {
              eventText = `🛡️ [ANTICIPATE+ ACTIVATED] ${activeDefender.name} (+15 Defense) executes a surgical standing tackle to extinguish the attack!`;
            } else if (activeDefender?.playStylePlus && activeDefender.playStylePlus.id === 'bruiser') {
              eventText = `💪 [BRUISER+ ACTIVATED] ${activeDefender.name} (+12 Physical) outmuscles the opponent in a fierce shoulder duel!`;
            } else {
              eventText = `🧤 Spectacular diving save keeps ${selectedOpponent.name} at bay!`;
            }
          } else if (eventRoll < 0.70) {
            eventType = 'chance';
            if (activeAttacker?.playStylePlus) {
              eventText = `⚡ Close attempt! ${activeAttacker.name}'s signature ${activeAttacker.playStylePlus.name} strikes the crossbar!`;
            } else {
              eventText = `⚡ Close attempt! ${activeAttacker ? activeAttacker.name : 'Your attack'} strikes the woodwork from distance!`;
            }
          } else {
            eventType = 'foul';
            eventText = `⚠️ Tactical midfield challenge breaks up play cleanly.`;
          }

          setLogs(prev => [
            ...prev,
            {
              minute: currentMin,
              text: eventText,
              type: eventType,
              team: 'user',
              score: [userScore, oppScore],
            },
          ]);
        }

        // Whistle at 90'
        if (currentMin >= 90) {
          setIsPlaying(false);
          setMatchFinished(true);
          sound.playSuspenseReveal();
        }
      }, 550);
    }

    return () => clearTimeout(timer);
  }, [isPlaying, minute, userScore, oppScore, userSquadRating, userSquadChemistry, selectedOpponent, userSquadCards]);

  const handleStartMatch = () => {
    if (userSquadCards.length < 5) {
      alert('Your squad has fewer than 5 players! Please add more cards in the Squad Builder first.');
      return;
    }
    setMinute(0);
    setUserScore(0);
    setOppScore(0);
    setLogs([
      {
        minute: 1,
        text: `🏁 The referee blows the whistle! Kick-off between Your Squad vs ${selectedOpponent.name}!`,
        type: 'whistle',
        team: 'user',
        score: [0, 0],
      },
    ]);
    setMatchFinished(false);
    setRewardClaimed(false);
    setIsPlaying(true);
    sound.playClick();
  };

  const handleClaimReward = () => {
    if (rewardClaimed) return;
    const isWin = userScore > oppScore;
    const isDraw = userScore === oppScore;

    const coinsEarned = isWin
      ? selectedOpponent.rewardCoins
      : isDraw
      ? Math.round(selectedOpponent.rewardCoins * 0.4)
      : Math.round(selectedOpponent.rewardCoins * 0.15);

    const bonusPack = isWin ? selectedOpponent.rewardPackName : undefined;

    onAwardMatchPrize(coinsEarned, bonusPack);
    setRewardClaimed(true);

    if (isWin) {
      sound.playGoalCheer();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } else {
      sound.playCoinClink();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4" />
            <span>Kick-Off Match Arena</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Test Your Squad in Live Match Clashes
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Put your custom creations & dream squad to the test. Win matches to earn coins and unlock bonus packs!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Your Squad Power</span>
            <span className="text-sm font-black text-amber-400">
              OVR {userSquadRating || '--'} · CHEM {userSquadChemistry}/33
            </span>
          </div>
          <button
            onClick={onNavigateToSquadBuilder}
            className="px-3.5 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            Edit Squad
          </button>
        </div>
      </div>

      {/* Opponent Selection Bar */}
      {!isPlaying && minute === 0 && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Select Opponent Club
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OPPONENT_TEAMS.map((opp) => (
              <div
                key={opp.id}
                onClick={() => {
                  setSelectedOpponent(opp);
                  sound.playClick();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedOpponent.id === opp.id
                    ? 'bg-slate-800/90 border-emerald-400 shadow-lg shadow-emerald-950/50 scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{opp.badge}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-950 text-slate-300 border border-slate-800">
                      {opp.difficulty}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{opp.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{opp.playersSummary}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Rating: <strong className="text-white">{opp.rating}</strong></span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    +{opp.rewardCoins.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Match Arena Display */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Active PlayStyle Plus Combat Synergy Banner */}
        {userSquadCards.some(c => !!c.playStylePlus) && (
          <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-[#18150c] to-slate-950 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                  Active PlayStyle Plus Synergy
                </span>
                <span className="text-[11px] text-zinc-400">
                  Tactical gameplay stat boosts applied to match clash calculations
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {userSquadCards.filter(c => !!c.playStylePlus).slice(0, 5).map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 border border-amber-500/40 text-[11px] font-bold text-amber-200 shadow-sm"
                >
                  <span>{c.playStylePlus?.iconSymbol}</span>
                  <span className="text-white">{c.shortName || c.name}</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-mono font-black uppercase">
                    +{c.playStylePlus?.statBoost.bonus} {c.playStylePlus?.statBoost.attribute}
                  </span>
                </span>
              ))}
              {userSquadCards.filter(c => !!c.playStylePlus).length > 5 && (
                <span className="text-[11px] text-amber-400 font-bold">
                  +{userSquadCards.filter(c => !!c.playStylePlus).length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Scoreboard Header */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
          {/* User Squad */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Your Dream XI
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Apex FC
            </h3>
            <span className="text-xs text-slate-400">
              OVR {userSquadRating} · Chem {userSquadChemistry}
            </span>
          </div>

          {/* Center: Score & Match Clock */}
          <div className="flex flex-col items-center px-6">
            <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-mono text-emerald-400 font-bold mb-2">
              {minute}'
            </div>
            <div className="flex items-center gap-4 text-4xl sm:text-5xl font-black text-white tabular-nums tracking-wider">
              <span>{userScore}</span>
              <span className="text-slate-600 font-light">-</span>
              <span>{oppScore}</span>
            </div>
            {matchFinished && (
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mt-2">
                Full Time
              </span>
            )}
          </div>

          {/* Opponent Squad */}
          <div className="flex-1 flex flex-col items-center sm:items-end text-center sm:text-right">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Opponent
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {selectedOpponent.name}
            </h3>
            <span className="text-xs text-slate-400">
              OVR {selectedOpponent.rating} · {selectedOpponent.difficulty}
            </span>
          </div>
        </div>

        {/* Match Action Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isPlaying && minute === 0 && (
            <button
              onClick={handleStartMatch}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Kick Off Match</span>
            </button>
          )}

          {isPlaying && (
            <button
              onClick={() => setIsPlaying(false)}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Sim</span>
            </button>
          )}

          {!isPlaying && minute > 0 && !matchFinished && (
            <button
              onClick={() => setIsPlaying(true)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Match</span>
            </button>
          )}

          {matchFinished && (
            <div className="flex items-center gap-3">
              {!rewardClaimed ? (
                <button
                  onClick={handleClaimReward}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transform hover:scale-105 transition-all"
                >
                  <Trophy className="w-4 h-4" />
                  <span>
                    Claim {userScore > oppScore ? 'Victory Reward' : userScore === oppScore ? 'Draw Reward' : 'Consolation Reward'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMinute(0);
                    setUserScore(0);
                    setOppScore(0);
                    setLogs([]);
                    setMatchFinished(false);
                    setRewardClaimed(false);
                  }}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Another Match</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Live Match Commentary Log Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 h-64 overflow-y-auto space-y-2.5 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-center py-20 text-slate-600 font-sans">
              Press Kick Off to start real-time match simulation...
            </div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 ${
                  log.type === 'goal'
                    ? log.team === 'user'
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-rose-950/50 border-rose-500/40 text-rose-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-slate-500 font-bold tabular-nums shrink-0">
                  {log.minute}'
                </span>
                <span className="flex-1 font-sans">{log.text}</span>
                <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                  [{log.score[0]}-{log.score[1]}]
                </span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
