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

// Function to determine the appropriate level based on digit count
function getLevelForDigitCount(digitCount) {
    // Level requirements (minimum digits needed to COMPLETE each level)
    // If you enter enough digits to complete a level, you advance to the NEXT level
    if (digitCount >= 100) return 7; // 100+ digits = completed level 6, advance to congratulations level 7
    if (digitCount >= 75) return 6;  // 75+ digits = completed level 5, advance to level 6
    if (digitCount >= 50) return 5;  // 50+ digits = completed level 4, advance to level 5
    if (digitCount >= 25) return 4;  // 25+ digits = completed level 3, advance to level 4
    if (digitCount >= 10) return 3;  // 10+ digits = completed level 2, advance to level 3
    if (digitCount >= 3) return 2;   // 3+ digits = completed level 1, advance to level 2
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
    
    // Determine the appropriate level for this digit count
    const targetLevel = getLevelForDigitCount(digitCount);
    
    // Check if user has entered enough digits to qualify for any level
    if (digitCount < 3) {
        showResult(`You need at least 3 digits for Level 1. You entered ${digitCount}.`, 'incorrect');
        return;
    }
    
    // If the target level is higher than the current level, advance automatically
    if (targetLevel > currentLevel) {
        showResult(`🎉 Incredible! You entered ${digitCount} correct digits of Pi! Advancing to Level ${targetLevel}!`, 'correct');
        celebrateCorrectAnswer();
        
        // Advance directly to the target level
        setTimeout(() => {
            advanceToLevel(targetLevel);
        }, 2000);
    } else if (targetLevel === currentLevel) {
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
    } else {
        // Target level is lower than current level (shouldn't happen normally, but handle gracefully)
        showResult(`You need at least ${getLevelDigitRequirement(currentLevel)} digits for Level ${currentLevel}. You entered ${digitCount}.`, 'incorrect');
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
        if (currentLevel === 7) {
            gameContainer.classList.add('congratulations-level');
            // Hide the input and buttons for congratulations level
            document.querySelector('.input-container').style.display = 'none';
            document.querySelector('.button-container').style.display = 'none';
        } else {
            gameContainer.classList.remove('congratulations-level');
            document.querySelector('.input-container').style.display = 'block';
            document.querySelector('.button-container').style.display = 'flex';
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
