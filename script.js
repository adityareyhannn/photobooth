class PhotoboothPro {
    constructor() {
        this.video = document.getElementById('video');
        this.overlay = document.getElementById('overlay');
        this.shots = [];
        this.currentShot = 0;
        this.currentProp = 'crown';
        this.stream = null;
        this.timerInterval = null;
        this.init();
    }

    async init() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'user', 
                    width: { ideal: 1280 }, 
                    height: { ideal: 720 } 
                }
            });
            this.video.srcObject = this.stream;
            
            this.video.onloadedmetadata = () => {
                this.updateStatus('✅ Kamera siap! Pilih props → START SESSION', 'status-ok');
                this.drawOverlay();
            };
        } catch (err) {
            this.updateStatus('❌ Izinkan akses kamera di browser!', 'status-error');
            console.error('Camera Error:', err);
        }

        // Event Listeners
        document.getElementById('startBtn').onclick = () => this.startSession();
        document.getElementById('captureBtn').onclick = () => this.captureShot();
        
        document.querySelectorAll('.prop-btn').forEach(btn => {
            btn.onclick = (e) => this.setProp(e.target.dataset.prop);
        });
        
        document.getElementById('downloadBtn').onclick = () => this.download();
        document.getElementById('shareBtn').onclick = () => this.share();
        document.getElementById('newSessionBtn').onclick = () => this.newSession();
    }

    updateStatus(message, className) {
        const statusEl = document.getElementById('status');
        statusEl.textContent = message;
        statusEl.className = `status ${className}`;
    }

    setProp(prop) {
        this.currentProp = prop;
        document.querySelectorAll('.prop-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.drawOverlay();
    }

    drawOverlay() {
        const ctx = this.overlay.getContext('2d');
        const rect = this.video.getBoundingClientRect();
        this.overlay.width = rect.width;
        this.overlay.height = rect.height;

        ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        ctx.save();
        ctx.scale(this.overlay.width / 640, this.overlay.height / 480);

        const props = {
            crown: function() {
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = 'rgba(255,215,0,0.7)';
                ctx.shadowBlur = 25;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 5;
                ctx.beginPath();
                ctx.moveTo(320, 70);
                ctx.quadraticCurveTo(280, 90, 260, 120);
                ctx.quadraticCurveTo(240, 160, 270, 140);
                ctx.quadraticCurveTo(300, 130, 320, 120);
                ctx.quadraticCurveTo(340, 130, 370, 140);
                ctx.quadraticCurveTo(400, 160, 380, 120);
                ctx.quadraticCurveTo(360, 90, 320, 70);
                ctx.fill();
            },
            hat: function() {
                ctx.fillStyle = '#8B4513';
                ctx.shadowColor = 'rgba(139,69,19,0.5)';
                ctx.shadowBlur = 15;
                ctx.fillRect(270, 120, 100, 45);
                ctx.beginPath();
                ctx.moveTo(250, 120);
                ctx.lineTo(410, 120);
                ctx.lineTo(340, 60);
                ctx.closePath();
                ctx.fill();
            },
            glasses: function() {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 14;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(280, 240, 40, 0, Math.PI * 2);
                ctx.arc(360, 240, 40, 0, Math.PI * 2);
                ctx.moveTo(320, 240);
                ctx.lineTo(320, 240);
                ctx.stroke();
            },
            heart: function() {
                ctx.fillStyle = '#ff1493';
                ctx.shadowColor = 'rgba(255,20,147,0.8)';
                ctx.shadowBlur = 30;
                ctx.beginPath();
                ctx.moveTo(320, 210);
                ctx.bezierCurveTo(320, 170, 280, 150, 280, 200);
                ctx.bezierCurveTo(280, 250, 320, 290, 320, 250);
                ctx.bezierCurveTo(360, 290, 400, 250, 400, 200);
                ctx.bezierCurveTo(400, 150, 360, 170, 320, 210);
                ctx.fill();
            },
            party: function() {
                ctx.fillStyle = 'rgba(255,215,0,0.9)';
                for (let i = 0; i < 40; i++) {
                    const x = Math.random() * 640;
                    const y = Math.random() * 480;
                    const size = Math.random() * 10 + 5;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            },
            none: function() {}
        };

        if (props[this.currentProp]) {
            props[this.currentProp]();
        }

        ctx.restore();
        requestAnimationFrame(() => this.drawOverlay());
    }

    async startSession() {
        this.shots = new Array(4).fill(null);
        this.currentShot = 0;
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('captureBtn').style.display = 'block';
        document.getElementById('shotCounter').textContent = 'GET READY!';
        
        // Timer
        this.timerInterval = setInterval(() => {
            this.timer++;
            const mins = Math.floor(this.timer / 60).toString().padStart(2, '0');
            const secs = (this.timer % 60).toString().padStart(2, '0');
            document.getElementById('timer').textContent = `${mins}:${secs}`;
        }, 1000);

        await this.countdown(4);
        this.captureShot();
    }

    async countdown(seconds) {
        const countdownEl = document.getElementById('countdown');
        for (let i = seconds; i > 0; i--) {
            countdownEl.textContent = i;
            countdownEl.style.opacity = '1';
            await new Promise(resolve => setTimeout(resolve, 950));
        }
        countdownEl.style.opacity = '0';
    }

    async captureShot() {
        if (this.currentShot >= 4) {
            this.finishSession();
            return;
        }

        // Flash effect
        document.body.style.transition = 'background 0.1s';
        document.body.style.background = '#ffffff';
        setTimeout(() => {
            document.body.style.background = '';
            document.body.style.transition = '';
        }, 150);

        // Capture to canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 640;
        tempCanvas.height = 480;
        const tempCtx = tempCanvas
