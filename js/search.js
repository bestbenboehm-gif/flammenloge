// ===== HANDBUCH SUCHE =====

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('handbuch-search');
  const searchClear = document.getElementById('search-clear');
  const searchResults = document.getElementById('search-results');
  
  if (!searchInput) return;
  
  // Alle durchsuchbaren Elemente sammeln
  const searchableElements = [];
  
  // Gesetze (Laws)
  document.querySelectorAll('.law').forEach(law => {
    const title = law.querySelector('.law-title');
    const text = law.querySelector('.law-text');
    const teach = law.querySelector('.law-teach');
    const num = law.querySelector('.law-num');
    
    searchableElements.push({
      element: law,
      title: title ? title.textContent : '',
      text: text ? text.textContent : '',
      teach: teach ? teach.textContent : '',
      num: num ? num.textContent : '',
      type: 'law'
    });
  });
  
  // Stufen (Stages)
  document.querySelectorAll('.stage').forEach(stage => {
    const title = stage.querySelector('.stage-title');
    const paragraphs = stage.querySelectorAll('p');
    let text = '';
    paragraphs.forEach(p => text += p.textContent + ' ');
    
    searchableElements.push({
      element: stage,
      title: title ? title.textContent : '',
      text: text,
      type: 'stage'
    });
  });
  
  // Riten (Rites)
  document.querySelectorAll('.rite').forEach(rite => {
    const title = rite.querySelector('.rite-title');
    const text = rite.querySelector('.rite-text');
    
    searchableElements.push({
      element: rite,
      title: title ? title.textContent : '',
      text: text ? text.textContent : '',
      type: 'rite'
    });
  });
  
  // Sprüche (Sayings)
  document.querySelectorAll('.saying').forEach(saying => {
    searchableElements.push({
      element: saying,
      title: '',
      text: saying.textContent,
      type: 'saying'
    });
  });
  
  // Verse
  document.querySelectorAll('p.verse').forEach(verse => {
    searchableElements.push({
      element: verse,
      title: '',
      text: verse.textContent,
      type: 'verse'
    });
  });
  
  // Such-Handler
  let searchTimeout;
  
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => performSearch(), 200);
  });
  
  // Clear Button
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      clearSearch();
      searchInput.focus();
    });
  }
  
  // Escape zum Schließen
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      clearSearch();
      searchInput.blur();
    }
  });
  
  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length === 0) {
      clearSearch();
      return;
    }
    
    // Clear Button zeigen
    if (searchClear) searchClear.style.display = 'block';
    
    let matchCount = 0;
    
    searchableElements.forEach(item => {
      const searchText = (item.title + ' ' + item.text + ' ' + (item.teach || '') + ' ' + (item.num || '')).toLowerCase();
      
      if (searchText.includes(query)) {
        item.element.style.display = '';
        item.element.classList.add('search-match');
        matchCount++;
        
        // Highlight matching text
        highlightText(item.element, query);
      } else {
        item.element.style.display = 'none';
        item.element.classList.remove('search-match');
      }
    });
    
    // Ergebnisse anzeigen
    if (searchResults) {
      if (matchCount > 0) {
        searchResults.textContent = `${matchCount} Ergebnis${matchCount !== 1 ? 'se' : ''} gefunden`;
        searchResults.style.display = 'block';
      } else {
        searchResults.textContent = 'Keine Ergebnisse';
        searchResults.style.display = 'block';
      }
    }
  }
  
  function clearSearch() {
    if (searchClear) searchClear.style.display = 'none';
    if (searchResults) searchResults.style.display = 'none';
    
    searchableElements.forEach(item => {
      item.element.style.display = '';
      item.element.classList.remove('search-match');
      removeHighlights(item.element);
    });
  }
  
  function highlightText(element, query) {
    // Nur in Text-Nodes highlighten, nicht in HTML-Tags
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }
    
    textNodes.forEach(node => {
      const text = node.textContent;
      const lowerText = text.toLowerCase();
      const index = lowerText.indexOf(query);
      
      if (index !== -1 && !node.parentElement.classList.contains('search-highlight')) {
        const before = text.substring(0, index);
        const match = text.substring(index, index + query.length);
        const after = text.substring(index + query.length);
        
        const span = document.createElement('span');
        span.className = 'search-highlight';
        span.textContent = match;
        
        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(span);
        if (after) fragment.appendChild(document.createTextNode(after));
        
        node.parentNode.replaceChild(fragment, node);
      }
    });
  }
  
  function removeHighlights(element) {
    element.querySelectorAll('.search-highlight').forEach(highlight => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    });
  }
});
