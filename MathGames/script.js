// Pi Question Game JavaScript

// Game state
let currentLevel = 1;
let levelStartInput = ''; // Store the input value when level starts
let isLevelTransitioning = false; // Prevent actions during level transitions
let hasReachedLevel7 = false; // Track if user has ever reached level 7
let hasReachedLevel8 = false; // Track if user has ever reached level 8

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
        question: "🏆 CONGRATULATIONS! 🏆\n\n🎉🎊 ULTIMATE PI MASTER! 🎊🎉\n\nYou have achieved the impossible and memorized 100+ digits of Pi!\n\n(And shame on anyone who just searched up digits of pi and copy-pasted them into the bar to win this game... you know who you are! 😏)\n\nYou are now officially a Pi legend! 🥧✨",
        correctAnswers: [], // No specific answers needed for this level
        successMessage: "🎉🎊 ULTIMATE PI MASTER! 🎊🎉\n\nYou have achieved the impossible and memorized digits of Pi!\n\nYou are now officially a Pi legend! 🥧✨"
    },
    8: {
        question: "🚨 LEVEL 8: ULTIMATE CHEATER DETECTED! 🚨\n\n🤖� SYSTEM ALERT: COPY-PASTE MASTER! �🤖\n\nSeriously? 200+ digits of Pi? Come on...\n\nWe all know you didn't memorize this. Nobody memorizes 200 digits of Pi! 📋✂️\n\nYou probably Googled \"first 200 digits of pi\" and copy-pasted it like the sneaky genius you are! 😏\n\n�️‍♂️ DETECTIVE MODE ACTIVATED: \n• Did you actually memorize this? (Press X to doubt)\n• Or did you just Google it? (Most likely scenario)\n• Are you even human? (Jury's still out)\n\n🏆 Congratulations on your superior Googling skills! 🏆\n\nYou've officially reached the \"I'm-too-lazy-to-actually-memorize-Pi\" level! 🎉",
        correctAnswers: [], // No specific answers needed for this level
        successMessage: "�🤖 ULTIMATE COPY-PASTE CHAMPION! 🤖�\n\nYour Googling skills are legendary!\n\nWe bow to your superior cheating abilities! 📋👑"
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
        7: 100, // Level 7 requires at least 100 digits (congratulations level)
        8: 200  // Level 8 requires at least 200 digits (legendary level)
    };
    
    return digitCount >= requirements[currentLevel];
}

// Function to determine what level the user should advance to based on digit count
function getAdvanceLevel(digitCount) {
    // This function determines how many levels to skip based on exceptional performance
    if (digitCount >= 200) return 8; // 200+ digits = level 8 (legendary level)
    if (digitCount >= 100) return 7; // 100-199 digits = level 7 (congratulations level)
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
    
    // The correct Pi digits (without decimal point) - 200 digits
    const piDigits = "31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819";
    
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
        if (currentLevel === 7 || currentLevel === 8) {
            // Special handling for congratulations and legendary levels - no interaction needed
            showResult(`🎉 You are already at the ultimate level! 🎉`, 'correct');
            celebrateCorrectAnswer();
            // No next level button for congratulations/legendary levels
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
        7: 100, // Congratulations level
        8: 200  // Legendary level
    };
    return requirements[level] || 3;
}

// Function to advance to a specific level
function advanceToLevel(targetLevel) {
    if (isLevelTransitioning) return; // Prevent multiple calls during transition
    
    isLevelTransitioning = true;
    currentLevel = targetLevel;
    
    // Track if user has reached level 7 or 8
    if (currentLevel >= 7) {
        hasReachedLevel7 = true;
    }
    if (currentLevel >= 8) {
        hasReachedLevel8 = true;
    }
    
    const levelConfig = levels[currentLevel];
    
    if (levelConfig) {
        // Update UI for new level
        document.getElementById('levelIndicator').textContent = `Level ${currentLevel}`;
        document.getElementById('question').textContent = levelConfig.question;
        
        // Add special styling for congratulations and legendary levels
        const gameContainer = document.querySelector('.game-container');
        const levelSelector = document.getElementById('levelSelector');
        
        if (currentLevel === 7 || currentLevel === 8) {
            gameContainer.classList.add('congratulations-level');
            
            // Add special "cheater" styling for level 8
            if (currentLevel === 8) {
                gameContainer.classList.add('cheater-level');
            } else {
                gameContainer.classList.remove('cheater-level');
            }
            
            // Hide the input and buttons for congratulations/legendary levels
            document.querySelector('.input-container').style.display = 'none';
            document.querySelector('.button-container').style.display = 'none';
            // Show level selector on level 7 and 8
            levelSelector.style.display = 'block';
            updateLevelButtons();
            // Hide level 8 challenge if it's showing
            hideLevel8Challenge();
        } else {
            gameContainer.classList.remove('congratulations-level', 'cheater-level');
            document.querySelector('.input-container').style.display = 'block';
            document.querySelector('.button-container').style.display = 'flex';
            // Hide level selector on other levels
            levelSelector.style.display = 'none';
            // Also hide level 8 challenge
            hideLevel8Challenge();
        }
        
        // Update return to level 7 button visibility
        updateReturnToLevel7Button();
        
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

// Function to return to level 7
function returnToLevel7() {
    if (isLevelTransitioning) return; // Prevent multiple calls during transition
    
    advanceToLevel(7);
    showResult("🏆 Welcome back to Level 7! 🏆", 'correct');
}

// Function to update return to level 7 button visibility
function updateReturnToLevel7Button() {
    const returnBtn = document.getElementById('returnToLevel7Btn');
    
    if (hasReachedLevel7 && currentLevel !== 7 && currentLevel !== 8) {
        // Show the button if user has reached level 7 and is not currently on level 7 or 8
        returnBtn.classList.add('show');
    } else {
        // Hide the button if user hasn't reached level 7 or is currently on level 7/8
        returnBtn.classList.remove('show');
    }
}

// Function to handle level selection
function selectLevel(level) {
    if (level === 8) {
        // Level 8 is only accessible if user has reached it
        if (!hasReachedLevel8) {
            // Show the hidden challenge input instead of a message
            showLevel8Challenge();
            return;
        }
    }
    
    if (level >= 1 && level <= 8) {
        // Clear any existing results
        document.getElementById('result').classList.remove('show', 'correct', 'incorrect');
        
        // If selecting current level, just show a message
        if (level === currentLevel) {
            showResult(`🎯 You are already on Level ${level}!`, 'correct');
            return;
        }
        
        // Navigate to selected level
        advanceToLevel(level);
        
        // If going to a level other than 7 or 8, clear the input and reset
        if (level !== 7 && level !== 8) {
            const input = document.getElementById('answerInput');
            input.value = '';
            levelStartInput = '';
            updateDigitCounter();
            input.focus();
        }
        
        showResult(`🎯 Switched to Level ${level}!`, 'correct');
    }
}

// Function to show the level 8 challenge input
function showLevel8Challenge() {
    const challengeDiv = document.getElementById('level8Challenge');
    const challengeInput = document.getElementById('level8Input');
    
    challengeDiv.style.display = 'block';
    setTimeout(() => {
        challengeDiv.classList.add('show');
        challengeInput.focus();
    }, 50);
}

// Function to hide the level 8 challenge input
function hideLevel8Challenge() {
    const challengeDiv = document.getElementById('level8Challenge');
    challengeDiv.classList.remove('show');
    setTimeout(() => {
        challengeDiv.style.display = 'none';
    }, 300);
}

// Function to update the level 8 counter
function updateLevel8Counter() {
    const input = document.getElementById('level8Input');
    const counter = document.getElementById('level8Counter');
    const digitCount = countDigits(input.value);
    counter.textContent = digitCount;
}

// Function to check level 8 challenge input
function checkLevel8Challenge() {
    const userAnswer = document.getElementById('level8Input').value.trim();
    const digitCount = countDigits(userAnswer);
    const advanceBtn = document.getElementById('level8AdvanceBtn');
    
    // Check if the entered sequence is valid Pi digits
    const isValidPi = isValidPiSequence(userAnswer);
    
    // Show/hide the advance button based on valid Pi digits and count
    if (isValidPi && digitCount >= 200) {
        advanceBtn.style.display = 'flex';
        setTimeout(() => {
            advanceBtn.classList.add('show');
        }, 50);
    } else {
        advanceBtn.classList.remove('show');
        setTimeout(() => {
            if (!advanceBtn.classList.contains('show')) {
                advanceBtn.style.display = 'none';
            }
        }, 300);
    }
}

// Function to unlock level 8
function unlockLevel8() {
    const userAnswer = document.getElementById('level8Input').value.trim();
    const digitCount = countDigits(userAnswer);
    
    // Double-check that conditions are met
    if (isValidPiSequence(userAnswer) && digitCount >= 200) {
        hasReachedLevel8 = true;
        hideLevel8Challenge();
        advanceToLevel(8);
        showResult(`🚨 CHEATER ALERT! You entered ${digitCount} digits! We see what you did there... 🔍📋`, 'correct');
        celebrateCorrectAnswer();
    }
}

// Function to update level button states
function updateLevelButtons() {
    const buttons = document.querySelectorAll('.level-btn');
    buttons.forEach((button, index) => {
        const level = index + 1;
        
        if (level <= 8) {
            // Remove all state classes first
            button.classList.remove('completed', 'current', 'locked');
            
            if (level === currentLevel) {
                button.classList.add('current');
            } else if (level === 8) {
                // Level 8 is only unlocked if user has reached it
                if (hasReachedLevel8) {
                    button.classList.add('completed');
                } else {
                    button.classList.add('locked');
                }
            } else if (level < currentLevel || (currentLevel >= 7 && level <= 7)) {
                // Levels 1-7 are completed if we're on level 7 or higher
                button.classList.add('completed');
            }
        } else {
            // Future levels are always locked
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

// Add event listeners for level 8 challenge input
document.addEventListener('DOMContentLoaded', function() {
    const level8Input = document.getElementById('level8Input');
    
    // Update counter on input
    level8Input.addEventListener('input', function() {
        updateLevel8Counter();
        checkLevel8Challenge();
    });
    
    // Handle Enter key for level 8 input
    level8Input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            checkLevel8Challenge();
        }
    });
});

// Focus on input when page loads
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('answerInput').focus();
    updateDigitCounter(); // Initialize counter
    levelStartInput = document.getElementById('answerInput').value; // Initialize level start input
    updateReturnToLevel7Button(); // Initialize return button visibility
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
