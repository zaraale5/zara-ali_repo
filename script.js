// NAV MENU TOGGLE
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  // Close navigation after link click on mobile
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 950) navMenu.classList.remove('open');
    });
  });
}

// SMOOTH SCROLL
const scrollLinks = document.querySelectorAll('a[href^="#"]');
scrollLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target && target !== document.body && target.id !== 'header') {
      e.preventDefault();
      window.scrollTo({
        top: target.offsetTop - 60,
        behavior: 'smooth'
      });
    }
  });
});

// PRODUCT FILTERING
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');
if (filterBtns.length) {
  filterBtns.forEach(btn => btn.addEventListener('click', function() {
    filterBtns.forEach(b => b.setAttribute('aria-pressed','false'));
    btn.setAttribute('aria-pressed','true');
    const filter = btn.dataset.filter;
    productCards.forEach(card => {
      if (filter === 'all' || card.dataset.type.indexOf(filter) !== -1) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }));
}

// FADE-IN SECTIONS on SCROLL
const fadeSections = document.querySelectorAll('.fade-section');
const fadeInObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeInObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
fadeSections.forEach(section => fadeInObserver.observe(section));

// --- Floating Chat Widget ---
(function initChatWidget() {
  const root = document.getElementById('chat-widget-root');
  if (!root) return;
  // HTML
  root.innerHTML = `
    <button id="chat-fab" aria-label="Chat with us" tabindex="0"><span>💬</span></button>
    <div id="chat-panel" aria-live="polite" aria-modal="true" role="dialog" style="display:none;">
      <div class="chat-header">
        <span aria-hidden="true">💬</span> Chat with Zara Ali
      </div>
      <div id="chat-messages">
      </div>
      <form id="chat-form" autocomplete="off">
        <input id="chat-input" type="text" placeholder="Type your question..." aria-label="Type message" required />
        <button id="chat-send" type="submit" aria-label="Send message">▶</button>
      </form>
    </div>
  `;
  const fab = document.getElementById('chat-fab');
  const panel = document.getElementById('chat-panel');
  const form = document.getElementById('chat-form');
  const messages = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  let open = false;
  function togglePanel() {
    open = !open;
    if (open) {
      panel.classList.add('open');
      panel.style.display = '';
      fab.setAttribute('aria-expanded','true');
      setTimeout(()=>panel.focus(),100);
    } else {
      panel.classList.remove('open');
      setTimeout(()=>{panel.style.display = 'none';},220);
      fab.setAttribute('aria-expanded','false');
    }
  }
  fab.addEventListener('click', togglePanel);
  fab.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){togglePanel();}});
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) { togglePanel(); fab.focus(); }
  });

  // Message helper
  function appendMessage({text, sender, loading}) {
    const msg = document.createElement('div');
    msg.className = 'chat-message' + (sender === 'user' ? ' user' : '');
    if (loading) {
      msg.innerHTML = `<div id="chat-loader"></div>`;
    } else {
      msg.innerHTML = `<div class="chat-bubble">${text}</div>`;
    }
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }
  // Opening message
  setTimeout(()=>{
    appendMessage({text: 'Hi! Ask me anything about our services 👋', sender: 'bot'});
  },300);

  // Handle form submit
  let awaitingResponse = false;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (awaitingResponse) return;
    const val = input.value.trim();
    if (!val) return;
    appendMessage({text: val, sender: 'user'});
    input.value = '';
    awaitingResponse = true;
    appendMessage({loading:true, sender:'bot'});
    // POST to endpoint
    fetch('https://overstay-choosy-succulent.ngrok-free.dev/webhook/chat', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({message: val, companyId: 'zara-ali-repo', companyName: 'Zara Ali'})
    })
      .then(res=>{ if (res.ok) return res.json(); throw new Error('No reply'); })
      .then(({reply}) => {
        // Remove loader
        const loaders = messages.querySelectorAll('#chat-loader');
        loaders.forEach(n=>n.parentNode && n.parentNode.remove());
        appendMessage({text: reply || 'Sorry, no reply received.', sender:'bot'});
      })
      .catch(()=>{
        const loaders = messages.querySelectorAll('#chat-loader');
        loaders.forEach(n=>n.parentNode && n.parentNode.remove());
        appendMessage({text: 'Sorry, the service is unavailable right now.', sender:'bot'});
      })
      .finally(()=> { awaitingResponse=false; messages.scrollTop = messages.scrollHeight; });
  });
  // Accessibility: Focus form input on open
  panel.addEventListener('transitionend',()=>{ if(open){ input && input.focus(); } });
})();
