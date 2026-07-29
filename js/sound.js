// ===== FIRE SOUND - Natural Fireplace Crackling =====
// Uses Web Audio API to synthesize a realistic, cozy fire sound.
// No samples needed - pure DSP with natural timing.
let audioCtx = null;
let isPlaying = false;
let nodes = [];
let crackleTimer = null;
let rumbleNode = null;

async function toggleSound() {
  const btn = document.getElementById('soundToggle');
  const label = document.getElementById('soundLabel');

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (isPlaying) {
    // Fade out
    if (rumbleNode) {
      try { rumbleNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5); } catch(e) {}
    }
    if (crackleTimer) {
      clearTimeout(crackleTimer);
      crackleTimer = null;
    }
    setTimeout(() => {
      nodes.forEach(n => { try { if (n.stop) n.stop(); if (n.disconnect) n.disconnect(); } catch(e) {} });
      nodes = [];
      rumbleNode = null;
      isPlaying = false;
      btn.classList.remove('playing');
      btn.textContent = '🔇';
      label.classList.remove('visible');
    }, 1500);
    return;
  }

  try {
    // =====================================================================
    // LAYER 1: DEEP RUMBLE (sub-bass warmth)
    // =====================================================================
    const sr = audioCtx.sampleRate;
    const bufLen = Math.ceil(sr * 5); // 5-second loop buffer
    const buf = audioCtx.createBuffer(1, bufLen, sr);
    const data = buf.getChannelData(0);
    
    // Brownian noise with extra shaping
    let last = 0;
    for (let i = 0; i < bufLen; i++) {
      const white = Math.random() * 2 - 1;
      let val = last + 0.035 * white;
      val = Math.max(-5, Math.min(5, val));
      data[i] = val;
      last = val;
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    // Sub-bass lowpass at ~200Hz
    const lp1 = audioCtx.createBiquadFilter();
    lp1.type = 'lowpass';
    lp1.frequency.value = 200;
    lp1.Q.value = 0.7;

    const hipass = audioCtx.createBiquadFilter();
    hipass.type = 'highpass';
    hipass.frequency.value = 50;
    hipass.Q.value = 0.5;

    const rumbleGain = audioCtx.createGain();
    rumbleGain.gain.value = 0;

    // Slow flame flicker LFO on the rumble
    const lfoLen = Math.ceil(sr * 4);
    const lfoBuf = audioCtx.createBuffer(1, lfoLen, sr);
    const lfoData = lfoBuf.getChannelData(0);
    for (let i = 0; i < lfoLen; i++) {
      const t = i / sr;
      // Composite LFO: dominant ~2Hz + subtle 0.5Hz + randomness
      lfoData[i] = 0.5 + 0.35 * Math.sin(2 * Math.PI * 2.1 * t)
                        + 0.15 * Math.sin(2 * Math.PI * 0.6 * t)
                        + 0.08 * Math.sin(2 * Math.PI * 4.3 * t + 1.2);
    }

    const lfoSrc = audioCtx.createBufferSource();
    lfoSrc.buffer = lfoBuf;
    lfoSrc.loop = true;

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.55; // modulation depth

    // lfo modulates the rumble gain
    lfoSrc.connect(lfoGain);
    lfoGain.connect(rumbleGain.gain);

    // Connect: noise → lowpass → hipass → gain → output
    src.connect(lp1);
    lp1.connect(hipass);
    hipass.connect(rumbleGain);
    rumbleGain.connect(audioCtx.destination);
    src.start();

    // Ramp in
    rumbleGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 3);

    rumbleNode = rumbleGain;
    nodes = [src, lp1, hipass, rumbleGain, lfoSrc, lfoGain];

    // =====================================================================
    // LAYER 2: MID FLAME (crackling & sizzling)
    // =====================================================================
    const midBufLen = Math.ceil(sr * 4);
    const midBuf = audioCtx.createBuffer(1, midBufLen, sr);
    const midData = midBuf.getChannelData(0);
    
    let last2 = 0;
    for (let i = 0; i < midBufLen; i++) {
      const w = Math.random() * 2 - 1;
      let v = last2 + 0.015 * w;
      v = Math.max(-3, Math.min(3, v));
      midData[i] = v * 3.5;
      last2 = v;
    }

    const midSrc = audioCtx.createBufferSource();
    midSrc.buffer = midBuf;
    midSrc.loop = true;

    // Bandpass: 500-3000Hz for the "flame body"
    const bp1 = audioCtx.createBiquadFilter();
    bp1.type = 'bandpass';
    bp1.frequency.value = 1200;
    bp1.Q.value = 0.6;

    const bp2 = audioCtx.createBiquadFilter();
    bp2.type = 'bandpass';
    bp2.frequency.value = 600;
    bp2.Q.value = 1.5;

    const midGain = audioCtx.createGain();
    midGain.gain.value = 0;
    midGain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 4);

    midSrc.connect(bp1);
    bp1.connect(bp2);
    bp2.connect(midGain);
    midGain.connect(audioCtx.destination);
    midSrc.start();

    nodes.push(midSrc, bp1, bp2, midGain);

    // =====================================================================
    // LAYER 3: NATURAL CRACKLES
    // =====================================================================
    function scheduleCrackle() {
      if (!isPlaying) return;

      // Natural timing: most crackles 1-4 seconds apart, occasional 0.5s
      const nextDelay = Math.random() < 0.1
        ? Math.random() * 400 + 300     // occasional quick follow-up (300-700ms)
        : Math.random() * 3000 + 800;    // normal: 0.8-3.8 seconds

      // Decide crackle type
      const isBigPop = Math.random() < 0.12;

      const duration = isBigPop
        ? Math.random() * 0.08 + 0.06   // 60-140ms
        : Math.random() * 0.06 + 0.02;  // 20-80ms

      const centerFreq = isBigPop
        ? Math.random() * 1500 + 500    // 500-2000Hz for pops
        : Math.random() * 2500 + 1000;  // 1000-3500Hz for crackles

      const volume = isBigPop
        ? Math.random() * 0.3 + 0.15    // 0.15-0.45
        : Math.random() * 0.12 + 0.03;  // 0.03-0.15

      // Create the crackle sound
      const crackleLen = Math.ceil(sr * duration);
      const crackleBuf = audioCtx.createBuffer(1, crackleLen, sr);
      const crackleData = crackleBuf.getChannelData(0);

      // White noise burst
      for (let i = 0; i < crackleLen; i++) {
        crackleData[i] = Math.random() * 2 - 1;
      }

      // Envelope: instant attack, variable decay
      const decayRate = isBigPop ? 3 : 5 + Math.random() * 3;
      for (let i = 0; i < crackleLen; i++) {
        const env = Math.exp(-i * decayRate / crackleLen);
        crackleData[i] *= env;
      }

      const crackleSrc = audioCtx.createBufferSource();
      crackleSrc.buffer = crackleBuf;

      // Bandpass filter for natural tone
      const bpf = audioCtx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = centerFreq;
      bpf.Q.value = isBigPop ? 1.5 : 2.5 + Math.random() * 2;

      const cGain = audioCtx.createGain();
      cGain.gain.value = volume;

      crackleSrc.connect(bpf);
      bpf.connect(cGain);
      cGain.connect(audioCtx.destination);
      crackleSrc.start();

      // Cleanup immediately to avoid buildup
      crackleSrc.onended = () => {
        try { bpf.disconnect(); cGain.disconnect(); } catch(e) {}
      };

      // Schedule next
      crackleTimer = setTimeout(scheduleCrackle, nextDelay);
    }

    // =====================================================================
    // LAYER 4: GENTLE HISS (fine crackling, distant)
    // =====================================================================
    const hissLen = Math.ceil(sr * 3);
    const hissBuf = audioCtx.createBuffer(1, hissLen, sr);
    const hissData = hissBuf.getChannelData(0);
    for (let i = 0; i < hissLen; i++) {
      hissData[i] = (Math.random() * 2 - 1) * 0.025;
    }

    const hissSrc = audioCtx.createBufferSource();
    hissSrc.buffer = hissBuf;
    hissSrc.loop = true;

    const hissBp = audioCtx.createBiquadFilter();
    hissBp.type = 'bandpass';
    hissBp.frequency.value = 3000;
    hissBp.Q.value = 0.5;

    const hissGain = audioCtx.createGain();
    hissGain.gain.value = 0;
    hissGain.gain.linearRampToValueAtTime(0.008, audioCtx.currentTime + 5);

    hissSrc.connect(hissBp);
    hissBp.connect(hissGain);
    hissGain.connect(audioCtx.destination);
    hissSrc.start();

    nodes.push(hissSrc, hissBp, hissGain);

    // =====================================================================
    // START
    // =====================================================================
    isPlaying = true;
    crackleTimer = setTimeout(scheduleCrackle, 1500); // first crackle after a breath

    btn.classList.add('playing');
    btn.textContent = '🔊';
    label.classList.add('visible');
  } catch(e) {
    console.log('Sound error:', e);
    btn.textContent = '🔇';
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (crackleTimer) clearTimeout(crackleTimer);
  nodes.forEach(n => { try { if (n.stop) n.stop(); if (n.disconnect) n.disconnect(); } catch(e) {} });
});
