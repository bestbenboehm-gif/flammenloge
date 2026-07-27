// ===== SCROLL ANIMATIONS =====
// Sections gleiten sanft ein, wie Glut die angefacht wird
// Staggered: Elemente erscheinen nacheinander

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('scroll-visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.scroll-fade');
  elements.forEach((el, index) => {
    el.style.transitionDelay = `${(index % 10) * 0.06}s`;
    observer.observe(el);
  });
});
