import React, { useState, useEffect, useRef } from 'react';
import { TournamentMatch, MatchCommentaryItem } from '../../types/draft';
import { SoccerCard } from '../../types/card';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Play, FastForward, SkipForward, Trophy, Shield, ArrowRight, RotateCcw, Flame } from 'lucide-react';

interface DraftMatchSimulationProps {
  match: TournamentMatch;
  userCards: SoccerCard[];
  onFinishMatch: (userWon: boolean, userScore: number, oppScore: number) => void;
  onExit: () => void;
}

export const DraftMatchSimulation: React.FC<DraftMatchSimulationProps> = ({
  match,
  userCards,
  onFinishMatch,
  onExit,
}) => {
  const [currentMinute, setCurrentMinute] = useState<number>(0);
  const [displayedEvents, setDisplayedEvents] = useState<MatchCommentaryItem[]>([]);
  const [currentHomeScore, setCurrentHomeScore] = useState<number>(0);
  const [currentAwayScore, setCurrentAwayScore] = useState<number>(0);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x = 600ms, 2x = 300ms, 4x = 120ms
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);

  const commentaryEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll commentary feed
  useEffect(() => {
    commentaryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedEvents]);

  // Simulation Timer loop
  useEffect(() => {
    if (!isStarted || isFinished) return;

    const intervalTime = Math.max(80, Math.floor(600 / simSpeed));

    const timer = setInterval(() => {
      setCurrentMinute((prevMin) => {
        const nextMin = prevMin + 3;

        // Check if any commentary events occurred up to nextMin
        const newEvents = match.commentaryLog.filter(
          (ev) => ev.minute > prevMin && ev.minute <= nextMin
        );

        if (newEvents.length > 0) {
          setDisplayedEvents((prev) => [...prev, ...newEvents]);

          // Check if any goals were scored
          newEvents.forEach((ev) => {
            if (ev.type === 'goal') {
              if (ev.team === 'user') {
                setCurrentHomeScore((s) => s + 1);
                sound.playGoal();
                confetti({
                  particleCount: 40,
                  spread: 60,
                  origin: { y: 0.7 },
                  colors: ['#fbbf24', '#f59e0b', '#10b981'],
                });
              } else {
                setCurrentAwayScore((s) => s + 1);
                sound.playWhistle();
              }
            } else if (ev.type === 'save') {
              sound.playHit();
            }
          });
        }

        // Full time reach (90 or 95)
        const maxMinute = match.commentaryLog.length > 0
          ? Math.max(90, ...match.commentaryLog.map((e) => e.minute))
          : 90;

        if (nextMin >= maxMinute) {
          clearInterval(timer);
          setIsFinished(true);
          sound.playWhistle();

          const finalUserWon = match.winnerTeamName === match.homeTeam.name;
          if (finalUserWon) {
            sound.playSuccess();
            confetti({
              particleCount: 90,
              spread: 90,
              origin: { y: 0.5 },
              colors: ['#ffd700', '#fbbf24', '#38bdf8', '#ffffff'],
            });
          }
          return maxMinute;
        }

        return nextMin;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isStarted, isFinished, simSpeed, match]);

  // Fast-Forward to instant completion
  const handleInstantFinish = () => {
    setCurrentMinute(90);
    setDisplayedEvents(match.commentaryLog);
    setCurrentHomeScore(match.homeScore);
    setCurrentAwayScore(match.awayScore);
    setIsFinished(true);
    sound.playWhistle();

    const userWon = match.winnerTeamName === match.homeTeam.name;
    if (userWon) {
      sound.playSuccess();
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
      });
    }
  };

  const userWon = currentHomeScore > currentAwayScore;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Top Match Header & Scoreboard */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700 shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between text-xs text-amber-400 font-black uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
          <span>{match.roundName} Knockout Clash</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-white text-sm">{currentMinute}'</span>
          </div>
        </div>

        {/* Live Score Counter */}
        <div className="grid grid-cols-3 items-center gap-4 text-center my-2">
          {/* User Team */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400/80 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-amber-500/20 mb-2">
              {match.homeTeam.badge}
            </div>
            <h3 className="font-black text-white text-base sm:text-lg truncate max-w-[140px]">
              {match.homeTeam.name}
            </h3>
            <span className="text-xs text-amber-300 font-semibold">{match.homeTeam.gamerTag}</span>
            <span className="text-[11px] text-slate-400 font-bold mt-1">{match.homeTeam.rating} OVR</span>
          </div>

          {/* Central Score */}
          <div className="flex flex-col items-center justify-center">
            <div className="font-mono font-black text-4xl sm:text-6xl text-white tracking-widest flex items-center gap-3">
              <span className={currentHomeScore > currentAwayScore ? 'text-amber-300' : 'text-white'}>
                {currentHomeScore}
              </span>
              <span className="text-slate-600">:</span>
              <span className={currentAwayScore > currentHomeScore ? 'text-rose-400' : 'text-white'}>
                {currentAwayScore}
              </span>
            </div>
            <div className="mt-2 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              {isFinished ? 'Full Time' : currentMinute === 0 ? 'Match Preview' : `Minute ${currentMinute}`}
            </div>
          </div>

          {/* Opponent Team */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-3xl sm:text-4xl shadow-xl mb-2">
              {match.awayTeam.badge}
            </div>
            <h3 className="font-black text-white text-base sm:text-lg truncate max-w-[140px]">
              {match.awayTeam.name}
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{match.awayTeam.gamerTag}</span>
            <span className="text-[11px] text-slate-400 font-bold mt-1">{match.awayTeam.rating} OVR</span>
          </div>
        </div>

        {/* Speed Controls & Sim Triggers */}
        {!isStarted ? (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                sound.playWhistle();
                setIsStarted(true);
              }}
              className="px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xl shadow-amber-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Kick Off Match
            </button>
          </div>
        ) : !isFinished ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Sim Speed:</span>
              {[1, 2, 4].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    sound.playClick();
                    setSimSpeed(speed);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    simSpeed === speed
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <button
              onClick={handleInstantFinish}
              className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <SkipForward className="w-4 h-4" />
              Skip to Final Whistle
            </button>
          </div>
        ) : null}
      </div>

      {/* Live Minute-by-Minute Commentary Feed */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col h-[340px]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Live Match Commentary
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">Minute-by-minute updates</span>
        </div>

        {/* Scrollable Log */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-2">
          {displayedEvents.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-500">
              Match commentary will stream here once kicked off...
            </div>
          ) : (
            displayedEvents.map((ev) => {
              const isGoal = ev.type === 'goal';
              const isUserGoal = isGoal && ev.team === 'user';
              const isOppGoal = isGoal && ev.team === 'opp';

              return (
                <div
                  key={ev.id}
                  className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    isUserGoal
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 font-semibold'
                      : isOppGoal
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 font-semibold'
                      : ev.type === 'half_time' || ev.type === 'full_time'
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-200 font-black'
                      : 'bg-slate-800/50 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-mono font-black text-amber-400 px-2 py-0.5 rounded bg-slate-950/60 text-[11px]">
                    {ev.minute}'
                  </span>
                  <p className="flex-1">{ev.text}</p>
                </div>
              );
            })
          )}
          <div ref={commentaryEndRef} />
        </div>
      </div>

      {/* Post-Match Conclusion Actions */}
      {isFinished && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xl font-black text-white">
              {userWon ? '🎉 Fantastic Victory!' : '💔 Defeat in Knockout'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {userWon
                ? 'Your squad advances to the next tournament round!'
                : 'Your tournament run has concluded. Consolation prizes awarded.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onFinishMatch(userWon, currentHomeScore, currentAwayScore);
              }}
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>{userWon ? 'Advance to Next Round' : 'Return to Tournament Hub'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
