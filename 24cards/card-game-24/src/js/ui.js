document.addEventListener('DOMContentLoaded', () => {
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
        Object.values(screens).forEach((screen) => screen.classList.remove('screen-active'));
        screens[screenKey].classList.add('screen-active');
    };

    soloButton.addEventListener('click', () => showScreen('solo'));
    multiplayerButton.addEventListener('click', () => showScreen('multiplayer'));
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
});