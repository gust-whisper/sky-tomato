// This file contains utility functions for the "24" card game.

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateRandomNumbers(count, min, max) {
    const numbers = [];
    for (let i = 0; i < count; i++) {
        numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return numbers;
}

function calculateCardValue(card) {
    if (card === 'A') return 1;
    if (['J', 'Q', 'K'].includes(card)) return 10;
    return parseInt(card, 10);
}

function isValidCombination(numbers, target) {
    // Implement logic to check if a combination of numbers can reach the target
    // This is a placeholder for the actual implementation
    return false;
}