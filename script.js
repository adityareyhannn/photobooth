class PhotoboothPro {
    constructor() {
        this.video = document.getElementById('video');
        this.overlay = document.getElementById('overlay');
        this.shots = [];
        this.currentShot = 0;
        this.currentProp = 'crown';
        this.stream = null;
        
        console.log('🚀 Photobooth init...');
        this.init();
    }

    async init() {
        const statusEl = document.getElementById('status');
        
        try {
            console.log('📷 Requesting camera...');
            statusEl.textContent = 'Meminta izin kamera...';
            statusEl.className = 'status status-error';
            
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            console.log('✅ Camera granted!', this.stream);
            this.video.srcObject = this.stream;
            
            this.video.onloadedmetadata = () => {
                console.log('🎥 Video ready');
                statusEl.textContent = '✅ KAMERA OK! Pilih props → START';
                statusEl.className = 'status status-ok';
                this.drawOverlay();
            };
            
            this.video.onerror = (e) => {
                console.error('Video error:', e);
                statusEl.textContent = '❌ Video error - coba refresh';
                statusEl.className = 'status status-error';
            };
            
        } catch (err) {
            console.error('❌ Camera denied:', err);
            statusEl.textContent = `❌ KAMERA DITOLAK: ${err.name}`;
            statusEl.className = 'status status-error';
        }

        // Simplified events - TEST DULU
        document.getElementById('startBtn').onclick = () => {
            alert('START clicked! Kamera sudah muncul?');
        };
        
        document.querySelectorAll('.prop-btn').forEach(btn => {
            btn.onclick = (e) => {
                console.log('Prop:', e.target.dataset.prop);
                this.setProp(e.target.dataset.prop);
            };
        });
    }

    setProp(prop) {
        this.currentProp = prop;
        document.querySelectorAll('.prop-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        console.log('Prop changed to:', prop);
        this.drawOverlay();
    }

    drawOverlay() {
        if (!this.video.videoWidth) return;
        
        const ctx = this.overlay.getContext('2d');
        const rect = this.video.getBoundingClientRect();
        this.overlay.width = rect.width;
        this.overlay.height = rect.height;

        ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        ctx.save();
        ctx.scale(this.overlay.width / 640, this.overlay.height / 480);

        // Simple test overlay
        ctx.fillStyle = this.currentProp === 'crown' ? '#ffd700' : '#ff69b4';
        ctx.beginPath();
        ctx.arc(320, 150, 60, 0, Math.PI * 2);
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 30;
        ctx.fill();
        
        ctx.restore();
    }
}

// AUTO START
const app = new PhotoboothPro();
console.log('Photobooth loaded!');
