class BasketballGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.trajectoryToggle = document.getElementById('trajectoryToggle');
        
        // Game state
        this.score = 0;
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
            isMoving: false
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
        if (this.isPointInBall(mousePos.x, mousePos.y)) {
            this.isDragging = true;
            this.dragStart = { x: mousePos.x, y: mousePos.y };
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
        if (ballRight > hoopLeftEdge && 
            ballLeft < hoopRightEdge &&
            ballTop < this.hoop.rimY && 
            ballBottom > this.hoop.rimY &&
            this.ball.vy > 0 && // Ball must be falling down
            this.ball.x > hoopLeftEdge && // Ball center must be within hoop opening
            this.ball.x < hoopRightEdge) {
            
            this.score++;
            this.scoreElement.textContent = this.score;
            
            // Trigger special effects
            this.triggerScoreEffects();
            
            this.resetBall();
        }
    }
    
    triggerScoreEffects() {
        // Create particle explosion
        this.createParticleExplosion(this.hoop.x + this.hoop.width / 2, this.hoop.rimY + 10);
        
        // Trigger screen shake
        this.screenShake.intensity = 5;
        this.screenShake.duration = 300; // milliseconds
        
        // Show score message
        this.scoreMessage.text = this.getRandomScoreText();
        this.scoreMessage.opacity = 1;
        this.scoreMessage.y = this.hoop.y - 50;
        this.scoreMessage.timer = 0;
        
        // Flash effect
        this.flashEffect.opacity = 0.3;
        
        // Net animation
        this.netAnimation.intensity = 8;
        this.netAnimation.duration = 500;
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
        const leftRimEnd = this.hoop.x + 5; // Left solid part
        const rightRimStart = this.hoop.x + this.hoop.width - 5; // Right solid part
        
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
        this.ball.x = this.ball.originalX;
        this.ball.y = this.ball.originalY;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.isMoving = false;
        this.isDragging = false;
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
        
        const dx = this.mouse.x - this.ball.x;
        const dy = this.mouse.y - this.ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) return; // Don't show arrow for very small movements
        
        // Calculate opposite direction
        const angle = Math.atan2(-dy, -dx);
        const arrowLength = Math.min(distance * 0.8, 100);
        
        const arrowX = this.ball.x + Math.cos(angle) * arrowLength;
        const arrowY = this.ball.y + Math.sin(angle) * arrowLength;
        
        this.ctx.save();
        
        // Arrow line
        this.ctx.beginPath();
        this.ctx.moveTo(this.ball.x, this.ball.y);
        this.ctx.lineTo(arrowX, arrowY);
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Arrow head
        const headSize = 15;
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(
            arrowX - headSize * Math.cos(angle - 0.5),
            arrowY - headSize * Math.sin(angle - 0.5)
        );
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(
            arrowX - headSize * Math.cos(angle + 0.5),
            arrowY - headSize * Math.sin(angle + 0.5)
        );
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
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
        this.ctx.setLineDash([5, 5]); // Dashed line
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.7;
        
        // Simulate trajectory
        let x = this.ball.x;
        let y = this.ball.y;
        let velX = vx;
        let velY = vy;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
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
            }
        }
        
        this.ctx.stroke();
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
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply screen shake
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        // Draw game elements
        this.drawHoop();
        this.drawBall();
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
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BasketballGame();
});
