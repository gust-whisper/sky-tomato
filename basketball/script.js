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
            this.resetBall();
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
        
        // Net
        for (let i = 0; i < 6; i++) {
            const x = this.hoop.x + (i * this.hoop.width / 5);
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.hoop.rimY);
            this.ctx.lineTo(x + Math.sin(Date.now() * 0.01 + i) * 3, this.hoop.rimY + 20);
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
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw game elements
        this.drawHoop();
        this.drawBall();
        this.drawTrajectory();
        this.drawAimingArrow();
    }
    
    gameLoop() {
        this.updateBall();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BasketballGame();
});
