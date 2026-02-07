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

    showScreen('title');
});