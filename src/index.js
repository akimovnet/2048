import { Graphic } from './graphic.js';
import { Playground } from './playground.js';

const graphic = new Graphic({
  containerId: 'playground',
  animationDuration: 150,
});

const playground = new Playground({
  dimensions: {
    columns: 4,
    rows: 4,
  },
  graphic: graphic,
});

playground.startNewGame();
