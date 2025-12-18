
import React, { useRef } from 'react';
import { AppState } from '../types';
// Fixed: Added 'Crown' to the lucide-react imports
import { Database, Trash2, Github, Share2, Info, Download, Upload, Volume2, Crown } from 'lucide-react';
import { playArcadeSound } from '../audio';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const SettingsView: React.FC<Props> = ({ state, setState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetData = () => {
    if (window.confirm("Isso apagará todos os jogadores, fila e histórico. Tem certeza?")) {
      setState({
        players: {},
        queue: [],
        activeMatch: null,
        history: []
      });
    }
  };

  const shareApp = () => {
    if (navigator.share) {
        navigator.share({
            title: 'REI DA MESA',
            text: 'Bora pro Ping Pong? O Rei da Mesa controla a fila!',
            url: window.location.href,
        });
    }
  };

  const downloadBackup = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const date = new Date().toISOString().split('T')[0];
    const exportFileDefaultName = `rei-da-mesa-backup-${date}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.players && json.queue && Array.isArray(json.history)) {
          if (window.confirm("Atenção: Restaurar o backup irá SOBRESCREVER todos os dados atuais. Deseja prosseguir?")) {
            setState(json);
            alert("Backup restaurado com sucesso! Mesa atualizada.");
          }
        } else {
          alert("Arquivo inválido.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6 space-y-8 max-w-xl mx-auto">
      <div className="text-center space-y-2">
          <div className="bg-[#4ade80] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-3">
              <Database size={40} className="text-black" />
          </div>
          <h2 className="font-arcade text-2xl text-white pt-4">Central de Comando</h2>
          <p className="text-zinc-500 text-xs uppercase font-bold tracking-[0.2em]">Versão 1.1.0 Arcade Edition</p>
      </div>

      <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">Áudio & Efeitos</h3>
          <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => playArcadeSound('point')}
                className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl flex flex-col items-center gap-2 border border-zinc-800 transition-colors"
              >
                  <Volume2 className="text-[#4ade80]" size={24} />
                  <span className="text-[10px] font-bold uppercase">Testar Ponto</span>
              </button>
              <button 
                onClick={() => playArcadeSound('victory')}
                className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl flex flex-col items-center gap-2 border border-zinc-800 transition-colors"
              >
                  <Crown className="text-[#eab308]" size={24} />
                  <span className="text-[10px] font-bold uppercase">Testar Vitória</span>
              </button>
          </div>
      </div>

      <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">Gerenciamento de Dados</h3>
          <div className="grid gap-2">
              <button 
                onClick={shareApp}
                className="w-full bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl flex items-center justify-between border border-zinc-800 transition-colors"
              >
                  <div className="flex items-center gap-3">
                      <Share2 className="text-[#4ade80]" size={20} />
                      <span className="font-bold">Convidar Jogadores</span>
                  </div>
              </button>

              <div className="grid grid-cols-2 gap-2">
                  <button onClick={downloadBackup} className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl flex flex-col items-center gap-2 border border-zinc-800 transition-colors">
                      <Download className="text-[#4ade80]" size={24} />
                      <span className="text-xs font-bold uppercase">Exportar</span>
                  </button>
                  <button onClick={triggerUpload} className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl flex flex-col items-center gap-2 border border-zinc-800 transition-colors">
                      <Upload className="text-[#eab308]" size={24} />
                      <span className="text-xs font-bold uppercase">Importar</span>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
              </div>

              <button onClick={resetData} className="w-full bg-zinc-900 hover:bg-red-950 p-4 rounded-2xl flex items-center justify-between border border-zinc-800 hover:border-red-900 transition-colors group mt-2">
                  <div className="flex items-center gap-3">
                      <Trash2 className="text-red-500" size={20} />
                      <span className="font-bold group-hover:text-red-200">Resetar Arena</span>
                  </div>
              </button>
          </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
          <div className="flex gap-4">
              <Info className="text-[#4ade80]" size={20} />
              <p className="text-xs text-zinc-500 leading-relaxed italic">
                O áudio é gerado em tempo real pelo seu processador. É a pureza do som digital para o maior torneio da sua vida.
              </p>
          </div>
      </div>
    </div>
  );
};

export default SettingsView;
