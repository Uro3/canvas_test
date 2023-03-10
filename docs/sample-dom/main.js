(function () {
  const MAX_X_CELL_NUM = 300;
  const MAX_Y_CELL_NUM = 300;
  const CELL_WIDTH = 90;
  const CELL_HEIGHT = 30;

  const tableWidth = window.innerWidth * 0.9;
  const tableHeight = window.innerHeight * 0.9;

  const resetSelect = () => {
    document.querySelectorAll('td.selected').forEach(element => {
      element.classList.remove('selected');
    });
  }

  const tableWrapper = document.getElementById('table-wrapper');
  const table = document.getElementById('table');
  const tbody = document.getElementById('table-body');
  const menu = document.getElementById('menu');
  const scrollUpButton = document.getElementById('scroll-up');
  const scrollDownButton = document.getElementById('scroll-down');
  const scrollLeftButton = document.getElementById('scroll-left');
  const scrollRightButton = document.getElementById('scroll-right');

  tableWrapper.style.width = `${tableWidth}px`;
  tableWrapper.style.height = `${tableHeight}px`;
  table.style.width = `${tableWidth}px`;
  table.style.height = `${tableHeight}px`;

  const textData = [];
  for (let i = 1; i <= (MAX_Y_CELL_NUM); i++) {
    const texts = []
    for (let j = 1; j <= (MAX_X_CELL_NUM); j++) {
      texts.push(`data-${i}-${j}`);
    }
    textData.push(texts);
  }

  for (let i = 0; i < textData.length; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < textData[i].length; j++) {
      const td = document.createElement('td');
      td.innerHTML = textData[i][j];
      td.style.width = `${CELL_WIDTH}px`;
      td.style.height = `${CELL_HEIGHT}px`;
      td.addEventListener('click', function (event) {
        event.stopPropagation();
        resetSelect();
        event.target.classList.add('selected');
        menu.style.display = 'none';
      })
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  // set listener
  document.body.addEventListener('click', function (_) {
    resetSelect();
    menu.style.display = 'none';
  });

  tableWrapper.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    menu.style.top = `${event.pageY}px`;
    menu.style.left = `${event.pageX + 10}px`;
    menu.style.display = 'block';
  });

  scrollUpButton.addEventListener('click', function (_) {
    const { scrollTop, scrollLeft } = tableWrapper;
    const top = (Math.floor(scrollTop / CELL_HEIGHT) * CELL_HEIGHT) - CELL_HEIGHT;
    if (top < 0) return;
    tableWrapper.scrollTo(scrollLeft, top);
  });

  scrollDownButton.addEventListener('click', function (_) {
    const { scrollTop, scrollLeft } = tableWrapper;
    const top = (Math.floor(scrollTop / CELL_HEIGHT) * CELL_HEIGHT) + CELL_HEIGHT;
    tableWrapper.scrollTo(scrollLeft, top);
  });

  scrollLeftButton.addEventListener('click', function (_) {
    const { scrollTop, scrollLeft } = tableWrapper;
    const left = (Math.floor(scrollLeft / CELL_WIDTH) * CELL_WIDTH) - CELL_WIDTH;
    if (left < 0) return;
    tableWrapper.scrollTo(left, scrollTop);
  });

  scrollRightButton.addEventListener('click', function (_) {
    const { scrollTop, scrollLeft } = tableWrapper;
    const left = (Math.floor(scrollLeft / CELL_WIDTH) * CELL_WIDTH) + CELL_WIDTH;
    tableWrapper.scrollTo(left, scrollTop);
  });
})();
