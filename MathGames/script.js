// Pi Question Game JavaScript

// Game state
let currentLevel = 1;
let levelStartInput = ''; // Store the input value when level starts
let isLevelTransitioning = false; // Prevent actions during level transitions

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
    },
    3: {
        question: "What are the first 25 digits of Pi?",
        correctAnswers: ["3141592653589793238462643", "3.141592653589793238462643"],
        successMessage: "🎉 Incredible! You've mastered the first 25 digits of Pi: 3.141592653589793238462643"
    },
    4: {
        question: "What are the first 50 digits of Pi?",
        correctAnswers: ["31415926535897932384626433832795028841971693993751", "3.1415926535897932384626433832795028841971693993751"],
        successMessage: "🎉 Outstanding! You've conquered the first 50 digits of Pi: 3.1415926535897932384626433832795028841971693993751"
    },
    5: {
        question: "What are the first 75 digits of Pi?",
        correctAnswers: ["314159265358979323846264338327950288419716939937510582097494459230781640628", "3.14159265358979323846264338327950288419716939937510582097494459230781640628"],
        successMessage: "🎉 Exceptional! You've mastered the first 75 digits of Pi: 3.14159265358979323846264338327950288419716939937510582097494459230781640628"
    },
    6: {
        question: "What are the first 100 digits of Pi?",
        correctAnswers: ["3141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067", "3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067"],
        successMessage: "🎉 LEGENDARY! You are a Pi master with 100 digits: 3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067"
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
            isLevelTransitioning = true; // Start transition
            setTimeout(() => {
                nextLevelBtn.style.display = 'flex';
                setTimeout(() => {
                    nextLevelBtn.classList.add('show');
                    isLevelTransitioning = false; // Transition complete
                }, 50);
            }, 1000);
        }
    } else {
        // Revert input to what it was when level started
        document.getElementById('answerInput').value = levelStartInput;
        updateDigitCounter();
        showResult(`❌ Incorrect. Try again!`, 'incorrect');
    }
}

// Function to go to the next level
function nextLevel() {
    if (isLevelTransitioning) return; // Prevent multiple calls during transition
    
    isLevelTransitioning = true;
    currentLevel++;
    const levelConfig = levels[currentLevel];
    
    if (levelConfig) {
        // Update UI for new level
        document.getElementById('levelIndicator').textContent = `Level ${currentLevel}`;
        document.getElementById('question').textContent = levelConfig.question;
        // Don't clear the input - keep the previous answer so user can continue typing
        document.getElementById('result').classList.remove('show', 'correct', 'incorrect');
        document.getElementById('nextLevelBtn').style.display = 'none';
        document.getElementById('nextLevelBtn').classList.remove('show');
        
        // Store the current input as the level start input
        levelStartInput = document.getElementById('answerInput').value;
        
        // Update digit counter with current input
        updateDigitCounter();
        
        // Focus on input and move cursor to end
        const input = document.getElementById('answerInput');
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        
        // Allow transitions again after UI updates
        setTimeout(() => {
            isLevelTransitioning = false;
        }, 100);
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

// Function to go back to the Math Games hub
function goBack() {
    window.location.href = 'index.html';
}

// Add event listener for Enter key and input changes
document.getElementById('answerInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        // Prevent actions during level transitions
        if (isLevelTransitioning) {
            return;
        }
        
        // Check if next level button is visible
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        if (nextLevelBtn.style.display === 'flex' && nextLevelBtn.classList.contains('show')) {
            // If next level button is visible, go to next level
            nextLevel();
        } else {
            // Otherwise, check the answer
            checkAnswer();
        }
    }
});

// Add event listener for input changes to update counter
document.getElementById('answerInput').addEventListener('input', updateDigitCounter);

// Focus on input when page loads
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('answerInput').focus();
    updateDigitCounter(); // Initialize counter
    levelStartInput = document.getElementById('answerInput').value; // Initialize level start input
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
