class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');

        // Game settings
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.gameSpeed = 144; // 20% faster than 180ms (180 * 0.8 = 144)
        this.speedIncrement = 2; // Speed increase per apple eaten

        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = [];
        this.minFoodCount = 3;
        this.particles = [];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = this.getHighScore();
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;
        
        // Continuous movement properties
        this.smoothSnake = [{ x: 10 * this.gridSize, y: 10 * this.gridSize }];
        this.moveProgress = 0;
        this.moveSpeed = 0.05; // How fast the snake moves between grid positions

        this.init();
    }

    init() {
        this.generateInitialFood();
        this.updateHighScoreDisplay();
        this.setupEventListeners();
        this.createAudioContext();
        this.draw();
    }

    setupEventListeners() {
        // Button event listeners
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());

        // Keyboard event listeners
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;

        const key = e.key.toLowerCase();

        // Prevent reverse direction
        switch (key) {
            case 'arrowup':
            case 'w':
                if (this.dy === 0) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'arrowdown':
            case 's':
                if (this.dy === 0) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'arrowleft':
            case 'a':
                if (this.dx === 0) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'arrowright':
            case 'd':
                if (this.dx === 0) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
            case ' ':
            case 'p':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }

    startGame() {
        if (this.gameRunning) return;

        this.gameRunning = true;
        this.gamePaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;

        if (this.dx === 0 && this.dy === 0) {
            this.dx = 1;
            this.dy = 0;
        }

        this.gameLoop = setInterval(() => {
            if (!this.gamePaused) {
                this.updateContinuous();
                this.draw();
            }
        }, 16); // 60 FPS for smooth animation
    }

    togglePause() {
        if (!this.gameRunning) return;

        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? 'Resume' : 'Pause';

        if (this.gamePaused) {
            this.drawPauseScreen();
        }
    }

    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        clearInterval(this.gameLoop);

        this.snake = [{ x: 10, y: 10 }];
        this.smoothSnake = [{ x: 10 * this.gridSize, y: 10 * this.gridSize }];
        this.moveProgress = 0;
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.particles = [];
        this.updateScore();

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';

        this.generateInitialFood();
        this.draw();
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.isPositionOccupied(newFood.x, newFood.y));
        
        return newFood;
    }

    generateInitialFood() {
        this.food = [];
        for (let i = 0; i < this.minFoodCount; i++) {
            this.food.push(this.generateFood());
        }
    }

    ensureMinimumFood() {
        while (this.food.length < this.minFoodCount) {
            this.food.push(this.generateFood());
        }
    }

    isPositionOccupied(x, y) {
        // Check if position is occupied by snake
        if (this.snake.some(segment => segment.x === x && segment.y === y)) {
            return true;
        }
        
        // Check if position is occupied by existing food
        if (this.food.some(foodItem => foodItem.x === x && foodItem.y === y)) {
            return true;
        }
        
        return false;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Draw snake
        this.smoothSnake.forEach((segment, index) => {
            if (index === 0) {
                // Snake head
                this.ctx.fillStyle = '#27ae60';
            } else {
                this.ctx.fillStyle = '#2ecc71';
            }
            
            // Draw rounded rectangle for smoother appearance
            this.drawRoundedRect(
                segment.x + 1,
                segment.y + 1,
                this.gridSize - 2,
                this.gridSize - 2,
                4
            );

            // Add some style to snake segments
            if (index === 0) {
                // Draw eyes on the head
                this.ctx.fillStyle = '#ffffff';
                const eyeSize = 3;
                const eyeOffset = 5;
                
                // Determine eye position based on direction
                let eyeX1, eyeY1, eyeX2, eyeY2;
                
                if (this.dx === 1) { // Moving right
                    eyeX1 = segment.x + this.gridSize - eyeOffset;
                    eyeY1 = segment.y + eyeOffset;
                    eyeX2 = segment.x + this.gridSize - eyeOffset;
                    eyeY2 = segment.y + this.gridSize - eyeOffset;
                } else if (this.dx === -1) { // Moving left
                    eyeX1 = segment.x + eyeOffset - eyeSize;
                    eyeY1 = segment.y + eyeOffset;
                    eyeX2 = segment.x + eyeOffset - eyeSize;
                    eyeY2 = segment.y + this.gridSize - eyeOffset;
                } else if (this.dy === -1) { // Moving up
                    eyeX1 = segment.x + eyeOffset;
                    eyeY1 = segment.y + eyeOffset - eyeSize;
                    eyeX2 = segment.x + this.gridSize - eyeOffset;
                    eyeY2 = segment.y + eyeOffset - eyeSize;
                } else if (this.dy === 1) { // Moving down
                    eyeX1 = segment.x + eyeOffset;
                    eyeY1 = segment.y + this.gridSize - eyeOffset;
                    eyeX2 = segment.x + this.gridSize - eyeOffset;
                    eyeY2 = segment.y + this.gridSize - eyeOffset;
                }
                
                if (this.dx !== 0 || this.dy !== 0) {
                    this.ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
                    this.ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);
                }
            }
        });

        // Draw food
        this.food.forEach(foodItem => {
            this.ctx.fillStyle = '#e74c3c';
            this.drawRoundedRect(
                foodItem.x * this.gridSize + 1,
                foodItem.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2,
                6
            );

            // Add a small highlight to the food
            this.ctx.fillStyle = '#ff6b6b';
            this.drawRoundedRect(
                foodItem.x * this.gridSize + 3,
                foodItem.y * this.gridSize + 3,
                this.gridSize - 8,
                this.gridSize - 8,
                3
            );
        });

        // Draw particles
        this.drawParticles();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }

    drawPauseScreen() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Pause text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press P or Space to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.setHighScore(this.highScore);
            this.updateHighScoreDisplay();
        }

        // Draw game over screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#e74c3c';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Click Reset to play again', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }

    getHighScore() {
        return parseInt(localStorage.getItem('snakeHighScore')) || 0;
    }

    setHighScore(score) {
        localStorage.setItem('snakeHighScore', score.toString());
    }

    getCurrentSpeed() {
        // Start at base speed, get faster as score increases
        const speedBonus = Math.floor(this.score / 50) * this.speedIncrement;
        return Math.max(96, this.gameSpeed - speedBonus); // Minimum 96ms (20% faster than 120ms)
    }

    createAudioContext() {
        // Create audio context for sound effects
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playPingSound() {
        if (!this.audioContext) return;

        // Resume audio context if it's suspended (required by some browsers)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Create a pleasant ping sound
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    createParticleEffect(x, y) {
        // Create particles at the food position
        const centerX = x * this.gridSize + this.gridSize / 2;
        const centerY = y * this.gridSize + this.gridSize / 2;
        const currentTime = Date.now();
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                createdTime: currentTime,
                lifetime: 500, // 0.5 seconds in milliseconds
                size: 3 + Math.random() * 3,
                color: `hsl(${Math.random() * 60 + 15}, 100%, 60%)` // Orange to yellow colors
            });
        }
    }

    updateParticles() {
        const currentTime = Date.now();
        
        this.particles = this.particles.filter(particle => {
            const age = currentTime - particle.createdTime;
            
            // Remove particle if it's older than 0.5 seconds
            if (age >= particle.lifetime) {
                return false;
            }
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98; // Slight deceleration
            particle.vy *= 0.98;
            
            return true;
        });
    }

    drawParticles() {
        const currentTime = Date.now();
        
        this.particles.forEach(particle => {
            const age = currentTime - particle.createdTime;
            const lifeRatio = 1 - (age / particle.lifetime); // 1.0 to 0.0 over lifetime
            
            this.ctx.save();
            this.ctx.globalAlpha = lifeRatio; // Fade out over time
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * lifeRatio, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    updateContinuous() {
        if (this.dx === 0 && this.dy === 0) return;

        // Update move progress based on current speed
        const currentSpeed = this.getCurrentSpeed();
        this.moveProgress += (16 / currentSpeed); // Normalize based on target speed

        // Update smooth positions
        this.updateSmoothPositions();

        // Check if we've completed a full grid movement
        if (this.moveProgress >= 1.0) {
            this.moveProgress = 0;
            this.completeGridMove();
        }

        // Update particles
        this.updateParticles();
    }

    updateSmoothPositions() {
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            
            if (i === 0) {
                // Head moves toward next grid position
                const targetX = (segment.x + this.dx) * this.gridSize;
                const targetY = (segment.y + this.dy) * this.gridSize;
                const currentX = segment.x * this.gridSize;
                const currentY = segment.y * this.gridSize;
                
                this.smoothSnake[i] = {
                    x: currentX + (targetX - currentX) * this.moveProgress,
                    y: currentY + (targetY - currentY) * this.moveProgress
                };
            } else {
                // Body segments follow the segment in front
                const prevSegment = this.snake[i - 1];
                const currentSegment = this.snake[i];
                
                const targetX = prevSegment.x * this.gridSize;
                const targetY = prevSegment.y * this.gridSize;
                const currentX = currentSegment.x * this.gridSize;
                const currentY = currentSegment.y * this.gridSize;
                
                this.smoothSnake[i] = {
                    x: currentX + (targetX - currentX) * this.moveProgress,
                    y: currentY + (targetY - currentY) * this.moveProgress
                };
            }
        }
    }

    completeGridMove() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }

        this.snake.unshift(head);

        // Check food collision
        let foodEaten = false;
        let eatenFoodPosition = null;
        this.food = this.food.filter(foodItem => {
            if (head.x === foodItem.x && head.y === foodItem.y) {
                this.score += 10;
                this.updateScore();
                foodEaten = true;
                eatenFoodPosition = { x: foodItem.x, y: foodItem.y };
                return false; // Remove this food item
            }
            return true; // Keep this food item
        });

        if (foodEaten) {
            // Create particle effect and play sound
            this.createParticleEffect(eatenFoodPosition.x, eatenFoodPosition.y);
            this.playPingSound();
            
            // Don't remove tail segment when food is eaten
            this.ensureMinimumFood();
            // Add new smooth segment
            this.smoothSnake.push({ x: this.snake[this.snake.length - 1].x * this.gridSize, y: this.snake[this.snake.length - 1].y * this.gridSize });
        } else {
            this.snake.pop();
            this.smoothSnake.pop();
        }

        // Update smooth snake positions to match grid positions
        for (let i = 0; i < this.snake.length; i++) {
            this.smoothSnake[i] = {
                x: this.snake[i].x * this.gridSize,
                y: this.snake[i].y * this.gridSize
            };
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
