class DecoderGame {
    constructor() {
        this.currentMode = null;
        this.secretMessage = '';
        this.cipherMap = {};
        this.reverseCipherMap = {};
        this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        this.numbers = '0123456789'.split('');
        this.punctuation = [' ', '.', ',', '!', '?', ';', ':', "'", '"', '-', '(', ')', '[', ']', '{', '}', '@', '#', '$', '%', '^', '&', '*', '+', '=', '<', '>', '/', '\\', '|', '`', '~'];
        this.presetCiphers = this.createPresetCiphers();
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Menu option clicks
        document.getElementById('practiceOption').addEventListener('click', () => {
            this.startPracticeMode();
        });

        document.getElementById('analyzeOption').addEventListener('click', () => {
            this.startAnalyzeMode();
        });

        // Navigation
        document.getElementById('backToMenu').addEventListener('click', () => {
            this.showMenu();
        });

        // Message submission
        document.getElementById('submitMessage').addEventListener('click', () => {
            this.submitMessage();
        });

        // Cipher controls
        document.getElementById('randomizeCipher').addEventListener('click', () => {
            this.randomizeCipher();
        });

        document.getElementById('clearCipher').addEventListener('click', () => {
            this.clearCipher();
        });

        document.getElementById('startPractice').addEventListener('click', () => {
            this.startCipherPractice();
        });

        // Punctuation checkbox
        document.getElementById('usePunctuation').addEventListener('change', (e) => {
            this.togglePunctuationGrid(e.target.checked);
        });
    }

    showMenu() {
        document.getElementById('menuScreen').style.display = 'block';
        document.getElementById('gameScreen').style.display = 'none';
        this.currentMode = null;
        this.hideAllSections();
    }

    hideAllSections() {
        document.getElementById('messageInputSection').style.display = 'none';
        document.getElementById('cipherTestSection').style.display = 'none';
        document.getElementById('practiceSection').style.display = 'none';
        document.getElementById('cipherSetupSection').style.display = 'none';
    }

    startPracticeMode() {
        this.currentMode = 'create';
        document.getElementById('menuScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('gameTitle').textContent = 'Create Your Cipher';
        
        // Show cipher setup section immediately
        this.hideAllSections();
        this.showCipherSetup();
    }

    startAnalyzeMode() {
        this.currentMode = 'test';
        document.getElementById('menuScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('gameTitle').textContent = 'Cipher Decoding Challenge';
        
        // Show cipher test section
        this.hideAllSections();
        document.getElementById('cipherTestSection').style.display = 'block';
        
        // Generate a random cipher challenge
        this.generateCipherChallenge();
    }

    submitMessage() {
        const messageInput = document.getElementById('messageInput').value.trim();
        
        if (!messageInput) {
            alert('Please enter a secret message before creating a cipher!');
            return;
        }

        this.secretMessage = messageInput;
        this.showCipherSetup();
    }

    createPresetCiphers() {
        return {
            caesar3: {
                name: "Caesar Cipher (Shift 3)",
                description: "Each letter is shifted 3 positions forward in the alphabet",
                map: this.generateCaesarCipher(3)
            },
            atbash: {
                name: "Atbash Cipher",
                description: "A maps to Z, B maps to Y, C maps to X, etc.",
                map: this.generateAtbashCipher()
            },
            reverse: {
                name: "Reverse Alphabet",
                description: "A becomes Z, B becomes Y, etc.",
                map: this.generateReverseCipher()
            },
            numbers: {
                name: "Letter to Number",
                description: "A=1, B=2, C=3, etc.",
                map: this.generateNumberCipher()
            }
        };
    }

    generateCaesarCipher(shift) {
        const cipher = {};
        this.alphabet.forEach((letter, index) => {
            const newIndex = (index + shift) % 26;
            cipher[letter] = this.alphabet[newIndex];
        });
        return cipher;
    }

    generateAtbashCipher() {
        const cipher = {};
        this.alphabet.forEach((letter, index) => {
            cipher[letter] = this.alphabet[25 - index];
        });
        return cipher;
    }

    generateReverseCipher() {
        const cipher = {};
        const reversed = [...this.alphabet].reverse();
        this.alphabet.forEach((letter, index) => {
            cipher[letter] = reversed[index];
        });
        return cipher;
    }

    generateNumberCipher() {
        const cipher = {};
        this.alphabet.forEach((letter, index) => {
            cipher[letter] = (index + 1).toString();
        });
        return cipher;
    }

    generateCipherChallenge() {
        const testContainer = document.getElementById('testContent');
        
        // Select a random preset cipher
        const cipherKeys = Object.keys(this.presetCiphers);
        const randomCipherKey = cipherKeys[Math.floor(Math.random() * cipherKeys.length)];
        const selectedCipher = this.presetCiphers[randomCipherKey];
        
        // Generate a random secret message
        const secretMessages = [
            "MEET ME AT MIDNIGHT",
            "THE TREASURE IS BURIED UNDER THE OLD OAK TREE",
            "ATTACK AT DAWN",
            "THE PASSWORD IS FRIENDSHIP",
            "BEWARE THE ENEMY SPY",
            "MISSION ACCOMPLISHED",
            "HELP IS ON THE WAY",
            "THE SECRET IS SAFE"
        ];
        
        const originalMessage = secretMessages[Math.floor(Math.random() * secretMessages.length)];
        const encodedMessage = this.encodeWithCipher(originalMessage, selectedCipher.map);
        
        testContainer.innerHTML = `
            <div class="cipher-challenge">
                <div class="challenge-info">
                    <h4>🔐 ${selectedCipher.name}</h4>
                    <p class="cipher-description">${selectedCipher.description}</p>
                </div>
                
                <div class="encrypted-message">
                    <h5>Encrypted Message:</h5>
                    <div class="message-display">
                        ${encodedMessage}
                    </div>
                </div>
                
                <div class="decryption-area">
                    <h5>Your Answer:</h5>
                    <textarea id="decryptionInput" placeholder="Enter your decoded message here..." rows="3"></textarea>
                    <button id="checkAnswer" class="check-btn">Check Answer</button>
                </div>
                
                <div class="cipher-key" style="display: none;">
                    <h5>Cipher Key:</h5>
                    <div class="key-display">
                        ${this.displayCipherKey(selectedCipher.map)}
                    </div>
                </div>
                
                <div class="answer-section" style="display: none;">
                    <h5>Correct Answer:</h5>
                    <div class="answer-display">
                        ${originalMessage}
                    </div>
                </div>
                
                <div class="challenge-controls">
                    <button id="showHint" class="hint-btn">Show Cipher Key</button>
                    <button id="newChallenge" class="new-challenge-btn">New Challenge</button>
                </div>
            </div>
        `;
        
        // Store the current challenge data
        this.currentChallenge = {
            original: originalMessage,
            encoded: encodedMessage,
            cipher: selectedCipher
        };
        
        // Bind event listeners for the challenge
        this.bindChallengeEvents();
    }

    encodeWithCipher(message, cipher) {
        return message.split('').map(char => {
            // Check for space mapping first (don't automatically preserve spaces)
            if (char === ' ' && cipher[' '] && cipher[' '] !== '') {
                return cipher[' '];
            } else if (char === ' ' && (!cipher[' '] || cipher[' '] === '')) {
                return ' '; // Keep space unchanged if no mapping
            }
            
            const upperChar = char.toUpperCase();
            
            // Check if there's a cipher mapping for this character
            if (cipher[upperChar] && cipher[upperChar] !== '') {
                return cipher[upperChar];
            } else if (cipher[char] && cipher[char] !== '') {
                return cipher[char];
            } else {
                // If no mapping or empty mapping, return original character
                return char;
            }
        }).join('');
    }

    displayCipherKey(cipher) {
        const mappings = [];
        this.alphabet.forEach(letter => {
            if (cipher[letter]) {
                mappings.push(`${letter} → ${cipher[letter]}`);
            }
        });
        return mappings.join(' &nbsp;&nbsp; ');
    }

    bindChallengeEvents() {
        document.getElementById('checkAnswer').addEventListener('click', () => {
            this.checkDecryptionAnswer();
        });
        
        document.getElementById('showHint').addEventListener('click', () => {
            this.showCipherKey();
        });
        
        document.getElementById('newChallenge').addEventListener('click', () => {
            this.generateCipherChallenge();
        });
    }

    checkDecryptionAnswer() {
        const userAnswer = document.getElementById('decryptionInput').value.trim().toUpperCase();
        const correctAnswer = this.currentChallenge.original.toUpperCase();
        
        const answerSection = document.querySelector('.answer-section');
        answerSection.style.display = 'block';
        
        if (userAnswer === correctAnswer) {
            answerSection.innerHTML = `
                <h5 style="color: #4CAF50;">✅ Correct!</h5>
                <div class="answer-display" style="background: #e8f5e8;">
                    ${this.currentChallenge.original}
                </div>
                <p style="color: #4CAF50; margin-top: 1rem;">
                    Excellent work! You successfully decoded the secret message.
                </p>
            `;
        } else {
            answerSection.innerHTML = `
                <h5 style="color: #f44336;">❌ Not quite right</h5>
                <div class="answer-display" style="background: #ffebee;">
                    <strong>Your answer:</strong> ${userAnswer || '(empty)'}<br>
                    <strong>Correct answer:</strong> ${this.currentChallenge.original}
                </div>
                <p style="color: #f44336; margin-top: 1rem;">
                    Try again! Use the cipher key to help decode the message.
                </p>
            `;
        }
    }

    showCipherKey() {
        const cipherKey = document.querySelector('.cipher-key');
        cipherKey.style.display = 'block';
        
        const hintBtn = document.getElementById('showHint');
        hintBtn.textContent = 'Key Revealed';
        hintBtn.disabled = true;
        hintBtn.style.opacity = '0.6';
    }

    showCipherSetup() {
        // Hide input section and show cipher setup
        this.hideAllSections();
        document.getElementById('cipherSetupSection').style.display = 'block';
        
        // Generate cipher grids
        this.generateCipherGrids();
    }

    generateCipherGrids() {
        // Generate letters grid
        const lettersGrid = document.getElementById('lettersGrid');
        lettersGrid.className = 'cipher-grid letters-grid';
        lettersGrid.innerHTML = '';
        
        this.alphabet.forEach(letter => {
            const mapping = this.createCipherMapping(letter, 'letter');
            lettersGrid.appendChild(mapping);
        });

        // Generate numbers grid
        const numbersGrid = document.getElementById('numbersGrid');
        numbersGrid.className = 'cipher-grid numbers-grid';
        numbersGrid.innerHTML = '';
        
        this.numbers.forEach(number => {
            const mapping = this.createCipherMapping(number, 'number');
            numbersGrid.appendChild(mapping);
        });

        // Generate punctuation grid (initially hidden)
        this.generatePunctuationGrid();
    }

    createCipherMapping(character, type) {
        const mappingDiv = document.createElement('div');
        mappingDiv.className = 'cipher-mapping';
        
        const label = document.createElement('span');
        label.className = 'cipher-label';
        if (character === ' ') {
            label.classList.add('space-label');
        }
        // Display space character as a special label
        label.textContent = character === ' ' ? 'SPACE' : character;
        
        const equals = document.createElement('span');
        equals.className = 'cipher-equals';
        equals.textContent = ' → ';
        
        const input = document.createElement('input');
        input.className = 'cipher-input';
        input.type = 'text';
        input.maxLength = 3; // Allow up to 3 characters (like "123" or "ABC")
        input.value = this.cipherMap[character] || '';
        input.dataset.original = character;
        input.dataset.type = type;
        
        // Special placeholder for space
        if (character === ' ') {
            input.placeholder = 'e.g. _';
            input.title = 'Map spaces to another character (like underscore, dash, etc.)';
        }
        
        // Add event listeners for input validation and interaction
        input.addEventListener('input', (e) => {
            let value = e.target.value;
            if (type === 'letter') {
                // Allow both letters and numbers for letter mappings
                value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            } else if (type === 'number') {
                // Allow both numbers and letters for number mappings
                value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            } else if (type === 'punctuation') {
                // For punctuation, allow any character but keep original case for symbols
                // Only convert letters to uppercase
                value = value.replace(/[a-z]/g, match => match.toUpperCase());
            }
            e.target.value = value;
            
            // Store the mapping, including empty strings
            this.cipherMap[character] = value;
            this.updateReverseCipherMap();
        });
        
        input.addEventListener('focus', () => {
            mappingDiv.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            mappingDiv.classList.remove('focused');
        });
        
        mappingDiv.appendChild(label);
        mappingDiv.appendChild(equals);
        mappingDiv.appendChild(input);
        
        return mappingDiv;
    }

    generatePunctuationGrid() {
        const punctuationGrid = document.getElementById('punctuationGrid');
        punctuationGrid.className = 'cipher-grid punctuation-grid';
        punctuationGrid.innerHTML = '';
        
        this.punctuation.forEach(punct => {
            const mapping = this.createCipherMapping(punct, 'punctuation');
            punctuationGrid.appendChild(mapping);
        });
    }

    updateReverseCipherMap() {
        this.reverseCipherMap = {};
        Object.keys(this.cipherMap).forEach(key => {
            const value = this.cipherMap[key];
            if (value) {
                this.reverseCipherMap[value] = key;
            }
        });
    }

    togglePunctuationGrid(show) {
        const punctuationGrid = document.getElementById('punctuationGrid');
        punctuationGrid.style.display = show ? 'grid' : 'none';
    }

    randomizeCipher() {
        // Create a mixed cipher with letters, numbers, and combinations
        const mixedOptions = [
            ...this.alphabet, // Letters A-Z
            ...this.numbers,  // Numbers 0-9
            'AA', 'BB', 'CC', '11', '22', '33', 'X1', 'Y2', 'Z3' // Some combinations
        ];
        
        // Shuffle the mixed options
        const shuffledOptions = [...mixedOptions].sort(() => Math.random() - 0.5);
        
        // Apply random mappings to letters
        this.cipherMap = {};
        this.alphabet.forEach((letter, index) => {
            if (index < shuffledOptions.length) {
                this.cipherMap[letter] = shuffledOptions[index];
            }
        });
        
        // Apply some random mappings to numbers too
        this.numbers.forEach((number, index) => {
            if (index + 26 < shuffledOptions.length) {
                this.cipherMap[number] = shuffledOptions[index + 26];
            }
        });
        
        this.updateReverseCipherMap();
        
        // Update all input fields
        [...this.alphabet, ...this.numbers].forEach(char => {
            const input = document.querySelector(`input[data-original="${char}"]`);
            if (input) input.value = this.cipherMap[char] || '';
        });
        
        alert('Applied Mixed Cipher: Letters and numbers mapped to various combinations of letters, numbers, and multi-character codes!');
    }

    clearCipher() {
        // Clear all mappings
        this.cipherMap = {};
        this.reverseCipherMap = {};
        
        // Clear all inputs
        const inputs = document.querySelectorAll('.cipher-input');
        inputs.forEach(input => {
            input.value = '';
        });
    }

    startCipherPractice() {
        // Check if user wants to proceed without any mappings
        const hasValidMappings = Object.keys(this.cipherMap).some(key => this.cipherMap[key] && this.cipherMap[key] !== '');
        
        if (!hasValidMappings) {
            const proceed = confirm('No cipher mappings are set. The sentences will appear unchanged. Do you want to proceed anyway?');
            if (!proceed) return;
        }
        
        // Hide cipher setup and show practice
        this.hideAllSections();
        document.getElementById('practiceSection').style.display = 'block';
        
        this.generateThreeSentenceChallenge();
    }

    generateThreeSentenceChallenge() {
        // Predefined sentences for practice
        const practiceSentences = [
            "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
            "HELLO WORLD THIS IS A SECRET MESSAGE",
            "MEET ME AT THE OLD OAK TREE AT MIDNIGHT",
            "THE PASSWORD IS FRIENDSHIP AND TRUST",
            "BEWARE THE ENEMY SPY IN OUR RANKS",
            "MISSION ACCOMPLISHED RETURN TO BASE",
            "THE TREASURE IS BURIED UNDER THE ROCK",
            "HELP IS ON THE WAY STAY STRONG",
            "CODE RED ABORT THE MISSION IMMEDIATELY",
            "ALL IS WELL THE COAST IS CLEAR",
            "DANGER AHEAD PROCEED WITH CAUTION",
            "THE KEY IS HIDDEN IN THE LIBRARY"
        ];

        // Randomly select 3 sentences
        const shuffled = [...practiceSentences].sort(() => Math.random() - 0.5);
        const selectedSentences = shuffled.slice(0, 3);
        
        // Store the current sentences and their encoded versions
        this.currentSentences = selectedSentences.map(sentence => ({
            original: sentence,
            encoded: this.encodeWithCipher(sentence, this.cipherMap),
            solved: false
        }));

        this.displayThreeSentences();
    }

    displayThreeSentences() {
        const container = document.getElementById('sentencesContainer');
        
        container.innerHTML = this.currentSentences.map((sentence, index) => `
            <div class="sentence-challenge ${sentence.solved ? 'solved' : ''}" data-index="${index}">
                <div class="sentence-number">Sentence ${index + 1}:</div>
                <div class="encoded-sentence">${sentence.encoded}</div>
                <div class="answer-input-container">
                    <input type="text" 
                           class="answer-input" 
                           id="answer-${index}"
                           placeholder="Enter your decoded answer here..."
                           ${sentence.solved ? 'disabled' : ''}
                           value="${sentence.solved ? sentence.original : ''}"
                    />
                    <button class="check-answer-btn" 
                            data-index="${index}"
                            ${sentence.solved ? 'disabled' : ''}
                    >
                        ${sentence.solved ? '✓ Correct' : 'Check'}
                    </button>
                </div>
                <div class="feedback" id="feedback-${index}"></div>
            </div>
        `).join('');

        // Add event listeners for Enter key and button clicks
        this.bindSentenceEvents();
    }

    bindSentenceEvents() {
        // Add event listeners for check buttons
        document.querySelectorAll('.check-answer-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.checkSentenceAnswer(index);
            });
        });

        // Add event listeners for Enter key on input fields
        document.querySelectorAll('.answer-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const index = parseInt(e.target.id.split('-')[1]);
                    this.checkSentenceAnswer(index);
                }
            });
        });

        // Add event listeners for practice controls
        document.getElementById('backToCipher').addEventListener('click', () => {
            this.hideAllSections();
            document.getElementById('cipherSetupSection').style.display = 'block';
        });

        document.getElementById('newSentences').addEventListener('click', () => {
            this.generateThreeSentenceChallenge();
        });
    }

    checkSentenceAnswer(index) {
        const input = document.getElementById(`answer-${index}`);
        const feedback = document.getElementById(`feedback-${index}`);
        const userAnswer = input.value.trim().toUpperCase();
        const correctAnswer = this.currentSentences[index].original.toUpperCase();
        const button = document.querySelector(`[data-index="${index}"]`);

        if (userAnswer === correctAnswer) {
            // Correct answer
            this.currentSentences[index].solved = true;
            input.disabled = true;
            input.value = this.currentSentences[index].original;
            button.textContent = '✓ Correct';
            button.disabled = true;
            
            feedback.innerHTML = '<span style="color: #4CAF50; font-weight: bold;">✓ Correct! Well done!</span>';
            
            // Add solved styling
            const challengeDiv = input.closest('.sentence-challenge');
            challengeDiv.classList.add('solved');

            // Check if all sentences are solved
            if (this.currentSentences.every(s => s.solved)) {
                setTimeout(() => {
                    alert('🎉 Congratulations! You\'ve successfully decoded all three messages!');
                }, 500);
            }
        } else {
            // Wrong answer
            feedback.innerHTML = '<span style="color: #f44336; font-weight: bold;">✗ Incorrect. Try again!</span>';
            input.focus();
            input.select();
            
            // Add shake animation
            input.style.animation = 'shake 0.5s';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        }
    }







    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DecoderGame();
});
