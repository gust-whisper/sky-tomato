document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('safe') === '1') {
        document.body.classList.add('safe-mode');
    }

    const screens = {
        title: document.getElementById('title-screen'),
        solo: document.getElementById('solo-screen'),
        multiplayer: document.getElementById('multiplayer-screen'),
    };

    const soloButton = document.getElementById('solo-mode');
    const multiplayerButton = document.getElementById('multiplayer-mode');
    const backButtons = document.querySelectorAll('[data-action="back"]');
    const editButtons = document.querySelectorAll('[data-edit]');
    const playButton = document.getElementById('play-button');
    const durationSlider = document.querySelector('.duration-slider');
    const durationTabs = document.querySelectorAll('[data-duration-option]');
    const dealArea = document.querySelector('.deal-area');
    const tableArea = document.querySelector('#multiplayer-screen .table-area');
    const tableCenter = document.querySelector('#multiplayer-screen .table-center');
    const emptyTable = document.querySelector('#multiplayer-screen .empty-table');
    const pauseOverlay = document.querySelector('#multiplayer-screen .pause-overlay');
    const pauseButtons = document.querySelectorAll('#multiplayer-screen [data-pause]');
    const claimSlider = document.querySelector('#multiplayer-screen .pause-claim-slider');
    const claimTabs = document.querySelectorAll('#multiplayer-screen [data-claim-side]');
    const claimedLeft = document.querySelector('#multiplayer-screen [data-claimed="left"]');
    const claimedRight = document.querySelector('#multiplayer-screen [data-claimed="right"]');
    const leftDeck = document.querySelector('#multiplayer-screen [data-deck="left"] .deck-stack');
    const rightDeck = document.querySelector('#multiplayer-screen [data-deck="right"] .deck-stack');
    const playerOneName = document.querySelector('#multiplayer-screen .player-name[data-player="1"]');
    const playerTwoName = document.querySelector('#multiplayer-screen .player-name[data-player="2"]');
    const emptyTableDefault = emptyTable ? emptyTable.textContent.trim() : '';
    let countdownTimer = null;
    let isCountdownActive = false;
    let isPauseActive = false;
    let isRoundActive = false;
    let lastClaimSide = null;
    const falseAlarmCounts = { left: 0, right: 0 };
    let selectedClaimSide = null;
    let areNamesLocked = false;

    const leftKeys = new Set('QWERTASDFGZXCV'.split(''));
    const rightKeys = new Set('YHBNJUIKMLOP'.split(''));

    const suits = [
        { symbol: '♠', name: 'spades', color: 'black' },
        { symbol: '♣', name: 'clubs', color: 'black' },
        { symbol: '♥', name: 'hearts', color: 'red' },
        { symbol: '♦', name: 'diamonds', color: 'red' },
    ];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const showScreen = (screenKey) => {
        Object.values(screens)
            .filter(Boolean)
            .forEach((screen) => screen.classList.remove('screen-active'));
        if (screens[screenKey]) {
            screens[screenKey].classList.add('screen-active');
        }
        if (screenKey === 'title') {
            document.body.classList.add('title-active');
        } else {
            document.body.classList.remove('title-active');
        }
    };

    const isMultiplayerActive = () => screens.multiplayer && screens.multiplayer.classList.contains('screen-active');

    const getPlayerNames = () => ({
        left: playerOneName ? playerOneName.textContent.trim() : 'Player One',
        right: playerTwoName ? playerTwoName.textContent.trim() : 'Player Two',
    });

    const updateClaimLabels = () => {
        const names = getPlayerNames();
        claimTabs.forEach((tab) => {
            const side = tab.getAttribute('data-claim-side');
            tab.textContent = side === 'right' ? names.right : names.left;
        });
    };

    const setClaimSide = (side) => {
        if (!side || !claimSlider) {
            return;
        }
        selectedClaimSide = side;
        claimSlider.setAttribute('data-active', side);
        claimTabs.forEach((tab) => {
            const tabSide = tab.getAttribute('data-claim-side');
            tab.classList.toggle('is-active', tabSide === side);
        });
    };

    const lockPlayerNames = () => {
        if (areNamesLocked) {
            return;
        }
        areNamesLocked = true;
        editButtons.forEach((button) => button.classList.add('is-locked'));
    };

    const unlockPlayerNames = () => {
        areNamesLocked = false;
        editButtons.forEach((button) => button.classList.remove('is-locked'));
    };

    const resetMultiplayerState = () => {
        if (countdownTimer) {
            window.clearInterval(countdownTimer);
            countdownTimer = null;
        }
        isCountdownActive = false;
        isPauseActive = false;
        isRoundActive = false;
        lastClaimSide = null;
        selectedClaimSide = null;
        falseAlarmCounts.left = 0;
        falseAlarmCounts.right = 0;
        unlockPlayerNames();
        if (tableArea) {
            tableArea.classList.remove('countdown-active', 'pause-active');
        }
        if (tableCenter) {
            tableCenter.classList.remove('is-hidden');
        }
        if (emptyTableDefault && emptyTable) {
            emptyTable.textContent = emptyTableDefault;
        }
        if (playButton) {
            playButton.disabled = false;
        }
        if (pauseOverlay) {
            pauseOverlay.setAttribute('aria-hidden', 'true');
        }
        clearDealtCards();
        if (claimedLeft) {
            claimedLeft.innerHTML = '';
        }
        if (claimedRight) {
            claimedRight.innerHTML = '';
        }
    };

    const createDeck = () => {
        const deck = [];
        suits.forEach((suit) => {
            ranks.forEach((rank) => {
                deck.push({ rank, suit });
            });
        });
        return deck;
    };

    const shuffleDeck = (deck) => {
        for (let i = deck.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    };

    const buildCardElement = (card) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'deal-card';
        const inner = document.createElement('div');
        inner.className = 'card-inner';

        const front = document.createElement('div');
        front.className = `card-face front ${card.suit.color === 'red' ? 'red' : ''}`.trim();
        const cornerTop = document.createElement('div');
        cornerTop.className = 'card-corner top';
        cornerTop.innerHTML = `<span class="card-rank">${card.rank}</span><span class="card-suit">${card.suit.symbol}</span>`;

        const cornerBottom = document.createElement('div');
        cornerBottom.className = 'card-corner bottom';
        cornerBottom.innerHTML = `<span class="card-rank">${card.rank}</span><span class="card-suit">${card.suit.symbol}</span>`;

        const pip = document.createElement('div');
        pip.className = 'card-pip';
        pip.textContent = card.suit.symbol;

        front.appendChild(cornerTop);
        front.appendChild(cornerBottom);
        front.appendChild(pip);

        const back = document.createElement('div');
        back.className = 'card-face back';

        inner.appendChild(front);
        inner.appendChild(back);
        cardElement.appendChild(inner);
        return cardElement;
    };

    const getCenterTargets = (areaRect, cardWidth, cardHeight) => {
        const leftX = areaRect.width * 0.44 - cardWidth / 2 - 15;
        const rightX = areaRect.width * 0.56 - cardWidth / 2 + 15;
        const topY = areaRect.height * 0.36 - cardHeight / 2 - 15;
        const bottomY = areaRect.height * 0.64 - cardHeight / 2 + 15;

        return [
            { x: leftX, y: topY },
            { x: leftX, y: bottomY },
            { x: rightX, y: topY },
            { x: rightX, y: bottomY },
        ];
    };

    const getDeckOrigin = (deckElement, areaRect, cardWidth, cardHeight) => {
        if (!deckElement) {
            return { x: areaRect.width / 2 - cardWidth / 2, y: areaRect.height / 2 - cardHeight / 2 };
        }
        const deckRect = deckElement.getBoundingClientRect();
        return {
            x: deckRect.left - areaRect.left + deckRect.width / 2 - cardWidth / 2,
            y: deckRect.top - areaRect.top + deckRect.height / 2 - cardHeight / 2,
        };
    };

    const getDeckBottom = (deckElement, areaRect, cardWidth, cardHeight) => {
        if (!deckElement) {
            return { x: areaRect.width / 2 - cardWidth / 2, y: areaRect.height / 2 - cardHeight / 2 };
        }
        const deckRect = deckElement.getBoundingClientRect();
        return {
            x: deckRect.left - areaRect.left + deckRect.width / 2 - cardWidth / 2,
            y: deckRect.bottom - areaRect.top - cardHeight + 6,
        };
    };

    const clearDealtCards = () => {
        if (!dealArea) {
            return;
        }
        dealArea.innerHTML = '';
    };

    const hidePauseOverlay = () => {
        isPauseActive = false;
        if (tableArea) {
            tableArea.classList.remove('pause-active');
        }
        if (pauseOverlay) {
            pauseOverlay.setAttribute('aria-hidden', 'true');
        }
    };

    const showPauseOverlay = (side) => {
        if (!tableArea || isPauseActive || isCountdownActive || !isRoundActive) {
            return;
        }
        isPauseActive = true;
        lastClaimSide = side;
        updateClaimLabels();
        setClaimSide(side);
        tableArea.classList.add('pause-active');
        if (pauseOverlay) {
            pauseOverlay.setAttribute('aria-hidden', 'false');
        }
    };

    const dealCards = ({ flipOnDeal = true } = {}) => {
        if (!dealArea || !tableArea) {
            return;
        }

        const deck = shuffleDeck(createDeck());
        const drawn = deck.slice(0, 4);
        const areaRect = tableArea.getBoundingClientRect();
        const cardWidth = 157;
        const cardHeight = 220;
        const targets = getCenterTargets(areaRect, cardWidth, cardHeight);
        const leftOrigin = getDeckBottom(leftDeck, areaRect, cardWidth, cardHeight);
        const rightOrigin = getDeckBottom(rightDeck, areaRect, cardWidth, cardHeight);

        clearDealtCards();

        drawn.forEach((card, index) => {
            const cardElement = buildCardElement(card);
            const target = targets[index];
            const origin = index < 2 ? leftOrigin : rightOrigin;
            const originSide = index < 2 ? 'left' : 'right';

            cardElement.style.left = `${target.x}px`;
            cardElement.style.top = `${target.y}px`;
            cardElement.style.transform = `translate(${origin.x - target.x}px, ${origin.y - target.y}px)`;
            cardElement.dataset.origin = originSide;

            dealArea.appendChild(cardElement);

            requestAnimationFrame(() => {
                cardElement.style.transform = 'translate(0, 0)';
                cardElement.classList.add('is-boosted');
                if (flipOnDeal) {
                    cardElement.classList.add('flipped');
                }
            });
        });
    };

    const moveCardsToCorner = (side) => {
        if (!dealArea || !tableArea) {
            return;
        }
        const cards = Array.from(dealArea.querySelectorAll('.deal-card'));
        if (cards.length === 0) {
            startCountdown();
            return;
        }
        const targetPile = side === 'right' ? claimedRight : claimedLeft;
        if (!targetPile) {
            clearDealtCards();
            startCountdown();
            return;
        }

        const areaRect = tableArea.getBoundingClientRect();
        const cardWidth = 157;
        const cardHeight = 220;
        const stackX = areaRect.width / 2 - cardWidth / 2;
        const stackY = areaRect.height / 2 - cardHeight / 2;
        const cornerPadding = 18;
        const leftOrigin = getDeckOrigin(leftDeck, areaRect, cardWidth, cardHeight);
        const rightOrigin = getDeckOrigin(rightDeck, areaRect, cardWidth, cardHeight);
        const deckOrigin = side === 'right' ? rightOrigin : leftOrigin;
        const cornerX = deckOrigin.x;
        const cornerY = areaRect.height - cardHeight - cornerPadding;

        cards.forEach((card) => {
            card.classList.remove('is-boosted');
            card.style.left = `${stackX}px`;
            card.style.top = `${stackY}px`;
        });

        window.setTimeout(() => {
            targetPile.style.left = `${cornerX}px`;
            targetPile.style.right = 'auto';
            targetPile.style.bottom = `${cornerPadding}px`;
            cards.forEach((card) => {
                card.style.left = `${cornerX}px`;
                card.style.top = `${cornerY}px`;
            });
        }, 650);

        window.setTimeout(() => {
            cards.forEach((card, index) => {
                const cardRect = card.getBoundingClientRect();
                const pileRect = targetPile.getBoundingClientRect();
                const offsetX = cardRect.left - pileRect.left;
                const offsetY = cardRect.top - pileRect.top;
                targetPile.appendChild(card);
                card.style.left = `${offsetX}px`;
                card.style.top = `${offsetY}px`;
                const stackOffset = index * 4;
                requestAnimationFrame(() => {
                    card.style.left = `${stackOffset}px`;
                    card.style.top = `${stackOffset * -0.6}px`;
                });
            });
        }, 700);

        window.setTimeout(() => {
            startCountdown();
        }, 1350);
    };

    const returnCardsToDecks = () => {
        if (!dealArea || !tableArea) {
            startCountdown();
            return;
        }
        const cards = Array.from(dealArea.querySelectorAll('.deal-card'));
        if (cards.length === 0) {
            startCountdown();
            return;
        }

        const areaRect = tableArea.getBoundingClientRect();
        const cardWidth = 157;
        const cardHeight = 220;
        const leftOrigin = getDeckOrigin(leftDeck, areaRect, cardWidth, cardHeight);
        const rightOrigin = getDeckOrigin(rightDeck, areaRect, cardWidth, cardHeight);

        cards.forEach((card) => {
            card.classList.remove('is-boosted');
            card.classList.remove('flipped');
        });

        window.setTimeout(() => {
            cards.forEach((card) => {
                const originSide = card.dataset.origin || 'left';
                const target = originSide === 'right' ? rightOrigin : leftOrigin;
                card.style.left = `${target.x}px`;
                card.style.top = `${target.y}px`;
            });
        }, 150);

        window.setTimeout(() => {
            clearDealtCards();
            startCountdown();
        }, 900);
    };

    const startCountdown = () => {
        if (isCountdownActive) {
            return;
        }
        if (!tableCenter || !emptyTable) {
            dealCards();
            return;
        }

        hidePauseOverlay();
        lastClaimSide = null;
        selectedClaimSide = null;
        isRoundActive = false;
        isCountdownActive = true;
        lockPlayerNames();
        if (playButton) {
            playButton.disabled = true;
        }
        tableCenter.classList.remove('is-hidden');
        if (tableArea) {
            tableArea.classList.add('countdown-active');
        }
        emptyTable.textContent = '3';

        clearDealtCards();
        dealCards({ flipOnDeal: false });

        let count = 3;
        countdownTimer = window.setInterval(() => {
            count -= 1;
            if (count > 0) {
                emptyTable.textContent = String(count);
                return;
            }

            window.clearInterval(countdownTimer);
            countdownTimer = null;
            if (tableArea) {
                tableArea.classList.remove('countdown-active');
            }
            tableCenter.classList.add('is-hidden');
            if (emptyTableDefault) {
                emptyTable.textContent = emptyTableDefault;
            }

            if (dealArea) {
                dealArea.querySelectorAll('.deal-card').forEach((card) => {
                    card.classList.add('flipped');
                });
            }

            isCountdownActive = false;
            isRoundActive = true;
            if (playButton) {
                playButton.disabled = false;
            }
        }, 1000);
    };

    if (soloButton) {
        soloButton.addEventListener('click', () => showScreen('solo'));
    }

    if (multiplayerButton) {
        multiplayerButton.addEventListener('click', () => showScreen('multiplayer'));
    }

    backButtons.forEach((button) => button.addEventListener('click', () => {
        resetMultiplayerState();
        showScreen('title');
    }));

    editButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (areNamesLocked) {
                return;
            }
            const playerId = button.getAttribute('data-edit');
            const nameTag = document.querySelector(`.player-name[data-player="${playerId}"]`);
            if (!nameTag) {
                return;
            }
            const currentName = nameTag.textContent.trim();
            const nextName = window.prompt('Edit player name:', currentName);
            if (nextName && nextName.trim().length > 0) {
                nameTag.textContent = nextName.trim();
                updateClaimLabels();
            }
        });
    });

    if (playButton) {
        playButton.addEventListener('click', () => startCountdown());
    }

    pauseButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-pause');
            if (action === 'false-alarm') {
                hidePauseOverlay();
                const countSide = selectedClaimSide || lastClaimSide;
                if (countSide && falseAlarmCounts[countSide] !== undefined) {
                    falseAlarmCounts[countSide] += 1;
                    if (falseAlarmCounts[countSide] >= 3) {
                        falseAlarmCounts[countSide] = 0;
                        isRoundActive = false;
                        const awardSide = countSide === 'left' ? 'right' : 'left';
                        moveCardsToCorner(awardSide);
                        return;
                    }
                }
                return;
            }
            if (action === 'claim') {
                hidePauseOverlay();
                isRoundActive = false;
                falseAlarmCounts.left = 0;
                falseAlarmCounts.right = 0;
                const awardSide = selectedClaimSide || lastClaimSide;
                if (awardSide) {
                    moveCardsToCorner(awardSide);
                }
                return;
            }
            if (action === 'impossible') {
                hidePauseOverlay();
                isRoundActive = false;
                returnCardsToDecks();
            }
        });
    });

    claimTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const side = tab.getAttribute('data-claim-side');
            setClaimSide(side);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.repeat || !isMultiplayerActive()) {
            return;
        }
        if (isPauseActive) {
            if (event.code === 'Space') {
                event.preventDefault();
                hidePauseOverlay();
                isRoundActive = false;
                falseAlarmCounts.left = 0;
                falseAlarmCounts.right = 0;
                const awardSide = selectedClaimSide || lastClaimSide;
                if (awardSide) {
                    moveCardsToCorner(awardSide);
                }
            }
            return;
        }
        if (isCountdownActive || !isRoundActive) {
            return;
        }
        const key = event.key.toUpperCase();
        if (leftKeys.has(key)) {
            showPauseOverlay('left');
            return;
        }
        if (rightKeys.has(key)) {
            showPauseOverlay('right');
        }
    });

    durationTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            if (!durationSlider) {
                return;
            }
            const option = tab.getAttribute('data-duration-option') || 'norm';
            durationSlider.setAttribute('data-duration', option);
            durationTabs.forEach((other) => {
                other.classList.toggle('is-active', other === tab);
            });
        });
    });

    showScreen('title');
});