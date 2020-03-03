import 'web-animations-js';

export class Graphic {
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    this.animationDuration = config.animationDuration;
  }

  init(size) {
    const existingMatrix = document.getElementById('matrix');
    if (existingMatrix) {
      existingMatrix.parentNode.removeChild(existingMatrix);
    }
    const table = document.createElement('table');
    table.id = 'matrix';
    for (let row = 0; row < size.rows; row++) {
      const row = document.createElement('tr');
      for (let column = 0; column < size.columns; column++) {
        row.appendChild(document.createElement('td'));
      }
      table.appendChild(row);
    }
    this.container.appendChild(table);
  }

  add(config) {
    const target = this.container
      .getElementsByTagName('tr')[config.coords.row]
      .getElementsByTagName('td')[config.coords.column];
    const tile = document.createElement('div');
    tile.innerHTML = config.value;
    tile.className = `tile tile-${config.value}`;
    target.appendChild(tile);

    tile.animate([
      { transform: 'scale(0)' }, 
      { transform: 'scale(1)' },
    ], { 
      duration: this.animationDuration,
    });
  }

  move(config) {
    const source = this.container
      .getElementsByTagName('tr')[config.from.row]
      .getElementsByTagName('td')[config.from.column]
      .firstChild;
    const originRect = source.getBoundingClientRect();
    const destination = this.container
      .getElementsByTagName('tr')[config.to.row]
      .getElementsByTagName('td')[config.to.column];
    if (destination.firstChild) {
      destination.removeChild(destination.firstChild);
    }
    destination.appendChild(source);
    const destinationRect = source.getBoundingClientRect();

    source.animate([
      {
        left: `${originRect.left - destinationRect.left}px`,
        top: `${originRect.top - destinationRect.top}px`,
      }, 
      {
        left: 0,
        top: 0,
      },
    ], {
      duration: this.animationDuration,
    });
  }

  update(config) {
    const tile = this.container
      .getElementsByTagName('tr')[config.coords.row]
      .getElementsByTagName('td')[config.coords.column]
      .firstChild;
    tile.innerHTML = config.value;
    tile.className = `tile tile-${config.value}`;

    tile.animate([
      { transform: 'scale(1.2)' }, 
      { transform: 'scale(1)' },
    ], { 
      duration: this.animationDuration,
    });
  }

  winningNotification() {
    return this.notify('Congratulations! You win! If you want, you can continue to play.');
  }

  losingNotification() {
    return this.notify('There are no more available moves. Press the button if you want to restart the game.');
  }

  notify(text) {
    return new Promise((resolve, reject) => {
      const notificationContainer = document.createElement('div');
      const notificationText = document.createElement('p');
      const okButton = document.createElement('button');
      okButton.innerHTML = 'Ok';
      notificationContainer.className = 'notification';
      notificationText.innerHTML = text;
      notificationContainer.appendChild(notificationText);
      notificationContainer.appendChild(okButton);
      this.container.prepend(notificationContainer);
      okButton.focus();
      okButton.onclick = () => {
        notificationContainer.parentNode.removeChild(notificationContainer);
        resolve();
      };
      notificationContainer.animate([
        { transform: 'scale(0)' }, 
        { transform: 'scale(1)' },
      ], { 
        duration: this.animationDuration,
      });
    });
  }
}
