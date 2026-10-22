import React from 'react';
import { TournamentMatch, TournamentRound, TournamentCup } from '../../types/draft';
import { Trophy, Play, CheckCircle2, XCircle, ArrowRight, Shield, Award, Users } from 'lucide-react';
import { sound } from '../../utils/audio';

interface DraftTournamentBracketProps {
  currentCup: TournamentCup;
  cups: TournamentCup[];
  onSelectCup: (cup: TournamentCup) => void;
  matches: TournamentMatch[];
  currentRound: TournamentRound;
  isEliminated: boolean;
  isChampion: boolean;
  isSquadReady?: boolean;
  draftedCount?: number;
  onGoToDraftTable?: () => void;
  onStartMatch: (match: TournamentMatch) => void;
  onClaimPrize?: () => void;
  onResetTournament: () => void;
}

export const DraftTournamentBracket: React.FC<DraftTournamentBracketProps> = ({
  currentCup,
  cups,
  onSelectCup,
  matches,
  currentRound,
  isEliminated,
  isChampion,
  isSquadReady = true,
  draftedCount = 11,
  onGoToDraftTable,
  onStartMatch,
  onClaimPrize,
  onResetTournament,
}) => {
  const r16Matches = matches.filter((m) => m.round === 'r16');
  const qfMatches = matches.filter((m) => m.round === 'qf');
  const sfMatches = matches.filter((m) => m.round === 'sf');
  const finalMatch = matches.find((m) => m.round === 'final');

  const activeUserMatch = matches.find((m) => m.round === currentRound && m.isUserMatch && m.status === 'ready');

  const roundOrder: { key: TournamentRound; title: string; count: number }[] = [
    { key: 'r16', title: 'Round of 16', count: 8 },
    { key: 'qf', title: 'Quarter-Finals', count: 4 },
    { key: 'sf', title: 'Semi-Finals', count: 2 },
    { key: 'final', title: 'Grand Final', count: 1 },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Tournament Cup Switcher & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
            {currentCup.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">{currentCup.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                16-Team Knockout
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentCup.tagline}</p>
          </div>
        </div>

        {/* Cup Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {cups.map((cup) => (
            <button
              key={cup.id}
              onClick={() => {
                sound.playClick();
                onSelectCup(cup);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide whitespace-nowrap transition-all ${
                cup.id === currentCup.id
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cup.name}
            </button>
          ))}
        </div>
      </div>

      {/* Prize Banner & Active Match CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-amber-900/30 border border-amber-500/30">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
              Tournament Grand Prize
            </span>
            <div className="text-lg font-black text-white flex items-center gap-2">
              <span>Jumbo Rare Players Pack</span>
              <span className="text-yellow-400">+ 25,000 Coins</span>
            </div>
          </div>
        </div>

        {/* Play Action / Result CTA */}
        {isChampion ? (
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Tournament Champion!
            </span>
            <button
              onClick={() => {
                sound.playFanfare();
                if (onClaimPrize) onClaimPrize();
              }}
              className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-yellow-300 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-105 transition-transform"
            >
              Claim 25,000 Coins & Pack
            </button>
          </div>
        ) : isEliminated ? (
          <div className="flex items-center gap-3">
            <span className="text-rose-400 font-bold text-xs">Eliminated from Cup</span>
            <button
              onClick={() => {
                sound.playClick();
                onResetTournament();
              }}
              className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Start New Draft
            </button>
          </div>
        ) : !isSquadReady ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs text-amber-300 font-bold bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30">
              Draft Starting 11 ({draftedCount}/11 drafted) in Draft Table to kick off!
            </span>
            {onGoToDraftTable && (
              <button
                onClick={() => {
                  sound.playClick();
                  onGoToDraftTable();
                }}
                className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Go to Draft Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : activeUserMatch ? (
          <button
            onClick={() => {
              sound.playWhistle();
              onStartMatch(activeUserMatch);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Play {activeUserMatch.roundName} Match vs {activeUserMatch.awayTeam.gamerTag || activeUserMatch.awayTeam.name}
          </button>
        ) : (
          <span className="text-xs text-slate-400 font-semibold">Tournament in progress...</span>
        )}
      </div>

      {/* 16-Team Bracket Visualizer */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[880px] grid grid-cols-4 gap-4">
          {roundOrder.map(({ key, title }) => {
            const roundMatches = matches.filter((m) => m.round === key);

            return (
              <div key={key} className="flex flex-col gap-3">
                <div className="text-center pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">{title}</h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {key === 'r16' ? '8 Fixtures' : key === 'qf' ? '4 Fixtures' : key === 'sf' ? '2 Fixtures' : 'Championship'}
                  </span>
                </div>

                <div className="flex flex-col justify-around gap-3 h-full">
                  {roundMatches.map((match) => {
                    const isUser = match.isUserMatch;
                    const isCompleted = match.status === 'completed';
                    const userWon = isCompleted && match.winnerTeamName === match.homeTeam.name;

                    return (
                      <div
                        key={match.id}
                        className={`rounded-2xl p-3 border transition-all text-xs ${
                          isUser
                            ? 'bg-slate-900 border-amber-400/80 shadow-md shadow-amber-500/10'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        {/* Match Status Header */}
                        <div className="flex items-center justify-between text-[10px] font-black uppercase mb-1.5 pb-1 border-b border-slate-800/60">
                          <span className={isUser ? 'text-amber-400' : 'text-slate-500'}>
                            {isUser ? '★ Your Match' : `Match #${match.matchIndex + 1}`}
                          </span>
                          <span
                            className={
                              isCompleted
                                ? 'text-emerald-400'
                                : match.status === 'ready'
                                ? 'text-amber-300 animate-pulse'
                                : 'text-slate-500'
                            }
                          >
                            {isCompleted ? 'Finished' : match.status === 'ready' ? 'Ready to Play' : 'Upcoming'}
                          </span>
                        </div>

                        {/* Home Team (User) */}
                        <div
                          className={`flex items-center justify-between py-1 ${
                            isCompleted && match.winnerTeamName === match.homeTeam.name ? 'font-black text-white' : ''
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span>{match.homeTeam.badge}</span>
                            <span className="truncate">{match.homeTeam.gamerTag || match.homeTeam.name}</span>
                          </div>
                          <span className="font-mono font-bold text-sm ml-2">
                            {isCompleted ? match.homeScore : '-'}
                          </span>
                        </div>

                        {/* Away Team (Opponent) */}
                        <div
                          className={`flex items-center justify-between py-1 ${
                            isCompleted && match.winnerTeamName === match.awayTeam.name ? 'font-black text-white' : ''
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span>{match.awayTeam.badge}</span>
                            <span className="truncate">{match.awayTeam.gamerTag || match.awayTeam.name}</span>
                          </div>
                          <span className="font-mono font-bold text-sm ml-2">
                            {isCompleted ? match.awayScore : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
