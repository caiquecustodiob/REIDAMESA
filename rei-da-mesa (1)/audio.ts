
export const playArcadeSound = (type: 'point' | 'remove' | 'victory' | 'deuce') => {
  const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  
  const playTone = (freq: number, type: OscillatorType, duration: number, volume: number = 0.1, delay: number = 0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  };

  switch (type) {
    case 'point':
      // Blip agudo e rápido
      playTone(880, 'square', 0.1);
      break;
    case 'remove':
      // Tom grave de erro
      playTone(220, 'sawtooth', 0.15, 0.05);
      break;
    case 'deuce':
      // Alerta de tensão
      playTone(150, 'sine', 0.5, 0.2);
      setTimeout(() => playTone(150, 'sine', 0.5, 0.2), 200);
      break;
    case 'victory':
      // Fanfarra triunfante (Arpejo de Dó Maior)
      const tempo = 0.12;
      playTone(523.25, 'square', tempo, 0.1, 0);       // C5
      playTone(659.25, 'square', tempo, 0.1, tempo);   // E5
      playTone(783.99, 'square', tempo, 0.1, tempo * 2); // G5
      playTone(1046.50, 'square', 0.4, 0.1, tempo * 3); // C6
      break;
  }
};
