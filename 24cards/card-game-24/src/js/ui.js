document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        title: document.getElementById('title-screen'),
        solo: document.getElementById('solo-screen'),
        multiplayer: document.getElementById('multiplayer-screen'),
    };

    const soloButton = document.getElementById('solo-mode');
    const multiplayerButton = document.getElementById('multiplayer-mode');
    const backButtons = document.querySelectorAll('[data-action="back"]');

    const showScreen = (screenKey) => {
        Object.values(screens).forEach((screen) => screen.classList.remove('screen-active'));
        screens[screenKey].classList.add('screen-active');
    };

    soloButton.addEventListener('click', () => showScreen('solo'));
    multiplayerButton.addEventListener('click', () => showScreen('multiplayer'));
    backButtons.forEach((button) => button.addEventListener('click', () => showScreen('title')));
});