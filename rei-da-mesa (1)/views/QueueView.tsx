
import React, { useState } from 'react';
import { AppState, Level, Player } from '../types';
import { EMOJIS, LEVELS } from '../constants';
import { UserPlus, Trash2, User, Crown, Edit2, X, ChevronUp, ChevronDown, Shuffle, PlayCircle, LogOut } from 'lucide-react';

interface Props {
  state: AppState;
  addPlayer: (name: string, level: Level, emoji: string) => void;
  updatePlayer: (id: string, name: string, level: Level, emoji: string) => void;
  removePlayer: (id: string) => void;
  toggleActive: (id: string) => void;
  moveInQueue: (index: number, direction: 'up' | 'down') => void;
  shuffleQueue: () => void;
  removeFromQueue: (id: string) => void;
}

const QueueView: React.FC<Props> = ({ 
  state, addPlayer, updatePlayer, removePlayer, toggleActive, moveInQueue, shuffleQueue, removeFromQueue 
}) => {
  const { players, queue, activeMatch } = state;
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState(EMOJIS[0]);
  const [newLevel, setNewLevel] = useState<Level>('Iniciante');

  // Fixed: Cast Object.values(players) to Player[] to ensure proper typing for the filter result
  const inactivePlayers = (Object.values(players) as Player[]).filter(p => !p.active);

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setNewName(p.name);
    setNewEmoji(p.emoji);
    setNewLevel(p.level);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewName('');
    setNewEmoji(EMOJIS[0]);
    setNewLevel('Iniciante');
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (editingId) updatePlayer(editingId, newName, newLevel, newEmoji);
    else addPlayer(newName, newLevel, newEmoji);
    cancelEdit();
  };

  return (
    <div className="p-4 space-y-8 max-w-2xl mx-auto pb-10">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
            <h2 className="font-arcade text-2xl text-white">Arena de Combate</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{queue.length} JOGADORES NA ROTAÇÃO</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={shuffleQueue}
              className="bg-zinc-800 text-[#4ade80] p-3 rounded-xl border border-zinc-700 active:scale-90 transition-transform"
              title="Embaralhar Fila"
            >
              <Shuffle size={20} />
            </button>
            <button 
              onClick={() => setShowForm(!showForm)}
              className={`${showForm ? 'bg-red-500' : 'bg-[#4ade80]'} text-black p-3 rounded-xl shadow-lg active:scale-90 transition-colors`}
            >
              {showForm ? <X size={20} /> : <UserPlus size={20} />}
            </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-[#4ade8033] p-6 rounded-3xl space-y-4 animate-in slide-in-from-top duration-300 shadow-2xl">
          <h3 className="font-arcade text-[#4ade80]">{editingId ? 'EDITAR GUERREIRO' : 'NOVO GUERREIRO'}</h3>
          <div className="space-y-4">
            <input 
              value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="APELIDO" className="w-full bg-zinc-800 text-white p-4 rounded-xl border border-zinc-700 font-arcade text-xs"
            />
            <div className="flex flex-wrap gap-1">
              {LEVELS.map(lvl => (
                <button key={lvl} type="button" onClick={() => setNewLevel(lvl as Level)}
                  className={`flex-1 py-2 px-1 rounded-lg text-[9px] font-bold border transition-all ${newLevel === lvl ? 'bg-[#4ade80] text-black border-white' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 bg-black/20 rounded-xl">
              {EMOJIS.map(emo => (
                <button key={emo} type="button" onClick={() => setNewEmoji(emo)}
                  className={`text-xl p-2 rounded-lg border-2 ${newEmoji === emo ? 'bg-zinc-700 border-[#4ade80]' : 'bg-zinc-800 border-transparent'}`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-[#4ade80] text-black p-4 rounded-xl font-arcade text-sm active:scale-95">
              {editingId ? 'SALVAR' : 'ENTRAR'}
            </button>
          </div>
        </form>
      )}

      {/* FILA ATIVA */}
      <section className="space-y-4">
        <h3 className="font-arcade text-xs text-zinc-500 flex items-center gap-2">
            <PlayCircle size={14} className="text-[#4ade80]" /> NA ROTAÇÃO
        </h3>
        
        <div className="space-y-2">
          {queue.length === 0 ? (
            <div className="text-center py-10 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                <p className="font-arcade text-zinc-600 text-[10px]">Ninguém na fila. Ative jogadores abaixo.</p>
            </div>
          ) : (
            queue.map((pid, idx) => {
              const p = players[pid];
              if (!p) return null;
              
              const isPlaying = activeMatch?.sideA.includes(pid) || activeMatch?.sideB.includes(pid);
              const isNext = !isPlaying && (idx < (activeMatch ? (activeMatch.mode === 'SOLO' ? 2 : 4) : 2));

              return (
                <div key={pid} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  isPlaying ? 'bg-[#4ade8011] border-[#4ade8044] glow-green' : 
                  isNext ? 'bg-zinc-900 border-yellow-900/50' : 'bg-zinc-900/50 border-zinc-800'
                }`}>
                  <div className="flex flex-col items-center min-w-[30px]">
                      <button onClick={() => moveInQueue(idx, 'up')} disabled={idx === 0} className="text-zinc-600 disabled:opacity-0"><ChevronUp size={16} /></button>
                      <span className="font-arcade text-xs text-zinc-400">{idx + 1}</span>
                      <button onClick={() => moveInQueue(idx, 'down')} disabled={idx === queue.length - 1} className="text-zinc-600 disabled:opacity-0"><ChevronDown size={16} /></button>
                  </div>

                  <div className="text-3xl relative">
                    {p.emoji}
                    {p.stats.consecutiveWins > 0 && <Crown size={10} className="absolute -top-1 -right-1 text-yellow-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-arcade text-xs text-white truncate">{p.name}</h4>
                    <div className="flex items-center gap-2">
                        {isPlaying ? (
                             <span className="text-[8px] bg-red-600 text-white font-bold px-1.5 rounded-sm animate-pulse">JOGANDO</span>
                        ) : isNext ? (
                             <span className="text-[8px] bg-yellow-600 text-white font-bold px-1.5 rounded-sm">PRÓXIMO</span>
                        ) : null}
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">{p.level}</span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                      <button onClick={() => startEdit(p)} className="p-2 text-zinc-600 hover:text-white"><Edit2 size={16} /></button>
                      <button onClick={() => toggleActive(pid)} className="p-2 text-zinc-600 hover:text-orange-500" title="Retirar da Fila"><LogOut size={16} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* BANCO DE RESERVAS */}
      {inactivePlayers.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-arcade text-xs text-zinc-500">RESERVAS / FORA DA FILA</h3>
          <div className="grid grid-cols-1 gap-2">
            {inactivePlayers.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-zinc-900/30 border border-zinc-800 rounded-xl opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1">
                    <h4 className="font-arcade text-[10px] text-zinc-400">{p.name}</h4>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase">{p.level}</p>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => toggleActive(p.id)} className="bg-zinc-800 text-[#4ade80] px-3 py-1.5 rounded-lg text-[8px] font-arcade border border-zinc-700">ENTRAR</button>
                    <button onClick={() => removePlayer(p.id)} className="p-2 text-zinc-700 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 text-[10px] text-zinc-600 italic">
        MODO REI DA MESA: Quem ganha fica no topo. Quem perde vai pro fim. O próximo da fila desafia os vencedores. Justo e cruel.
      </div>
    </div>
  );
};

export default QueueView;
