class PhotoboothPro {
    constructor() {
        this.video = document.getElementById('video');
        this.overlay = document.getElementById('overlay');
        this.shots = [];
        this.currentShot = 0;
        this.currentProp = 'crown';
        this.stream = null;
        this.timer = 0;
        this.timerInterval = null;
        this.init();
    }

    async init() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            this.video.srcObject = this.stream;
            
            this.video.onloadedmetadata = () => {
                this.updateStatus('✅ FULLY READY! Pilih props → START SESSION', 'status-ok');
                this.drawOverlay();
            };
        } catch (err) {
            this.updateStatus('❌ Error: ' + err.name, 'status-error');
        }

        // FULL EVENT LISTENERS
        document.getElementById('startBtn').onclick = () => this.startSession();
        document.getElementById('captureBtn').onclick = () => this.captureShot();
        
        document.querySelectorAll('.prop-btn').forEach(btn => {
            btn.onclick = (e) => this.setProp(e.target.dataset.prop);
        });
        
        document.getElementById('downloadBtn').onclick = () => this.download();
        document.getElementById('shareBtn').onclick = () => this.share();
        document.getElementById('newSessionBtn').onclick = () => this.newSession();
    }

    updateStatus(msg, className) {
        const statusEl = document.getElementById('status');
        statusEl.textContent = msg;
        statusEl.className = `status ${className}`;
    }

    setProp(prop) {
        this.currentProp = prop;
        document.querySelectorAll('.prop-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
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

        const props = {
            crown: () => {
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ffed4a';
                ctx.shadowBlur = 25;
                ctx.beginPath();
                ctx.moveTo(320, 80);
                ctx.quadraticCurveTo(280, 100, 260, 130);
                ctx.quadraticCurveTo(240, 170, 270, 150);
                ctx.quadraticCurveTo(300, 140, 320, 130);
                ctx.quadraticCurveTo(340, 140, 370, 150);
                ctx.quadraticCurveTo(400, 170, 380, 130);
                ctx.quadraticCurveTo(360, 100, 320, 80);
                ctx.fill();
            },
            hat: () => {
                ctx.fillStyle = '#8B4513';
                ctx.shadowBlur = 15;
                ctx.fillRect(270, 130, 100, 40);
                ctx.beginPath();
                ctx.moveTo(250, 130);
                ctx.lineTo(410, 130);
                ctx.lineTo(330, 70);
                ctx.closePath();
                ctx.fill();
            },
            glasses: () => {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 12;
                ctx.lineCap = 'round';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(280, 250, 35, 0, Math.PI*2);
                ctx.arc(360, 250, 35, 0, Math.PI*2);
                ctx.moveTo(315, 250);
                ctx.lineTo(335, 250);
                ctx.stroke();
            },
            heart: () => {
                ctx.fillStyle = '#ff1493';
                ctx.shadowColor = '#ff69b4';
                ctx.shadowBlur = 30;
                ctx.beginPath();
                ctx.moveTo(320, 220);
                ctx.bezierCurveTo(320, 180, 280, 160, 280, 210);
                ctx.bezierCurveTo(280, 260, 320, 300, 320, 260);
                ctx.bezierCurveTo(360, 300, 400, 260, 400, 210);
                ctx.bezierCurveTo(400, 160, 360, 180, 320, 220);
                ctx.fill();
            },
            party: () => {
                ctx.fillStyle = 'rgba(255,215,0,0.8)';
                for(let i=0; i<25; i++) {
                    ctx.beginPath();
                    ctx.arc(Math.random()*640, Math.random()*480, Math.random()*8+3, 0, Math.PI*2);
                    ctx.fill();
                }
            },
            none: () => {}
        };

        if (props[this.currentProp]) props[this.currentProp]();
        ctx.restore();
    }

    async startSession() {
        this.shots = [];
        this.currentShot = 0;
        this.timer = 0;
        
        // UI
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('captureBtn').style.display = 'block';
        document.getElementById('shotCounter').textContent = 'GET READY!';
        
        // Timer
        this.timerInterval = setInterval(() => {
            this.timer++;
            const mins = Math.floor(this.timer/60).toString().padStart(2,'0');
            const secs = (this.timer%60).toString().padStart(2,'0');
            document.getElementById('timer').textContent = `${mins}:${secs}`;
        }, 1000);

        await this.countdown(4);
        this.captureShot();
    }

    async countdown(n) {
        const el = document.getElementById('countdown');
        for(let i=n; i>0; i--) {
            el.textContent = i;
            el.style.opacity = '1';
            await new Promise(r=>setTimeout(r,1000));
        }
        el.style.opacity = '0';
    }

    async captureShot() {
        if(this.currentShot >= 4) {
            this.finishSession();
            return;
        }

        // FLASH EFFECT
        document.body.style.background = '#fff';
        document.body.style.transition = 'background 0.2s';
        setTimeout(() => {
            document.body.style.background = '';
        }, 200);

        // CAPTURE
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(this.video, 0, 0, 640, 480);
        
        // Overlay layer
        const overlayData = this.overlay.getContext('2d').getImageData(0, 0, 640, 480);
        ctx.putImageData(overlayData, 0, 0);

        // SAVE SHOT
        this.shots[this.currentShot] = canvas.toDataURL('image/png');
        
        // THUMBNAIL
        const thumb = document.getElementById(`shot${this.currentShot+1}`);
        thumb.width = 120;
        thumb.height = 90;
        thumb.getContext('2d').drawImage(canvas, 0, 0, 120, 90);

        document.getElementById('shotCounter').textContent = `${this.currentShot+1}/4`;
        this.currentShot++;

        if(this.currentShot < 4) {
            setTimeout(() => {
                this.countdown(3).then(() => this.captureShot());
            }, 800);
        }
    }

    finishSession() {
        clearInterval(this.timerInterval);
        document.getElementById('captureBtn').style.display = 'none';
        this.createStrip();
        document.querySelector('.booth').style.display = 'none';
        document.querySelector('.props').style.display = 'none';
        document.getElementById('resultSection').classList.remove('hidden');
        this.updateStatus('🎉 SESSION COMPLETE!', 'status-ok');
    }

    createStrip() {
        const canvas = document.getElementById('finalStrip');
        const ctx = canvas.getContext('2d');
        canvas.width = 900;
        canvas.height = 1300;

        // BACKGROUND
        const gradient = ctx.createLinearGradient(0, 0, 0, 1300);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.7, '#f8f9fa');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 900, 1300);

        // BORDER
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 25;
        ctx.strokeRect(50, 50, 800, 1200);

        // 4 PHOTOS
        this.shots.forEach((shotData, i) => {
            const img = new Image();
            img.onload = () => {
                const x = (i % 2) * 410 + 80;
                const y = Math.floor(i / 2) * 370 + 80;
                ctx.shadowColor = 'rgba(0,0,0,0.15)';
                ctx.shadowBlur = 20;
                ctx.shadowOffsetY = 10;
                ctx.drawImage(img, x, y, 330, 250);
            };
            img.src = shotData;
        });

        // TEXT
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('DIGITAL PHOTOBOOTH', 450, 1230);

        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#6c757d';
        ctx.fillText(new Date().toLocaleString('id-ID'), 450, 1280);
    }

    download() {
        const canvas = document.getElementById('finalStrip');
        const link = document.createElement('a');
        link.download = `photobooth_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        this.updateStatus('💾 Downloaded!', 'status-ok');
    }

    share() {
        const canvas = document.getElementById('finalStrip');
        const url = canvas.toDataURL('image/png');
        const text = encodeURIComponent('📸 Foto photobooth keren! ' + new Date().toLocaleDateString('id-ID'));
        window.open(`https://wa.me/?text=${text}`);
        this.download();
    }

    newSession() {
        document.getElementById('resultSection').classList.add('hidden');
        document.querySelector('.booth').style.display = 'block';
        document.querySelector('.props').style.display = 'block';
        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('shotCounter').textContent = '0/4';
        this.updateStatus('✅ READY! Pilih props → START', 'status-ok');
    }
}

// START APP
const app = new PhotoboothPro();
