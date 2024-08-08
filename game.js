const suits = ['C', 'D', 'H', 'S'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const cardBack = 'green_back.png';
const greekNames = [
  'Alexander', 'Dimitri', 'Nikos', 'Georgios', 'Sophia', 'Elena', 'Maria', 'Athena',
  'Constantine', 'Theodore', 'Leonidas', 'Spiros', 'Helena', 'Penelope', 'Irene',
  'Ariadne', 'Evangelos', 'Stavros', 'Katerina', 'Chloe'
];

const players = [
  { id: 'dealer', name: 'Dealer' },
  { id: 'player1', name: '' },
  { id: 'player2', name: '' },
  { id: 'player', name: '' },
];

let deck = [];
let hands = {};
let playerName = '';

function createDeck() {
  deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ value, suit, image: `${value}${suit}.png` });
    }
  }
  shuffleDeck();
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function dealCard(hand, faceDown = false) {
  const card = deck.pop();
  hand.cards.push(card);
  const element = document.createElement('img');
  element.src = faceDown ? `cards/${cardBack}` : `cards/${card.image}`;
  element.classList.add('card');
  if (faceDown) {
    element.classList.add('face-down');
    element.setAttribute('data-value', card.value);
    element.setAttribute('data-suit', card.suit);
  }
  document.getElementById(`${hand.id}-cards`).appendChild(element);
  updateHandValue(hand);
}

function calculateHandValue(hand) {
  let value = 0;
  let aceCount = 0;

  for (const card of hand.cards) {
    if (card.value === 'A') {
      aceCount++;
      value += 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value, 10);
    }
  }

  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }

  return value;
}

function updateHandValue(hand) {
  const value = calculateHandValue(hand);
  document.getElementById(`${hand.id}-value`).innerText = `(${value})`;
}

function initGame() {
  createDeck();
  hands = {};

  for (const player of players) {
    if (player.id !== 'dealer' && player.id !== 'player') {
      player.name = greekNames[Math.floor(Math.random() * greekNames.length)];
      document.getElementById(`${player.id}-name`).innerText = player.name;
    } else if (player.id === 'player') {
      player.name = playerName;
      document.getElementById(`${player.id}-name`).innerText = player.name;
    }

    hands[player.id] = { id: player.id, name: player.name, cards: [] };
    document.getElementById(`${player.id}-cards`).innerHTML = '';
    document.getElementById(`${player.id}-value`).innerText = '';
  }

  for (const hand of Object.values(hands)) {
    dealCard(hand);
    if (hand.id === 'dealer') {
      dealCard(hand, true);
    } else {
      dealCard(hand);
    }
  }

  document.getElementById('hit').disabled = false;
  document.getElementById('stand').disabled = false;
  document.getElementById('deal').disabled = true;
  document.getElementById('player').classList.add('active');
}

function hit() {
  const playerHand = hands.player;
  dealCard(playerHand);

  if (calculateHandValue(playerHand) > 21) {
    stand();
  }
}

async function stand() {
  document.getElementById('hit').disabled = true;
  document.getElementById('stand').disabled = true;
  document.getElementById('player').classList.remove('active');

  const dealerHand = hands.dealer;
  const faceDownCard = document.querySelector('#dealer-cards .face-down');
  faceDownCard.src = `cards/${faceDownCard.getAttribute('data-value')}${faceDownCard.getAttribute('data-suit')}.png`;
  faceDownCard.classList.remove('face-down');
  updateHandValue(dealerHand);

  while (calculateHandValue(dealerHand) < 17) {
    dealCard(dealerHand);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const dealerValue = calculateHandValue(dealerHand);
  if (dealerValue > 21) {
    showMessage('Dealer busts! You win!');
  } else {
    let winners = [];

    for (const hand of Object.values(hands)) {
      if (hand.id !== 'dealer') {
        const value = calculateHandValue(hand);
        if (value > dealerValue && value <= 21) {
          winners.push(hand.name);
        }
      }
    }

    showMessage(`${winners.length > 0 ? `${winners.join(' and ')} win${winners.length > 1 ? 's' : ''}!` : 'Dealer wins!'}`);
  }

  document.getElementById('deal').disabled = false;
}

function showMessage(text) {
  const message = document.getElementById('message');
  message.innerText = text;
  message.classList.remove('hide');
  setTimeout(() => message.classList.add('hide'), 3000);
}

function startGame() {
  playerName = document.getElementById('username').value.trim();
  if (!playerName) {
    playerName = 'Player';
  }
  document.getElementById('start-screen').classList.add('hide');
  document.getElementById('game').classList.remove('hide');
  initGame();
}

function addTouchListeners() {
  const buttons = document.querySelectorAll('.action-button');
  buttons.forEach(button => {
    button.addEventListener('touchstart', () => {
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
    });
    button.addEventListener('touchend', () => {
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  addTouchListeners();

  document.getElementById('hit').addEventListener('click', hit);
  document.getElementById('stand').addEventListener('click', stand);
  document.getElementById('deal').addEventListener('click', initGame);
  document.getElementById('start-game').addEventListener('click', startGame);

  // Adding touch event listeners for buttons
  document.getElementById('hit').addEventListener('touchstart', hit);
  document.getElementById('stand').addEventListener('touchstart', stand);
  document.getElementById('deal').addEventListener('touchstart', initGame);
  document.getElementById('start-game').addEventListener('touchstart', startGame);
});