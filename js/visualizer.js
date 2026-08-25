export class VisualizerRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.backgroundImage = null;
    this.title = 'Judul Lagu';
    this.artist = 'Nama Artis';
    this.style = 'bars';
  }

  setBackground(img) {
    this.backgroundImage = img;
  }

  setMetadata(title, artist) {
    this.title = title || 'Judul Lagu';
    this.artist = artist || 'Nama Artis';
  }

  setStyle(styleName) {
    this.style = styleName;
  }

  draw(frequencyData) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    // 1. Layer Background
    if (this.backgroundImage && this.backgroundImage.complete) {
      ctx.drawImage(this.backgroundImage, 0, 0, width, height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, width, height);
    } else {
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#0a0a14');
      bgGradient.addColorStop(1, '#1b1b2f');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Layer Metadata Lagu
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Arial';
    ctx.fillText(this.title, width / 2, height / 2 - 380);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '36px Arial';
    ctx.fillText(this.artist, width / 2, height / 2 - 320);

    // 3. Layer Visualizer (Dipisah tegas tiap gayanya)
    switch (this.style) {
      case 'circle':
        this.drawCircularPulse(frequencyData, width, height);
        break;
      case 'radial':
        this.drawRadialSunburst(frequencyData, width, height);
        break;
      case 'wave':
        this.drawSmoothWave(frequencyData, width, height);
        break;
      case 'particles':
        this.drawFloatingParticles(frequencyData, width, height);
        break;
      case 'bars':
      default:
        this.drawWaveformBars(frequencyData, width, height);
        break;
    }
  }

  // 1. Waveform Bars: Kotak-kotak pilar vertikal berjejer rapi di tengah-bawah
  drawWaveformBars(dataArray, width, height) {
    const ctx = this.ctx;
    const barCount = 36;
    const barWidth = 16;
    const gap = 10;
    const totalWidth = barCount * (barWidth + gap) - gap;
    const startX = (width - totalWidth) / 2;
    const centerY = height / 2 + 150;

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i * 2] || 0;
      const barHeight = (value / 255) * 320;

      const x = startX + i * (barWidth + gap);
      const y = centerY - barHeight / 2;

      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, '#38bdf8');
      gradient.addColorStop(1, '#6366f1');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, Math.max(barHeight, 8), 6);
      ctx.fill();
    }
  }

  // 2. Neon Circular Pulse: Lingkaran cincin berdenyut di tengah
  drawCircularPulse(dataArray, width, height) {
    const ctx = this.ctx;
    const centerX = width / 2;
    const centerY = height / 2 + 150;
    const radius = 180;
    const points = 50;

    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const value = dataArray[i] || 0;
      const offset = (value / 255) * 120;
      const r = radius + offset;

      const angle = (i / points) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 12;
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#d946ef';
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // 3. Radial Sunburst: Garis-garis pancaran sinar dari titik pusat
  drawRadialSunburst(dataArray, width, height) {
    const ctx = this.ctx;
    const centerX = width / 2;
    const centerY = height / 2 + 150;
    const innerRadius = 120;
    const bars = 45;

    for (let i = 0; i < bars; i++) {
      const value = dataArray[i * 2] || 0;
      const barLength = (value / 255) * 200;

      const angle = (i / bars) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * (innerRadius + barLength);
      const y2 = centerY + Math.sin(angle) * (innerRadius + barLength);

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // 4. Smooth Wave Spectrum: Garis kurva sinyal meliuk-liuk (Oscilloscope style)
  drawSmoothWave(dataArray, width, height) {
    const ctx = this.ctx;
    const centerY = height / 2 + 150;
    const sliceWidth = width / 30;

    ctx.beginPath();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    let x = 0;
    for (let i = 0; i < 30; i++) {
      const value = dataArray[i * 3] || 128;
      // Menggunakan fungsi sinus murni dikali amplitudo audio agar membentuk gelombang mengalir
      const y = centerY + Math.sin(i * 0.5 + Date.now() * 0.005) * ((value / 255) * 150);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      x += sliceWidth;
    }
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#fb7185';
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // 5. Floating Particles: Bola-bola orbs/gelembung melayang naik turun acak di area bawah
  drawFloatingParticles(dataArray, width, height) {
    const ctx = this.ctx;
    const count = 25;
    const baseWidth = width - 100;

    for (let i = 0; i < count; i++) {
      const value = dataArray[i * 4] || 0;
      const size = Math.max((value / 255) * 25, 4);
      
      // Posisi X disebar, posisi Y naik turun berdasarkan waktu dan data audio
      const x = 50 + (i * (baseWidth / count));
      const timeOffset = Date.now() * 0.002 + i;
      const y = (height / 2 + 250) - (Math.sin(timeOffset) * 80) - ((value / 255) * 100);

      ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}
