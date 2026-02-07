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
    const dealArea = document.querySelector('.deal-area');
    const tableArea = document.querySelector('#multiplayer-screen .table-area');
    const leftDeck = document.querySelector('#multiplayer-screen [data-deck="left"] .deck-stack');
    const rightDeck = document.querySelector('#multiplayer-screen [data-deck="right"] .deck-stack');

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
        const leftX = areaRect.width * 0.35 - cardWidth / 2;
        const rightX = areaRect.width * 0.65 - cardWidth / 2;
        const topY = areaRect.height * 0.35 - cardHeight / 2;
        const bottomY = areaRect.height * 0.62 - cardHeight / 2;

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

    const clearDealtCards = () => {
        if (!dealArea) {
            return;
        }
        dealArea.innerHTML = '';
    };

    const dealCards = () => {
        if (!dealArea || !tableArea) {
            return;
        }

        const deck = shuffleDeck(createDeck());
        const drawn = deck.slice(0, 4);
        const areaRect = tableArea.getBoundingClientRect();
        const cardWidth = 130;
        const cardHeight = 182;
        const targets = getCenterTargets(areaRect, cardWidth, cardHeight);
        const leftOrigin = getDeckOrigin(leftDeck, areaRect, cardWidth, cardHeight);
        const rightOrigin = getDeckOrigin(rightDeck, areaRect, cardWidth, cardHeight);

        clearDealtCards();

        drawn.forEach((card, index) => {
            const cardElement = buildCardElement(card);
            const target = targets[index];
            const origin = index < 2 ? leftOrigin : rightOrigin;

            cardElement.style.left = `${target.x}px`;
            cardElement.style.top = `${target.y}px`;
            cardElement.style.transform = `translate(${origin.x - target.x}px, ${origin.y - target.y}px)`;

            dealArea.appendChild(cardElement);

            requestAnimationFrame(() => {
                cardElement.style.transform = 'translate(0, 0)';
                cardElement.classList.add('flipped');
            });
        });
    };

    if (soloButton) {
        soloButton.addEventListener('click', () => showScreen('solo'));
    }

    if (multiplayerButton) {
        multiplayerButton.addEventListener('click', () => showScreen('multiplayer'));
    }

    backButtons.forEach((button) => button.addEventListener('click', () => showScreen('title')));

    editButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const playerId = button.getAttribute('data-edit');
            const nameTag = document.querySelector(`.player-name[data-player="${playerId}"]`);
            if (!nameTag) {
                return;
            }
            const currentName = nameTag.textContent.trim();
            const nextName = window.prompt('Edit player name:', currentName);
            if (nextName && nextName.trim().length > 0) {
                nameTag.textContent = nextName.trim();
            }
        });
    });

    if (playButton) {
        playButton.addEventListener('click', dealCards);
    }

    showScreen('title');
});