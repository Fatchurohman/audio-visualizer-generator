export class VideoRecorder {
  constructor(canvas, audioStream) {
    this.canvas = canvas;
    this.audioStream = audioStream;
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  startRecording() {
    this.recordedChunks = [];
    const canvasStream = this.canvas.captureStream(60);

    // Gabungkan video stream canvas & audio stream
    const combinedTracks = [
      ...canvasStream.getVideoTracks(),
      ...this.audioStream.getAudioTracks()
    ];
    const combinedStream = new MediaStream(combinedTracks);

    // Pilih codec yang didukung browser
    let mimeType = 'video/webm; codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    this.mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: mimeType,
      videoBitsPerSecond: 6000000 // 6 Mbps
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100);
  }

  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder belum diinisialisasi'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }
}

