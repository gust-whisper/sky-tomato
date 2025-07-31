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
    },
    7: {
        question: "🏆 CONGRATULATIONS! 🏆\n\n🎉🎊 ULTIMATE PI MASTER! 🎊🎉\n\nYou have achieved the impossible and memorized 100+ digits of Pi!\n\n(And shame on anyone who just searched up 100 digits of pi and copy-pasted it into the bar to win this game... you know who you are! 😏)\n\nYou are now officially a Pi legend! 🥧✨",
        correctAnswers: [], // No specific answers needed for this level
        successMessage: "🎉🎊 ULTIMATE PI MASTER! 🎊🎉\n\nYou have achieved the impossible and memorized 100+ digits of Pi!\n\n(And shame on anyone who just searched up 100 digits of pi and copy-pasted it into the bar to win this game... you know who you are! 😏)\n\nYou are now officially a Pi legend! 🥧✨"
    }
};

// Function to check if the user has enough digits to pass the current level
function hasPassedCurrentLevel(digitCount, currentLevel) {
    const requirements = {
        1: 3,   // Level 1 requires exactly 3 digits
        2: 10,  // Level 2 requires exactly 10 digits
        3: 25,  // Level 3 requires exactly 25 digits
        4: 50,  // Level 4 requires exactly 50 digits
        5: 75,  // Level 5 requires exactly 75 digits
        6: 100, // Level 6 requires exactly 100 digits
        7: 0    // Level 7 is congratulations, no requirement
    };
    
    return digitCount >= requirements[currentLevel];
}

// Function to determine what level the user should advance to based on digit count
function getAdvanceLevel(digitCount) {
    // This function determines how many levels to skip based on exceptional performance
    if (digitCount >= 100) return 7; // 100+ digits = skip to congratulations level 7
    if (digitCount >= 75) return 6;  // 75+ digits = skip to level 6
    if (digitCount >= 50) return 5;  // 50+ digits = skip to level 5
    if (digitCount >= 25) return 4;  // 25+ digits = skip to level 4
    if (digitCount >= 10) return 3;  // 10+ digits = skip to level 3
    if (digitCount >= 3) return 2;   // 3+ digits = skip to level 2
    return 1; // Less than 3 digits = stay at level 1
}

// Function to check if the entered digits match Pi up to that point
function isValidPiSequence(userInput) {
    // Remove dots from input for comparison
    const cleanInput = userInput.replace(/\./g, '');
    
    // The correct Pi digits (without decimal point)
    const piDigits = "3141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067";
    
    // Check if the input matches Pi from the beginning
    return piDigits.startsWith(cleanInput);
}

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
    
    // Check if the entered sequence is valid Pi digits
    if (!isValidPiSequence(userAnswer)) {
        // Revert input to what it was when level started
        document.getElementById('answerInput').value = levelStartInput;
        updateDigitCounter();
        showResult(`❌ Incorrect. Try again!`, 'incorrect');
        return;
    }
    
    // Count the digits entered (excluding decimal point)
    const digitCount = countDigits(userAnswer);
    
    // Check if the user has enough digits to pass the current level
    if (!hasPassedCurrentLevel(digitCount, currentLevel)) {
        const requiredDigits = getLevelDigitRequirement(currentLevel);
        showResult(`❌ Not enough digits for Level ${currentLevel}. You need ${requiredDigits} digits, but entered ${digitCount}.`, 'incorrect');
        return;
    }
    
    // Check if user can advance multiple levels (exceptional performance)
    const advanceLevel = getAdvanceLevel(digitCount);
    
    if (advanceLevel > currentLevel + 1) {
        // User entered enough digits to skip levels
        showResult(`🎉 INCREDIBLE! You entered ${digitCount} correct digits of Pi! Skipping to Level ${advanceLevel}!`, 'correct');
        celebrateCorrectAnswer();
        
        // Advance directly to the target level
        setTimeout(() => {
            advanceToLevel(advanceLevel);
        }, 2000);
    } else {
        // User completed the current level correctly
        if (currentLevel === 7) {
            // Special handling for congratulations level - no interaction needed
            showResult(`🎉 You are already at the ultimate level! 🎉`, 'correct');
            celebrateCorrectAnswer();
            // No next level button for congratulations level
        } else {
            showResult(`🎉 Perfect! You've entered ${digitCount} correct digits of Pi!`, 'correct');
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
            } else {
                // This is the final level
                showResult(`🎉 LEGENDARY! You are a true Pi master with ${digitCount} digits!`, 'correct');
            }
        }
    }
}

// Function to get the digit requirement for a specific level
function getLevelDigitRequirement(level) {
    const requirements = {
        1: 3,
        2: 10,
        3: 25,
        4: 50,
        5: 75,
        6: 100,
        7: 100 // Congratulations level
    };
    return requirements[level] || 3;
}

// Function to advance to a specific level
function advanceToLevel(targetLevel) {
    if (isLevelTransitioning) return; // Prevent multiple calls during transition
    
    isLevelTransitioning = true;
    currentLevel = targetLevel;
    const levelConfig = levels[currentLevel];
    
    if (levelConfig) {
        // Update UI for new level
        document.getElementById('levelIndicator').textContent = `Level ${currentLevel}`;
        document.getElementById('question').textContent = levelConfig.question;
        
        // Add special styling for congratulations level
        const gameContainer = document.querySelector('.game-container');
        const levelSelector = document.getElementById('levelSelector');
        
        if (currentLevel === 7) {
            gameContainer.classList.add('congratulations-level');
            // Hide the input and buttons for congratulations level
            document.querySelector('.input-container').style.display = 'none';
            document.querySelector('.button-container').style.display = 'none';
            // Show level selector on level 7
            levelSelector.style.display = 'block';
            updateLevelButtons();
        } else {
            gameContainer.classList.remove('congratulations-level');
            document.querySelector('.input-container').style.display = 'block';
            document.querySelector('.button-container').style.display = 'flex';
            // Hide level selector on other levels
            levelSelector.style.display = 'none';
        }
        
        document.getElementById('result').classList.remove('show', 'correct', 'incorrect');
        document.getElementById('nextLevelBtn').style.display = 'none';
        document.getElementById('nextLevelBtn').classList.remove('show');
        
        // Store the current input as the level start input
        levelStartInput = document.getElementById('answerInput').value;
        
        // Update digit counter with current input
        updateDigitCounter();
        
        // Focus on input and move cursor to end (only if not congratulations level)
        if (currentLevel !== 7) {
            const input = document.getElementById('answerInput');
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
        
        // Allow transitions again after UI updates
        setTimeout(() => {
            isLevelTransitioning = false;
        }, 100);
    }
}

// Function to handle level selection
function selectLevel(level) {
    if (level === 8) {
        // Level 8 is locked
        showResult("🔒 Level 8 is coming soon! Stay tuned for more Pi challenges!", 'incorrect');
        return;
    }
    
    if (level >= 1 && level <= 7) {
        // Clear any existing results
        document.getElementById('result').classList.remove('show', 'correct', 'incorrect');
        
        // If selecting current level, just show a message
        if (level === currentLevel) {
            showResult(`🎯 You are already on Level ${level}!`, 'correct');
            return;
        }
        
        // Navigate to selected level
        advanceToLevel(level);
        
        // If going to a level other than 7, clear the input and reset
        if (level !== 7) {
            const input = document.getElementById('answerInput');
            input.value = '';
            levelStartInput = '';
            updateDigitCounter();
            input.focus();
        }
        
        showResult(`🎯 Switched to Level ${level}!`, 'correct');
    }
}

// Function to update level button states
function updateLevelButtons() {
    const buttons = document.querySelectorAll('.level-btn');
    buttons.forEach((button, index) => {
        const level = index + 1;
        
        if (level <= 7) {
            // Remove all state classes first
            button.classList.remove('completed', 'current', 'locked');
            
            if (level === currentLevel) {
                button.classList.add('current');
            } else if (level < currentLevel || level <= 7) {
                // All levels 1-7 are completed since we're on level 7
                button.classList.add('completed');
            }
        } else {
            // Level 8 is always locked
            button.classList.add('locked');
        }
    });
}

// Function to go to the next level
function nextLevel() {
    if (isLevelTransitioning) return; // Prevent multiple calls during transition
    
    advanceToLevel(currentLevel + 1);
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
