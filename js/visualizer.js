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
      // Dark Overlay agar visualizer & teks tetap kontras
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

    // 3. Layer Visualizer
    if (this.style === 'circle') {
      this.drawCircularPulse(frequencyData, width, height);
    } else {
      this.drawWaveformBars(frequencyData, width, height);
    }
  }

  drawWaveformBars(dataArray, width, height) {
    const ctx = this.ctx;
    const barCount = 48;
    const barWidth = 14;
    const gap = 8;
    const totalWidth = barCount * (barWidth + gap) - gap;
    const startX = (width - totalWidth) / 2;
    const centerY = height / 2 + 100;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor(i * (dataArray.length / barCount) * 0.7);
      const value = dataArray[dataIndex] || 0;
      const barHeight = (value / 255) * 280;

      const x = startX + i * (barWidth + gap);
      const y = centerY - barHeight / 2;

      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, '#38bdf8');
      gradient.addColorStop(1, '#818cf8');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, Math.max(barHeight, 6), 6);
      ctx.fill();
    }
  }

  drawCircularPulse(dataArray, width, height) {
    const ctx = this.ctx;
    const centerX = width / 2;
    const centerY = height / 2 + 100;
    const radius = 220;
    const points = 64;

    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const dataIndex = Math.floor(i * (dataArray.length / points) * 0.6);
      const value = dataArray[dataIndex] || 0;
      const offset = (value / 255) * 90;
      const r = radius + offset;

      const angle = (i / points) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 10;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#d946ef';
    ctx.stroke();
    ctx.shadowBlur = 0; // reset
  }
}

