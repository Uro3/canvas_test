(function () {
  const MAX_X_CELL_NUM = 500;
  const MAX_Y_CELL_NUM = 500;
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
      this.cursorX = 0;
      this.cursorY = 0;
    }

    get offscreenCtx() {
      return this.offscreenCanvas.getContext('2d');
    }

    get baseX() {
      return this.cursorX * CELL_WIDTH;
    }

    get baseY() {
      return this.cursorY * CELL_HEIGHT;
    }

    get renderingCellNumX() {
      return canvasWidth / CELL_WIDTH + 1;
    }

    get renderingCellNumY() {
      return canvasHeight / CELL_HEIGHT + 1;
    }

    render() {
      this.drawTable();
    }

    shiftCell(x, y) {
      this.cursorX = x;
      this.cursorY = y;
      this.ctx.save();
      this.ctx.clearRect(0, 0, maxWidth, maxHeight);
      this.ctx.translate(-this.baseX, -this.baseY);
      this.render();
      this.ctx.restore();
    };

    drawTable() {
      for (let i = 0; i <= this.renderingCellNumX; i++) {
        this.drawLine(this.baseX + i * CELL_WIDTH, this.baseY, this.baseX + i * CELL_WIDTH, this.baseY + canvasHeight);
      }
      for (let i = 0; i <= this.renderingCellNumY; i++) {
        this.drawLine(this.baseX, this.baseY + i * CELL_HEIGHT, this.baseX + canvasWidth, this.baseY + i * CELL_HEIGHT);
      }
      for (let i = this.cursorY; i < this.cursorY + this.renderingCellNumY && i < this.data.length; i++) {
        for (let j = this.cursorX; j < this.cursorX + this.renderingCellNumX && j < this.data[i].length; j++) {
          this.drawText(this.data[i][j], j * CELL_WIDTH, i * CELL_HEIGHT);
        }
      }
    }

    drawLine(s_x, s_y, d_x, d_y) {
      const { ctx } = this;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.moveTo(s_x, s_y);
      ctx.lineTo(d_x, d_y);
      ctx.closePath();
      ctx.stroke();
    };

    drawText(text, x, y) {
      const { ctx } = this;
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
    const cursorY = Math.floor(scrollTop / CELL_HEIGHT);
    const cursorX = Math.floor(scrollLeft / CELL_WIDTH)

    const canScrollTop = cursorY != canvasTable.cursorY;
    const canScrollLeft = cursorX != canvasTable.cursorX;
    if (canScrollTop || canScrollLeft) {
      canvasTable.shiftCell(cursorX, cursorY);
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
  });

  // draw canvas
  canvasTable.render();
})();
