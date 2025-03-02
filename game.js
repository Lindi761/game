class Bird {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = canvas.width / 3;
        this.y = canvas.height / 2;
        this.radius = 12;
        this.velocity = 0;
        this.gravity = 0.15;
        this.jumpForce = -4;
        this.rotation = 0;
        this.wingAngle = 0;
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        this.rotation = Math.min(Math.PI/4, Math.max(-Math.PI/4, this.velocity * 0.1));
        this.wingAngle += 0.2;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // 绘制身体
        ctx.fillStyle = '#FFE135';  // 明亮的黄色
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 1.2, this.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // 绘制翅膀
        ctx.fillStyle = '#FFD700';  // 金色翅膀
        const wingY = Math.sin(this.wingAngle) * 5;
        
        // 左翅膀
        ctx.beginPath();
        ctx.ellipse(
            -5, wingY,
            this.radius * 0.7,
            this.radius * 0.4,
            Math.PI/4 + Math.sin(this.wingAngle) * 0.2,
            0, Math.PI * 2
        );
        ctx.fill();

        // 绘制头部
        ctx.fillStyle = '#FFE135';
        ctx.beginPath();
        ctx.arc(this.radius * 0.7, -this.radius * 0.3, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // 绘制眼睛
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.radius * 0.9, -this.radius * 0.4, this.radius * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛高光
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(
            this.radius * 0.95,
            -this.radius * 0.45,
            this.radius * 0.05,
            0, Math.PI * 2
        );
        ctx.fill();

        // 绘制喙
        ctx.fillStyle = '#FF6B6B';  // 珊瑚红色
        ctx.beginPath();
        ctx.moveTo(this.radius * 1.2, -this.radius * 0.3);
        ctx.lineTo(this.radius * 1.6, -this.radius * 0.1);
        ctx.lineTo(this.radius * 1.2, this.radius * 0.1);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    jump() {
        this.velocity = this.jumpForce;
    }
}

class Lightning {
    constructor(canvas, x) {
        this.canvas = canvas;
        this.x = x;
        this.width = 20;
        this.gap = 300;
        this.segments = [];
        this.topHeight = Math.random() * (canvas.height - this.gap - 300) + 100;
        this.bottomY = this.topHeight + this.gap;
        this.speed = 0.8;
        this.scored = false;
        this.time = 0;
        
        // 生成闪电路径
        this.generatePath(0, 0, this.topHeight);  // 上部闪电
        this.generatePath(this.bottomY, this.bottomY, canvas.height - this.bottomY);  // 下部闪电
    }

    generatePath(startY, baseY, height) {
        let y = startY;
        let segments = [];
        const zigzagWidth = 30;
        const segmentHeight = 20;
        
        while (y < baseY + height) {
            segments.push({
                x1: this.x + Math.random() * zigzagWidth - zigzagWidth/2,
                y1: y,
                x2: this.x + Math.random() * zigzagWidth - zigzagWidth/2,
                y2: y + segmentHeight
            });
            y += segmentHeight;
        }
        this.segments.push(segments);
    }

    update() {
        this.x -= this.speed;
        this.time += 0.1;
        
        // 更新闪电路径
        this.segments.forEach(segmentGroup => {
            segmentGroup.forEach(segment => {
                segment.x1 -= this.speed;
                segment.x2 -= this.speed;
            });
        });
    }

    draw(ctx) {
        // 闪电光晕效果
        const gradient = ctx.createLinearGradient(this.x - 20, 0, this.x + 20, 0);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.2 + Math.sin(this.time) * 0.1})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        // 绘制每个闪电段
        this.segments.forEach(segmentGroup => {
            // 外发光
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            segmentGroup.forEach(segment => {
                ctx.moveTo(segment.x1, segment.y1);
                ctx.lineTo(segment.x2, segment.y2);
            });
            ctx.stroke();

            // 内部亮光
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(this.time) * 0.2})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            segmentGroup.forEach(segment => {
                ctx.moveTo(segment.x1, segment.y1);
                ctx.lineTo(segment.x2, segment.y2);
            });
            ctx.stroke();

            // 中心最亮部分
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.beginPath();
            segmentGroup.forEach(segment => {
                ctx.moveTo(segment.x1, segment.y1);
                ctx.lineTo(segment.x2, segment.y2);
            });
            ctx.stroke();
        });
    }
}

// 添加 Cloud 类
class Cloud {
    constructor(bird) {
        this.bird = bird;
        this.offset = {
            x: -40,  // 云在鸟后面
            y: -30   // 云在鸟上方
        };
        this.positions = [];  // 存储云朵的历史位置
        this.maxPositions = 10;  // 云的长度
    }

    update() {
        // 添加新位置到数组开头
        this.positions.unshift({
            x: this.bird.x + this.offset.x,
            y: this.bird.y + this.offset.y
        });

        // 保持数组长度
        if (this.positions.length > this.maxPositions) {
            this.positions.pop();
        }
    }

    draw(ctx) {
        // 绘制每个云朵位置
        this.positions.forEach((pos, index) => {
            const alpha = 1 - (index / this.maxPositions);  // 渐变透明度
            const size = 15 - (index * 0.5);  // 渐变大小

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            
            // 绘制云朵形状
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.arc(pos.x + size * 0.8, pos.y - size * 0.2, size * 0.6, 0, Math.PI * 2);
            ctx.arc(pos.x + size * 0.4, pos.y - size * 0.4, size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.raindrops = [];
        this.sunPosition = { x: 50, y: 50 };
        this.time = 0;
        
        // 创建初始雨滴
        for (let i = 0; i < 100; i++) {
            this.raindrops.push(this.createRaindrop());
        }
    }

    createRaindrop() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            speed: 3 + Math.random() * 2,
            length: 10 + Math.random() * 10
        };
    }

    update() {
        this.time += 0.01;
        
        // 更新雨滴位置
        this.raindrops.forEach(drop => {
            drop.y += drop.speed;
            drop.x += 0.5; // 斜向雨
            
            // 如果雨滴超出画面，重置位置
            if (drop.y > this.canvas.height) {
                Object.assign(drop, this.createRaindrop());
                drop.y = -drop.length;
            }
            if (drop.x > this.canvas.width) {
                drop.x = -drop.length;
            }
        });
    }

    draw(ctx) {
        // 绘制渐变天空
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        skyGradient.addColorStop(0, '#87CEEB');  // 天蓝色
        skyGradient.addColorStop(1, '#E0F6FF');  // 浅蓝色
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制太阳和光芒
        ctx.save();
        ctx.translate(this.sunPosition.x, this.sunPosition.y);
        ctx.rotate(this.time);
        
        // 太阳光芒
        for (let i = 0; i < 12; i++) {
            ctx.rotate(Math.PI / 6);
            ctx.beginPath();
            ctx.moveTo(20, 0);
            ctx.lineTo(35 + Math.sin(this.time * 2) * 5, 0);
            ctx.strokeStyle = 'rgba(255, 200, 0, 0.4)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // 太阳本体
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.restore();

        // 绘制远处的山丘
        ctx.fillStyle = '#90EE90';  // 浅绿色
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height);
        for (let x = 0; x <= this.canvas.width; x += 50) {
            const y = this.canvas.height - 100 + Math.sin(x * 0.02 + this.time) * 20;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(this.canvas.width, this.canvas.height);
        ctx.fill();

        // 绘制彩虹
        const rainbow = ctx.createRadialGradient(
            this.canvas.width * 0.7, this.canvas.height * 1.2,
            this.canvas.height * 0.5,
            this.canvas.width * 0.7, this.canvas.height * 1.2,
            this.canvas.height * 0.8
        );
        rainbow.addColorStop(0, 'rgba(255, 0, 0, 0.1)');
        rainbow.addColorStop(0.2, 'rgba(255, 165, 0, 0.1)');
        rainbow.addColorStop(0.4, 'rgba(255, 255, 0, 0.1)');
        rainbow.addColorStop(0.6, 'rgba(0, 255, 0, 0.1)');
        rainbow.addColorStop(0.8, 'rgba(0, 0, 255, 0.1)');
        rainbow.addColorStop(1, 'rgba(238, 130, 238, 0.1)');
        
        ctx.fillStyle = rainbow;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制雨滴
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        this.raindrops.forEach(drop => {
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x + drop.length * 0.1, drop.y + drop.length);
            ctx.stroke();
        });
    }
}

class AudioManager {
    constructor() {
        // 延迟创建音频上下文，直到用户交互
        this.context = null;
        this.sounds = {};
        this.bgmPlaying = false;
        this.initialized = false;
    }

    // 新方法：初始化音频系统
    async init() {
        if (this.initialized) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建主音量控制
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = 0.3;

            await this.createSounds();
            this.initialized = true;
        } catch (error) {
            console.error('音频初始化失败:', error);
        }
    }

    async createSounds() {
        // 创建雨声（使用白噪音）
        const bufferSize = 2 * this.context.sampleRate;
        const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const rainNode = this.context.createBufferSource();
        rainNode.buffer = noiseBuffer;
        rainNode.loop = true;
        
        const rainGain = this.context.createGain();
        const rainFilter = this.context.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.value = 400;

        rainNode.connect(rainFilter);
        rainFilter.connect(rainGain);
        rainGain.connect(this.masterGain);
        rainGain.gain.value = 0.05;

        this.sounds.rain = { source: rainNode, gain: rainGain };

        // 创建翅膀扇动声
        const wingOsc = this.context.createOscillator();
        const wingGain = this.context.createGain();
        wingOsc.type = 'triangle';
        wingOsc.frequency.value = 300;
        
        wingOsc.connect(wingGain);
        wingGain.connect(this.masterGain);
        wingGain.gain.value = 0;

        this.sounds.wing = { osc: wingOsc, gain: wingGain };
        wingOsc.start();
    }

    updateWingSound(wingAngle) {
        if (!this.initialized || !this.bgmPlaying) return;
        
        const wingVolume = Math.abs(Math.sin(wingAngle)) * 0.1;
        this.sounds.wing.gain.gain.setTargetAtTime(wingVolume, this.context.currentTime, 0.01);
        
        const wingFreq = 300 + Math.sin(wingAngle) * 50;
        this.sounds.wing.osc.frequency.setTargetAtTime(wingFreq, this.context.currentTime, 0.01);
    }

    playBirdChirp() {
        if (!this.initialized || !this.bgmPlaying || Math.random() > 0.01) return;

        const chirp = this.context.createOscillator();
        const chirpGain = this.context.createGain();
        
        chirp.type = 'sine';
        chirp.frequency.setValueAtTime(1800 + Math.random() * 400, this.context.currentTime);
        chirp.frequency.exponentialRampToValueAtTime(1200, this.context.currentTime + 0.1);
        
        chirp.connect(chirpGain);
        chirpGain.connect(this.masterGain);
        
        chirpGain.gain.setValueAtTime(0, this.context.currentTime);
        chirpGain.gain.linearRampToValueAtTime(0.1, this.context.currentTime + 0.01);
        chirpGain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.1);
        
        chirp.start();
        chirp.stop(this.context.currentTime + 0.1);
    }

    updateRainSound(intensity) {
        if (!this.initialized || !this.bgmPlaying) return;
        this.sounds.rain.gain.gain.setTargetAtTime(0.02 + intensity * 0.03, this.context.currentTime, 0.1);
    }

    async startAll() {
        if (!this.initialized) {
            await this.init();
        }
        
        if (!this.bgmPlaying && this.initialized) {
            await this.context.resume();
            this.sounds.rain.source.start(0);
            this.bgmPlaying = true;
        }
    }

    stopAll() {
        if (this.bgmPlaying && this.initialized) {
            this.sounds.wing.gain.gain.setValueAtTime(0, this.context.currentTime);
            this.sounds.rain.gain.gain.setValueAtTime(0, this.context.currentTime);
            this.bgmPlaying = false;
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 320;
        this.canvas.height = 480;
        
        this.background = new Background(this.canvas);  // 添加背景
        this.bird = new Bird(this.canvas);
        this.lightnings = [];
        this.score = 0;
        this.gameOver = false;
        this.started = false;
        this.cloud = new Cloud(this.bird);  // 添加云朵
        this.audio = new AudioManager();  // 添加音频管理器
        
        this.setupEventListeners();
        this.init();
    }

    init() {
        this.lightnings = [];
        this.score = 0;
        this.gameOver = false;
        this.bird = new Bird(this.canvas);
        this.cloud = new Cloud(this.bird);  // 重置云朵
        document.getElementById('score').textContent = this.score;
    }

    setupEventListeners() {
        // PC控制
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.started && !this.gameOver) {
                this.bird.jump();
            }
        });

        // 移动端和PC点击控制
        this.canvas.addEventListener('click', () => {
            if (this.started && !this.gameOver) {
                this.bird.jump();
            }
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
    }

    async startGame() {
        this.started = true;
        document.getElementById('startScreen').classList.add('hidden');
        await this.audio.startAll();  // 等待音频初始化完成
        this.gameLoop();
    }

    restartGame() {
        this.init();
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.gameLoop();
    }

    update() {
        if (this.gameOver) return;

        this.background.update();
        this.bird.update();
        this.cloud.update();

        // 生成新的闪电
        if (this.lightnings.length === 0 || this.lightnings[this.lightnings.length - 1].x < this.canvas.width - 400) {
            this.lightnings.push(new Lightning(this.canvas, this.canvas.width));
        }

        // 更新闪电位置
        this.lightnings.forEach(lightning => lightning.update());

        // 移除超出画面的闪电
        this.lightnings = this.lightnings.filter(lightning => lightning.x + lightning.width > 0);

        // 更新音频
        this.audio.updateWingSound(this.bird.wingAngle);
        this.audio.playBirdChirp();
        this.audio.updateRainSound(0.5 + Math.sin(this.bird.wingAngle) * 0.2);

        this.checkCollisions();
        this.updateScore();
    }

    checkCollisions() {
        // 给玩家更多的容错空间，减小碰撞检测范围
        if (this.bird.y - this.bird.radius <= 5 || this.bird.y + this.bird.radius >= this.canvas.height - 5) {
            this.endGame();
        }

        // 更宽松的管道碰撞检测
        this.lightnings.forEach(lightning => {
            if (this.bird.x + (this.bird.radius * 0.8) > lightning.x - 10 && 
                this.bird.x - (this.bird.radius * 0.8) < lightning.x + 10) {
                if (this.bird.y - (this.bird.radius * 0.8) < lightning.topHeight || 
                    this.bird.y + (this.bird.radius * 0.8) > lightning.bottomY) {
                    this.endGame();
                }
            }
        });
    }

    updateScore() {
        this.lightnings.forEach(lightning => {
            if (lightning.x + lightning.width < this.bird.x && !lightning.scored) {
                lightning.scored = true;
                this.score++;
                document.getElementById('score').textContent = this.score;
            }
        });
    }

    endGame() {
        this.gameOver = true;
        this.audio.stopAll();  // 停止音频
        const highScore = localStorage.getItem('highScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('highScore', this.score);
        }
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('highScore').textContent = Math.max(highScore, this.score);
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.background.draw(this.ctx);
        this.cloud.draw(this.ctx);
        this.lightnings.forEach(lightning => lightning.draw(this.ctx));
        this.bird.draw(this.ctx);
    }

    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// 启动游戏
window.onload = () => {
    new Game();
}; 