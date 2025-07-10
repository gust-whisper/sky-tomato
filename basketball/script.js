class BasketballGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.trajectoryToggle = document.getElementById('trajectoryToggle');
        
        // Game state
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.missCounter = 0; // Counter for missed shots
        this.isDragging = false;
        this.gameRunning = false;
        this.showTrajectory = false;
        
        // Special effects
        this.particles = [];
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
        this.scoreMessage = { text: '', opacity: 0, y: 0, timer: 0 };
        this.flashEffect = { opacity: 0, color: '#FFD700' };
        this.netAnimation = { intensity: 0, duration: 0 };
        
        // Basketball properties
        this.ball = {
            x: 100,
            y: 400,
            radius: 20,
            vx: 0,
            vy: 0,
            originalX: 100,
            originalY: 400,
            currentResetX: 100,  // Track current reset position
            currentResetY: 400,  // Track current reset position
            isMoving: false,
            scored: false,      // Track if ball has scored
            scoreTime: 0        // Timer for score delay
        };
        
        // Hoop properties
        this.hoop = {
            x: 650,
            y: 200,
            width: 80,
            height: 60,
            rimY: 240,
            backboard: {
                x: 650 + 80 - 10, // backboard x position
                y: 200 - 20,      // backboard y position
                width: 15,        // backboard width
                height: 60 + 20   // backboard height
            }
        };
        
        // Aiming properties
        this.mouse = { x: 0, y: 0 };
        this.dragStart = { x: 0, y: 0 };
        
        // Physics
        this.gravity = 0.4;
        this.friction = 0.99;
        
        this.initEventListeners();
        this.gameLoop();
    }
    
    initEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Remove the mouseleave auto-shoot behavior
        // this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        // Trajectory toggle
        this.trajectoryToggle.addEventListener('change', (e) => {
            this.showTrajectory = e.target.checked;
        });
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    isPointInBall(x, y) {
        const dx = x - this.ball.x;
        const dy = y - this.ball.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.ball.radius;
    }
    
    handleMouseDown(e) {
        if (this.ball.isMoving) return;
        
        const mousePos = this.getMousePos(e);
        
        // Check basketball click first (highest priority)
        if (this.isPointInBall(mousePos.x, mousePos.y)) {
            this.isDragging = true;
            this.dragStart = { x: mousePos.x, y: mousePos.y };
            return;
        }
        
        // Check if clicking on reference dot (only if it's visible)
        const deltaX = this.hoop.x + (this.hoop.width / 2) - this.ball.originalX;
        const refDotX = this.ball.originalX + (deltaX / 3);
        const refDotY = this.ball.originalY;
        const refDotDistance = Math.sqrt((mousePos.x - refDotX) ** 2 + (mousePos.y - refDotY) ** 2);
        
        // Reference dot is always visible, so check it
        if (refDotDistance <= 8) { // 8 pixel radius for easier clicking
            // Only teleport if ball is not already at reference dot position
            if (Math.abs(this.ball.x - refDotX) > 5 || Math.abs(this.ball.y - refDotY) > 5) {
                this.ball.x = refDotX;
                this.ball.y = refDotY;
                // Update current reset position when teleporting
                this.ball.currentResetX = refDotX;
                this.ball.currentResetY = refDotY;
            }
            return;
        }
        
        // Check if clicking on second reference dot (two-thirds position)
        const refDot2X = this.ball.originalX + (deltaX * 2 / 3);
        const refDot2Y = this.ball.originalY;
        const refDot2Distance = Math.sqrt((mousePos.x - refDot2X) ** 2 + (mousePos.y - refDot2Y) ** 2);
        
        // Second reference dot is always visible, so check it
        if (refDot2Distance <= 8) { // 8 pixel radius for easier clicking
            // Only teleport if ball is not already at second reference dot position
            if (Math.abs(this.ball.x - refDot2X) > 5 || Math.abs(this.ball.y - refDot2Y) > 5) {
                this.ball.x = refDot2X;
                this.ball.y = refDot2Y;
                // Update current reset position when teleporting
                this.ball.currentResetX = refDot2X;
                this.ball.currentResetY = refDot2Y;
            }
            return;
        }
        
        // Check if clicking on center dot (only if it's visible - ball not at original position)
        const isAtOriginal = Math.abs(this.ball.x - this.ball.originalX) < 5 && Math.abs(this.ball.y - this.ball.originalY) < 5;
        if (!isAtOriginal) {
            const centerDotDistance = Math.sqrt((mousePos.x - this.ball.x) ** 2 + (mousePos.y - this.ball.y) ** 2);
            
            if (centerDotDistance <= 8) { // 8 pixel radius for easier clicking
                // Only teleport if ball is not already at original position
                if (Math.abs(this.ball.x - this.ball.originalX) > 5 || Math.abs(this.ball.y - this.ball.originalY) > 5) {
                    this.ball.x = this.ball.originalX;
                    this.ball.y = this.ball.originalY;
                    // Update current reset position when teleporting
                    this.ball.currentResetX = this.ball.originalX;
                    this.ball.currentResetY = this.ball.originalY;
                }
                return;
            }
        }
        
        // Check if clicking on starting position dot (only if it's visible - ball not at starting position)
        const isAtStartingPosition = Math.abs(this.ball.x - this.ball.originalX) < 5 && Math.abs(this.ball.y - this.ball.originalY) < 5;
        if (!isAtStartingPosition) {
            const startingDotDistance = Math.sqrt((mousePos.x - this.ball.originalX) ** 2 + (mousePos.y - this.ball.originalY) ** 2);
            
            if (startingDotDistance <= 8) { // 8 pixel radius for easier clicking
                // Only teleport if ball is not already at starting position
                if (Math.abs(this.ball.x - this.ball.originalX) > 5 || Math.abs(this.ball.y - this.ball.originalY) > 5) {
                    this.ball.x = this.ball.originalX;
                    this.ball.y = this.ball.originalY;
                    // Update current reset position when teleporting
                    this.ball.currentResetX = this.ball.originalX;
                    this.ball.currentResetY = this.ball.originalY;
                }
                return;
            }
        }
    }
    
    handleMouseMove(e) {
        const mousePos = this.getMousePos(e);
        this.mouse = mousePos;
        
        if (this.isDragging && !this.ball.isMoving) {
            // Keep ball in place, just update mouse position for arrow
        }
    }
    
    handleMouseUp(e) {
        if (this.isDragging && !this.ball.isMoving) {
            this.shootBall();
        }
        this.isDragging = false;
    }
    
    shootBall() {
        const dx = this.dragStart.x - this.mouse.x;
        const dy = this.dragStart.y - this.mouse.y;
        
        // Update the current reset position to where the ball is being shot from
        this.ball.currentResetX = this.ball.x;
        this.ball.currentResetY = this.ball.y;
        
        // Calculate power based on distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        const power = Math.min(distance / 6, 25); // Increased power and max limit
        
        // Calculate angle
        const angle = Math.atan2(dy, dx);
        
        // Set ball velocity
        this.ball.vx = Math.cos(angle) * power;
        this.ball.vy = Math.sin(angle) * power;
        this.ball.isMoving = true;
    }
    
    updateBall() {
        if (!this.ball.isMoving) return;
        
        // Apply gravity
        this.ball.vy += this.gravity;
        
        // Update position
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        
        // Apply air resistance
        this.ball.vx *= this.friction;
        
        // Check backboard collision
        this.checkBackboardCollision();
        
        // Check rim collision
        this.checkRimCollision();
        
        // Check boundaries - reset ball if it hits left or right walls
        if (this.ball.x < this.ball.radius || this.ball.x > this.canvas.width - this.ball.radius) {
            this.resetBall();
        }
        
        // Check if ball hits the ground
        if (this.ball.y > this.canvas.height - this.ball.radius) {
            this.resetBall();
        }
        
        // Check if ball scores
        this.checkScore();
        
        // Update special effects
        this.updateParticles();
        this.updateScreenShake();
        this.updateScoreMessage();
        this.updateFlashEffect();
        this.updateNetAnimation();
    }
    
    checkScore() {
        const ballBottom = this.ball.y + this.ball.radius;
        const ballTop = this.ball.y - this.ball.radius;
        const ballLeft = this.ball.x - this.ball.radius;
        const ballRight = this.ball.x + this.ball.radius;
        
        // More precise scoring - ball must go through the actual hoop opening
        // Add margin to make the hoop opening smaller than the visual rim
        const hoopMargin = 10; // Makes the scoring area smaller than the visual rim
        const hoopLeftEdge = this.hoop.x + hoopMargin;
        const hoopRightEdge = this.hoop.x + this.hoop.width - hoopMargin;
        
        // Check if ball is going through the hoop opening (not hitting the rim)
        if (!this.ball.scored && // Only score once per shot
            ballRight > hoopLeftEdge && 
            ballLeft < hoopRightEdge &&
            ballTop < this.hoop.rimY && 
            ballBottom > this.hoop.rimY &&
            this.ball.vy > 0 && // Ball must be falling down
            this.ball.x > hoopLeftEdge && // Ball center must be within hoop opening
            this.ball.x < hoopRightEdge) {
            
            this.score++;
            this.scoreElement.textContent = this.score;
            
            // Reset miss counter on successful shot
            this.missCounter = 0;
            
            // Mark ball as scored and start timer
            this.ball.scored = true;
            this.ball.scoreTime = Date.now();
            
            // Check for new high score
            const isNewHighScore = this.updateHighScore();
            
            // Trigger special effects
            this.triggerScoreEffects(isNewHighScore);
        }
        
        // Reset ball after it has fallen through the hoop (1 second delay)
        if (this.ball.scored && Date.now() - this.ball.scoreTime > 1000) {
            this.resetBall();
        }
    }
    
    triggerScoreEffects(isNewHighScore = false) {
        // Create particle explosion
        this.createParticleExplosion(this.hoop.x + this.hoop.width / 2, this.hoop.rimY + 10);
        
        // Trigger screen shake (more intense for high score)
        this.screenShake.intensity = isNewHighScore ? 8 : 5;
        this.screenShake.duration = isNewHighScore ? 500 : 300; // milliseconds
        
        // Show score message
        this.scoreMessage.text = isNewHighScore ? 'NEW HIGH SCORE!' : this.getRandomScoreText();
        this.scoreMessage.opacity = 1;
        this.scoreMessage.y = this.hoop.y - 50;
        this.scoreMessage.timer = 0;
        
        // Flash effect (more intense for high score)
        this.flashEffect.opacity = isNewHighScore ? 0.5 : 0.3;
        this.flashEffect.color = isNewHighScore ? '#FFD700' : '#FFD700';
        
        // Net animation
        this.netAnimation.intensity = isNewHighScore ? 12 : 8;
        this.netAnimation.duration = isNewHighScore ? 800 : 500;
        
        // Extra particles for high score
        if (isNewHighScore) {
            this.createParticleExplosion(this.hoop.x + this.hoop.width / 2, this.hoop.rimY + 10);
        }
    }
    
    getRandomScoreText() {
        const messages = [
            "SWISH!", "NICE SHOT!", "BOOM!", "PERFECT!", 
            "AMAZING!", "FANTASTIC!", "INCREDIBLE!", "AWESOME!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    createParticleExplosion(x, y) {
        const numParticles = 15;
        const colors = ['#FFD700', '#FF6B35', '#F7931E', '#FFE135', '#C7F464'];
        
        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            
            // Update life
            particle.life -= particle.decay;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateScreenShake() {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= 16; // Assuming 60fps
            const intensity = this.screenShake.intensity * (this.screenShake.duration / 300);
            this.screenShake.x = (Math.random() - 0.5) * intensity;
            this.screenShake.y = (Math.random() - 0.5) * intensity;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
        }
    }
    
    updateScoreMessage() {
        if (this.scoreMessage.opacity > 0) {
            this.scoreMessage.timer += 16;
            this.scoreMessage.y -= 0.5; // Float upward
            
            // Fade out after 1 second
            if (this.scoreMessage.timer > 1000) {
                this.scoreMessage.opacity -= 0.02;
            }
            
            if (this.scoreMessage.opacity <= 0) {
                this.scoreMessage.text = '';
            }
        }
    }
    
    updateFlashEffect() {
        if (this.flashEffect.opacity > 0) {
            this.flashEffect.opacity -= 0.015;
        }
    }
    
    updateNetAnimation() {
        if (this.netAnimation.duration > 0) {
            this.netAnimation.duration -= 16;
            this.netAnimation.intensity = Math.max(0, this.netAnimation.intensity * 0.95);
        }
    }
    
    checkBackboardCollision() {
        const ballRight = this.ball.x + this.ball.radius;
        const ballLeft = this.ball.x - this.ball.radius;
        const ballTop = this.ball.y - this.ball.radius;
        const ballBottom = this.ball.y + this.ball.radius;
        
        const backboard = this.hoop.backboard;
        
        // Check if ball is colliding with the backboard
        if (ballRight > backboard.x && 
            ballLeft < backboard.x + backboard.width &&
            ballBottom > backboard.y && 
            ballTop < backboard.y + backboard.height) {
            
            // Ball is hitting the backboard from the left side
            if (this.ball.vx > 0) {
                this.ball.x = backboard.x - this.ball.radius;
                this.ball.vx *= -0.8; // Bounce with some energy loss
            }
        }
    }
    
    checkRimCollision() {
        const ballBottom = this.ball.y + this.ball.radius;
        const ballTop = this.ball.y - this.ball.radius;
        const ballLeft = this.ball.x - this.ball.radius;
        const ballRight = this.ball.x + this.ball.radius;
        
        const rimThickness = 4; // Thickness of the rim
        const rimY = this.hoop.rimY;
        const rimLeft = this.hoop.x;
        const rimRight = this.hoop.x + this.hoop.width;
        
        // Define the solid parts of the rim (left and right edges)
        const leftRimEnd = this.hoop.x + 1; // Left solid part
        const rightRimStart = this.hoop.x + this.hoop.width - 1; // Right solid part
        
        // Check collision with left rim edge
        if (ballRight > rimLeft && 
            ballLeft < leftRimEnd &&
            ballBottom > rimY && 
            ballTop < rimY + rimThickness) {
            
            // Bounce off left rim
            if (this.ball.vy > 0) { // Ball coming from above
                this.ball.vy *= -0.6;
                this.ball.y = rimY - this.ball.radius;
            }
            if (this.ball.vx > 0) { // Ball moving right, bounce left
                this.ball.vx *= -0.7;
            }
        }
        
        // Check collision with right rim edge
        if (ballRight > rightRimStart && 
            ballLeft < rimRight &&
            ballBottom > rimY && 
            ballTop < rimY + rimThickness) {
            
            // Bounce off right rim
            if (this.ball.vy > 0) { // Ball coming from above
                this.ball.vy *= -0.6;
                this.ball.y = rimY - this.ball.radius;
            }
            if (this.ball.vx < 0) { // Ball moving left, bounce right
                this.ball.vx *= -0.7;
            }
        }
    }
    
    resetBall() {
        // Increment miss counter only if ball didn't score
        if (!this.ball.scored) {
            this.missCounter++;
            
            // Every 3 misses, remove a point from the score
            if (this.missCounter >= 3 && this.score > 0) {
                this.score--;
                this.scoreElement.textContent = this.score;
                this.missCounter = 0; // Reset the miss counter
                
                // Show penalty message
                this.showPenaltyMessage();
            }
        }
        
        // Save high score before resetting
        this.updateHighScore();
        
        // Reset to the position where the ball was shot from, not always the original position
        this.ball.x = this.ball.currentResetX;
        this.ball.y = this.ball.currentResetY;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.isMoving = false;
        this.ball.scored = false;    // Reset scored flag
        this.ball.scoreTime = 0;     // Reset score timer
        this.isDragging = false;
    }
    
    showPenaltyMessage() {
        // Show penalty message
        this.scoreMessage.text = 'PENALTY: -1 POINT!';
        this.scoreMessage.opacity = 1;
        this.scoreMessage.y = this.canvas.height / 2;
        this.scoreMessage.timer = 0;
        
        // Flash effect for penalty
        this.flashEffect.opacity = 0.3;
        this.flashEffect.color = '#FF4444'; // Red flash for penalty
    }

    drawBall() {
        this.ctx.save();
        
        // Basketball body
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Basketball lines
        this.ctx.beginPath();
        this.ctx.moveTo(this.ball.x - this.ball.radius, this.ball.y);
        this.ctx.lineTo(this.ball.x + this.ball.radius, this.ball.y);
        this.ctx.moveTo(this.ball.x, this.ball.y - this.ball.radius);
        this.ctx.lineTo(this.ball.x, this.ball.y + this.ball.radius);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawHoop() {
        this.ctx.save();
        
        // Pole/Stand connecting to ground
        const poleX = this.hoop.x + this.hoop.width - 5; // Moved 5 more pixels to the left
        const poleWidth = 8;
        const poleHeight = (this.canvas.height - (this.hoop.y + this.hoop.height)) * 0.75; // Reduced by 1/4
        
        this.ctx.fillStyle = '#808080'; // Gray color for pole
        this.ctx.fillRect(poleX, this.hoop.y + this.hoop.height, poleWidth, poleHeight);
        this.ctx.strokeStyle = '#404040'; // Darker gray for outline
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(poleX, this.hoop.y + this.hoop.height, poleWidth, poleHeight);
        
        // Backboard
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(this.hoop.x + this.hoop.width - 10, this.hoop.y - 20, 15, this.hoop.height + 20);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.hoop.x + this.hoop.width - 10, this.hoop.y - 20, 15, this.hoop.height + 20);
        
        // Hoop rim
        this.ctx.beginPath();
        this.ctx.moveTo(this.hoop.x, this.hoop.rimY);
        this.ctx.lineTo(this.hoop.x + this.hoop.width, this.hoop.rimY);
        this.ctx.strokeStyle = '#FF4500';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        // Net (with animation)
        for (let i = 0; i < 6; i++) {
            const x = this.hoop.x + (i * this.hoop.width / 5);
            const netSwing = Math.sin(Date.now() * 0.01 + i) * 3;
            const animationSwing = Math.sin(Date.now() * 0.02 + i) * this.netAnimation.intensity;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.hoop.rimY);
            this.ctx.lineTo(x + netSwing + animationSwing, this.hoop.rimY + 20 + this.netAnimation.intensity);
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawAimingArrow() {
        if (!this.isDragging || this.ball.isMoving) return;
        
        const dx = this.dragStart.x - this.mouse.x;
        const dy = this.dragStart.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) return; // Don't show arrow for very small movements
        
        // Calculate direction (same as trajectory line for consistency)
        const angle = Math.atan2(dy, dx);
        const arrowLength = Math.min(distance * 0.8, 100);
        
        const arrowX = this.ball.x + Math.cos(angle) * arrowLength;
        const arrowY = this.ball.y + Math.sin(angle) * arrowLength;
        
        this.ctx.save();
        
        // Calculate power for visual feedback
        const power = Math.min(distance / 6, 25);
        const powerRatio = power / 25; // Normalize to 0-1
        
        // Arrow shaft width based on power
        const shaftWidth = 4 + powerRatio * 8; // 4-12 pixels wide
        
        // Create gradient for the arrow
        const gradient = this.ctx.createLinearGradient(
            this.ball.x, this.ball.y, arrowX, arrowY
        );
        gradient.addColorStop(0, `rgba(255, 0, 0, 0.8)`);
        gradient.addColorStop(0.5, `rgba(255, 100, 0, 0.9)`);
        gradient.addColorStop(1, `rgba(255, 150, 0, 1)`);
        
        // Draw arrow shaft as a thick line with rounded ends
        this.ctx.beginPath();
        this.ctx.moveTo(this.ball.x, this.ball.y);
        this.ctx.lineTo(arrowX, arrowY);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = shaftWidth;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        
        // Calculate arrow head size based on power
        const headSize = 15 + powerRatio * 10; // 15-25 pixels
        const headWidth = 8 + powerRatio * 6; // 8-14 pixels
        
        // Draw 2D arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        
        // Left side of arrow head
        this.ctx.lineTo(
            arrowX - headSize * Math.cos(angle - 0.4) - headWidth * Math.sin(angle),
            arrowY - headSize * Math.sin(angle - 0.4) + headWidth * Math.cos(angle)
        );
        
        // Back of arrow head (creates the base)
        this.ctx.lineTo(
            arrowX - (headSize * 0.6) * Math.cos(angle),
            arrowY - (headSize * 0.6) * Math.sin(angle)
        );
        
        // Right side of arrow head
        this.ctx.lineTo(
            arrowX - headSize * Math.cos(angle + 0.4) + headWidth * Math.sin(angle),
            arrowY - headSize * Math.sin(angle + 0.4) - headWidth * Math.cos(angle)
        );
        
        this.ctx.closePath();
        
        // Fill the arrow head with gradient
        const headGradient = this.ctx.createRadialGradient(
            arrowX, arrowY, 0, arrowX, arrowY, headSize
        );
        headGradient.addColorStop(0, `rgba(255, 200, 0, 1)`);
        headGradient.addColorStop(1, `rgba(255, 0, 0, 0.8)`);
        
        this.ctx.fillStyle = headGradient;
        this.ctx.fill();
        
        // Add a darker outline to the arrow head
        this.ctx.strokeStyle = 'rgba(150, 0, 0, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Add power indicator (small circles along the shaft)
        const numIndicators = Math.floor(powerRatio * 5) + 1;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        for (let i = 1; i <= numIndicators; i++) {
            const indicatorRatio = i / (numIndicators + 1);
            const indicatorX = this.ball.x + Math.cos(angle) * arrowLength * indicatorRatio;
            const indicatorY = this.ball.y + Math.sin(angle) * arrowLength * indicatorRatio;
            
            this.ctx.beginPath();
            this.ctx.arc(indicatorX, indicatorY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawTrajectory() {
        if (!this.isDragging || this.ball.isMoving || !this.showTrajectory) return;
        
        const dx = this.dragStart.x - this.mouse.x;
        const dy = this.dragStart.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) return;
        
        // Calculate initial velocity (same as shootBall function)
        const power = Math.min(distance / 6, 25);
        const angle = Math.atan2(dy, dx);
        const vx = Math.cos(angle) * power;
        const vy = Math.sin(angle) * power;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.35;
        
        // Simulate trajectory
        let x = this.ball.x;
        let y = this.ball.y;
        let velX = vx;
        let velY = vy;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
        let lastX = x;
        let lastY = y;
        
        // Draw trajectory points
        for (let i = 0; i < 100; i++) {
            // Apply physics simulation
            velY += this.gravity;
            velX *= this.friction;
            
            x += velX;
            y += velY;
            
            // Stop if ball goes off screen or hits ground
            if (x < 0 || x > this.canvas.width || y > this.canvas.height - 20) {
                break;
            }
            
            // Draw point every few iterations for better visibility
            if (i % 3 === 0) {
                this.ctx.lineTo(x, y);
                lastX = x;
                lastY = y;
            }
        }
        
        this.ctx.stroke();
        
        // Draw arrow at the end of trajectory
        if (lastX !== this.ball.x || lastY !== this.ball.y) {
            const arrowSize = 8;
            const trajectoryAngle = Math.atan2(velY, velX);
            
            this.ctx.beginPath();
            this.ctx.moveTo(lastX, lastY);
            this.ctx.lineTo(
                lastX - arrowSize * Math.cos(trajectoryAngle - 0.5),
                lastY - arrowSize * Math.sin(trajectoryAngle - 0.5)
            );
            this.ctx.moveTo(lastX, lastY);
            this.ctx.lineTo(
                lastX - arrowSize * Math.cos(trajectoryAngle + 0.5),
                lastY - arrowSize * Math.sin(trajectoryAngle + 0.5)
            );
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawParticles() {
        this.ctx.save();
        
        for (const particle of this.particles) {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawScoreMessage() {
        if (this.scoreMessage.opacity <= 0) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = this.scoreMessage.opacity;
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.strokeStyle = '#FF6B35';
        this.ctx.lineWidth = 3;
        this.ctx.textAlign = 'center';
        
        // Add text shadow effect
        this.ctx.fillText(this.scoreMessage.text, this.hoop.x + this.hoop.width / 2 + 2, this.scoreMessage.y + 2);
        this.ctx.strokeText(this.scoreMessage.text, this.hoop.x + this.hoop.width / 2, this.scoreMessage.y);
        this.ctx.fillText(this.scoreMessage.text, this.hoop.x + this.hoop.width / 2, this.scoreMessage.y);
        
        this.ctx.restore();
    }
    
    drawFlashEffect() {
        if (this.flashEffect.opacity <= 0) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = this.flashEffect.opacity;
        this.ctx.fillStyle = this.flashEffect.color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }
    
    drawReferenceDot() {
        // Calculate position one-third between basketball and hoop
        const deltaX = this.hoop.x + (this.hoop.width / 2) - this.ball.originalX;
        const dotX = this.ball.originalX + (deltaX / 3);
        const dotY = this.ball.originalY; // Same level as the basketball
        
        this.ctx.save();
        
        // Draw the reference dot with teleportation visual cue
        this.ctx.beginPath();
        this.ctx.arc(dotX, dotY, 5, 0, Math.PI * 2); // Slightly larger for better clicking
        this.ctx.fillStyle = 'rgba(100, 200, 255, 0.9)'; // Light blue to indicate it's special
        this.ctx.fill();
        
        // Add a glowing outline
        this.ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Add inner highlight
        this.ctx.beginPath();
        this.ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawSecondReferenceDot() {
        // Calculate position two-thirds between basketball and hoop
        const deltaX = this.hoop.x + (this.hoop.width / 2) - this.ball.originalX;
        const dotX = this.ball.originalX + (deltaX * 2 / 3);
        const dotY = this.ball.originalY; // Same level as the basketball
        
        this.ctx.save();
        
        // Draw the second reference dot with teleportation visual cue
        this.ctx.beginPath();
        this.ctx.arc(dotX, dotY, 5, 0, Math.PI * 2); // Slightly larger for better clicking
        this.ctx.fillStyle = 'rgba(255, 200, 100, 0.9)'; // Light orange to distinguish from first reference dot
        this.ctx.fill();
        
        // Add a glowing outline
        this.ctx.strokeStyle = 'rgba(255, 150, 0, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Add inner highlight
        this.ctx.beginPath();
        this.ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawCenterDot() {
        // Draw a dot at the center of the basketball (only if ball is not at original position)
        const isAtOriginal = Math.abs(this.ball.x - this.ball.originalX) < 5 && Math.abs(this.ball.y - this.ball.originalY) < 5;
        
        if (!isAtOriginal) {
            this.ctx.save();
            
            // Draw the center dot with teleportation visual cue
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, 5, 0, Math.PI * 2); // Slightly larger for better clicking
            this.ctx.fillStyle = 'rgba(255, 100, 100, 0.9)'; // Light red to indicate it's special
            this.ctx.fill();
            
            // Add a glowing outline
            this.ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Add inner highlight
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    drawStartingPositionDot() {
        // Draw a dot at the starting position (only if ball is not there)
        const isAtStartingPosition = Math.abs(this.ball.x - this.ball.originalX) < 5 && Math.abs(this.ball.y - this.ball.originalY) < 5;
        
        if (!isAtStartingPosition) {
            this.ctx.save();
            
            // Draw the starting position dot with teleportation visual cue
            this.ctx.beginPath();
            this.ctx.arc(this.ball.originalX, this.ball.originalY, 5, 0, Math.PI * 2); // Slightly larger for better clicking
            this.ctx.fillStyle = 'rgba(100, 255, 100, 0.9)'; // Light green to indicate starting position
            this.ctx.fill();
            
            // Add a glowing outline
            this.ctx.strokeStyle = 'rgba(50, 200, 50, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Add inner highlight
            this.ctx.beginPath();
            this.ctx.arc(this.ball.originalX, this.ball.originalY, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply screen shake
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        // Draw game elements
        this.drawHoop();
        this.drawBall();
        this.drawCenterDot();
        this.drawReferenceDot();
        this.drawSecondReferenceDot();
        this.drawStartingPositionDot();
        this.drawTrajectory();
        this.drawAimingArrow();
        this.drawParticles();
        this.drawScoreMessage();
        
        this.ctx.restore();
        
        // Draw flash effect (outside screen shake)
        this.drawFlashEffect();
    }
    
    gameLoop() {
        this.updateBall();
        this.updateParticles();
        this.updateScreenShake();
        this.updateScoreMessage();
        this.updateFlashEffect();
        this.updateNetAnimation();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    loadHighScore() {
        const savedHighScore = localStorage.getItem('basketballHighScore');
        const highScore = savedHighScore ? parseInt(savedHighScore) : 0;
        this.updateHighScoreDisplay(highScore);
        return highScore;
    }
    
    saveHighScore() {
        localStorage.setItem('basketballHighScore', this.highScore.toString());
    }
    
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.updateHighScoreDisplay(this.highScore);
            this.saveHighScore();
            return true; // New high score achieved
        }
        return false;
    }
    
    updateHighScoreDisplay(score) {
        if (this.highScoreElement) {
            this.highScoreElement.textContent = score;
        }
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BasketballGame();
});
