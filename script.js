class ProPhotobooth {
    constructor() {
        // Elements
        this.video = document.getElementById('video');
        this.overlayCanvas = document.getElementById('overlayCanvas');
        this.captureCanvas = document.getElementById('captureCanvas');
        this.shotCanvases = [
            document.getElementById('shot1'),
            document.getElementById('shot2'),
            document.getElementById('shot3'),
            document.getElementById('shot4')
        ];
        this.finalStripCanvas = document.getElementById('finalStrip');
        
        this.startBtn = document.getElementById('startSession');
        this.captureBtn = document.getElementById('captureBtn');
        this.countdownEl = document.getElementById('countdown');
        this.shotCounterEl = document.getElementById('shotCounter');
        this.resultSection = document.getElementById('resultSection');
        
        // State
        this.currentShot = 0;
        this.shots = [];
        this.currentProp = 'crown';
        this.currentFilter = 'normal';
        this.sessionTimer = 0;
        this.stream = null;
        this.sessionActive = false;
        this.timerInterval = null;
        
        this.init();
    }
    
    async init() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' }
            });
            this.video.srcObject = this.stream;
            
            // Event Listeners
            this.startBtn.addEventListener('click', () => this.startSession());
            this.captureBtn.addEventListener('click', () => this.captureShot());
            
            // Props & Filters
            document.querySelectorAll('.prop-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.setProp(e.target.dataset.prop));
            });
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
            });
            
            // Result actions
            document.getElementById('downloadBtn').addEventListener('click', () => this.downloadStrip());
            document.getElementById('shareBtn').addEventListener('click', () => this.shareStrip());
            document.getElementById('newSessionBtn').addEventListener('click', () => this.newSession());
            
        } catch(err) {
            alert('Izinkan akses kamera dulu ya! 📱');
        }
    }
    
    startSession() {
        this.currentShot = 0;
        this.shots = [];
        this.sessionActive = true;
        this.sessionTimer = 0;
        
        // UI Update
        this.startBtn.style.display = 'none';
        this.captureBtn.style.display = 'block';
        this.shotCounterEl.textContent = 'GET READY!';
        
        // Start timer
        this.timerInterval = setInterval(() => {
            this.sessionTimer++;
            const minutes = Math.floor(this.sessionTimer / 60).toString().padStart(2, '0');
            const seconds = (this.sessionTimer % 60).toString().padStart(2, '0');
            document.getElementById('timer').textContent = `${minutes}:${seconds}`;
        }, 1000);
        
        // Auto countdown to first shot
        setTimeout(() => this.startCountdown(), 2000);
    }
    
    async startCountdown() {
        for (let i = 4; i > 0; i--) {
            this.countdownEl.textContent = i;
            this.countdownEl.style.opacity = '1';
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        this.countdownEl.style.opacity = '0';
        this.captureShot();
    }
    
    async captureShot() {
        if (this.currentShot >= 4) return;
        
        // Capture with overlay
        const ctx = this.captureCanvas.getContext('2d');
        this.captureCanvas.width = 640;
        this.captureCanvas.height = 480;
        
        ctx.drawImage(this.video, 0, 0, 640, 480);
        ctx.drawImage(this.overlayCanvas, 0, 0, 640, 480);
        
        // Apply filter
        this.applyFilter();
        
        // Save shot
        this.shots[this.currentShot] = this.captureCanvas.toDataURL();
        this.shotCanvases[this.currentShot].width = 120;
        this.shotCanvases[this.currentShot].height = 90;
        const thumbCtx = this.shotCanvases[this.currentShot].getContext('2d');
        thumbCtx.drawImage(this.captureCanvas, 0, 0, 120, 90);
        
        this.currentShot++;
        this.shotCounterEl.textContent = `${this.currentShot}/4`;
        
        // Next shot or finish
        if (this.currentShot < 4) {
            setTimeout(() => this.startCountdown(), 1000);
        } else {
            setTimeout(() => this.finishSession(), 2000);
        }
    }
    
    finishSession() {
        this.sessionActive = false;
        clearInterval(this.timerInterval);
        this.createFinalStrip();
        this.resultSection.classList.remove('hidden');
        document.querySelector('.booth').style.display = 'none';
        document.querySelector('.props-panel').style.display = 'none';
        document.querySelector('.filters').style.display = 'none';
    }
    
    createFinalStrip() {
        const ctx = this.finalStripCanvas.getContext('2d');
        this.finalStripCanvas.width = 800;
        this.finalStripCanvas.height = 1200;
        
        // Background strip
        const gradient = ctx.createLinearGradient(0, 0, 0, 1200);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#f8f9fa');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 1200);
        
        // Border
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 20;
        ctx.strokeRect(40, 40, 720, 1120);
        
        // 4 Shots (2x2 grid)
        const shotSize = 320;
        const offsetX = [80, 440];
        const offsetY = [80, 500];
        
        this.shots.forEach((shot, index) => {
            const img = new Image();
            img.src = shot;
            img.onload = () => {
                ctx.drawImage(img, offsetX[index % 2], offsetY[Math.floor(index / 2)], shotSize, shotSize * 0.75);
            };
        });
        
        // Photobooth branding
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('DIGITAL PHOTOBOOTH', 400, 1150);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(`Session: ${new Date().toLocaleString('id-ID')}`, 400, 1185);
    }
    
    setProp(prop) {
        this.currentProp = prop;
        document.querySelectorAll('.prop-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-prop="${prop}"]`).classList.add('active');
        this.drawOverlay();
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    }
    
    drawOverlay() {
        const ctx = this.overlayCanvas.getContext('2d');
        const rect = this.video.getBoundingClientRect();
        this.overlayCanvas.width = rect.width;
        this.overlayCanvas.height = rect.height;
        
        ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        ctx.save();
        ctx.scale(this.overlayCanvas.width/640, this.overlayCanvas.height/480);
        
        // Draw props based on currentProp
        switch(this.currentProp) {
            case 'hat':
                this.drawHat(ctx);
                break;
            case 'sunglasses':
                this
