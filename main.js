const MAX_WIDTH = 6000
const MAX_HEIGHT = 3000
const BOX_WIDTH = 60
const BOX_HEIGHT = 30

const textData = [];
for (let i = 0; i < (MAX_HEIGHT/BOX_HEIGHT); i++) {
  const texts = []
  for (let j = 0; j < (MAX_WIDTH/BOX_WIDTH); j++) {
    texts.push(`data-${i}-${j}`);
  }
  textData.push(texts);
}

class CanvasTable {
  constructor(canvas, data = [[]]) {
    this.ctx = canvas.getContext('2d');
    this.data = data;

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = MAX_WIDTH;
    offscreenCanvas.height = MAX_HEIGHT;
    this.offscreenCanvas = offscreenCanvas;
    this.isRedered = false;
  }

  get offscreenCtx() {
    return this.offscreenCanvas.getContext('2d');
  }

  render() {
    if (!this.isRedered) {
      this.drawTable();
      this.isRedered = true;
    }
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  translate(x, y) {
    this.ctx.clearRect(0, 0, MAX_WIDTH, MAX_HEIGHT);
    this.ctx.translate(x, y);
    this.render();
  };

  drawTable() {
    for (let i = 0; i <= MAX_WIDTH; i += BOX_WIDTH) {
      this.drawLine(i, 0, i, MAX_HEIGHT);
    }
    for (let i = 0; i <= MAX_HEIGHT; i += BOX_HEIGHT) {
      this.drawLine(0, i, MAX_WIDTH, i);
    }
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].length; j++) {
        this.drawText(this.data[i][j], j*BOX_WIDTH, i*BOX_HEIGHT);
      }
    }
  }

  drawLine(s_x, s_y, d_x, d_y) {
    const ctx = this.offscreenCtx;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.moveTo(s_x, s_y);
    ctx.lineTo(d_x, d_y);
    ctx.closePath();
    ctx.stroke();
  };

  drawText(text, x, y) {
    const ctx = this.offscreenCtx;
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.font = '12px serif';
    ctx.textBaseline = "top";
    ctx.fillText(text, x+5, y+5);
  };
}

const area = document.getElementById('control-area');
const box = document.getElementById('box');
const menu = document.getElementById('menu');
const scrollUp = document.getElementById('scroll-up');
const scrollDown = document.getElementById('scroll-down');

const canvas = document.getElementById('canvas-sample');
const canvasTable = new CanvasTable(canvas, textData);

// set listener
document.body.addEventListener('click', function(_) {
  menu.style.display = 'none';
});

area.addEventListener('click', function(event) {
  const clientRect = this.getBoundingClientRect();
  const positionX = clientRect.left + window.pageXOffset;
  const positionY = clientRect.top + window.pageYOffset;

  // 要素内のクリック位置
  const x = event.pageX - positionX;
  const y = event.pageY - positionY;

  const top = Math.floor(y / BOX_HEIGHT) * BOX_HEIGHT;
  const left = Math.floor(x / BOX_WIDTH) * BOX_WIDTH;

  box.style.top = `${top}px`;
  box.style.left = `${left}px`;
  menu.style.display = 'none';
});

area.addEventListener('contextmenu', function(event) {
  event.preventDefault();

  const clientRect = this.getBoundingClientRect();
  const positionX = clientRect.left + window.pageXOffset;
  const positionY = clientRect.top + window.pageYOffset;

  // 要素内のクリック位置
  const x = event.pageX - positionX;
  const y = event.pageY - positionY;

  const top = Math.floor(y / BOX_HEIGHT) * BOX_HEIGHT;
  const left = Math.floor(x / BOX_WIDTH) * BOX_WIDTH;

  box.style.top = `${top}px`;
  box.style.left = `${left}px`;
  menu.style.top = `${event.pageY}px`;
  menu.style.left = `${event.pageX+10}px`;
  menu.style.display = 'block';
});

scrollUp.addEventListener('click', function(_) {
  canvasTable.translate(0, BOX_HEIGHT);
})

scrollDown.addEventListener('click', function(_) {
  canvasTable.translate(0, -BOX_HEIGHT);
})

// draw canvas
canvasTable.render();
