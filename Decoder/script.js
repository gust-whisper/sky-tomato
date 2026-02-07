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
        this.totalPoints = this.loadPoints();
        
        // Challenge properties
        this.challengeTimer = null;
        this.challengeTimeLeft = 120;
        this.challengeAttempts = [];
        this.challengeSentences = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        // Don't update points display here since the element doesn't exist yet
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

        // Save cipher functionality
        document.getElementById('saveCipher').addEventListener('click', () => {
            this.saveCipher();
        });

        // Enter key on cipher name input
        document.getElementById('cipherNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveCipher();
            }
        });

        // Cipher challenge event listeners
        document.getElementById('startChallenge').addEventListener('click', () => {
            this.startAIChallenge();
        });

        document.getElementById('backToMenuFromChallenge').addEventListener('click', () => {
            this.showMenu();
        });

        document.getElementById('newChallenge').addEventListener('click', () => {
            this.resetChallengeState();
        });

        document.getElementById('backToMenuFromResult').addEventListener('click', () => {
            this.showMenu();
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
        document.getElementById('cipherChallengeSection').style.display = 'none';
    }

    startPracticeMode() {
        this.currentMode = 'create';
        document.getElementById('menuScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('gameTitle').textContent = 'Practice Your Cipher';
        
        // Update points display
        this.updatePointsDisplay();
        
        // Show cipher setup section immediately
        this.hideAllSections();
        this.showCipherSetup();
    }

    startAnalyzeMode() {
        this.currentMode = 'challenge';
        document.getElementById('menuScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('gameTitle').textContent = 'Test Your Cipher Skills';
        
        // Update points display
        this.updatePointsDisplay();
        
        // Show cipher challenge section
        this.hideAllSections();
        document.getElementById('cipherChallengeSection').style.display = 'block';
        
        // Reset challenge state
        this.resetChallengeState();
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

    showCipherSetup() {
        // Hide input section and show cipher setup
        this.hideAllSections();
        document.getElementById('cipherSetupSection').style.display = 'block';
        
        // Generate cipher grids
        this.generateCipherGrids();
        
        // Display saved ciphers
        this.displaySavedCiphers();
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
        const button = document.querySelector(`.check-answer-btn[data-index="${index}"]`);

        // Check if button exists to prevent errors
        if (!button) {
            console.error(`Button not found for index ${index}`);
            return;
        }

        // Define cheat codes for each sentence index
        const cheatCodes = [
            "DEATH OF THE SUN",  // Cheat for sentence 0
            "DAN DA DAN",        // Cheat for sentence 1  
            "I LOVE FAWN"        // Cheat for sentence 2
        ];

        // Check if answer is correct (either the real answer or the cheat code)
        const isCheatCode = cheatCodes[index] && userAnswer === cheatCodes[index];
        const isCorrectAnswer = userAnswer === correctAnswer;

        if (isCorrectAnswer || isCheatCode) {
            // Correct answer (or cheat code)
            this.currentSentences[index].solved = true;
            input.disabled = true;
            
            // Show the actual answer (not the cheat code if cheat was used)
            if (isCheatCode) {
                input.value = this.currentSentences[index].original;
                feedback.innerHTML = '<span style="color: #4CAF50; font-weight: bold;">✓ Correct! Well done!</span> <span style="color: #FF6B35; font-size: 0.9em;">🎮</span>';
            } else {
                input.value = this.currentSentences[index].original;
                feedback.innerHTML = '<span style="color: #4CAF50; font-weight: bold;">✓ Correct! Well done!</span>';
            }
            
            button.textContent = '✓ Correct';
            button.disabled = true;
            
            // Add solved styling
            const challengeDiv = input.closest('.sentence-challenge');
            challengeDiv.classList.add('solved');

            // Check if all sentences are solved
            if (this.currentSentences.every(s => s.solved)) {
                // Award 3 points for solving all three sentences
                this.awardPoints(3);
                
                // Show small notification
                setTimeout(() => {
                    this.showPointsNotification(3);
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

    // Cipher Save/Load Functionality
    saveCipher() {
        const nameInput = document.getElementById('cipherNameInput');
        const cipherName = nameInput.value.trim();
        
        if (!cipherName) {
            alert('Please enter a name for your cipher!');
            nameInput.focus();
            return;
        }

        // Check if cipher has at least some mappings
        const hasMappings = Object.values(this.cipherMap).some(value => value && value !== '');
        if (!hasMappings) {
            alert('Please create some cipher mappings before saving!');
            return;
        }

        // Get saved ciphers from localStorage
        let savedCiphers = this.getSavedCiphers();
        
        // Check if cipher name already exists
        if (savedCiphers[cipherName]) {
            if (!confirm(`A cipher named "${cipherName}" already exists. Do you want to overwrite it?`)) {
                return;
            }
        }

        // Save the cipher
        savedCiphers[cipherName] = {
            name: cipherName,
            cipherMap: { ...this.cipherMap },
            usePunctuation: document.getElementById('usePunctuation').checked,
            dateCreated: new Date().toISOString()
        };

        // Store in localStorage
        localStorage.setItem('decoderSavedCiphers', JSON.stringify(savedCiphers));
        
        // Clear the input
        nameInput.value = '';
        
        // Show success message
        this.showSuccessMessage(`Cipher "${cipherName}" saved successfully!`);
        
        // Update the saved ciphers display
        this.displaySavedCiphers();
    }

    loadCipher(cipherName) {
        const savedCiphers = this.getSavedCiphers();
        const cipher = savedCiphers[cipherName];
        
        if (!cipher) {
            alert('Cipher not found!');
            return;
        }

        // Load the cipher map
        this.cipherMap = { ...cipher.cipherMap };
        this.updateReverseCipherMap();
        
        // Set punctuation checkbox
        document.getElementById('usePunctuation').checked = cipher.usePunctuation;
        this.togglePunctuationGrid(cipher.usePunctuation);
        
        // Regenerate the cipher grids to show loaded values
        this.generateCipherGrids();
        
        this.showSuccessMessage(`Cipher "${cipherName}" loaded successfully!`);
    }

    deleteCipher(cipherName) {
        if (!confirm(`Are you sure you want to delete the cipher "${cipherName}"?`)) {
            return;
        }

        const savedCiphers = this.getSavedCiphers();
        delete savedCiphers[cipherName];
        
        localStorage.setItem('decoderSavedCiphers', JSON.stringify(savedCiphers));
        
        this.displaySavedCiphers();
        this.showSuccessMessage(`Cipher "${cipherName}" deleted successfully!`);
    }

    getSavedCiphers() {
        try {
            const saved = localStorage.getItem('decoderSavedCiphers');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Error loading saved ciphers:', e);
            return {};
        }
    }

    displaySavedCiphers() {
        const savedCiphers = this.getSavedCiphers();
        const cipherNames = Object.keys(savedCiphers);
        const container = document.getElementById('savedCiphersList');
        const noSavedText = document.getElementById('noSavedCiphers');
        
        if (cipherNames.length === 0) {
            noSavedText.style.display = 'block';
            container.innerHTML = '';
            return;
        }

        noSavedText.style.display = 'none';
        
        container.innerHTML = cipherNames.map(name => `
            <div class="saved-cipher-btn" data-cipher-name="${name}">
                ${this.escapeHtml(name)}
                <button class="delete-btn" onclick="event.stopPropagation(); decoderGame.deleteCipher('${this.escapeHtml(name)}')" title="Delete cipher">×</button>
            </div>
        `).join('');
        
        // Add click listeners to cipher buttons
        container.querySelectorAll('.saved-cipher-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    const cipherName = btn.dataset.cipherName;
                    this.loadCipher(cipherName);
                }
            });
        });
    }

    showSuccessMessage(message) {
        // Create a temporary success message element
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            font-weight: 600;
            transition: all 0.3s ease;
        `;
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.style.transform = 'translateX(400px)';
            successDiv.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(successDiv);
            }, 300);
        }, 3000);
    }

    showPointsSuccessMessage(message, pointsEarned, totalPoints) {
        // Create a special success message element for points
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 2rem 3rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            z-index: 1000;
            font-weight: 600;
            text-align: center;
            min-width: 300px;
            border: 3px solid #fff;
        `;
        
        successDiv.innerHTML = `
            <div style="font-size: 1.2rem; margin-bottom: 1rem;">
                ${message}
            </div>
            <div style="font-size: 2rem; margin: 1rem 0; color: #FFD700;">
                +${pointsEarned} Points! ⭐
            </div>
            <div style="font-size: 1rem; opacity: 0.9;">
                Total Points: ${totalPoints}
            </div>
            <button id="pointsOkBtn" style="
                margin-top: 1rem;
                background: rgba(255,255,255,0.2);
                color: white;
                border: 2px solid white;
                padding: 0.5rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                Awesome! ✨
            </button>
        `;
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            backdrop-filter: blur(3px);
        `;
        
        document.body.appendChild(backdrop);
        document.body.appendChild(successDiv);
        
        // Handle close button
        const closeBtn = successDiv.querySelector('#pointsOkBtn');
        const closeModal = () => {
            successDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
            successDiv.style.opacity = '0';
            backdrop.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(successDiv)) document.body.removeChild(successDiv);
                if (document.body.contains(backdrop)) document.body.removeChild(backdrop);
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        
        // Auto close after 10 seconds
        setTimeout(closeModal, 10000);
    }

    updatePointsDisplay() {
        const pointsElement = document.getElementById('pointsValue');
        if (pointsElement) {
            pointsElement.textContent = this.totalPoints;
        }
    }

    showPointsNotification(pointsEarned) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'points-notification';
        notification.innerHTML = `
            <div class="notification-icon">⭐</div>
            <div class="notification-text">
                <div class="notification-title">+${pointsEarned} Points!</div>
                <div class="notification-subtitle">Total: ${this.totalPoints}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }

    // Points Management System
    loadPoints() {
        try {
            const savedPoints = localStorage.getItem('decoderGamePoints');
            return savedPoints ? parseInt(savedPoints, 10) : 0;
        } catch (e) {
            console.error('Error loading points:', e);
            return 0;
        }
    }

    savePoints() {
        try {
            localStorage.setItem('decoderGamePoints', this.totalPoints.toString());
        } catch (e) {
            console.error('Error saving points:', e);
        }
    }

    awardPoints(points) {
        this.totalPoints += points;
        this.savePoints();
        this.updatePointsDisplay(); // Update display when points are awarded
        return this.totalPoints;
    }

    getPoints() {
        return this.totalPoints;
    }

    // Cipher Challenge Methods
    resetChallengeState() {
        // Reset input fields
        document.getElementById('sentence1').value = '';
        document.getElementById('sentence2').value = '';
        document.getElementById('sentence3').value = '';
        
        // Hide challenge containers
        document.getElementById('aiChallengeContainer').style.display = 'none';
        document.getElementById('challengeResult').style.display = 'none';
        
        // Reset timer and progress
        this.challengeTimer = null;
        this.challengeTimeLeft = 120; // 2 minutes
        this.updateTimerDisplay();
        this.updateProgressBar(0);
        
        // Clear analysis log and attempts
        document.getElementById('analysisLog').innerHTML = '<p>Starting cipher analysis...</p>';
        document.getElementById('attemptsContainer').innerHTML = '';
        
        this.challengeAttempts = [];
        this.challengeSentences = [];
    }

    startAIChallenge() {
        // Get the three sentences
        const sentence1 = document.getElementById('sentence1').value.trim();
        const sentence2 = document.getElementById('sentence2').value.trim();
        const sentence3 = document.getElementById('sentence3').value.trim();
        
        // Validate input
        if (!sentence1 || !sentence2 || !sentence3) {
            alert('Please enter all three encrypted sentences before starting the challenge!');
            return;
        }
        
        // Store sentences
        this.challengeSentences = [sentence1, sentence2, sentence3];
        
        // Show AI challenge container
        document.getElementById('aiChallengeContainer').style.display = 'block';
        
        // Start the timer and AI challenge
        this.startChallengeTimer();
        this.runAIDecryption();
    }

    startChallengeTimer() {
        this.challengeTimeLeft = 120; // 2 minutes
        this.updateTimerDisplay();
        
        this.challengeTimer = setInterval(() => {
            this.challengeTimeLeft--;
            this.updateTimerDisplay();
            this.updateProgressBar((120 - this.challengeTimeLeft) / 120 * 100);
            
            // Check if time is running out
            const timerElement = document.getElementById('timerValue');
            if (this.challengeTimeLeft <= 30) {
                timerElement.classList.add('critical');
                timerElement.classList.remove('warning');
            } else if (this.challengeTimeLeft <= 60) {
                timerElement.classList.add('warning');
                timerElement.classList.remove('critical');
            }
            
            if (this.challengeTimeLeft <= 0) {
                this.endChallenge(false); // Player wins - AI failed
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.challengeTimeLeft / 60);
        const seconds = this.challengeTimeLeft % 60;
        const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timerValue').textContent = timerText;
    }

    updateProgressBar(percentage) {
        document.getElementById('progressFill').style.width = `${percentage}%`;
    }

    addAnalysisLog(message) {
        const log = document.getElementById('analysisLog');
        const p = document.createElement('p');
        p.textContent = message;
        log.appendChild(p);
        log.scrollTop = log.scrollHeight;
    }

    addAttempt(attemptNumber, attemptText, confidence) {
        const container = document.getElementById('attemptsContainer');
        const attemptDiv = document.createElement('div');
        attemptDiv.className = 'attempt-item';
        
        attemptDiv.innerHTML = `
            <div class="attempt-number">Attempt ${attemptNumber} (Confidence: ${confidence}%)</div>
            <div class="attempt-text">${attemptText}</div>
        `;
        
        container.appendChild(attemptDiv);
        container.scrollTop = container.scrollHeight;
        
        this.challengeAttempts.push({
            number: attemptNumber,
            text: attemptText,
            confidence: confidence
        });
    }

    async runAIDecryption() {
        this.addAnalysisLog('Analyzing cipher patterns...');
        
        try {
            // Phase 1: Pattern Analysis (10-20 seconds)
            await this.analyzePatterns();
            
            // Phase 2: Frequency Analysis (20-40 seconds)
            await this.frequencyAnalysis();
            
            // Phase 3: Dictionary Matching (40-80 seconds)
            await this.dictionaryMatching();
            
            // Phase 4: Advanced Techniques (80-120 seconds)
            await this.advancedDecryption();
            
        } catch (error) {
            this.addAnalysisLog('Error during decryption: ' + error.message);
        }
    }

    async analyzePatterns() {
        this.addAnalysisLog('Examining character frequencies...');
        await this.delay(2000);
        
        this.addAnalysisLog('Identifying word boundaries...');
        await this.delay(3000);
        
        this.addAnalysisLog('Looking for common patterns...');
        await this.delay(2000);
        
        // Simple pattern-based attempt
        const simpleAttempt = this.generateSimpleAttempt();
        this.addAttempt(1, simpleAttempt, 15);
        await this.delay(3000);
    }

    async frequencyAnalysis() {
        if (this.challengeTimeLeft <= 0) return;
        
        this.addAnalysisLog('Running frequency analysis on character distribution...');
        await this.delay(4000);
        
        this.addAnalysisLog('Comparing against English letter frequencies...');
        await this.delay(3000);
        
        // Frequency-based attempt
        const frequencyAttempt = this.generateFrequencyAttempt();
        this.addAttempt(2, frequencyAttempt, 35);
        await this.delay(4000);
        
        if (this.challengeTimeLeft <= 0) return;
        
        this.addAnalysisLog('Adjusting mappings based on digram analysis...');
        await this.delay(3000);
        
        const improvedAttempt = this.generateImprovedAttempt();
        this.addAttempt(3, improvedAttempt, 50);
        await this.delay(3000);
    }

    async dictionaryMatching() {
        if (this.challengeTimeLeft <= 0) return;
        
        this.addAnalysisLog('Attempting dictionary word matching...');
        await this.delay(4000);
        
        this.addAnalysisLog('Searching for common English words...');
        await this.delay(3000);
        
        const dictionaryAttempt = this.generateDictionaryAttempt();
        this.addAttempt(4, dictionaryAttempt, 65);
        await this.delay(4000);
        
        if (this.challengeTimeLeft <= 0) return;
        
        // Check if this attempt is good enough to "win"
        if (this.isGoodDecryption(dictionaryAttempt)) {
            this.endChallenge(true); // AI wins
            return;
        }
        
        this.addAnalysisLog('Refining word boundaries...');
        await this.delay(3000);
        
        const refinedAttempt = this.generateRefinedAttempt();
        this.addAttempt(5, refinedAttempt, 75);
        await this.delay(3000);
    }

    async advancedDecryption() {
        if (this.challengeTimeLeft <= 0) return;
        
        this.addAnalysisLog('Applying advanced cryptanalysis techniques...');
        await this.delay(5000);
        
        this.addAnalysisLog('Using context clues and semantic analysis...');
        await this.delay(4000);
        
        const advancedAttempt = this.generateAdvancedAttempt();
        this.addAttempt(6, advancedAttempt, 85);
        await this.delay(4000);
        
        if (this.challengeTimeLeft <= 0) return;
        
        // Final attempt - this might succeed
        if (this.isGoodDecryption(advancedAttempt)) {
            this.endChallenge(true); // AI wins
            return;
        }
        
        this.addAnalysisLog('Making final optimization attempts...');
        await this.delay(3000);
        
        const finalAttempt = this.generateFinalAttempt();
        this.addAttempt(7, finalAttempt, 90);
        
        // Final check
        if (this.isGoodDecryption(finalAttempt)) {
            this.endChallenge(true); // AI wins
        }
    }

    generateSimpleAttempt() {
        // Simple substitution - just replace some common letters
        return this.challengeSentences.map(sentence => {
            return sentence.replace(/E/g, 'A')
                          .replace(/T/g, 'E')
                          .replace(/A/g, 'I')
                          .replace(/O/g, 'O')
                          .replace(/I/g, 'T');
        }).join(' | ');
    }

    generateFrequencyAttempt() {
        // More sophisticated attempt based on frequency
        const commonMappings = {
            'E': 'T', 'T': 'A', 'A': 'O', 'O': 'I', 'I': 'N',
            'N': 'S', 'S': 'H', 'H': 'R', 'R': 'D', 'D': 'L'
        };
        
        return this.challengeSentences.map(sentence => {
            let result = sentence;
            for (const [from, to] of Object.entries(commonMappings)) {
                result = result.replace(new RegExp(from, 'g'), to.toLowerCase());
            }
            return result;
        }).join(' | ');
    }

    generateImprovedAttempt() {
        // Improved version with better mapping
        return this.challengeSentences.map(sentence => {
            return sentence.toLowerCase()
                          .replace(/x/g, 'e')
                          .replace(/q/g, 't')
                          .replace(/z/g, 'a')
                          .replace(/w/g, 'o')
                          .replace(/j/g, 'i');
        }).join(' | ');
    }

    generateDictionaryAttempt() {
        // Attempt to make recognizable words
        return this.challengeSentences.map(sentence => {
            return sentence.toLowerCase()
                          .replace(/th/g, 'the')
                          .replace(/nd/g, 'and')
                          .replace(/ht/g, 'hat')
                          .replace(/is/g, 'it')
                          .replace(/at/g, 'to');
        }).join(' | ');
    }

    generateRefinedAttempt() {
        // More refined attempt
        return 'meet me at the secret location | bring the package carefully | trust no one else completely';
    }

    generateAdvancedAttempt() {
        // Advanced attempt - getting closer
        return 'the quick brown fox jumps over | secret messages need careful handling | victory belongs to the persistent';
    }

    generateFinalAttempt() {
        // Final attempt - this could be very close
        return 'this is the first decoded sentence | here is the second important message | the third sentence completes the challenge';
    }

    isGoodDecryption(attempt) {
        // Check if the decryption is "good enough" for AI to win
        // This is somewhat random to make the game interesting
        const randomFactor = Math.random();
        const timeProgression = (120 - this.challengeTimeLeft) / 120;
        
        // AI has a higher chance of success as time progresses
        const successThreshold = 0.3 + (timeProgression * 0.4); // 30% to 70% chance
        
        return randomFactor < successThreshold;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    endChallenge(aiWon) {
        // Stop the timer
        if (this.challengeTimer) {
            clearInterval(this.challengeTimer);
            this.challengeTimer = null;
        }
        
        // Show result
        document.getElementById('challengeResult').style.display = 'block';
        const resultContent = document.getElementById('resultContent');
        
        if (aiWon) {
            // AI succeeded - player loses 2 points
            this.awardPoints(-2);
            this.addAnalysisLog('DECRYPTION SUCCESSFUL! AI has cracked your cipher.');
            
            resultContent.innerHTML = `
                <div class="result-lose">🤖 AI Wins!</div>
                <div class="result-details">
                    <p>The AI successfully decoded your cipher in ${Math.floor((120 - this.challengeTimeLeft) / 60)}:${((120 - this.challengeTimeLeft) % 60).toString().padStart(2, '0')}!</p>
                    <p><strong>-2 Points</strong> - Better luck next time!</p>
                    <p>Your current score: <strong>${this.totalPoints} points</strong></p>
                </div>
            `;
            
            this.showPointsNotification(-2, '🤖 AI cracked your cipher! -2 points');
        } else {
            // Player wins - AI failed
            this.awardPoints(2);
            this.addAnalysisLog('DECRYPTION FAILED! Your cipher has defeated the AI.');
            
            resultContent.innerHTML = `
                <div class="result-win">🎉 You Win!</div>
                <div class="result-details">
                    <p>Your cipher successfully stumped the AI for the full 2 minutes!</p>
                    <p><strong>+2 Points</strong> - Excellent cipher skills!</p>
                    <p>Your current score: <strong>${this.totalPoints} points</strong></p>
                </div>
            `;
            
            this.showPointsNotification(2, '🎉 Your cipher stumped the AI! +2 points');
        }
        
        // Scroll to result
        document.getElementById('challengeResult').scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the game when the page loads
let decoderGame;
document.addEventListener('DOMContentLoaded', () => {
    decoderGame = new DecoderGame();
});
