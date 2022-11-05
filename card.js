class Card {
  
  // Create a Card with the suit and value
  constructor(value, suit, x = 0, y = 0) {
    this.suit = suit;
    this.value = parseInt(value);
    this.x = x;
    this.y = y;
    this.yOffset = 0;
    this.sizex = 150;
    this.sizey = 210;
    // Define colors
    this.white = color(255);
    this.lightGray = color(150);
    this.red = color(255, 10, 10);
    this.black = color(10, 10, 10);
    this.darkGray = color(50);
    this.color = this.white;
    if (this.value == 0)
      this.isJoker = true;
    this.isClicked = false;
  }
  
  // Compares card's value against another
  //
  compare (other) {
    if (this.value == other.value) return 0;
    else if (this.value > other.value) return 1;
    else return -1;
  }
  
  // Print the value and suit of the card
  //
  toString() {
    if (this.isJoker)
      return "Joker";
    else if (this.value > 10) {
      switch(this.value) {
        case 11: return "Jack of " + this.suit; 
        case 12: return "Queen of " + this.suit; 
        case 13: return "King of " + this.suit; 
        case 14: return "Ace of " + this.suit;
        default: break;
      }
    }
    else
      return this.value + " of " + this.suit; 
  }
  
  valToStr() {
    if (this.isJoker)
      return "Joker";
    else if (this.value > 10) {
      switch(this.value) {
        case 11: return "J"; 
        case 12: return "Q"; 
        case 13: return "K"; 
        case 14: return "A";
        default: break;
      }
    }
    else 
      return this.value;
  }
  
  suitSymbol() {
    switch(this.suit) {
      case "Hearts": return "♥";
      case "Diamonds": return "♦";
      case "Clovers": return "♣";
      case "Spades": return "♠";
      default: return "🎭";
    }
  }
  
  suitColor() {
    switch(this.suit) {
      case "Hearts":
      case "Diamonds":
        return this.red;
      case "Clovers":
      case "Spades":
        return this.black;
      default:
        return this.white;
    }
  }
  
   cardColor() {
    switch(this.suit) {
      case "Hearts":
      case "Diamonds":
      case "Clovers":
      case "Spades":
        return this.white;
      default:
        return this.darkGray;
    }
  }
  
  draw() {
    if (this.isClicked)
      this.yOffset = -30;
    else
      this.yOffset = 0;
    
    rectMode(CENTER);
    fill(0);
    rect(this.x + 2, this.y + this.yOffset + 2, this.sizex, this.sizey, 10, 10, 10, 10);
    fill(this.cardColor());
    rect(this.x, this.y + this.yOffset, this.sizex, this.sizey, 10, 10, 10, 10);
    textSize(42);
    fill(this.suitColor());
    textAlign(CENTER, CENTER)
    text(this.valToStr(), this.x, this.y - 35 + this.yOffset);
    if (this.isJoker)
      textSize(56);
    else
      textSize(64);
    text(this.suitSymbol(), this.x, this.y + 24 + this.yOffset);
  }
  
  drawxy(x, y, offset=0) {
    this.x = x;
    this.y = y;
    
    rectMode(CENTER);
    fill(0);
    rect(this.x + 2, this.y + 2, this.sizex, this.sizey, 10, 10, 10, 10);
    fill(this.cardColor());
    rect(this.x, this.y, this.sizex, this.sizey, 10, 10, 10, 10);
    textSize(42);
    fill(this.suitColor());
    textAlign(CENTER, CENTER)
    text(this.valToStr(), this.x-offset, this.y - 35);
    if (this.isJoker)
      textSize(56);
    else
      textSize(64);
    text(this.suitSymbol(), this.x-offset, this.y + 24);
  }
  
  drawstacked(x, y, offset=0) {
    this.x = x;
    this.y = y;
    
    rectMode(CENTER);
    fill(0);
    rect(this.x + 2, this.y + 2, this.sizex, this.sizey, 10, 10, 10, 10);
    fill(this.cardColor());
    rect(this.x, this.y, this.sizex, this.sizey, 10, 10, 10, 10);
    textSize(42);
    fill(this.suitColor());
    textAlign(CENTER, CENTER)
    if (this.isJoker)
      text("J", this.x-offset-44, this.y - 35);
    else
      text(this.valToStr(), this.x-offset-44, this.y - 35);
    if (this.isJoker)
      textSize(50);
    else
      textSize(64);
    text(this.suitSymbol(), this.x-offset-44, this.y + 24);
  }
  
  
  // Returns a deck that is sorted from least value to most
  //
  static getDeck(includeJokers) {
    var deck = [];
    
    // Push Spades
    for (var i = 2; i < 15; i++) 
      deck.push(new Card(i, "Spades"));
    // Push Clovers
    for (i = 2; i < 15; i++) 
      deck.push(new Card(i, "Clovers"));
    // Push Diamonds
    for (i = 2; i < 15; i++) 
      deck.push(new Card(i, "Diamonds"));
    // Push Hearts
    for (i = 2; i < 15; i++) 
      deck.push(new Card(i, "Hearts"));
    
    // Include Jokers if asked for
    if (includeJokers) {
      deck.push(new Card(0, ""));
      deck.push(new Card(0, ""));
    }
    
    return deck;
  }
  
  inside(x, y) {
    if (x <= this.x + this.sizex / 2 && x >= this.x - this.sizex / 2) {
      if (y <= this.y + this.sizey / 2 + this.yOffset && 
          y >= this.y - this.sizey / 2 + this.yOffset) {
        this.isClicked = !this.isClicked;
        return true;
      }
    } 
    
    return false;
  }
  
}