let bgm = "bgm",
    badhand = "badhand",
    goodhand = "goodhand",
    greathand = "greathand",
    slct = "select",
    card = "card",
    ding = "ding",
    cashout = "cashout",
    doublefail = "doublefail",
    doublewin = "doublewin";
      

// Soundplayer class that controls bgm and sound fx
class Sound {
  constructor() {
    // Background Music
    this.bgm = createAudio('data/tota_casino_bgm.ogg');
    this.bgm.volume(.5);
    
    // Sound Effects
    this.badhand = createAudio('data/badhand.ogg');
    this.goodhand = createAudio('data/goodhand.ogg');
    this.greathand = createAudio('data/greathand.ogg');
    this.slct = createAudio('data/select.ogg');
    this.card = createAudio('data/card.ogg');
    this.ding = createAudio('data/ding.ogg');
    this.cashout = createAudio('data/cashout.ogg');
    this.doublefail = createAudio('data/doublefail.ogg');
    this.doublewin = createAudio('data/doublewin.ogg');
  }
  
  play(sound) {
    switch(sound) {
      case badhand: 
        this.badhand.play();
        break;
      case goodhand: 
        this.goodhand.play();
        break;
      case greathand: 
        this.greathand.play();
        break;
      // For: Select, Card, Ding, Doublewin
      // Stop sound if it is currently playing in order 
      // to allow a new instance to play right away
      case slct: 
        this.slct.stop();
        this.slct.play();
        break;
      case card: 
        this.card.stop();
        this.card.play();
        break;
      case ding: 
        this.ding.stop();
        this.ding.play();
        break;
      case cashout: 
        this.cashout.play();
        break;
      case doublefail: 
        this.doublefail.play();
        break;
      case doublewin: 
        this.doublewin.stop();
        this.doublewin.play();
        break; 
    }
  }
  
  loop_bgm() {
    this.bgm.loop();
  }
  
  stop_bgm() {
    this.bgm.stop();
  }
  
}