// ===== SOCIAL SHARING =====

function shareOnTwitter() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent('Flammenloge - Ein stiller Ort im Licht der Erkenntnis');
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
}

function shareOnFacebook() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
}

function shareOnWhatsApp() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent('Flammenloge - Ein stiller Ort im Licht der Erkenntnis');
  window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
}

function shareViaEmail() {
  const url = window.location.href;
  const subject = encodeURIComponent('Flammenloge - Ein stiller Ort im Licht der Erkenntnis');
  const body = encodeURIComponent(`Schau dir das mal an:\n\n${url}\n\nEin stiller Ort in einer lauten Welt. Wo Gedanken zu Flammen werden.`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// Sharing-Panel Toggle
function toggleSharePanel() {
  const panel = document.getElementById('share-panel');
  const button = document.querySelector('.share-toggle');
  const isOpen = panel.classList.toggle('open');
  button.setAttribute('aria-expanded', isOpen);
}

// Schließen bei Klick außerhalb
document.addEventListener('click', (e) => {
  const panel = document.getElementById('share-panel');
  const toggle = document.querySelector('.share-toggle');
  if (panel && toggle && !panel.contains(e.target) && !toggle.contains(e.target)) {
    panel.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});
