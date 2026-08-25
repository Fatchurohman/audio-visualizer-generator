import { VisualizerRenderer } from './visualizer.js';
import { VideoRecorder } from './recorder.js';

let audioCtx = null;
let analyserNode = null;
let audioSource = null;
let mediaStreamDest = null;
let animationId = null;
let videoRecorder = null;

const audioElement = document.getElementById('audioElement');
const canvas = document.getElementById('visualizerCanvas');
const audioInput = document.getElementById('audioInput');
const bgInput = document.getElementById('bgInput');
const trackTitleInput = document.getElementById('trackTitle');
const artistNameInput = document.getElementById('artistName');
const visualStyleSelect = document.getElementById('visualStyle');
const statusBox = document.getElementById('statusMessage');

const btnPlay = document.getElementById('btnPlay');
const btnPause = document.getElementById('btnPause');
const btnRecord = document.getElementById('btnRecord');
const btnStopRecord = document.getElementById('btnStopRecord');

const renderer = new VisualizerRenderer(canvas);

// Inisialisasi Audio Context
function setupAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();

    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.8;

    mediaStreamDest = audioCtx.createMediaStreamDestination();

    audioSource = audioCtx.createMediaElementSource(audioElement);
    audioSource.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
    analyserNode.connect(mediaStreamDest);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Loop Animasi Canvas
function renderLoop() {
  animationId = requestAnimationFrame(renderLoop);

  if (analyserNode) {
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);
    renderer.draw(dataArray);
  } else {
    renderer.draw(new Uint8Array(128));
  }
}

// Event Listeners Input File & Teks
audioInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const objectUrl = URL.createObjectURL(file);
  audioElement.src = objectUrl;
  btnPlay.disabled = false;
  btnRecord.disabled = false;
  statusBox.textContent = `File "${file.name}" berhasil dimuat. Klik Play untuk preview.`;

  if (!animationId) {
    renderLoop();
  }
});

bgInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      renderer.setBackground(img);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

trackTitleInput.addEventListener('input', (e) => {
  renderer.setMetadata(e.target.value, artistNameInput.value);
});

artistNameInput.addEventListener('input', (e) => {
  renderer.setMetadata(trackTitleInput.value, e.target.value);
});

visualStyleSelect.addEventListener('change', (e) => {
  renderer.setStyle(e.target.value);
});

// Kontrol Play / Pause
btnPlay.addEventListener('click', async () => {
  setupAudioContext();
  await audioElement.play();
  btnPlay.disabled = true;
  btnPause.disabled = false;
  statusBox.textContent = 'Audio sedang diputar...';
});

btnPause.addEventListener('click', () => {
  audioElement.pause();
  btnPlay.disabled = false;
  btnPause.disabled = true;
  statusBox.textContent = 'Audio di-pause.';
});

audioElement.addEventListener('ended', () => {
  btnPlay.disabled = false;
  btnPause.disabled = true;
  statusBox.textContent = 'Lagu selesai diputar.';
});

// Rekam & Unduh Video
btnRecord.addEventListener('click', async () => {
  setupAudioContext();
  audioElement.currentTime = 0;
  await audioElement.play();

  videoRecorder = new VideoRecorder(canvas, mediaStreamDest.stream);
  videoRecorder.startRecording();

  btnRecord.disabled = true;
  btnStopRecord.disabled = false;
  btnPlay.disabled = true;
  btnPause.disabled = true;
  statusBox.textContent = '🔴 Perekaman video sedang berjalan bersamaan dengan audio...';
});

btnStopRecord.addEventListener('click', async () => {
  audioElement.pause();
  statusBox.textContent = 'Memproses file video...';

  try {
    const videoBlob = await videoRecorder.stopRecording();
    const videoUrl = URL.createObjectURL(videoBlob);

    // Download file otomatis
    const downloadLink = document.createElement('a');
    downloadLink.href = videoUrl;
    downloadLink.download = `${trackTitleInput.value || 'visualizer'}.webm`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    statusBox.textContent = '✅ Video berhasil diunduh!';
  } catch (err) {
    statusBox.textContent = `Gagal menyimpan video: ${err.message}`;
  } finally {
    btnRecord.disabled = false;
    btnStopRecord.disabled = true;
    btnPlay.disabled = false;
    btnPause.disabled = true;
  }
});

// Render awal kanvas kosong
renderLoop();

