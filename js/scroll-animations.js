// ===== SCROLL ANIMATIONS =====
// Sections gleiten sanft ein, wie Glut die angefacht wird

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('scroll-visible');
      // Einmal abspielen, dann nicht mehr beobachten
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

// Elemente beobachten
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.scroll-fade');
  elements.forEach(el => observer.observe(el));
});
