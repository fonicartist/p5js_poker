// Game objects and arrays
var deckOfCards,
    sound,
    cardsInPlay = [],
    discardIndexes = [],
    cardsDiscarded = [],
    cardsForDoubling = [],
    cardToAnimate = [];

// Global variables
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
    pastBet,
    amnt,
    btnColor,
    cursorColor;

// Colors
var darkBlue,
    hoverBlue,
    darkRed,
    hoverRed,
    shadow,
    black,
    white,
    golden;

// Message Texts
const betMessage = "Use Arrows to\n Customize  Bet",
      invalidBetMessage = "Bet amount must be less\n than or equal to Chips!",
      discardMessage = "Select cards you wish to trade",
      dealMessage = "Click 'Deal' to Play",
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
      betCursor = "⌃";

// Button Texts
const left = "⬅",
      right = "➡",
      up = "⬆",
      down = "⬇",
      dealButton = "Deal",
      playAgainButton = "Play Again",
      okButton = "OK",
      tradeAllButton = "Trade All",
      highButton = "High",
      lowButton = "Low",
      yesButton = "YES",
      noButton = "NO",
      musicButton = "♪";

// Gamestates
const welcome = "welcome",
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

// Number constants
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
  cursorPos = 0;
  
  // Set initial state for some vars
  nextCard = null;
  doubleCount = 0;
  startBgm = false;
  muteBgm = false;
  result = "";
  pastBet = -1;
  cursorColor = 0;
  
  // Initialize common colors
  darkBlue  = color(60, 30, 220);
  hoverBlue = color(80, 50, 240);
  darkRed   = color(180, 0, 60);
  hoverRed  = color(200, 20, 80);
  shadow    = color(0, 150);
  black     = color(0);
  white     = color(255);
  golden    = color(255, 206, 36);
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
  }

  // Poker hand multiplier background
  rectMode(CENTER);
  push();
    strokeWeight(0);
    drawPane(432, 102, 720, 170, color(120, 50, 10, 220), color(0, 0, 0, 80), 5);
  pop();

  // Display pokerhand multipliers
  let currentFont = textFont();
  textFont('Consolas');
  textSize(24);
  textAlign(LEFT, CENTER);
  drawText(pokerHands1, 95, 102, black, golden);
  drawText(pokerHands2, 490, 102, black, golden);

  // Restore the original font
  textFont(currentFont);

  // Chips background
  push();
    strokeWeight(0);
    drawPane(1022, 102, 380, 170, color(230, 245, 160, 200), color(146, 149, 109), 5);
    fill(184, 222, 136);
    rect(1022, 100, 370, 4);
  pop();
  
  // Display chip amounts
  textSize(32);
  drawText("Chips", 850, 63, color(0, 0, 0, 70), color(250));
  drawText("Bet", 850, 143, color(0, 0, 0, 70), color(250));
  textAlign(RIGHT, CENTER);
  drawTextUniformR(chips, 1190, 63, 32, color(0, 0, 0, 70), color(250));
  drawTextUniformR(betAmount, 1190, 143, 32, color(0, 0, 0, 70), color(250));
  // Bet cursor
  textSize(30);
  cursorColor -= 2;
  if (cursorColor < 180) cursorColor = 250;
  drawText(betCursor, 1190 - 18 * cursorPos, 172, color(cursorColor,70), color(cursorColor));

  // Draw buttons
  rectMode(CENTER);
  strokeWeight(0);
  textAlign(CENTER, CENTER);
  switch (state) {
    case start:
      // Deal button
      if (insideBox(CENTER_X, CENTER_Y + 148, 120, 50)) btnColor = hoverBlue;
      else btnColor = darkBlue;
      drawButton(CENTER_X, CENTER_Y + 148, 120, 50, shadow, btnColor);
      
      textSize(36);
      drawText(dealButton, CENTER_X, CENTER_Y + 150, black, white);
      break;
    case discard:
      // Ok button
      if (insideBox(730, 648, 80, 50)) btnColor = hoverBlue;
      else btnColor = darkBlue;
      drawButton(730, 648, 80, 50, shadow, btnColor);
      
      // Trade All button
      if (insideBox(580, 648, 180, 50)) btnColor = hoverRed;
      else btnColor = darkRed;
      drawButton(580, 648, 180, 50, shadow, btnColor);
      
      textSize(36);
      drawText(okButton, 730, 650, black, white);
      drawText(tradeAllButton, 580, 650, black, white);
      break;
    case end:
      // Ok button
      if (insideBox(640, 648, 80, 50)) btnColor = hoverBlue;
      else btnColor = darkBlue;
      drawButton(640, 648, 80, 50, shadow, btnColor);
      
      textSize(36);
      drawText(okButton, 640, 650, black, white);
      break;
    case doubling:
      // Yes button
      if (insideBox(570, 648, 100, 50)) btnColor = hoverBlue;
      else btnColor = darkBlue;
      drawButton(570, 648, 100, 50, shadow, btnColor);
      
      // No button
      if (insideBox(690, 648, 80, 50)) btnColor = hoverRed;
      else btnColor = darkRed;
      drawButton(690, 648, 80, 50, shadow, btnColor);
      
      textSize(36);
      drawText(yesButton, 570, 650, black, white);
      drawText(noButton, 690, 650, black, white);
      break;
    case highlow:
      // High button
      if (insideBox(570, 648, 110, 50)) btnColor = hoverBlue;
      else btnColor = darkBlue;
      drawButton(570, 648, 110, 50, shadow, btnColor);
      
      // Low button
      if (insideBox(710, 648, 100, 50)) btnColor = hoverRed;
      else btnColor = darkRed;
      drawButton(710, 648, 100, 50, shadow, btnColor);
      
      textSize(36);
      drawText(highButton, 570, 650, black, white);
      drawText(lowButton, 710, 650, black, white);
      break;
    case hlwin:
      // Yes button
      if (insideBox(570, 648, 100, 50)) btnColor = hoverBlue;
      else btnColor = darkBlue;
      drawButton(570, 648, 100, 50, shadow, btnColor);
      
      // No button
      if (insideBox(690, 648, 80, 50)) btnColor = hoverRed;
      else btnColor = darkRed;
      drawButton(690, 648, 80, 50, shadow, btnColor);
      
      textSize(36);
      drawText(yesButton, 570, 650, black, white);
      drawText(noButton, 690, 650, black, white);
      break;
    case hllose:
      // Ok button
      if (insideBox(640, 648, 80, 50)) btnColor = hoverBlue;
      else btnColor = darkBlue;
      drawButton(640, 648, 80, 50, shadow, btnColor);
      
      textSize(36);
      drawText(okButton, 640, 650, black, white);
      break;
    case hlmax:
      // Ok button
      if (insideBox(640, 648, 80, 50)) btnColor = hoverBlue;
      else btnColor = darkBlue;
      drawButton(640, 648, 80, 50, shadow, btnColor);
      
      textSize(36);
      drawText(okButton, 640, 650, black, white);
      break;
    case gameover:
      // Ok button
      if (insideBox(640, 648, 80, 50)) btnColor = hoverBlue;
      else btnColor = darkBlue;
      drawButton(640, 648, 80, 50, shadow, btnColor);
      
      textSize(36);
      drawText(okButton, 640, 650, black, white);
      break;
  }
  strokeWeight(1);

  // Draw Messages
  if (state == start) {
    textSize(40);
    textAlign(CENTER, CENTER);
    push();
      strokeWeight(0);
      drawPane(CENTER_X, CENTER_Y - 70, 330, 140, color(35, 120, 250), color(0, 100, 0, 80), 10);
    pop();
    drawText(betMessage, CENTER_X, CENTER_Y - 65, black, white);
    drawText(dealMessage, CENTER_X, CENTER_Y + 80, black, golden);
    if (bInvalidBet) {
      textSize(36);
      drawText(invalidBetMessage, 1040, 250, color(50, 150), color(255, 50, 10));
    }
    
    // Draw Arrows for bet adjustment
    textSize(80);
    let arrows = [left, right, up, down];
    for (let i = 0; i < arrows.length; i++) {
      let x = CENTER_X + 245 + 95 * i;
      let y = CENTER_Y - 70;
      let color1 = color(20, 140, 50, 180);
      let color2;
      if (insideCircle(x, y, 90)) color2 = color(252, 245, 231, 255);
      else color2 = color(247, 240, 226, 180);
      drawCircleButton(x, y, 90, 80, color1, color2, arrows[i], 80, 5);
    }
    
  } 
  else if (state == discard) {
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(discardMessage, CENTER_X, 250, black, golden);
  } 
  else if (state == end) {
    // Display poker hand
    textSize(56);
    textAlign(CENTER, CENTER);
    drawText(result, CENTER_X, 280, black, golden);
  }
  else if (state == doubling) {
    // Ask player if they want to play bonus game
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(doubleMessage, CENTER_X, 250, black, golden);
  }
  else if (state == highlow) {
    // Will the next card be High or Low
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(highLowMessage, CENTER_X, 250, black, golden);
    if (doubleCount > 1)
      drawText(doubleCount+streakMessage, CENTER_X + 300, CARDSY-40, black, golden);
  }
  else if (state == hlwin) {
    // Guessed Correct! Go again?
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(hlwinMessage, CENTER_X, 250, black, golden);
    drawText(continuePlayingMessage, CENTER_X, 300, black, golden);
    if (doubleCount > 1)
      drawText(doubleCount+streakMessage, CENTER_X + 300, CARDSY-40, black, golden); 
  }
  else if (state == hllose) {
    // Guessed Wrong 
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(hlloseMessage, CENTER_X, 250, black, golden);
  }
  else if (state == hlmax) {
    // Maximum Guesses Reached
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(hlmaxMessage, CENTER_X, 250, black, golden);
  }
  else if (state == gameover) {
    // No more chips
    textSize(40);
    textAlign(CENTER, CENTER);
    drawText(gameoverMessage, CENTER_X, 250, black, golden);
  }
  
  // Mute/Unmute button for BGM
  strokeWeight(0);
  if (muteBgm) {
    let color1 = color(20, 140, 50, 50);
    let color2;
    // Hover color
    if (insideCircle(1250, 690, 40)) color2 = color(252, 245, 201, 200)
    else color2 = color(247, 240, 196, 150);
    drawCircleButton(1250, 690, 40, 35, color1, color2, '♪', 30, 1);
    fill(color(255, 0, 0, 200));
    textSize(49);
    text('⊘', 1250, 690);
  }
  else {
    let color1 = color(20, 140, 50, 200);
    let color2;
    // Hover color
    if (insideCircle(1250, 690, 40)) color2 = color(252, 245, 201, 200)
    else color2 = color(247, 240, 196, 150);    
    drawCircleButton(1250, 690, 40, 35, color1, color2, '♪', 30, 1);
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
    //print(hand[i].toString());
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
  
  //print("\0");

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
  cardsInPlay = [];
  cardsDiscarded = [];
  cardsForDoubling = [];
  discardIndexes = [];
  state = discard;
  bInvalidBet = false;
  doubleCount = 0;
  
  if (!startBgm && !muteBgm) {
    startBgm = true;
    sound.loop_bgm();
  }
    
  if (pastBet != betAmount)
    pastBet = betAmount;
  
  // Subtract bet from chips
  chips -= betAmount;
  
  // Move cursor if it is outside range
  let mcp = maxCurPos();
  if (cursorPos > mcp)
    cursorPos = mcp;
  
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
      amnt = 10 ** cursorPos;
      switch (keyCode) {
        case ENTER:
          if (betAmount <= chips) 
            deal();
          break;
        case LEFT_ARROW: curLeft();
          break;
        case RIGHT_ARROW: curRight();
          break;
        case UP_ARROW: curUp();
          break;
        case DOWN_ARROW: curDown();
          break;
      }
      break;
    case discard:
      // Control cards using keyboard during discard state
      switch(keyCode) {
        case 32: tradeAll();
          break;
        case ENTER: tradeCards();
          break;
        case 49: 
        case 50: 
        case 51: 
        case 52: 
        case 53: 
          let i = keyCode - 49;
          cardsInPlay[i].isClicked = !cardsInPlay[i].isClicked;
          let index = discardIndexes.indexOf(i);
          if (index == -1)
            discardIndexes.push(i);
          else if (index >= 0 && index <= 4) {
            discardIndexes.splice(index, 1);
          }
          // Play select sound
          sound.play("select");
          break;
      }
      break;
    case end:
      if (keyCode == ENTER) {
        state = doubling;
        sound.play("card");
      } 
      break;
    case doubling:
      if (keyCode == ENTER) {
        state = highlow;
        beginDouble();
      } else if (keyCode == BACKSPACE)
        backToStart();
      break;
    case highlow:
      if (keyCode == 49) {
        highOrLow = highButton;
        highLowCard();
      } else if (keyCode == 50) {
        highOrLow = lowButton;
        highLowCard();
      }
      break;
    case hlwin:
      if (keyCode == ENTER) {
        state = highlow;
        sound.play("card");
      } else if (keyCode == BACKSPACE)
        backToStart();
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
      if (keyCode == ENTER) 
        endgame();
      break;
  }
  return false;
}

function mouseClicked() {
  buttonClick();
}

//=============================================================
// Register clicks based on mouse position and state
function buttonClick() {
  // Mute/Unmute BGM
  if (insideCircle(1250, 690, 50)) {
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
    // Before game starts, choose bet amount
    case start:
      // amount to add based on current cursor position
      amnt = 10 ** cursorPos;
      // Up Arrow
      if (insideCircle(CENTER_X + 435, CENTER_Y - 70, 90))
        curUp();
      // Down Arrow
      if (insideCircle(CENTER_X + 530, CENTER_Y - 70, 90))
        curDown();
      // Left Arrow
      if (insideCircle(CENTER_X + 245, CENTER_Y - 70, 90))
        curLeft();
      // Right Arrow
      if (insideCircle(CENTER_X + 340, CENTER_Y - 70, 90))
        curRight();
      // Deal Button
      if (insideBox(640, 508, 120, 50))
        deal();
      break;
    // Player choosing which card to trade
    case discard:
      // Trade all button
      if (insideBox(580, 650, 180, 50))
        tradeAll();
      // Ok button
      if (insideBox(730, 650, 80, 50))
        tradeCards();
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
    // Round over, hand result screen
    case end:
      // Ok button
      if (insideBox(640, 650, 80, 50)) {
        state = doubling;
        sound.play("card");
      }
      break;
    // Ask to play bonus game for double points
    case doubling:
      // Yes button
      if (insideBox(570, 650, 80, 50)) {
        state = highlow;
        beginDouble();
      }
      // No button
      if (insideBox(690, 650, 80, 50))
        backToStart();
      break;
    // Show current card, guess next one
    case highlow:
      // High button
      if (insideBox(570, 650, 110, 50)) {
          highOrLow = highButton;
          highLowCard();
      }
      // Low button
      if (insideBox(710, 650, 100, 50)) {
          highOrLow = lowButton;
          highLowCard();
      }
      break;
    // Guessed correctly on High or Low card
    case hlwin: 
      // Yes button
      if (insideBox(570, 650, 80, 50)) {
        state = highlow;
        sound.play("card");
      }
      // No button
      if (insideBox(690, 650, 80, 50))
        backToStart();
      break;
    // Guessed wrong, round over
    case hllose: 
      // Ok button
      if (insideBox(640, 650, 80, 50))
        backToStart();
      break;
    // Reached maximum number of doubling attempts
    case hlmax: 
      // Ok button
      if (insideBox(640, 650, 80, 50)) 
        backToStart();
      break;
    // Chips hit zero, player lost
    case gameover: 
      // Ok button
      if (insideBox(640, 650, 80, 50))
        endgame();
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
// Gameover when chips hit 0
function endgame() {
  chips = STARTING_CHIPS;
  betAmount = 1;
  cursorPos = 0;
  cardsInPlay = [];
  state = start;
  sound.play("card");
}


//=============================================================
// Functions relating to bet cursor
function maxCurPos() {
  var i = 1;
  while (chips / (10 ** i) >= 1) {
    i += 1;
  }
  return i - 1;
}

function curLeft() {
  if (cursorPos < maxCurPos()) {
    cursorPos++;
    sound.play("ding");
  }
}

function curRight() {
  if (cursorPos > 0) {
    cursorPos--;
    sound.play("ding");
  }
}

function curUp() {
  if (betAmount + amnt < chips) {
    betAmount += amnt;
    sound.play("ding");
  } else if (betAmount != chips) {
    betAmount = chips;
    sound.play("ding");
  }
}

function curDown() {
  if (betAmount - amnt > 1) {
    betAmount -= amnt;
    sound.play("ding");
  } else if (betAmount != 1) {
    betAmount = 1;
    sound.play("ding");
  }
}

//=============================================================
// Functions to facilitate drawing boxes and text
function drawBox(x, y, w, h, color1, color2, r=0) {
  fill(color1);
  rect(x, y, w, h, r, r, r, r);
  fill(color2);
  rect(x - 2, y - 2, w, h, r, r, r, r);
}

function drawPane(x, y, w, h, color1, color2, r=0) {
  fill(color1);
  rect(x, y, w, h, r, r, r, r);
  fill(color2);
  rect(x, y, w - 10, h - 10, r, r, r, r);
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

// Draw text with uniform spacing right aligned
function drawTextUniformR(str, x, y, size, color1, color2) {
  str = String(str);
  len = str.length;
  for(let i = len - 1; i >= 0; i--) {
    let c = str.charAt(len - i - 1);
    let spacing = size / 2 + 2;
    fill(color1);
    text(c, x - i * spacing, y);
    fill(color2);
    text(c, x - i * spacing - 2, y - 2);
  }
}

function drawCircleButton(x, y, r1, r2, color1, color2, str="", strSize=0, offset=0) {
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
  text(str, x, y + offset);
}


//=============================================================
// Checking mouse bounds
function insideCircle(x, y, r) {
  var result = false;
  let relDis = dist(x, y, mouseX, mouseY);
  if (relDis < r / 2.0 + 1)
    result = true;
  return result;  
}

// Assumes boxes are center aligned
function insideBox(x, y, w, h) {
  var result = false;
  if (mouseX > x - w / 2 && mouseX < x + w / 2 &&
      mouseY > y - h / 2 && mouseY < y + h / 2)
    result = true;
  return result;
}