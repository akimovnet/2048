export class Listener {
  constructor() {
    this.onLeft = () => {};
    this.onUp = () => {};
    this.onRight = () => {};
    this.onDown = () => {};
  }

  initKeyboardListener() {
    document.onkeydown = key => {
      if (37 === key.keyCode) {
        this.onLeft();
      }
      if (38 === key.keyCode) {
        this.onUp();
      }
      if (39 === key.keyCode) {
        this.onRight();
      }
      if (40 === key.keyCode) {
        this.onDown();
      }
    };
  }

  initSwipeListener() {
    let xDown = null;
    let yDown = null;
    document.addEventListener('touchstart', evt => {
      xDown = evt.touches[0].clientX;
      yDown = evt.touches[0].clientY;
    }, false);
    document.addEventListener('touchmove', evt => {
      if (!xDown || !yDown) {
        return;
      }
      let xUp = evt.touches[0].clientX;
      let yUp = evt.touches[0].clientY;
      let xDiff = xDown - xUp;
      let yDiff = yDown - yUp;

      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
          this.onLeft();
        } else {
          this.onRight();
        }
      } else {
        if (yDiff > 0) {
          this.onUp();
        } else { 
          this.onDown();
        }
      }
      xDown = null;
      yDown = null;
    }, false);
  }
}
