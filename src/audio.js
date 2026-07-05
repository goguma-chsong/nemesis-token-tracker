let audioCtx = null;
let isMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const setMuted = (muted) => {
  isMuted = muted;
};

export const playClick = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.error(e);
  }
};

export const playDraw = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const duration = 0.8;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + duration);
    
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(6, ctx.currentTime);
    filter.frequency.setValueAtTime(120, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error(e);
  }
};

export const playReveal = (isDangerous = false) => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const duration = 0.6;
    
    // Low frequency rumble/impact
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(isDangerous ? 60 : 100, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(isDangerous ? 30 : 50, ctx.currentTime + duration);
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + duration);
    
    // Higher metallic ring
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(isDangerous ? 180 : 380, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(isDangerous ? 120 : 250, ctx.currentTime + duration);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();
    osc2.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error(e);
  }
};

export const playAlarm = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const playBeep = (delay, freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + delay + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    };
    
    playBeep(0, 880);
    playBeep(0.18, 880);
  } catch (e) {
    console.error(e);
  }
};

export const playPneumatic = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const duration = 0.8;
    
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + duration);
    filter.Q.setValueAtTime(1, ctx.currentTime);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noiseNode.start();
    noiseNode.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error(e);
  }
};
