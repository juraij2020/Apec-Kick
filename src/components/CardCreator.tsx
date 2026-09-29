import React, { useState } from 'react';
import { SoccerCard, Position, CardStyle, CardRarity } from '../types/card';
import { CardItem } from './CardItem';
import { generateUserCardSvg } from '../data/defaultCards';
import { sound } from '../utils/audio';
import { Sparkles, Upload, Wand2, Plus, Check, RefreshCw, Trash2, Edit3 } from 'lucide-react';

interface CardCreatorProps {
  userCreatedCards: SoccerCard[];
  onSaveCard: (card: SoccerCard) => void;
  onDeleteCard: (cardId: string) => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=striker1&backgroundColor=022c22',
  'https://api.dicebear.com/7.x/bottts/svg?seed=midfield2&backgroundColor=1e1b4b',
  'https://api.dicebear.com/7.x/bottts/svg?seed=defender3&backgroundColor=450a0a',
  'https://api.dicebear.com/7.x/bottts/svg?seed=keeper4&backgroundColor=172554',
  'https://api.dicebear.com/7.x/bottts/svg?seed=star5&backgroundColor=3b0764',
];

const POPULAR_NATIONS = [
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'United States', flag: '🇺🇸' },
];

export const CardCreator: React.FC<CardCreatorProps> = ({
  userCreatedCards,
  onSaveCard,
  onDeleteCard,
}) => {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('Apex Prodigy');
  const [shortName, setShortName] = useState('Prodigy');
  const [position, setPosition] = useState<Position>('ST');
  const [rating, setRating] = useState(91);
  const [nation, setNation] = useState('France');
  const [nationFlag, setNationFlag] = useState('🇫🇷');
  const [club, setClub] = useState('Apex FC');
  const [league, setLeague] = useState('Creator Elite League');
  const [cardStyle, setCardStyle] = useState<CardStyle>('custom_neon');
  const [photoUrl, setPhotoUrl] = useState(PRESET_AVATARS[0]);
  const [customTag, setCustomTag] = useState('My Creation');

  // Stats
  const [pac, setPac] = useState(94);
  const [sho, setSho] = useState(92);
  const [pas, setPas] = useState(85);
  const [dri, setDri] = useState(91);
  const [def, setDef] = useState(48);
  const [phy, setPhy] = useState(84);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Auto calculate suggested rating from stats
  const calculateAutoRating = () => {
    let calculated = 0;
    if (position === 'ST' || position === 'CF') {
      calculated = Math.round(pac * 0.25 + sho * 0.4 + dri * 0.2 + phy * 0.15);
    } else if (['LW', 'RW', 'LM', 'RM'].includes(position)) {
      calculated = Math.round(pac * 0.35 + dri * 0.3 + sho * 0.2 + pas * 0.15);
    } else if (['CAM', 'CM'].includes(position)) {
      calculated = Math.round(pas * 0.35 + dri * 0.3 + sho * 0.15 + pac * 0.1 + def * 0.1);
    } else if (position === 'CDM') {
      calculated = Math.round(def * 0.35 + phy * 0.3 + pas * 0.2 + pac * 0.15);
    } else if (['CB', 'LB', 'RB'].includes(position)) {
      calculated = Math.round(def * 0.45 + phy * 0.3 + pac * 0.15 + pas * 0.1);
    } else {
      calculated = Math.round((pac + sho + pas + dri + def + phy) / 6);
    }
    setRating(Math.max(50, Math.min(99, calculated)));
  };

  // Presets
  const applyPreset = (type: 'striker' | 'playmaker' | 'defender' | 'speedster' | 'godmode') => {
    sound.playClick();
    if (type === 'striker') {
      setPosition('ST');
      setPac(92); setSho(94); setPas(82); setDri(89); setDef(42); setPhy(86);
      setRating(92);
      setCardStyle('custom_neon');
    } else if (type === 'playmaker') {
      setPosition('CAM');
      setPac(86); setSho(88); setPas(96); setDri(94); setDef(65); setPhy(76);
      setRating(93);
      setCardStyle('emerald_legend');
    } else if (type === 'defender') {
      setPosition('CB');
      setPac(86); setSho(45); setPas(80); setDri(78); setDef(95); setPhy(94);
      setRating(91);
      setCardStyle('totw_black');
    } else if (type === 'speedster') {
      setPosition('LW');
      setPac(99); setSho(87); setPas(84); setDri(95); setDef(38); setPhy(74);
      setRating(92);
      setCardStyle('tots_electric_blue');
    } else if (type === 'godmode') {
      setRating(99);
      setPac(99); setSho(99); setPas(99); setDri(99); setDef(95); setPhy(98);
      setCardStyle('icon_white_gold');
    }
  };

  // Handle local image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          sound.playClick();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const cardId = editingCardId || `user-custom-${Date.now()}`;
    const newCard: SoccerCard = {
      id: cardId,
      name: name.trim() || 'Custom Hero',
      shortName: shortName.trim() || name.trim() || 'Custom',
      rating,
      position,
      nation,
      nationFlag,
      club,
      league,
      rarity: 'custom',
      cardStyle,
      photoUrl,
      fullCardImage: generateUserCardSvg(name, rating, position, { pac, sho, pas, dri, def, phy }, nationFlag, club, photoUrl || '⚽', cardStyle),
      isCustom: true,
      creatorTag: customTag || 'My Creation',
      stats: { pac, sho, pas, dri, def, phy },
      weakFoot: 5,
      skillMoves: 5,
      workRate: 'H/M',
      price: Math.round(rating * 120),
    };

    onSaveCard(newCard);
    sound.playGoalCheer();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    setEditingCardId(null);
  };

  const startEditCard = (card: SoccerCard) => {
    setEditingCardId(card.id);
    setName(card.name);
    setShortName(card.shortName || card.name);
    setPosition(card.position);
    setRating(card.rating);
    setNation(card.nation);
    setNationFlag(card.nationFlag);
    setClub(card.club);
    setLeague(card.league);
    setCardStyle(card.cardStyle);
    setPhotoUrl(card.photoUrl || '');
    setCustomTag(card.creatorTag || 'My Creation');
    setPac(card.stats.pac);
    setSho(card.stats.sho);
    setPas(card.stats.pas);
    setDri(card.stats.dri);
    setDef(card.stats.def);
    setPhy(card.stats.phy);
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingCardId(null);
    setName('New Soccer Star');
    setShortName('Star');
    setRating(88);
    setPosition('ST');
    setPac(90); setSho(88); setPas(82); setDri(89); setDef(45); setPhy(80);
    sound.playClick();
  };

  // Preview Card Object
  const previewCard: SoccerCard = {
    id: editingCardId || 'preview-temp',
    name: name.trim() || 'Custom Hero',
    shortName: shortName.trim() || name.trim() || 'Hero',
    rating,
    position,
    nation,
    nationFlag,
    club,
    league,
    rarity: 'custom',
    cardStyle,
    photoUrl,
    isCustom: true,
    creatorTag: customTag,
    stats: { pac, sho, pas, dri, def, phy },
    price: Math.round(rating * 120),
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Card Studio & Pack Pool Injector</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Create Your Custom Soccer Cards
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Every card you design is dynamically injected into your <strong className="text-emerald-400">Pack Opening Pool</strong>, added to your <strong className="text-emerald-400">Club</strong>, and can be used in <strong className="text-emerald-400">Squad Building Challenges (SBCs)</strong> and matches!
          </p>
        </div>

        {editingCardId ? (
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <Plus className="w-4 h-4" /> Cancel Edit & New Card
          </button>
        ) : (
          <div className="text-right">
            <span className="text-xs text-slate-400">Custom Cards Created:</span>
            <span className="block text-2xl font-black text-emerald-400 tabular-nums">
              {userCreatedCards.length}
            </span>
          </div>
        )}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Card Customization Controls (8 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          {/* Quick Archetype Presets */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Stat Presets
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('striker')}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              >
                ⚽ Clinical ST
              </button>
              <button
                type="button"
                onClick={() => applyPreset('playmaker')}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              >
                🎯 Maestro CAM
              </button>
              <button
                type="button"
                onClick={() => applyPreset('defender')}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              >
                🛡️ Rock CB
              </button>
              <button
                type="button"
                onClick={() => applyPreset('speedster')}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              >
                ⚡ 99 Pace Winger
              </button>
              <button
                type="button"
                onClick={() => applyPreset('godmode')}
                className="px-3 py-1.5 text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/40 transition-colors"
              >
                👑 99 God Tier
              </button>
            </div>
          </div>

          {/* Player Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Player Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cristiano Jr, Neymar Legend"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Jersey / Card Display Name
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. Apex, Junior"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Position & Overall Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as Position)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <optgroup label="Attacking">
                  <option value="ST">ST - Striker</option>
                  <option value="CF">CF - Center Forward</option>
                  <option value="LW">LW - Left Wing</option>
                  <option value="RW">RW - Right Wing</option>
                </optgroup>
                <optgroup label="Midfield">
                  <option value="CAM">CAM - Attacking Midfield</option>
                  <option value="CM">CM - Central Midfield</option>
                  <option value="CDM">CDM - Defensive Midfield</option>
                  <option value="LM">LM - Left Midfield</option>
                  <option value="RM">RM - Right Midfield</option>
                </optgroup>
                <optgroup label="Defense">
                  <option value="CB">CB - Center Back</option>
                  <option value="LB">LB - Left Back</option>
                  <option value="RB">RB - Right Back</option>
                  <option value="GK">GK - Goalkeeper</option>
                </optgroup>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Overall Rating (OVR): <span className="text-emerald-400 font-bold">{rating}</span>
                </label>
                <button
                  type="button"
                  onClick={calculateAutoRating}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  title="Auto-calculate rating based on stats"
                >
                  <Wand2 className="w-3 h-3" /> Auto
                </button>
              </div>
              <input
                type="range"
                min="60"
                max="99"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Nation & Club */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Nationality & Flag
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nationFlag}
                  onChange={(e) => setNationFlag(e.target.value)}
                  className="w-12 px-2 py-2 text-center bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  title="Emoji Flag"
                />
                <input
                  type="text"
                  value={nation}
                  onChange={(e) => setNation(e.target.value)}
                  placeholder="Nation name"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>
              {/* Quick nations row */}
              <div className="flex flex-wrap gap-1 mt-2">
                {POPULAR_NATIONS.slice(0, 6).map((n) => (
                  <button
                    key={n.name}
                    type="button"
                    onClick={() => { setNation(n.name); setNationFlag(n.flag); }}
                    className="text-xs px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 flex items-center gap-1"
                  >
                    <span>{n.flag}</span>
                    <span>{n.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Club & League
              </label>
              <input
                type="text"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                placeholder="Club name (e.g. Apex FC, Real Madrid)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white mb-2"
              />
              <input
                type="text"
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                placeholder="League name"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-400"
              />
            </div>
          </div>

          {/* Card Rarity Visual Style */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block">
              Card Visual Skin / Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'hof_gold_obsidian', label: '👑 Hall of Fame', border: 'border-yellow-400' },
                { id: 'futmas_crimson', label: '❄️ Futmas Crimson', border: 'border-rose-400' },
                { id: 'custom_neon', label: 'Custom Neon', border: 'border-emerald-400' },
                { id: 'classic_gold', label: 'Classic Gold', border: 'border-amber-300' },
                { id: 'totw_black', label: 'TOTW Obsidian', border: 'border-amber-500' },
                { id: 'tots_electric_blue', label: 'TOTS Electric', border: 'border-cyan-400' },
                { id: 'future_stars_magenta', label: 'Future Magenta', border: 'border-fuchsia-400' },
                { id: 'icon_white_gold', label: 'Icon Diamond', border: 'border-yellow-200' },
                { id: 'emerald_legend', label: 'Emerald Legend', border: 'border-emerald-500' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setCardStyle(style.id as CardStyle)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                    cardStyle === style.id
                      ? `${style.border} bg-slate-800 text-white shadow-md`
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo / Avatar Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block">
              Player Avatar / Custom Photo
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {/* Presets */}
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPhotoUrl(url)}
                  className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                    photoUrl === url ? 'border-emerald-400 scale-110 shadow-lg' : 'border-slate-700 opacity-60'
                  }`}
                >
                  <img src={url} alt="Preset avatar" className="w-full h-full rounded-full object-cover" />
                </button>
              ))}

              {/* Upload file button */}
              <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Stats Sliders */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Attributes & Detailed Stats
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">{position === 'GK' ? 'Diving (DIV)' : 'Pace (PAC)'}</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{pac}</span>
                </div>
                <input
                  type="range" min="40" max="99" value={pac}
                  onChange={(e) => setPac(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">{position === 'GK' ? 'Handling (HAN)' : 'Shooting (SHO)'}</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{sho}</span>
                </div>
                <input
                  type="range" min="40" max="99" value={sho}
                  onChange={(e) => setSho(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">{position === 'GK' ? 'Kicking (KIC)' : 'Passing (PAS)'}</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{pas}</span>
                </div>
                <input
                  type="range" min="40" max="99" value={pas}
                  onChange={(e) => setPas(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">{position === 'GK' ? 'Reflexes (REF)' : 'Dribbling (DRI)'}</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{dri}</span>
                </div>
                <input
                  type="range" min="40" max="99" value={dri}
                  onChange={(e) => setDri(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">{position === 'GK' ? 'Speed (SPE)' : 'Defending (DEF)'}</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{def}</span>
                </div>
                <input
                  type="range" min="40" max="99" value={def}
                  onChange={(e) => setDef(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">{position === 'GK' ? 'Positioning (POS)' : 'Physical (PHY)'}</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{phy}</span>
                </div>
                <input
                  type="range" min="40" max="99" value={phy}
                  onChange={(e) => setPhy(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Reset to Defaults
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Card Injected to Packs & Club!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{editingCardId ? 'Update & Save Card' : 'Save & Inject to Packs'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Holographic Card Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Live Card Preview (Hover to tilt)
            </span>
          </div>

          <div className="p-4 bg-gradient-to-b from-slate-900/60 to-slate-950/80 rounded-3xl border border-slate-800 shadow-2xl flex items-center justify-center">
            <CardItem card={previewCard} size="lg" interactive={true} />
          </div>

          <div className="text-center text-xs text-slate-400 max-w-xs space-y-1">
            <p>
              ⚡ <strong>Instant Pack Injection:</strong> As soon as you save, this card can be revealed in booster packs!
            </p>
            <p className="text-emerald-400">
              Value: {previewCard.price.toLocaleString()} coins
            </p>
          </div>
        </div>
      </div>

      {/* User's Created Cards Gallery List */}
      <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Your Custom Card Creations ({userCreatedCards.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Cards in this active pool can be opened in packs, drafted into your squad, or traded in SBCs.
            </p>
          </div>
        </div>

        {userCreatedCards.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            You haven't created any cards yet. Use the studio above to create your first card!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userCreatedCards.map((card, idx) => (
              <div
                key={`${card.id}_${idx}`}
                className="group relative flex flex-col items-center bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-3 transition-colors"
              >
                <CardItem card={card} size="sm" interactive={false} />
                <div className="mt-3 flex items-center gap-2 w-full justify-center">
                  <button
                    onClick={() => startEditCard(card)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                    title="Edit card"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${card.name}?`)) {
                        onDeleteCard(card.id);
                        sound.playClick();
                      }
                    }}
                    className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded text-xs transition-colors border border-rose-800/40"
                    title="Delete card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
