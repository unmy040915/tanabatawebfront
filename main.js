(function () {
  /* ── Responsive scaling ── */
  const DESIGN_WIDTH  = 1440;
  const DESIGN_HEIGHT = 4110;

  /* Hero band design metrics (px, pre-scale) */
  const HERO_HEIGHT     = 859;
  const TICKER_HEIGHT   = 55;
  const HERO_IMG_HEIGHT = 525;

  function applyScale() {
    const frame        = document.querySelector('.frame');
    const wrapper      = document.querySelector('.scale-wrapper');
    const heroBg       = document.querySelector('.hero-bg');
    const heroImg      = document.querySelector('.hero-img');
    const tickerTop    = document.querySelector('.ticker-top');
    const tickerBottom = document.querySelector('.ticker-bottom');
    const belowHero    = document.querySelector('.below-hero');

    /* Use clientWidth (excludes the scrollbar) rather than innerWidth/vw,
       which would overshoot the page by the scrollbar's width. */
    const viewportWidth = document.documentElement.clientWidth;
    const scale = Math.min(1, viewportWidth / DESIGN_WIDTH);

    /* Stretch the hero band so the bottom ticker always reaches the
       bottom of the window, then push everything below it down to match. */
    const heroNaturalScreenPx = HERO_HEIGHT * scale;
    const extraScreenPx = Math.max(0, window.innerHeight - heroNaturalScreenPx);
    const extraDesignPx = extraScreenPx / scale;

    heroBg.style.height    = `${HERO_HEIGHT + extraDesignPx}px`;
    tickerBottom.style.top = `${HERO_HEIGHT - TICKER_HEIGHT + extraDesignPx}px`;
    heroImg.style.top      = `${(HERO_HEIGHT + extraDesignPx - HERO_IMG_HEIGHT) / 2}px`;
    belowHero.style.top    = `${extraDesignPx}px`;
    frame.style.minHeight  = `${DESIGN_HEIGHT + extraDesignPx}px`;

    /* Widen the hero band to fill the full window when there's leftover
       horizontal space beyond the 1440px design. */
    if (scale === 1 && viewportWidth > DESIGN_WIDTH) {
      const offset = -((viewportWidth - DESIGN_WIDTH) / 2);
      [heroBg, tickerTop, tickerBottom].forEach((el) => {
        el.style.left  = `${offset}px`;
        el.style.width = `${viewportWidth}px`;
      });
    } else {
      [heroBg, tickerTop, tickerBottom].forEach((el) => {
        el.style.left  = '';
        el.style.width = '';
      });
    }

    if (scale < 1) {
      frame.style.transform  = `scale(${scale})`;
      frame.style.marginLeft = '0';
      wrapper.style.height   = `${(DESIGN_HEIGHT + extraDesignPx) * scale}px`;
    } else {
      frame.style.transform  = '';
      frame.style.marginLeft = '';
      wrapper.style.height   = '';
    }
  }

  window.addEventListener('resize', applyScale);
  applyScale();

  /* ── Sticker interaction (custom pointer-based drag, follows the cursor) ── */
  const dock    = document.getElementById('sticker-dock');
  const sticker = document.getElementById('draggable-sticker');
  const ghost   = document.getElementById('drag-ghost');
  const rows    = document.querySelectorAll('.name-row');
  const voteBtn = document.getElementById('vote-btn');
  const voteTxt = document.getElementById('vote-btn-text');
  const comment = document.getElementById('vote-comment');
  const peelBtn = document.getElementById('peel-btn');

  let dragging  = false;
  let offX = 0, offY = 0;
  let hoverRow  = null;
  let placedRow = null;

  function clearHover() {
    if (hoverRow) hoverRow.classList.remove('drag-over');
    hoverRow = null;
  }

  function selectRow(row) {
    rows.forEach((r) => r.classList.remove('selected'));
    row.classList.add('selected');
    placedRow = row;
    comment.textContent = `// ${row.dataset.name} が選ばれました`;
    voteBtn.classList.add('active');
    voteTxt.textContent = 'シールを交換する！';
    peelBtn.classList.add('visible');
    dock.style.display = 'none';
  }

  function unselect() {
    rows.forEach((r) => r.classList.remove('selected'));
    placedRow = null;
    comment.textContent = '// まだ誰も選ばれていません';
    voteBtn.classList.remove('active');
    voteTxt.textContent = '名前にシールを貼ると押せます';
    peelBtn.classList.remove('visible');
    dock.style.display = '';
  }

  sticker.addEventListener('pointerdown', (e) => {
    const r = sticker.getBoundingClientRect();
    offX = e.clientX - r.left;
    offY = e.clientY - r.top;
    dragging = true;
    dock.style.display = 'none';
    ghost.style.display = 'block';
    ghost.style.left = `${e.clientX - offX}px`;
    ghost.style.top  = `${e.clientY - offY}px`;
    sticker.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    ghost.style.left = `${e.clientX - offX}px`;
    ghost.style.top  = `${e.clientY - offY}px`;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    const row = target ? target.closest('.name-row') : null;
    if (row !== hoverRow) {
      clearHover();
      if (row) { row.classList.add('drag-over'); hoverRow = row; }
    }
  });

  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    ghost.style.display = 'none';
    if (hoverRow) {
      selectRow(hoverRow);
      clearHover();
    } else {
      dock.style.display = '';
    }
  });

  /* Tap a name directly to select it (no drag required) */
  rows.forEach((row) => {
    row.addEventListener('click', () => selectRow(row));
  });

  peelBtn.addEventListener('click', unselect);

  voteBtn.addEventListener('click', () => {
    if (!voteBtn.classList.contains('active')) return;
    if (placedRow) alert(`${placedRow.dataset.name} さんとのシール交換リクエストを送りました！`);
  });
})();
