(function(){
  const $ = (sel, parent=document) => parent.querySelector(sel);
  const $$ = (sel, parent=document) => Array.from(parent.querySelectorAll(sel));

  const screens = $$('.screen');
  const bottom = $('#bottombar');
  const tabs = $$('.tab');
  const searchBtn = $('#searchBtn');
  const notifBtn = $('#notifBtn');
  const searchOverlay = $('#searchOverlay');
  const searchClose = $('#searchClose');
  const searchInput = $('#searchInput');
  const searchGo = $('#searchGo');
  const searchResults = $('#searchResults');
  const searchSummary = $('#searchSummary');
  const proceedBtn = $('#proceedBtn');
  const notifList = $('#notifList');

  const prices = { regular:75, premium:120, vip:220 };
  const qty = { regular:0, premium:0, vip:0 };

  // Drawer
 const sideDrawer = $('#sideDrawer');
const drawerClose = $('#drawerClose');

function openDrawer(){ sideDrawer.hidden = false; }
function closeDrawer(){ sideDrawer.hidden = true; }

if(drawerClose){ drawerClose.addEventListener('click', closeDrawer); }
sideDrawer.addEventListener('click', (e)=>{
  if(e.target === sideDrawer) closeDrawer();
});

$$('.ditem', sideDrawer).forEach(btn => {
  btn.addEventListener('click', ()=>{
    closeDrawer();
    const dest = btn.dataset.goto;
    if(dest) show(dest);
  });
});

  $$('.ditem', sideDrawer).forEach(btn => {
    btn.addEventListener('click', ()=>{
      closeDrawer();
      const dest = btn.dataset.goto;
      if(dest) show(dest);
    });
  });

  // --- Mock Data ---
  const events = [
    { id: 'final-2025', title:'Championship Final 2025', date:'2025-10-12T19:30:00', pretty:'Sat, Oct 12 • 7:30 PM', venue:'National Stadium', city:'Capital City', price:75 },
    { id: 'derby-city', title:'City Derby', date:'2025-11-03T18:00:00', pretty:'Sun, Nov 3 • 6:00 PM', venue:'Metro Arena', city:'Downtown', price:59 },
    { id: 'rock-fest', title:'Rock Fest: Legends Night', date:'2025-09-21T20:00:00', pretty:'Sun, Sep 21 • 8:00 PM', venue:'River Park', city:'Greenfield', price:45 },
    { id: 'jazz-evening', title:'Jazz Evening by the Lake', date:'2025-12-05T19:00:00', pretty:'Fri, Dec 5 • 7:00 PM', venue:'Lakeside Amphitheater', city:'Harbor City', price:38 },
    { id: 'tech-con', title:'TechCon Keynote', date:'2025-10-01T10:00:00', pretty:'Wed, Oct 1 • 10:00 AM', venue:'Expo Center', city:'Capital City', price:0 }
  ];

  const notifications = [
    { id:'n1', title:'Your booking is confirmed', body:'Order #SBR-2025-1043 for Championship Final 2025.', time:'Just now' },
    { id:'n2', title:'Price drop alert', body:'City Derby tickets dropped to $55 for Section B.', time:'2h ago' },
    { id:'n3', title:'New event near you', body:'Rock Fest: Legends Night added in Greenfield.', time:'Yesterday' },
  ];

  function show(screenName){
    screens.forEach(s => {
      s.hidden = s.dataset.screen !== screenName;
    });
    const hideBars = screenName === 'login';
    bottom.style.display = hideBars ? 'none' : 'grid';
    $('.topbar').style.display = hideBars ? 'none' : 'flex';
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === screenName));
    if(screenName === 'login'){ $('#email')?.focus(); }
    if(screenName === 'notifications'){ renderNotifications(); }
  }

  // Router
  document.addEventListener('click', (e)=>{
    const gotoEl = e.target.closest('[data-goto]');
    if(!gotoEl) return;
    const goto = gotoEl.dataset.goto;
    e.preventDefault();
    if(goto === 'tickets'){ show('confirmation'); return; }
    show(goto);
  });

  // Login
  $('#loginForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = $('#email').value.trim();
    const pass = $('#password').value.trim();
    if(email && pass){ show('listing'); } else { alert('Please enter email and password'); }
  });

  // Tabs
  tabs.forEach(t=> t.addEventListener('click', ()=>{
  const dest = t.dataset.tab;
  if(dest === 'search'){ openSearch(); return; }
  if(dest === 'tickets'){ show('confirmation'); return; }
  if(dest === 'profile'){ 
    searchOverlay.hidden = true;   // ✅ always hide search
    openDrawer(); 
    return; 
  }
  show(dest);
}));

  // --- Search Overlay ---
  function openSearch(){
    searchOverlay.hidden = false;
    setTimeout(()=> searchInput?.focus(), 50);
  }
  searchBtn.addEventListener('click', openSearch);
  searchClose.addEventListener('click', ()=> searchOverlay.hidden = true);
  searchOverlay.addEventListener('click', (e)=>{
    if(e.target === searchOverlay) searchOverlay.hidden = true;
  });
  searchGo.addEventListener('click', ()=> {
    const q = searchInput.value;
    performSearch(q);
    searchOverlay.hidden = true;
    show('search');
  });
  searchInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      e.preventDefault();
      searchGo.click();
    }
  });

  // --- Notifications ---
  notifBtn.addEventListener('click', ()=> show('notifications'));
  function renderNotifications(){
    notifList.innerHTML = '';
    notifications.forEach(n => {
      const item = document.createElement('div');
      item.className = 'notif';
      item.innerHTML = `
        <div class="title">${n.title}</div>
        <div class="body muted">${n.body}</div>
        <div class="time">${n.time}</div>
      `;
      notifList.appendChild(item);
    });
  }

  // --- Qty Handlers ---
  $$('.qty').forEach(box => {
    box.addEventListener('click', (e)=>{
      const act = e.target.dataset.act;
      if(!act) return;
      const key = box.dataset.key;
      qty[key] += (act === 'inc' ? 1 : -1);
      if(qty[key] < 0) qty[key] = 0;
      box.querySelector('.qval').textContent = qty[key];
      updateTotal();
    });
  });

  function calcTotal(){
    return (qty.regular*prices.regular) + (qty.premium*prices.premium) + (qty.vip*prices.vip);
  }

  function updateTotal(){
    $('#total').textContent = `$${calcTotal().toFixed(2)}`;
  }

  // --- Search Logic ---
  function renderEventCard(e){
    const el = document.createElement('article');
    el.className = 'card event';
    el.dataset.goto = 'details';
    el.dataset.eventId = e.id;
    el.innerHTML = `
      <div class="thumb"></div>
      <div class="content">
        <h3 class="h3">${e.title}</h3>
        <div class="meta"><span class="icon clock"></span><span>${e.pretty}</span></div>
        <div class="meta"><span class="icon pin"></span><span>${e.venue}, ${e.city}</span></div>
        <div class="row between mt-8">
          <span class="price">From $${e.price}</span>
          <button class="btn ghost sm" data-goto="details" data-event-id="${e.id}">View</button>
        </div>
      </div>
    `;
    return el;
  }

  function performSearch(q){
    const query = (q || '').trim().toLowerCase();
    let filtered = events;
    if(query){
      filtered = events.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.venue.toLowerCase().includes(query) ||
        e.city.toLowerCase().includes(query) ||
        e.pretty.toLowerCase().includes(query)
      );
      searchSummary.textContent = `Showing ${filtered.length} result(s) for "${query}"`;
    } else {
      searchSummary.textContent = 'Type to find events…';
      filtered = [];
    }
    searchResults.innerHTML = '';
    filtered.forEach(e => searchResults.appendChild(renderEventCard(e)));
    $$('.card.event', searchResults).forEach(card => {
      card.addEventListener('click', (ev)=>{
        const id = ev.target.dataset.eventId || card.dataset.eventId;
        const found = events.find(x => x.id === id) || filtered[0];
        if(found){ setDetails(found); show('details'); }
      });
    });
  }

  function setDetails(e){
    $('#screen-details .h2').textContent = e.title;
    const meta = $$('#screen-details .meta span:nth-child(2)');
    if(meta[0]) meta[0].textContent = e.pretty;
    if(meta[1]) meta[1].textContent = `${e.venue}, ${e.city}`;
    $$('#screen-booking .summary .h4')[0].textContent = e.title;
    $$('#screen-booking .summary .muted')[0].textContent = e.pretty;
  }

  if (proceedBtn) {
    proceedBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      const total = calcTotal();
      if (total <= 0) {
        alert('Please select at least 1 ticket to proceed.');
        return;
      }
      show('confirmation');
    });
  }

  // Init
  searchOverlay.hidden = true;
  sideDrawer.hidden = true;
  show('login');
})();
