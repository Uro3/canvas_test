(function () {
  const MAX_X_CELL_NUM = 300;
  const MAX_Y_CELL_NUM = 300;
  const CELL_WIDTH = 90;
  const CELL_HEIGHT = 30;

  const maxWidth = CELL_WIDTH * MAX_X_CELL_NUM;
  const maxHeight = CELL_HEIGHT * MAX_Y_CELL_NUM;
  const canvasWidth = window.innerWidth * 0.9;
  const canvasHeight = window.innerHeight * 0.9;

  class CanvasTable {
    constructor(canvas, data = [[]]) {
      this.ctx = canvas.getContext('2d');
      this.data = data;
      this.cursor_x = 0;
      this.cursor_y = 0;

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = maxWidth;
      offscreenCanvas.height = maxHeight;
      this.offscreenCanvas = offscreenCanvas;
      this.isRedered = false;
    }

    get offscreenCtx() {
      return this.offscreenCanvas.getContext('2d');
    }

    get base_x() {
      return this.cursor_x * CELL_WIDTH;
    }

    get base_y() {
      return this.cursor_y * CELL_HEIGHT;
    }

    render() {
      if (!this.isRedered) {
        this.drawTable();
        this.isRedered = true;
      }
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }

    translate(x, y) {
      this.ctx.save();
      this.ctx.clearRect(0, 0, maxWidth, maxHeight);
      this.ctx.translate(-x, -y);
      this.render();
      this.ctx.restore();
      this.cursor_x = x / CELL_WIDTH;
      this.cursor_y = x / CELL_WIDTH;
    };

    shiftCell(x, y) {
      this.cursor_x = x;
      this.cursor_y = y;
      this.ctx.save();
      this.ctx.clearRect(0, 0, maxWidth, maxHeight);
      this.ctx.translate(-this.base_x, -this.base_y);
      this.render();
      this.ctx.restore();
    };

    drawTable() {
      for (let i = 0; i <= maxWidth; i += CELL_WIDTH) {
        this.drawLine(i, 0, i, maxHeight);
      }
      for (let i = 0; i <= maxHeight; i += CELL_HEIGHT) {
        this.drawLine(0, i, maxWidth, i);
      }
      for (let i = 0; i < this.data.length; i++) {
        for (let j = 0; j < this.data[i].length; j++) {
          this.drawText(this.data[i][j], j * CELL_WIDTH, i * CELL_HEIGHT);
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
      ctx.fillText(text, x + 5, y + 5);
    };
  }

  const controlArea = document.getElementById('control-area');
  const box = document.getElementById('box');
  const menu = document.getElementById('menu');
  const scrollInner = document.getElementById('scroll-inner');
  const scrollUpButton = document.getElementById('scroll-up');
  const scrollDownButton = document.getElementById('scroll-down');
  const scrollLeftButton = document.getElementById('scroll-left');
  const scrollRightButton = document.getElementById('scroll-right');
  const canvas = document.getElementById('canvas');

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  controlArea.style.width = `${canvasWidth + 10}px`;
  controlArea.style.height = `${canvasHeight + 10}px`;
  box.style.width = `${CELL_WIDTH}px`;
  box.style.height = `${CELL_HEIGHT}px`;
  scrollInner.style.width = `${maxWidth + CELL_WIDTH}px`;
  scrollInner.style.height = `${maxHeight + CELL_HEIGHT}px`;

  const textData = [];
  for (let i = 1; i <= (MAX_Y_CELL_NUM); i++) {
    const texts = []
    for (let j = 1; j <= (MAX_X_CELL_NUM); j++) {
      texts.push(`data-${i}-${j}`);
    }
    textData.push(texts);
  }
  const canvasTable = new CanvasTable(canvas, textData);

  // set listener
  document.body.addEventListener('click', function (_) {
    menu.style.display = 'none';
  });

  controlArea.addEventListener('click', function (event) {
    event.preventDefault();

    // 要素内のクリック位置を取得
    const clientRect = this.getBoundingClientRect();
    const positionX = clientRect.left + window.pageXOffset;
    const positionY = clientRect.top + window.pageYOffset;
    const x = event.pageX - positionX;
    const y = event.pageY - positionY;

    // 現在のスクロール量
    const { scrollTop, scrollLeft } = controlArea;

    const top = Math.floor((y) / CELL_HEIGHT) * CELL_HEIGHT;
    const left = Math.floor((x) / CELL_WIDTH) * CELL_WIDTH;

    box.style.top = `${top + scrollTop}px`;
    box.style.left = `${left + scrollLeft}px`;
    box.style.display = 'block';
    menu.style.display = 'none';
  });

  controlArea.addEventListener('contextmenu', function (event) {
    event.preventDefault();

    // 要素内のクリック位置を取得
    const clientRect = this.getBoundingClientRect();
    const positionX = clientRect.left + window.pageXOffset;
    const positionY = clientRect.top + window.pageYOffset;
    const x = event.pageX - positionX;
    const y = event.pageY - positionY;

    const top = Math.floor(y / CELL_HEIGHT) * CELL_HEIGHT;
    const left = Math.floor(x / CELL_WIDTH) * CELL_WIDTH;

    box.style.top = `${top}px`;
    box.style.left = `${left}px`;
    menu.style.top = `${event.pageY}px`;
    menu.style.left = `${event.pageX + 10}px`;
    menu.style.display = 'block';
  });

  controlArea.addEventListener('scroll', function (event) {
    event.preventDefault();
    const { scrollTop, scrollLeft } = event.target;
    const cursor_y = Math.floor(scrollTop / CELL_HEIGHT);
    const cursor_x = Math.floor(scrollLeft / CELL_WIDTH)

    const canScrollTop = cursor_y != canvasTable.cursor_y;
    const canScrollLeft = cursor_x != canvasTable.cursor_x;
    if (canScrollTop || canScrollLeft) {
      canvasTable.shiftCell(cursor_x, cursor_y);
    }
  });

  scrollUpButton.addEventListener('click', function (_) {
    const { scrollTop, scrollLeft } = controlArea;
    const cursor = Math.floor(scrollTop / CELL_HEIGHT)
    const top = (cursor * CELL_HEIGHT) - CELL_HEIGHT;
    if (top < 0) return;
    controlArea.scrollTo(scrollLeft, top);
    canvasTable.shiftCell(0, cursor);
  });

  scrollDownButton.addEventListener('click', function (_) {
    const { scrollTop, scrollLeft } = controlArea;
    const cursor = Math.floor(scrollTop / CELL_HEIGHT)
    const top = (cursor * CELL_HEIGHT) + CELL_HEIGHT;
    controlArea.scrollTo(scrollLeft, top);
    canvasTable.shiftCell(0, cursor);
  });

  scrollLeftButton.addEventListener('click', function (_) {
    const { scrollTop, scrollLeft } = controlArea;
    const cursor = Math.floor(scrollLeft / CELL_WIDTH)
    const left = (cursor * CELL_WIDTH) - CELL_WIDTH;
    if (left < 0) return;
    controlArea.scrollTo(left, scrollTop);
    canvasTable.shiftCell(cursor, 0);
  });

  scrollRightButton.addEventListener('click', function (_) {
    const { scrollTop, scrollLeft } = controlArea;
    const cursor = Math.floor(scrollLeft / CELL_WIDTH)
    const left = (cursor * CELL_WIDTH) + CELL_WIDTH;
    controlArea.scrollTo(left, scrollTop);
    canvasTable.shiftCell(cursor, 0);
  })

  // draw canvas
  canvasTable.render();
})();
