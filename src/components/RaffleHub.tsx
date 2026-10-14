import React, { useState, useEffect } from 'react';
import { SoccerCard, PackDefinition } from '../types/card';
import { RaffleState, RaffleWinnerEntry } from '../types/raffle';
import {
  getRafflePlayerForMonth,
  getCurrentCalendarMonthKey,
} from '../data/raffleCards';
import {
  loadRaffleState,
  saveRaffleState,
  getNextUtcMidnightTimestamp,
  formatMsToCountdown,
  executeDailyDraw,
  getUtcDateKey,
} from '../utils/raffleService';
import { CardItem } from './CardItem';

interface RaffleHubProps {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  clubCards: SoccerCard[];
  setClubCards: React.Dispatch<React.SetStateAction<SoccerCard[]>>;
  onAddUnopenedPack: (
    pack: PackDefinition,
    sourceTitle: string,
    sourceType: 'high_low' | 'guess_who' | 'daily_objective' | 'bonus' | 'sbc' | 'pack_duo' | 'raffle'
  ) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const RaffleHub: React.FC<RaffleHubProps> = ({
  coins,
  setCoins,
  clubCards,
  setClubCards,
  onAddUnopenedPack,
}) => {
  const [raffleState, setRaffleState] = useState(() => loadRaffleState());
  const [ticketInputAmount, setTicketInputAmount] = useState<number>(10);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);
  const [purchaseErrorMessage, setPurchaseErrorMessage] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [claimCelebrationWinner, setClaimCelebrationWinner] = useState<RaffleWinnerEntry | null>(
    raffleState.pendingUserPrize
  );

  // Active player configuration strictly derived from current real-world calendar UTC
  const currentMonthKey = getCurrentCalendarMonthKey();
  const currentMonthConfig = getRafflePlayerForMonth(currentMonthKey);
  const featuredCard = currentMonthConfig.card;

  // UTC Midnight Countdown
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    totalSeconds: number;
  }>({ hours: '00', minutes: '00', seconds: '00', totalSeconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const nextMidnight = getNextUtcMidnightTimestamp(new Date(now));
      const diff = nextMidnight - now;
      setTimeLeft(formatMsToCountdown(diff));

      // Auto-check if day flipped
      const currentUtcKey = getUtcDateKey(new Date(now));
      if (raffleState.todayDrawDateKey && raffleState.todayDrawDateKey !== currentUtcKey) {
        // Run daily draw automatically
        const { newState, userPrize } = executeDailyDraw(raffleState, false, currentMonthKey);
        setRaffleState(newState);
        if (userPrize) {
          setClaimCelebrationWinner(userPrize);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [raffleState, currentMonthKey]);

  // Check if user already owns this raffle card in club
  const isCardInClub = clubCards.some(
    (c) => c.name.toLowerCase() === featuredCard.name.toLowerCase() && c.rarity === 'raffle'
  );

  // Ticket calculations
  const totalDrawTickets = raffleState.userTicketsToday + raffleState.communityTicketsToday;
  const userWinningChance =
    totalDrawTickets > 0 ? ((raffleState.userTicketsToday / totalDrawTickets) * 100).toFixed(2) : '0.00';

  // Handle purchasing tickets (1 coin per ticket, unlimited based on coins)
  const handlePurchaseTickets = (amountToBuy: number) => {
    if (amountToBuy <= 0) return;
    const cost = amountToBuy * 1; // 1 coin per ticket
    if (coins < cost) {
      setPurchaseErrorMessage(
        `⚠️ Insufficient coins! You need ${cost.toLocaleString()} coins to purchase ${amountToBuy.toLocaleString()} tickets (Balance: ${coins.toLocaleString()} coins).`
      );
      setTimeout(() => setPurchaseErrorMessage(null), 4500);
      return;
    }

    setCoins((prev) => prev - cost);
    setPurchaseErrorMessage(null);
    setRaffleState((prev) => {
      const updated = {
        ...prev,
        userTicketsToday: prev.userTicketsToday + amountToBuy,
        currentMonthKey,
      };
      saveRaffleState(updated);
      return updated;
    });

    setPurchaseSuccessMessage(
      `🎟️ Successfully purchased ${amountToBuy.toLocaleString()} tickets for ${cost.toLocaleString()} coins!`
    );
    setTimeout(() => setPurchaseSuccessMessage(null), 4000);
  };

  // Run a draw (Random or Forced win for testing)
  const handleTriggerDraw = (forceWin = false) => {
    const { newState, userPrize } = executeDailyDraw(raffleState, forceWin, currentMonthKey);
    setRaffleState(newState);
    if (userPrize) {
      setClaimCelebrationWinner(userPrize);
    }
  };


  // Claim user prize
  const handleClaimPrize = (winner: RaffleWinnerEntry) => {
    if (winner.claimed) return;

    if (winner.place === 1 && winner.prizeCard) {
      // Award featured card to club
      const rewardCard: SoccerCard = {
        ...winner.prizeCard,
        id: `raffle_win_${Date.now()}_${winner.prizeCard.id}`,
      };
      setClubCards((prev) => [rewardCard, ...prev]);
    } else if (winner.place === 2 && winner.prizePack) {
      // Award Jumbo Rare Players Pack
      onAddUnopenedPack(winner.prizePack, 'Daily Raffle: 2nd Place Prize 🥈', 'raffle');
    } else if (winner.place === 3 && winner.prizePack) {
      // Award Mega Pack
      onAddUnopenedPack(winner.prizePack, 'Daily Raffle: 3rd Place Prize 🥉', 'raffle');
    }

    // Mark claimed in state
    setRaffleState((prev) => {
      const updatedLatest = prev.latestDrawResult
        ? {
            ...prev.latestDrawResult,
            winners: prev.latestDrawResult.winners.map((w) =>
              w.place === winner.place ? { ...w, claimed: true } : w
            ),
          }
        : null;

      const updatedHistory = prev.drawHistory.map((d) =>
        d.drawId === prev.latestDrawResult?.drawId
          ? {
              ...d,
              winners: d.winners.map((w) => (w.place === winner.place ? { ...w, claimed: true } : w)),
            }
          : d
      );

      const updated: RaffleState = {
        ...prev,
        latestDrawResult: updatedLatest,
        drawHistory: updatedHistory,
        pendingUserPrize: null,
      };
      saveRaffleState(updated);
      return updated;
    });

    setClaimCelebrationWinner(null);
  };

  const latestDraw = raffleState.latestDrawResult;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-stone-950 to-slate-950 text-white p-3 sm:p-6 pb-28">
      {/* Top Banner & Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-stone-900 to-yellow-950 border border-amber-500/40 p-6 sm:p-8 shadow-2xl shadow-amber-950/40">
          {/* Glowing background rays */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wider uppercase">
                <span>🎟️ OFFICIAL FUT DAILY RAFFLE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>1 COIN PER TICKET</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
                DAILY RAFFLE HUB
              </h1>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Spend coins to buy raffle tickets. Daily winners are announced next day right below the ticket counter!
                First place wins the exclusive <span className="text-amber-300 font-bold">99 OVR {currentMonthConfig.card.name}</span>, while second & third place claim <span className="text-yellow-300 font-bold">Jumbo Rare & Mega Packs</span>!
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowHistoryModal(true)}
                className="px-4 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-600/50 text-stone-200 font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                <span>📜 Draw History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Single Active Month Reveal Banner (Strict Single Tab for Current Month) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-950/60 via-stone-900/80 to-amber-950/60 border border-amber-500/30 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span className="text-xs font-black uppercase text-amber-300 tracking-wider">Active Month:</span>
            <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-white font-black text-xs border border-amber-400/40">
              {currentMonthConfig.monthName} · {currentMonthConfig.card.name} (99 OVR)
            </span>
          </div>
          <div className="flex items-center gap-2 text-stone-400 text-xs font-semibold">
            <span>🔒 Upcoming Raffle:</span>
            <span className="text-stone-300 font-bold italic">Classified until {currentMonthConfig.monthName} finishes</span>
          </div>
        </div>

        {/* Main Grid: Left Feature Card Showpiece | Right Ticket Counter & Buying Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Featured Card Showcase & Rewards Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl bg-gradient-to-b from-stone-900/90 to-stone-950/90 border border-amber-500/30 p-6 flex flex-col items-center shadow-xl">
              <div className="w-full flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
                  <span>👑 1ST PLACE DAILY REWARD</span>
                </div>
                {isCardInClub && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
                    ✓ IN YOUR CLUB
                  </span>
                )}
              </div>

              {/* 3D Interactive Card Item */}
              <div className="py-2">
                <CardItem card={featuredCard} size="lg" interactive={true} />
              </div>

              {/* Player Bio & Lore */}
              <div className="w-full mt-4 space-y-2 text-center bg-stone-950/60 rounded-2xl p-4 border border-stone-800">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">{featuredCard.nationFlag}</span>
                  <h3 className="text-lg font-black text-amber-200">{featuredCard.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold">
                    {featuredCard.rating} OVR · {featuredCard.position}
                  </span>
                </div>
                <p className="text-xs text-stone-400">{currentMonthConfig.description}</p>
                <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono text-stone-300">
                  <span>PAC {featuredCard.stats.pac}</span>
                  <span>SHO {featuredCard.stats.sho}</span>
                  <span>PAS {featuredCard.stats.pas}</span>
                  <span>DRI {featuredCard.stats.dri}</span>
                  <span>DEF {featuredCard.stats.def}</span>
                  <span>PHY {featuredCard.stats.phy}</span>
                </div>
              </div>

              {/* 2nd & 3rd Place Rewards Preview */}
              <div className="w-full mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-stone-950/70 border border-slate-700/60 p-3 text-center space-y-1">
                  <span className="text-xl">🥈</span>
                  <h4 className="text-xs font-bold text-amber-300">2nd Place</h4>
                  <p className="text-[11px] text-stone-300 font-semibold">Jumbo Rare Players Pack</p>
                  <span className="text-[10px] text-stone-500">8 Players · 84+ Walkout</span>
                </div>
                <div className="rounded-2xl bg-stone-950/70 border border-slate-700/60 p-3 text-center space-y-1">
                  <span className="text-xl">🥉</span>
                  <h4 className="text-xs font-bold text-amber-300">3rd Place</h4>
                  <p className="text-[11px] text-stone-300 font-semibold">Mega Pack</p>
                  <span className="text-[10px] text-stone-500">6 Players · 80+ Guaranteed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ticket Counter & Purchasing Console (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 24h Countdown & Live Ticket Counter */}
            <div className="rounded-3xl bg-gradient-to-b from-stone-900/90 to-stone-950/90 border border-amber-500/30 p-6 sm:p-8 shadow-xl space-y-6">
              {/* UTC Countdown Clock */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Next Daily Draw At Midnight UTC
                  </span>
                  <h3 className="text-lg font-black text-stone-200">Draw Countdown</h3>
                </div>

                {/* Digital Clock Digits */}
                <div className="flex items-center gap-2 font-mono">
                  <div className="flex flex-col items-center bg-stone-950 border border-amber-500/30 rounded-xl px-3 py-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">{timeLeft.hours}</span>
                    <span className="text-[9px] uppercase tracking-wider text-stone-500">Hours</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-500/50">:</span>
                  <div className="flex flex-col items-center bg-stone-950 border border-amber-500/30 rounded-xl px-3 py-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">{timeLeft.minutes}</span>
                    <span className="text-[9px] uppercase tracking-wider text-stone-500">Mins</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-500/50">:</span>
                  <div className="flex flex-col items-center bg-stone-950 border border-amber-500/30 rounded-xl px-3 py-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">{timeLeft.seconds}</span>
                    <span className="text-[9px] uppercase tracking-wider text-stone-500">Secs</span>
                  </div>
                </div>
              </div>

              {/* Your Live Ticket Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-stone-950/80 border border-amber-500/40 p-4 space-y-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 text-4xl opacity-10">🎟️</div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Your Tickets</span>
                  <div className="text-3xl font-black text-white flex items-baseline gap-1.5">
                    <span>{raffleState.userTicketsToday.toLocaleString()}</span>
                    <span className="text-sm font-normal text-stone-400">tickets</span>
                  </div>
                  <p className="text-[11px] text-stone-400">Bought for today&apos;s draw</p>
                </div>

                <div className="rounded-2xl bg-stone-950/80 border border-stone-800 p-4 space-y-1">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Winning Odds</span>
                  <div className="text-3xl font-black text-amber-300">
                    {userWinningChance}%
                  </div>
                  <p className="text-[11px] text-stone-500">Calculated live vs pool</p>
                </div>

                <div className="rounded-2xl bg-stone-950/80 border border-stone-800 p-4 space-y-1">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Pool</span>
                  <div className="text-3xl font-black text-stone-200">
                    {totalDrawTickets.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-stone-500">All entered tickets</p>
                </div>
              </div>

              {/* Ticket Purchase Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-wider text-stone-300 flex items-center gap-2">
                    <span>Buy Raffle Tickets</span>
                    <span className="text-xs font-normal text-amber-400">(1 Coin = 1 Ticket)</span>
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <span>Balance:</span>
                    <span className="font-mono text-white">{coins.toLocaleString()} 🪙</span>
                  </div>
                </div>

                {/* Quick Add Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { count: 1, label: '+1' },
                    { count: 10, label: '+10' },
                    { count: 100, label: '+100' },
                    { count: 1000, label: '+1,000' },
                    { count: 10000, label: '+10,000' },
                  ].map((btn) => (
                    <button
                      key={btn.count}
                      onClick={() => handlePurchaseTickets(btn.count)}
                      disabled={coins < btn.count}
                      className="px-2 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:pointer-events-none border border-stone-700 text-stone-200 hover:text-white font-black text-xs transition-all active:scale-95"
                    >
                      {btn.label} 🎟️
                    </button>
                  ))}
                  {/* Max Button */}
                  <button
                    onClick={() => handlePurchaseTickets(coins)}
                    disabled={coins <= 0}
                    className="px-2 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-black text-xs transition-all active:scale-95"
                  >
                    MAX 🚀
                  </button>
                </div>

                {/* Custom Ticket Input & Buy Button */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={1}
                      max={coins || 1}
                      value={ticketInputAmount || ''}
                      onChange={(e) => setTicketInputAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      placeholder="Enter ticket amount"
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute right-3 top-3.5 text-xs text-stone-500 font-bold">
                      = {ticketInputAmount.toLocaleString()} coins
                    </span>
                  </div>
                  <button
                    onClick={() => handlePurchaseTickets(ticketInputAmount)}
                    disabled={ticketInputAmount <= 0 || coins < ticketInputAmount}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
                  >
                    Buy Tickets 🎟️
                  </button>
                </div>

                {purchaseSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fadeIn flex items-center gap-2">
                    <span>✓</span>
                    <span>{purchaseSuccessMessage}</span>
                  </div>
                )}

                {purchaseErrorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-fadeIn flex items-center gap-2">
                    <span>{purchaseErrorMessage}</span>
                  </div>
                )}
              </div>

              {/* Testing / Instant Draw Controls */}
              <div className="pt-4 border-t border-stone-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Simulate / Test Next Draw (Instant Demo)
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTriggerDraw(false)}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs border border-stone-700 transition-all flex items-center gap-2"
                  >
                    <span>⚡ Draw Now (Random Weighted)</span>
                  </button>
                  <button
                    onClick={() => handleTriggerDraw(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-all flex items-center gap-2"
                  >
                    <span>🎯 Draw Now (Force Win 1st Place)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DAILY WINNERS ANNOUNCEMENT SECTION (BELOW THE TICKET COUNTER)              */}
        {/* As requested: "daily winners will be announced next day, it will showed   */}
        {/* below the ticket counter. so daily first players gets the raflle player,  */}
        {/* but the person who got more or less ticket may be winner"                 */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-gradient-to-b from-stone-900/95 to-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                <span>🏆 OFFICIAL DAILY RESULTS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Yesterday&apos;s Daily Raffle Winners
              </h2>
              <p className="text-xs text-stone-400">
                Announced daily after midnight UTC. Winners are chosen via weighted draw based on tickets bought!
              </p>
            </div>
            {latestDraw && (
              <div className="text-left sm:text-right text-xs text-stone-400 font-mono">
                <div>Draw Date: <span className="text-amber-300 font-bold">{latestDraw.drawDateStr}</span></div>
                <div>Total Tickets in Draw: <span className="text-white font-bold">{latestDraw.totalTicketsInDraw.toLocaleString()}</span></div>
              </div>
            )}
          </div>

          {latestDraw ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestDraw.winners.map((winner) => {
                const isFirst = winner.place === 1;
                const isSecond = winner.place === 2;
                const isThird = winner.place === 3;

                return (
                  <div
                    key={winner.place}
                    className={`rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-between transition-all ${
                      winner.isUser
                        ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/10'
                        : isFirst
                        ? 'bg-stone-950/80 border-amber-500/40'
                        : 'bg-stone-950/60 border-stone-800'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Place Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {isFirst ? '🥇' : isSecond ? '🥈' : '🥉'}
                          </span>
                          <span
                            className={`text-xs font-black uppercase tracking-wider ${
                              isFirst ? 'text-amber-400' : isSecond ? 'text-slate-300' : 'text-amber-600'
                            }`}
                          >
                            {isFirst ? '1st Place Winner' : isSecond ? '2nd Place Winner' : '3rd Place Winner'}
                          </span>
                        </div>
                        {winner.isUser && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                            ⭐ YOU WON!
                          </span>
                        )}
                      </div>

                      {/* Winner Name & Tickets Info */}
                      <div>
                        <h4 className="text-lg font-black text-white flex items-center gap-2">
                          <span>{winner.winnerName}</span>
                        </h4>
                        <div className="text-xs text-stone-400 flex items-center gap-3 mt-1 font-mono">
                          <span>🎟️ {winner.ticketCount.toLocaleString()} tickets</span>
                          <span>·</span>
                          <span className="text-amber-400/90">{winner.winningOddsPct}% odds</span>
                        </div>
                      </div>

                      {/* Prize Card / Pack Graphic & Info */}
                      <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-stone-500 block">
                          Prize Awarded
                        </span>
                        <div className="text-sm font-black text-amber-200">
                          {winner.prizeTitle}
                        </div>
                        <p className="text-[11px] text-stone-400">{winner.prizeSubtitle}</p>
                      </div>
                    </div>

                    {/* Claim Button for User */}
                    {winner.isUser && (
                      <div className="mt-4 pt-3 border-t border-stone-800">
                        {winner.claimed ? (
                          <div className="text-center text-xs text-emerald-400 font-bold py-1">
                            ✓ Prize Claimed & Transferred
                          </div>
                        ) : (
                          <button
                            onClick={() => handleClaimPrize(winner)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            🎁 Claim Your Prize Now
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-400">
              No draw results yet. The first daily draw will occur at midnight UTC!
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CELEBRATION WINNER POPUP MODAL                                             */}
      {/* ========================================================================= */}
      {claimCelebrationWinner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-400 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl shadow-amber-500/20 relative animate-fadeIn">
            <div className="text-5xl animate-bounce">🎉</div>
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                DAILY RAFFLE WINNER!
              </span>
              <h3 className="text-2xl font-black text-white">Congratulations!</h3>
              <p className="text-xs text-stone-300">
                Your ticket was drawn in the Daily Raffle! You won{' '}
                <span className="text-amber-300 font-bold">{claimCelebrationWinner.prizeTitle}</span>!
              </p>
            </div>

            {/* If 1st place, preview the card */}
            {claimCelebrationWinner.place === 1 && claimCelebrationWinner.prizeCard && (
              <div className="flex justify-center py-2">
                <CardItem card={claimCelebrationWinner.prizeCard} size="md" interactive={false} />
              </div>
            )}

            <button
              onClick={() => handleClaimPrize(claimCelebrationWinner)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
            >
              🎁 Claim Prize To Club / Packs Vault
            </button>
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* DRAW HISTORY MODAL                                                        */}
      {/* ========================================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-lg font-black text-white">📜 Daily Raffle History</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {raffleState.drawHistory.map((draw) => (
                <div key={draw.drawId} className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span className="font-bold text-amber-400">{draw.drawDateStr}</span>
                    <span>{draw.totalTicketsInDraw.toLocaleString()} tickets drawn</span>
                  </div>
                  <div className="text-sm font-black text-stone-200">
                    Grand Prize: {draw.featuredCard.name} ({draw.featuredCard.rating} OVR)
                  </div>
                  <div className="text-xs text-stone-400 font-mono">
                    1st: {draw.winners[0]?.winnerName} ({draw.winners[0]?.ticketCount.toLocaleString()} tix) · 2nd: {draw.winners[1]?.winnerName} · 3rd: {draw.winners[2]?.winnerName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
