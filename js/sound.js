// ===== FIRE SOUND =====
let audioCtx = null;
let isPlaying = false;
let noiseNodes = [];
let crackleTimeout = null;

async function toggleSound() {
  const btn = document.getElementById('soundToggle');
  const label = document.getElementById('soundLabel');

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (isPlaying) {
    // Fade out
    if (noiseNodes[3]) { // gain node
      noiseNodes[3].gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
    }
    
    setTimeout(() => {
      if (crackleTimeout) clearTimeout(crackleTimeout);
      noiseNodes.forEach(n => {
        if (n.stop) try { n.stop(); } catch(e) {}
        if (n.disconnect) n.disconnect();
      });
      noiseNodes = [];
      isPlaying = false;
      btn.classList.remove('playing');
      btn.textContent = '🔇';
      label.classList.remove('visible');
    }, 1000);
    return;
  }

  try {
    // Brownian noise
    const bufSize = audioCtx.sampleRate * 3;
    const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + 0.05 * white) / 1.05;
      last = data[i];
      data[i] *= 3;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 500;

    const highpass = audioCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 80;

    const gain = audioCtx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 2); // Fade in

    noise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
    noiseNodes = [noise, lowpass, highpass, gain];

    // Crackle bursts
    function addCrackle() {
      if (!isPlaying) return;
      const duration = Math.random() * 0.15 + 0.03;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(Math.random() * 0.4 + 0.1, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      
      const bpf = audioCtx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = Math.random() * 3000 + 800;
      bpf.Q.value = 2;
      
      const src = audioCtx.createBufferSource();
      const buf2 = audioCtx.createBuffer(1, Math.ceil(audioCtx.sampleRate * duration), audioCtx.sampleRate);
      const d2 = buf2.getChannelData(0);
      for (let i = 0; i < d2.length; i++) d2[i] = Math.random() * 2 - 1;
      src.buffer = buf2;
      
      src.connect(bpf);
      bpf.connect(g);
      g.connect(audioCtx.destination);
      src.start();
      
      crackleTimeout = setTimeout(addCrackle, Math.random() * 300 + 100);
    }
    
    isPlaying = true;
    addCrackle();
    
    btn.classList.add('playing');
    btn.textContent = '🔊';
    label.classList.add('visible');
  } catch(e) {
    console.log('Sound error:', e);
    btn.textContent = '🔇';
  }
}
