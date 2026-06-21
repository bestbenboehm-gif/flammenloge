// ===== NAVIGATION =====

// Globale toggleNav-Funktion für onclick-Handler (index.html, gedichte.html)
function toggleNav(button) {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;
  
  const isOpen = navLinks.classList.toggle('open');
  
  // ARIA-Attribute aktualisieren
  button.setAttribute('aria-expanded', isOpen.toString());
  button.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
  
  // Focus auf ersten Link wenn geöffnet
  if (isOpen) {
    const firstLink = navLinks.querySelector('a');
    if (firstLink) firstLink.focus();
  }
}

// Globale toggleHandbuchNav-Funktion für handbuch-flammenseele.html
function toggleHandbuchNav(button) {
  const navLinks = document.getElementById('hnav');
  if (!navLinks) return;
  
  const isOpen = navLinks.classList.toggle('open');
  
  // ARIA-Attribute aktualisieren
  button.setAttribute('aria-expanded', isOpen.toString());
  button.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
  
  // Focus auf ersten Link wenn geöffnet
  if (isOpen) {
    const firstLink = navLinks.querySelector('a');
    if (firstLink) firstLink.focus();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.nav-burger');
  const navLinks = document.querySelector('.nav-links');
  
  if (burger && navLinks) {
    // Keyboard-Support für Burger-Button
    burger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleNav(burger);
      }
    });
    
    // Keyboard-Navigation im Menü
    navLinks.addEventListener('keydown', (e) => {
      const links = Array.from(navLinks.querySelectorAll('a'));
      const currentIndex = links.indexOf(document.activeElement);
      
      switch(e.key) {
        case 'Escape':
          navLinks.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          burger.setAttribute('aria-label', 'Menü öffnen');
          burger.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < links.length - 1) {
            links[currentIndex + 1].focus();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            links[currentIndex - 1].focus();
          } else {
            burger.focus();
          }
          break;
        case 'Home':
          e.preventDefault();
          links[0].focus();
          break;
        case 'End':
          e.preventDefault();
          links[links.length - 1].focus();
          break;
      }
    });
    
    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Menü öffnen');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!burger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Menü öffnen');
      }
    });
  }
  
  // ===== SOUND TOGGLE ARIA-UPDATE =====
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    // Observer für aria-pressed Updates
    const originalToggle = window.toggleSound;
    if (originalToggle) {
      window.toggleSound = function() {
        originalToggle();
        const isPlaying = soundToggle.classList.contains('playing');
        soundToggle.setAttribute('aria-pressed', isPlaying.toString());
      };
    }
  }
});
