// Pi Question Game JavaScript

// Game state
let currentLevel = 1;

// Level configuration
const levels = {
    1: {
        question: "What are the first three digits of Pi?",
        correctAnswers: ["314", "3.14"],
        successMessage: "🎉 Correct! The first three digits of Pi are 3.14"
    },
    2: {
        question: "What are the first 10 digits of Pi?",
        correctAnswers: ["3141592653", "3.141592653"],
        successMessage: "🎉 Amazing! The first 10 digits of Pi are 3.141592653"
    }
};

// Function to check the user's answer
function checkAnswer() {
    const userAnswer = document.getElementById('answerInput').value.trim();
    const resultDiv = document.getElementById('result');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    
    // Clear previous result
    resultDiv.classList.remove('show', 'correct', 'incorrect');
    nextLevelBtn.style.display = 'none';
    nextLevelBtn.classList.remove('show');
    
    // Check if input is empty
    if (!userAnswer) {
        showResult("Please enter an answer!", 'incorrect');
        return;
    }
    
    // Get current level configuration
    const levelConfig = levels[currentLevel];
    
    // Check if the answer is correct
    if (levelConfig.correctAnswers.includes(userAnswer)) {
        showResult(levelConfig.successMessage, 'correct');
        celebrateCorrectAnswer();
        
        // Show next level button if not on the last level
        if (currentLevel < Object.keys(levels).length) {
            setTimeout(() => {
                nextLevelBtn.style.display = 'flex';
                setTimeout(() => {
                    nextLevelBtn.classList.add('show');
                }, 50);
            }, 1000);
        }
    } else {
        const correctAnswer = levelConfig.correctAnswers[1] || levelConfig.correctAnswers[0];
        showResult(`❌ Incorrect. The correct answer is ${correctAnswer} (you entered: ${userAnswer})`, 'incorrect');
    }
}

// Function to go to the next level
function nextLevel() {
    currentLevel++;
    const levelConfig = levels[currentLevel];
    
    if (levelConfig) {
        // Update UI for new level
        document.getElementById('levelIndicator').textContent = `Level ${currentLevel}`;
        document.getElementById('question').textContent = levelConfig.question;
        document.getElementById('answerInput').value = '';
        document.getElementById('result').classList.remove('show', 'correct', 'incorrect');
        document.getElementById('nextLevelBtn').style.display = 'none';
        document.getElementById('nextLevelBtn').classList.remove('show');
        
        // Reset digit counter
        updateDigitCounter();
        
        // Focus on input
        document.getElementById('answerInput').focus();
    }
}

// Function to display the result
function showResult(message, type) {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = message;
    resultDiv.classList.add(type);
    
    // Trigger animation
    setTimeout(() => {
        resultDiv.classList.add('show');
    }, 50);
}

// Function to add celebration effects for correct answers
function celebrateCorrectAnswer() {
    // Add a subtle shake animation to the container
    const container = document.querySelector('.game-container');
    container.style.animation = 'celebrate 0.5s ease-in-out';
    
    // Remove animation after it completes
    setTimeout(() => {
        container.style.animation = '';
    }, 500);
}

// Function to count digits (excluding periods)
function countDigits(text) {
    return text.replace(/\./g, '').length;
}

// Function to update the digit counter
function updateDigitCounter() {
    const input = document.getElementById('answerInput');
    const counter = document.getElementById('digitCounter');
    const digitCount = countDigits(input.value);
    counter.textContent = digitCount;
}

// Function to go back to the portfolio
function goBack() {
    window.location.href = '../index.html';
}

// Add event listener for Enter key and input changes
document.getElementById('answerInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

// Add event listener for input changes to update counter
document.getElementById('answerInput').addEventListener('input', updateDigitCounter);

// Focus on input when page loads
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('answerInput').focus();
    updateDigitCounter(); // Initialize counter
});

// Add CSS animation for celebration
const style = document.createElement('style');
style.textContent = `
    @keyframes celebrate {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(style);
