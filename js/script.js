
(function () {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('[data-carousel-track]');
  const cards = Array.from(track.children);
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  const dotsWrap = carousel.querySelector('[data-carousel-dots]');

  const AUTOPLAY_DELAY = 6000;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cardsPerView = 3;
  let index = 0;
  let autoplayTimer = null;

  // quantos cartões mostrar de acordo com a largura da tela
  function getCardsPerView() {
    const w = window.innerWidth;
    if (w <= 640) return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(cards.length - cardsPerView, 0);
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIndex(); i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Ir para avaliação ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function update() {
    track.style.setProperty('--cards-per-view', cardsPerView);
    const step = 100 / cardsPerView;
    track.style.transform = `translateX(-${index * step}%)`;

    // atualiza estado das setas
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === maxIndex();

    // atualiza os pontinhos
    Array.from(dotsWrap.children).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });
  }

  function goTo(i) {
    index = Math.min(Math.max(i, 0), maxIndex());
    update();
    restartAutoplay();
  }

  function next() {
    goTo(index >= maxIndex() ? 0 : index + 1);
  }

  function prev() {
    goTo(index <= 0 ? maxIndex() : index - 1);
  }

  function restartAutoplay() {
    if (prefersReducedMotion) return;
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, AUTOPLAY_DELAY);
  }

  function handleResize() {
    const newCardsPerView = getCardsPerView();
    if (newCardsPerView !== cardsPerView) {
      cardsPerView = newCardsPerView;
      index = Math.min(index, maxIndex());
      buildDots();
    }
    update();
  }

  // navegação por clique
  nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });
  prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });

  // pausa o autoplay ao passar o mouse ou focar no carrossel
  carousel.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  carousel.addEventListener('mouseleave', restartAutoplay);
  carousel.addEventListener('focusin', () => clearInterval(autoplayTimer));
  carousel.addEventListener('focusout', restartAutoplay);

  // suporte a arrastar/deslizar no toque (mobile)
  let touchStartX = 0;
  let touchDeltaX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    clearInterval(autoplayTimer);
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    touchDeltaX = e.touches[0].clientX - touchStartX;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    const SWIPE_THRESHOLD = 40;
    if (touchDeltaX > SWIPE_THRESHOLD) prev();
    else if (touchDeltaX < -SWIPE_THRESHOLD) next();
    touchDeltaX = 0;
    restartAutoplay();
  });

  // inicialização
  cardsPerView = getCardsPerView();
  buildDots();
  update();
  restartAutoplay();
  window.addEventListener('resize', handleResize);
})();