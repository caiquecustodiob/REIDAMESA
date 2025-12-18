
import React, { useState, useEffect } from 'react';
import { AppState, Level, Player } from '../types';
import { EMOJIS, LEVELS } from '../constants';
import { UserPlus, Trash2, User, Crown, Edit2, X } from 'lucide-react';

interface Props {
  state: AppState;
  addPlayer: (name: string, level: Level, emoji: string) => void;
  updatePlayer: (id: string, name: string, level: Level, emoji: string) => void;
  removePlayer: (id: string) => void;
}

const QueueView: React.FC<Props> = ({ state, addPlayer, updatePlayer, removePlayer }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState(EMOJIS[0]);
  const [newLevel, setNewLevel] = useState<Level>('Iniciante');

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setNewName(p.name);
    setNewEmoji(p.emoji);
    setNewLevel(p.level);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    if (editingId) {
      updatePlayer(editingId, newName, newLevel, newEmoji);
    } else {
      addPlayer(newName, newLevel, newEmoji);
    }

    cancelEdit();
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="font-arcade text-2xl text-white">Fila da Morte</h2>
        <button 
          onClick={() => {
            if (showForm) cancelEdit();
            else setShowForm(true);
          }}
          className={`${showForm ? 'bg-red-500' : 'bg-[#4ade80]'} text-black p-3 rounded-full shadow-lg active:scale-90 transition-colors`}
        >
          {showForm ? <X size={24} /> : <UserPlus size={24} />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-[#4ade8033] p-6 rounded-3xl space-y-4 animate-in slide-in-from-top duration-300 shadow-2xl">
          <div className="flex justify-between items-center">
             <h3 className="font-arcade text-[#4ade80]">{editingId ? 'EDITAR GUERREIRO' : 'NOVO GUERREIRO'}</h3>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-widest">Apelido</label>
            <input 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ex: Matador66"
              className="w-full bg-zinc-800 text-white p-4 rounded-xl border border-zinc-700 focus:outline-none focus:border-[#4ade80]"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-widest">Nível de Skill</label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setNewLevel(lvl as Level)}
                  className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold transition-all border ${newLevel === lvl ? 'bg-[#4ade80] text-black border-white' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-widest">Avatar</label>
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-black/20 rounded-xl custom-scrollbar">
              {EMOJIS.map(emo => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => setNewEmoji(emo)}
                  className={`text-2xl p-2 rounded-xl transition-all border-2 ${newEmoji === emo ? 'bg-zinc-700 border-[#4ade80]' : 'bg-zinc-800 border-transparent'}`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {editingId && (
              <button 
                type="button" 
                onClick={cancelEdit}
                className="flex-1 bg-zinc-800 text-white p-4 rounded-xl font-arcade text-xs active:scale-95"
              >
                CANCELAR
              </button>
            )}
            <button type="submit" className="flex-[2] bg-[#4ade80] text-black p-4 rounded-xl font-arcade text-lg active:scale-95 shadow-lg">
              {editingId ? 'SALVAR ALTERAÇÕES' : 'ENTRAR NA FILA'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {state.queue.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <User size={48} className="mx-auto mb-2 opacity-20" />
            <p className="font-arcade">Fila vazia. Onde estão os jogadores?</p>
          </div>
        ) : (
          state.queue.map((pid, idx) => {
            const p = state.players[pid];
            if (!p) return null;
            const isKing = p.stats.consecutiveWins > 0;
            const isNext = idx === 0 || idx === 1;

            return (
              <div 
                key={pid} 
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    isNext ? 'bg-[#4ade8011] border-[#4ade8044] scale-[1.02]' : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center font-arcade text-xl ${isNext ? 'text-[#4ade80]' : 'text-zinc-600'}`}>
                  {idx + 1}
                </div>
                
                <div className="relative">
                    <div className="text-4xl">{p.emoji}</div>
                    {isKing && (
                        <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-0.5 shadow-lg">
                            <Crown size={12} className="text-black" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-arcade text-white truncate">{p.name}</h3>
                    {isNext && (
                      <span className="text-[10px] bg-[#4ade80] text-black font-bold px-1.5 py-0.5 rounded animate-pulse">
                        PRÓXIMO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    <span>{p.level}</span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                    <span>{p.stats.wins}W - {p.stats.losses}L</span>
                  </div>
                </div>

                <div className="flex gap-1">
                    <button 
                      onClick={() => startEdit(p)}
                      className="p-2 text-zinc-500 hover:text-[#4ade80] transition-colors"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={() => removePlayer(pid)}
                      className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 text-[10px] text-zinc-500 leading-relaxed italic">
        DICA DO REI: Errou o nome ou quer mudar o visual? Clica no lápis. O Rei da Mesa aceita vaidade, mas não aceita desculpa.
      </div>
    </div>
  );
};

export default QueueView;
