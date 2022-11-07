var deckOfCards,
  sound,
  cardsInPlay = [],
  discardIndexes = [],
  cardsDiscarded = [],
  cardsForDoubling = [],
  cardToAnimate = [];
var betAmount,
  bInvalidBet,
  chips,
  cardsAnim,
  state,
  mult,
  highOrLow,
  doubleCount,
  nextCard,
  startBgm,
  muteBgm,
  savedChips,
  result,
  pastBet;
const betMessage = "Betting\n🡅 or 🡇: +/- 1  \n🡄 or 🡆: +/- 10",
  invalidBetMessage = "Bet amount must be less\n than or equal to Chips!",
  discardMessage = "Select cards you wish to trade",
  dealMessage = "Click 'Deal' to deal a new hand",
  doubleMessage = "Play Higher/Lower to multiply winnings?",
  continuePlayingMessage = "Go again?",
  highLowMessage = "Will the next card be higher or lower?",
  hlwinMessage = "Alright! Winnings Doubled!",
  hlloseMessage = "Sorry! You lost everything!",
  hlmaxMessage = "Maximum Doubling Reached!\nReturning to start...",
  playAgainMessage = "Press 'enter' to play again",
  gameoverMessage = "You ran out of chips!\nGAMEOVER",
  streakMessage = "x Streak!",
  pokerHands1 = "Royal Flush       x100\nFive of a Kind    x50\nStraight Flush    x20\nFour of a Kind    x10\nFull House        x5",
  pokerHands2 = "Flush              x4\nStraight           x3\nThree of a Kind    x2\nTwo Pair           x1\nOne Pair           x0",
  dealButton = "Deal",
  playAgainButton = "Play Again",
  okButton = "OK",
  tradeAllButton = "Trade All",
  highButton = "High",
  lowButton = "Low",
  yesButton = "YES",
  noButton = "NO",
  musicButton = "♪",
  welcome = "welcome",
  start = "start",
  discard = "discard",
  doubling = "doubling",
  eval = "eval",
  end = "end",
  highlow = "highlow",
  hlwin = "hlwin",
  hllose = "hllose",
  hlmax = "hlmax",
  gameover = "gameover";
const CARDSY = 480,
  WIDTH = 1280,
  HEIGHT = 720,
  CENTER_X = 640,
  CENTER_Y = 360,
  STARTING_CHIPS = 100,
  DOUBLE_LIMIT = 10;

//=============================================================
// Pre load media files
function preload() {
  print('preload');
  sound = new Sound();
}

//=============================================================
// Set up the environment
function setup() {
  createCanvas(WIDTH, HEIGHT);

  // Create an array of cards
  deckOfCards = Card.getDeck(true);

  // Enum state = {start, discard, eval, end}
  state = start;

  // Starting number of chips
  savedChips = getItem('chips');
  if (savedChips != null)
    chips = savedChips;
  else
    chips = STARTING_CHIPS;
  betAmount = 1;
  bInvalidBet = false;
  
  // Set initial state for some vars
  nextCard = null;
  doubleCount = 0;
  startBgm = false;
  muteBgm = false;
  result = "";
  pastBet = -1;
}

//=============================================================
// Handles drawing items. Called 60x/seconds
function draw() {
  // Update environment and variables
  update();

  // Draw green background
  background(20, 140, 50);

  // Draw cards
  // These are the cards in hand
  strokeWeight(1);
  if (![start, highlow, hlwin, hllose, hlmax].includes(state))
    for (let i = 0; i < cardsInPlay.length; i++)
      cardsInPlay[i].draw();
  // These are the cards for doubling
  if (cardsForDoubling.length > 0) {
    let length = cardsForDoubling.length;
    for (let i = 0; i < length; i++) {
      if (i < length - 1) {
        // Cards on the left stack will have a different 
        // position for suit and value placement
        if (i == length - 2)
          cardsForDoubling[i].drawxy(CENTER_X - 90 * (length - i - 1) - 25, CARDSY - 40);
        else
          cardsForDoubling[i].drawstacked(CENTER_X - 60 * (length - i - 1) - 60, CARDSY - 40);
      }
      // draw off center if more than two cards
      else if (i == length - 1 && length > 1)
        cardsForDoubling[i].drawxy(CENTER_X + 100, CARDSY - 40);
      // draw center if only one card
      else if (length == 1)
        cardsForDoubling[i].drawxy(CENTER_X, CARDSY - 40);
    }
    /*
    if (nextCard){
      nextCard.drawxy(CENTER_X + 100, CARDSY - 40);
    }
    */
  }

  // Poker hand multiplier background
  rectMode(CENTER);
  drawBox(432, 102, 720, 160, color(0, 0, 0, 100), color(100, 50, 10));

  // Display pokerhand multipliers
  let currentFont = textFont();
  textFont('Consolas');
  textSize(24);
  textAlign(LEFT, CENTER);
  drawText(pokerHands1, 90, 102, color(0), color(255, 201, 14));
  drawText(pokerHands2, 490, 102, color(0), color(255, 201, 14));

  // Restore the original font
  textFont(currentFont);

  // Chips background
  drawBox(1022, 102, 380, 160, color(0, 0, 0, 100), color(240, 245, 180));
  rect(1020, 100, 380, 2);

  // Display chip amounts
  textSize(32);
  drawText("Chips", 850, 63, color(0, 0, 0, 70), color(0));
  drawText("Bet", 850, 143, color(0, 0, 0, 70), color(0));
  textAlign(RIGHT, CENTER);
  drawText(chips, 1190, 63, color(0, 0, 0, 70), color(0));
  drawText(betAmount, 1190, 143, color(0, 0, 0, 70), color(0));


  // Draw buttons
  rectMode(CENTER);
  strokeWeight(0);
  textAlign(CENTER, CENTER);
  switch (state) {
    case start:
      drawButton(CENTER_X, CENTER_Y + 148, 120, 50, color(0, 0, 0, 150), color(100, 80, 250));
      textSize(36);
      drawText(dealButton, CENTER_X, CENTER_Y + 150, color(0), color(255));
      break;
    case discard:
      drawButton(730, 648, 80, 50, color(0, 0, 0, 150), color(70, 50, 250));
      drawButton(580, 648, 180, 50, color(0, 0, 0, 150), color(200, 0, 100));
      textSize(36);
      drawText(okButton, 730, 650, color(0), color(255));
      drawText(tradeAllButton, 580, 650, color(0), color(255));
      break;
    case end:
      drawButton(640, 648, 80, 50, color(0, 0, 0, 150), color(70, 50, 250));
      textSize(36);
      drawText(okButton, 640, 650, color(0), color(255));
      break;
    case doubling:
      drawButton(570, 648, 100, 50, color(0, 0, 0, 150), color(70, 50, 250));
      drawButton(690, 648, 80, 50, color(0, 0, 0, 150), color(200, 0, 100));
      textSize(36);
      drawText(yesButton, 570, 650, color(0), color(255));
      drawText(noButton, 690, 650, color(0), color(255));
      break;
    case highlow:
      drawButton(570, 648, 110, 50, color(0, 0, 0, 150), color(70, 50, 250));
      drawButton(710, 648, 100, 50, color(0, 0, 0, 150), color(200, 0, 100));
      textSize(36);
      drawText(highButton, 570, 650, color(0), color(255));
      drawText(lowButton, 710, 650, color(0), color(255));
      break;
    case hlwin:
      drawButton(570, 648, 100, 50, color(0, 0, 0, 150), color(70, 50, 250));
      drawButton(690, 648, 80, 50, color(0, 0, 0, 150), color(200, 0, 100));
      textSize(36);
      drawText(yesButton, 570, 650, color(0), color(255));
      drawText(noButton, 690, 650, color(0), color(255));
      break;
    case hllose:
      drawButton(640, 648, 80, 50, color(0, 0, 0, 150), color(70, 50, 250));
      textSize(36);
      drawText(okButton, 640, 650, color(0), color(255));
      break;
    case hlmax:
      drawButton(640, 648, 80, 50, color(0, 0, 0, 150), color(70, 50, 250));
      textSize(36);
      drawText(okButton, 640, 650, color(0), color(255));
      break;
    case gameover:
      drawButton(640, 648, 80, 50, color(0, 0, 0, 150), color(70, 50, 250));
      textSize(36);
      drawText(okButton, 640, 650, color(0), color(255));
      break;
  }
  strokeWeight(1);

  // Draw Messages
  if (state == start) {
    textSize(40);
    textAlign(CENTER, CENTER);
    drawBox(CENTER_X, CENTER_Y - 70, 350, 170, color(0), color(25, 100, 200));
    drawText(betMessage, CENTER_X, CENTER_Y - 70, color(0), color(255));
    drawText(dealMessage, CENTER_X, CENTER_Y + 80, color(0), color(255, 201, 14));
    if (bInvalidBet) {
      textSize(36);
      drawText(invalidBetMessage, 1040, 250, color(50, 150), color(255, 50, 10));
    }
    strokeWeight(0);
    fill(255, 255, 255, 50);
    rect(CENTER_X-112, CENTER_Y - 74, 36, 36); // Up
    rect(CENTER_X-18, CENTER_Y - 74, 36, 36); // Down
    rect(CENTER_X-112, CENTER_Y - 24, 36, 36); // Left
    rect(CENTER_X-18, CENTER_Y - 24, 36, 36); // Right
    strokeWeight(1);
  } 
  else if (state == discard) {
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(discardMessage, CENTER_X, 250, color(0), color(255, 201, 14));
  } 
  else if (state == end) {
    // Display poker hand
    textSize(56);
    textAlign(CENTER, CENTER);
    drawText(result, CENTER_X, 280, color(0), color(255, 201, 14));
    // Show play again text
    //textSize(24);
    //fill(0, 0, 0);
    //text(playAgainMessage, CENTER_X, 300);
    //fill(255, 201, 14);
    //text(playAgainMessage, CENTER_X - 2, 298);
  }
  else if (state == doubling) {
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(doubleMessage, CENTER_X, 250, color(0), color(255, 201, 14));
  }
  else if (state == highlow) {
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(highLowMessage, CENTER_X, 250, color(0), color(255, 201, 14));
    if (doubleCount > 1)
      drawText(doubleCount+streakMessage, CENTER_X + 300, CARDSY-40, color(0), color(255, 201, 14)); 
  }
  else if (state == hlwin) {
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(hlwinMessage, CENTER_X, 250, color(0), color(255, 201, 14)); 
    drawText(continuePlayingMessage, CENTER_X, 300, color(0), color(255, 201, 14));
    if (doubleCount > 1)
      drawText(doubleCount+streakMessage, CENTER_X + 300, CARDSY-40, color(0), color(255, 201, 14)); 
  }
  else if (state == hllose) {
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(hlloseMessage, CENTER_X, 250, color(0), color(255, 201, 14));
  }
  else if (state == hlmax) {
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(hlmaxMessage, CENTER_X, 250, color(0), color(255, 201, 14));
  }
  else if (state == gameover) {
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(gameoverMessage, CENTER_X, 250, color(0), color(255, 201, 14));
  }
  
  // Mute/Unmute button for BGM
  strokeWeight(0);
  if (muteBgm) {
    let color1 = color(20, 140, 50, 50);
    let color2 = color(247, 240, 196, 150);
    drawCircleButton(1250, 690, 40, 35, color1, color2, '♪', 30);
    fill(color(255, 0, 0, 200));
    textSize(49);
    text('⊘', 1250, 690);
  }
  else {
    let color1 = color(20, 140, 50, 200);
    let color2 = color(247, 240, 196, 250);
    drawCircleButton(1250, 690, 40, 35, color1, color2, '♪', 30);
  }
  
}

//=============================================================
// Updates variables based on state and environment
function update() {
  if (state == start && savedChips != chips && chips > 0) {
    savedChips = chips;
    storeItem('chips', savedChips);
  }
  
  if (chips <= 0 && betAmount == 0)
    state = gameover;

  if (state == eval) {
    result = checkHand(cardsInPlay);
    switch(result) {
      case "Royal Flush": mult = 100;
        break;
      case "Five of a Kind": mult = 50;
        break;
      case "Straight Flush": mult = 20;
        break;
      case "Four of a Kind": mult = 10;
        break;
      case "Full House": mult = 5;
        break;
      case "Flush": mult = 4;
        break;
      case "Straight": mult = 3;
        break;
      case "Three of a Kind": mult = 2;
        break;
      case "Two Pair": mult = 1;
        break;
      default: mult = 0;
        break;
    }
    // Play sounds based on final poker hand
    switch(mult) {
      case 100: 
      case 50:
      case 20:
      case 10:
        sound.play("greathand");
        break;
      case 5:
      case 4:
      case 3:
      case 2:
      case 1:
        sound.play("goodhand");
        break;
      case 0: sound.play("badhand");
        break;
    }
    state = end;
    betAmount *= mult;
  }
  else if (state == doubling) {
    if (result == "Nothing" || result == "One Pair") {
      if (pastBet <= chips)
        betAmount = pastBet;
      else
        betAmount = 1;
      state = start;
    }
  }

}

//=============================================================
// Evaluates poker hand and returns 
// result as a string
function checkHand(cardArray) {
  var hand = [];
  var count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var flush = true;
  var onePair = false;
  var twoPair = false;
  var threeOfAKind = false;
  var fourOfAKind = false;
  var straight = true;
  var isRoyal = false;
  var numOfJokers = 0;

  // Initialize count array to all zeroes
  //for (let i = 0; i < count.length; i++)
  //  count[i] = 0;

  // Copy array to new variable
  arrayCopy(cardArray, hand, 5);

  if (hand.length != 5) {
    print("Hand size is invalid!");
    return;
  }

  // Sort the hand by value for easy comparison
  hand.sort((x, y) => {
    if (x.value < y.value) return -1;
    else if (x.value > y.value) return 1;
    else return 0;
  });

  // Count card values and number of Jokers
  for (let i = 0; i < 5; i++) {
    if (hand[i].isJoker)
      numOfJokers++;
    else if (hand[i].value == 14) {
      // Increase number 14 and number 1 for aces
      count[0]++;
      count[13]++;
    } else
      count[hand[i].value - 1]++;
    print(hand[i].toString());
  }

  // Loop through and determine card counts
  for (let i = 1; i < count.length; i++) {
    // Found a pair
    if (count[i] == 2) {
      if (!onePair) {
        onePair = true;
      } else if (onePair) {
        onePair = false;
        twoPair = true;
      }
    }
    // Found a triple
    else if (count[i] == 3)
      threeOfAKind = true;
    else if (count[i] == 4)
      fourOfAKind = true;
  }

  // Assign suit to be the first non Joker card
  suit = hand[0 + numOfJokers].suit;

  // Check for flush
  for (let i = 1 + numOfJokers; i < 5; i++) {
    if (suit != hand[i].suit && !hand[i].isJoker)
      flush = false;
  }

  // Loop through count array to check for straights, taking jokers into account
  for (let i = 13; i > 3; i--) {
    let jokers = numOfJokers;
    straight = true;
    // Loop through 5 card values in the count array
    for (let j = i; j > i - 5; j--) {
      // Skip spaces for every joker if the current value is zero
      if (jokers > 0 && count[j] == 0) {
        jokers--;
      } 
      else if (count[j] == 0) {
        straight = false;
        break;
      }
    }
    // If straight is still true, we found a straight --> Break from loop
    if (straight) {
      if (i == 13)
        isRoyal = true;
      break;
    }
  }
  
  print("\0");

  // Five of a Kind
  if (fourOfAKind && numOfJokers == 1 || threeOfAKind && numOfJokers == 2) {
    return "Five of a Kind";
  }

  // Royal Flush
  else if (straight && flush && isRoyal) {
    return "Royal Flush";
  }

  // Straight Flush
  else if (straight && flush) {
    return "Straight Flush";
  }

  // Four of a Kind
  else if (fourOfAKind || (threeOfAKind && numOfJokers == 1) ||
    onePair && numOfJokers == 2) {
    return "Four of a Kind";
  }

  // Full House
  else if (threeOfAKind && onePair ||
    twoPair && numOfJokers == 1) {
    return "Full House";
  }

  // Flush
  else if (flush) {
    return "Flush";
  }

  // Straight
  else if (straight) {
    return "Straight";
  }

  // Three of a Kind
  else if (threeOfAKind || onePair && numOfJokers == 1 || numOfJokers == 2) {
    return "Three of a Kind";
  } else if (twoPair) {
    return "Two Pair";
  } else if (onePair || numOfJokers == 1) {
    return "One Pair";
  } else
    return "Nothing";
}

//=============================================================
// Start new round and reset environment
function reset() {
  //print('reset');
  cardsInPlay = [];
  cardsDiscarded = [];
  cardsForDoubling = [];
  discardIndexes = [];
  state = discard;
  bInvalidBet = false;
  doubleCount = 0;
  
  if (!startBgm) {
    print('starting bgm');
    startBgm = true;
    sound.loop_bgm();
  }
    
  if (pastBet != betAmount) {
    print('past bet = ' + pastBet);
    pastBet = betAmount;
  }
  
  // Subtract bet from chips
  chips -= betAmount;
  
  // Populate the card list
  for (let i = 0; i < 5; i++) {
    while (true) {
      let card = random(deckOfCards);
      card.isClicked = false;
      if (cardsInPlay.indexOf(card) == -1) {
        cardsInPlay.push(card);
        break;
      }
    }
  }

  // Position the cards
  for (let i = 0; i < cardsInPlay.length; i++) {
    cardsInPlay[i].x = 190 * (i + 1) + 70;
    cardsInPlay[i].y = CARDSY;
  }
  
  // Play card sound
  sound.play("card");
}

//=============================================================
// Does actions based on what keys are 
// pressed and the current state
function keyPressed() {
  // Card sound is played for some reason if space is pressed
  if (keyCode == 32 && state != discard)
    return;
  // Mute/Unmute BGM
  if (keyCode == 77) {
    if (muteBgm) {
      // Unmute
      muteBgm = false;
      sound.loop_bgm();
    }
    else {
      // Mute
      muteBgm = true;
      sound.stop_bgm();
    }
  }
  switch (state) {
    case start:
      switch (keyCode) {
        case ENTER:
          if (betAmount <= chips) 
            deal();
          break;
        case LEFT_ARROW:
          if (betAmount > 10) {
            betAmount -= 10;
            sound.play("ding");
          }
          else {
            if (betAmount != 1)
              sound.play("ding");
            betAmount = 1;
          }
          break;
        case RIGHT_ARROW:
          betAmount += 10;
          sound.play("ding");
          break;
        case UP_ARROW:
          betAmount++;
          sound.play("ding");
          break;
        case DOWN_ARROW:
          if (betAmount > 1) {
            betAmount--;
            sound.play("ding");
          }
          break;
      }
      break;
    case discard:
      if (keyCode == 32)
        tradeAll();
      else if (keyCode == ENTER)
        tradeCards();
      break;
    case end:
      if (keyCode == ENTER)
        state = doubling;
        sound.play("card");
      break;
    case doubling:
      if (keyCode == ENTER)
        state = highlow;
        beginDouble();
      break;
    case hlwin:
      if (keyCode == ENTER)
        state = highlow;
        sound.play("card");
      break;
    case hllose:
      if (keyCode == ENTER)
        backToStart();
      break;
    case hlmax:
      if (keyCode == ENTER)
        backToStart();
      break;
    case gameover:
      if (keyCode == ENTER) {
        chips = STARTING_CHIPS;
        cardsInPlay = [];
        state = start;
        sound.play("card");
      }
      break;
  }
  return false;
}

function touchStarted() {
  if (mouseIsPressed)
    return false;
  else
    buttonClick();
}

function mouseClicked() {
  buttonClick();
}

//=============================================================
// Register clicks based on mouse position and state
function buttonClick() {
  // Mute/Unmute BGM
  if (mouseX <= 1250 + 25 && mouseX >= 1250 - 25)
    if (mouseY <= 690 + 25 && mouseY >= 690 - 25) {
      if (muteBgm) {
        // Unmute
        muteBgm = false;
        sound.loop_bgm();
      }
      else {
        // Mute
        muteBgm = true;
        sound.stop_bgm();
      }
    }
  switch (state) {
    case start:
      /*
      rect(CENTER_X-112, CENTER_Y - 74, 36, 36); // Up
      rect(CENTER_X-18, CENTER_Y - 74, 36, 36); // Down
      rect(CENTER_X-112, CENTER_Y - 24, 36, 36); // Left
      rect(CENTER_X-18, CENTER_Y - 24, 36, 36); // Right
      */
      // Up Arrow
      if (mouseX <= 528 + 18 && mouseX >= 528 - 18)
        if (mouseY <= 286 + 18 && mouseY >= 286 - 18) {
          betAmount++;
          sound.play("ding");
        }
      // Down Arrow
      if (mouseX <= 622 + 18 && mouseX >= 622 - 18)
        if (mouseY <= 286 + 18 && mouseY >= 286 - 18) {
          if (betAmount > 1) {
            betAmount--;
            sound.play("ding");
          }
          else betAmount = 1;
        }
      // Left Arrow
      if (mouseX <= 528 + 18 && mouseX >= 528 - 18)
        if (mouseY <= 336 + 18 && mouseY >= 336 - 18) {
          if (betAmount > 10) {
            betAmount -= 10;
            sound.play("ding");
          }
          else {
            if (betAmount > 1)
              sound.play("ding");
            betAmount = 1;
          }
        }
      // Right Arrow
      if (mouseX <= 622 + 18 && mouseX >= 622 - 18)
        if (mouseY <= 336 + 18 && mouseY >= 336 - 18) {
          betAmount+=10;
          sound.play("ding");
        }
      // Deal Button
      if (mouseX <= 640 + 120 / 2 && mouseX >= 640 - 120 / 2)
        if (mouseY <= 508 + 50 / 2 && mouseY >= 508 - 50 / 2) {
          deal();
        }
      break;
    case discard:
      // Trade all button
      if (mouseX <= 580 + 180 / 2 && mouseX >= 580 - 180 / 2)
        if (mouseY <= 650 + 50 / 2 && mouseY >= 650 - 50 / 2) {
          tradeAll();
        }
      // Ok button
      if (mouseX <= 730 + 80 / 2 && mouseX >= 730 - 80 / 2)
        if (mouseY <= 650 + 50 / 2 && mouseY >= 650 - 50 / 2) {
          tradeCards();
        }
      // Clicking cards to trade
      for (let i = 0; i < cardsInPlay.length; i++) {
        if (cardsInPlay[i].inside(mouseX, mouseY)) {
          let index = discardIndexes.indexOf(i);
          if (index == -1)
            discardIndexes.push(i);
          else if (index >= 0 && index <= 4) {
            discardIndexes.splice(index, 1);
          }
          // Play select sound
          sound.play("select");
        }
      }
      break;
    case end:
      // Ok button
      if (mouseX <= 640 + 80 / 2 && mouseX >= 640 - 80 / 2)
        if (mouseY <= 650 + 50 / 2 && mouseY >= 650 - 50 / 2) {
          state = doubling;
          sound.play("card");
        }
      break;
    case doubling:
      // Yes button
      if (mouseX <= 570 + 80 / 2 && mouseX >= 570 - 80 / 2)
        if (mouseY <= 650 + 50 / 2 && mouseY >= 650 - 50 / 2) {
          state = highlow;
          beginDouble();
        }
      // No button
      if (mouseX <= 690 + 80 / 2 && mouseX >= 690 - 80 / 2)
        if (mouseY <= 650 + 50 / 2 && mouseY >= 650 - 50 / 2) {
          backToStart();
        }
      break;
    case highlow:
      // High button
      if (mouseX <= 570 + 110 / 2 && mouseX >= 570 - 110 / 2)
        if (mouseY <= 650 + 50 / 2 && mouseY >= 650 - 50 / 2) {
          highOrLow = highButton;
          highLowCard();
        }
      // Low button
      if (mouseX <= 710 + 100 / 2 && mouseX >= 710 - 100 / 2)
        if (mouseY <= 650 + 50 / 2 && mouseY >= 650 - 50 / 2) {
          highOrLow = lowButton;
          highLowCard();
        }
      break;
    case hlwin: 
      // Yes button
      if (mouseX <= 570 + 80 / 2 && mouseX >= 570 - 80 / 2)
        if (mouseY <= 650 + 50 / 2 && mouseY >= 650 - 50 / 2) {
          state = highlow;
          sound.play("card");
        }
      // No button
      if (mouseX <= 690 + 80 / 2 && mouseX >= 690 - 80 / 2)
        if (mouseY <= 650 + 50 / 2 && mouseY >= 650 - 50 / 2) {
          backToStart();
        }
      break;
    case hllose: 
      // Ok button
      if (mouseX <= 640 + 80 / 2 && mouseX >= 640 - 80 / 2)
        if (mouseY <= 650 + 50 / 2 && mouseY >= 650 - 50 / 2) {
          backToStart();
        }
      break;
    case hlmax: 
      // Ok button
      if (mouseX <= 640 + 80 / 2 && mouseX >= 640 - 80 / 2)
        if (mouseY <= 650 + 50 / 2 && mouseY >= 650 - 50 / 2) {
          backToStart();
        }
      break;
    case gameover: 
      // Ok button
      if (mouseX <= 640 + 80 / 2 && mouseX >= 640 - 80 / 2)
        if (mouseY <= 650 + 50 / 2 && mouseY >= 650 - 50 / 2) {
          chips = STARTING_CHIPS;
          cardsInPlay = [];
          state = start;
          sound.play("card");
        }
      break;
  }
}

//=============================================================
// Swap trade position of all cards
function tradeAll() {
  for (let i = 0; i < cardsInPlay.length; i++) {
    cardsInPlay[i].isClicked = !cardsInPlay[i].isClicked;
    let index = discardIndexes.indexOf(i);
    if (index == -1)
      discardIndexes.push(i);
    else if (index >= 0 && index <= 4)
      discardIndexes.splice(index, 1);
  }
  // Play card sound
  sound.play("select");
}

//=============================================================
// Checks if a valid bet was made before changing states
function deal() {
  if (betAmount <= chips)
    reset();
  else
    bInvalidBet = true;
}

//=============================================================
// Swap cards chosen for trading
function tradeCards() {
  print('tradeCards');
  for (let i = 0; i < discardIndexes.length; i++) {
    let index = discardIndexes[i];
    // Push discarded cards into discard pile
    cardsDiscarded.push(cardsInPlay[index]);
    // Replace with new card
    while (true) {
      let card = random(deckOfCards);
      // If card is not in hand or discard pile
      if (cardsInPlay.indexOf(card) == -1 && cardsDiscarded.indexOf(card) == -1) {
        // Position the card
        card.y = CARDSY;
        card.x = cardsInPlay[index].x
        card.isClicked = false;
        // Replace the discarded card
        cardsInPlay[index] = card;
        break;
      }
    }
  }
  state = eval;
  // Play card sound
  sound.play("card");
}

//=============================================================
// Cashout winnings and return to start state
function backToStart() {
  if (betAmount > 0)
    sound.play("cashout");
  sound.play("card");
  cardsForDoubling = [];
  cardsInPlay = [];
  chips += betAmount;
  if (pastBet <= chips)
    betAmount = pastBet;
  else
    betAmount = 1;
  state = start;
}

//=============================================================
// Function to call when entering doubling state
function beginDouble() {
  print('beginDouble');
  // Draw a random card to add to initialize doubling mechanic
  while (true) {
    let card = random(deckOfCards);
    if (cardsForDoubling.indexOf(card) == -1){
      // Add to end of array
      cardsForDoubling.push(card);
      break;
    }
  }
  // Play card sound
  sound.play("card");
}

//=============================================================
// Function to call when executing high low
function highLowCard() {
  // Grab a random card not in doubling list
  while (true) {
    nextCard = random(deckOfCards);
    if (cardsForDoubling.indexOf(nextCard) == -1)
      break;
  }
  
  // Play card sound
  sound.play("card");
  
  // Check if card is lower or higher than previous
  var bCorrect;
  let length = cardsForDoubling.length,
      oldCard = cardsForDoubling[length - 1];
  switch(highOrLow) {
    case highButton:
      // Always true if current card is 2
      if (oldCard.value == 2)
        bCorrect = true;
      // True if both cards have the same value, next card
      // is higher or if next card is Joker
      else if (nextCard.value == oldCard.value || nextCard.value == 0 ||
         nextCard.value > oldCard.value)
        bCorrect = true;
      else 
        bCorrect = false;
      break;
    case lowButton:
      // Always true if current card is Joker
      if (oldCard.value == 0)
        bCorrect = true;
      // False if next card is Joker or larger
      else if (nextCard.value == 0 || nextCard.value > oldCard.value)
        bCorrect = false;
      else 
        bCorrect = true;
      break;
  }
  
  // bCorrect now holds whether the player is right
  if (bCorrect) {
    // Double earnings
    betAmount *= 2;
    // Increase number of times doubling is successful
    doubleCount += 1;
    // No more doubling if won 10x in a row
    if (doubleCount == DOUBLE_LIMIT) 
      state = hlmax;
    else
      state = hlwin;
    // Play doublewin sound
    sound.play("doublewin");
  }
  else {
    // Reset betAmount and doubleCount
    betAmount = 0;
    state = hllose;
    // Play doublefail sound
    sound.play("doublefail");
  }
  cardsForDoubling.push(nextCard);
  
}

//=============================================================
// Functions to facilitate drawing boxes and text
function drawBox(x, y, w, h, color1, color2) {
  fill(color1);
  rect(x, y, w, h);
  fill(color2);
  rect(x - 2, y - 2, w, h);
}

function drawButton(x, y, w, h, color1, color2) {
  fill(color1);
  rect(x, y, w, h, 15, 15, 15, 15);
  fill(color2);
  rect(x - 2, y - 2, w, h, 15, 15, 15, 15);
}

function drawText(str, x, y, color1, color2) {
  fill(color1);
  text(str, x, y);
  fill(color2);
  text(str, x - 2, y - 2);
}

function drawCircleButton(x, y, r1, r2, color1, color2, str="", strSize=0) {
  strokeWeight(0);
  
  // Circle
  fill(color2);
  circle(x, y, r1);
  fill(color1);
  circle(x, y, r2);

  // Text
  textAlign(CENTER, CENTER);
  fill(color2);
  textSize(strSize);
  text(str, x, y);
}