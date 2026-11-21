const menu = document.querySelector('.menu'), links = document.querySelector('.links'), loginToggle = document.querySelector('#login-toggle'), login = document.querySelector('#login-form'), currencyToggle = document.querySelector('#currency-toggle'), currencyCard = document.querySelector('#currency-card');
menu.addEventListener('click', () => {
  let open = links.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open))
});
links.addEventListener('click', e => {
  if (e.target.closest('a')) {
    links.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false')
  }
});
function closePanels() {
  login.hidden = true;
  currencyCard.hidden = true;
  loginToggle.setAttribute('aria-expanded', 'false');
  currencyToggle.setAttribute('aria-expanded', 'false')
}
loginToggle.addEventListener('click', () => {
  let open = login.hidden;
  closePanels();
  login.hidden = !open;
  loginToggle.setAttribute('aria-expanded', String(open));
  if (open) login.querySelector('input').focus()
});
currencyToggle.addEventListener('click', () => {
  let open = currencyCard.hidden;
  closePanels();
  currencyCard.hidden = !open;
  currencyToggle.setAttribute('aria-expanded', String(open));
  if (open) loadCurrency()
});
document.addEventListener('click', e => {
  if (!login.contains(e.target) && !loginToggle.contains(e.target) && !currencyCard.contains(e.target) && !currencyToggle.contains(e.target)) closePanels()
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    let active = !login.hidden || !currencyCard.hidden;
    closePanels();
    links.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    if (active) loginToggle.focus()
  }
});
document.querySelector('#login-form').addEventListener('submit', e => {
  e.preventDefault();
  document.querySelector('#login-status').textContent = 'Login demo only — no credentials were sent or stored.'
});
document.querySelector('#google-login').addEventListener('click', () => {
  document.querySelector('#login-status').textContent = 'Google sign-in is a visual demo and is not connected yet.'
});
document.querySelector('#newsletter-form').addEventListener('submit', e => {
  e.preventDefault();
  document.querySelector('#signup-status').textContent = 'Thanks! This demo is ready to connect to your mailing list service.'
});
const amountInput = document.querySelector('#currency-amount'), fromSelect = document.querySelector('#currency-from'), toSelect = document.querySelector('#currency-to'), currencyOutput = document.querySelector('#currency-output'), currencyStatus = document.querySelector('#currency-status'), currencySummary = document.querySelector('#currency-summary'), rateCache = new Map();
let activeRates = null;
async function loadCurrency() {
  let base = fromSelect.value;
  currencyStatus.textContent = 'Fetching latest ' + base + ' rates…';
  currencyOutput.textContent = 'Loading…';
  try {
    let data = rateCache.get(base);
    if (!data) {
      let response = await fetch('https://open.er-api.com/v6/latest/' + encodeURIComponent(base));
      if (!response.ok) throw new Error('Rate service returned ' + response.status);
      data = await response.json();
      if (data.result !== 'success' || !data.rates) throw new Error('Rate data is unavailable');
      rateCache.set(base, data)
    }
    activeRates = data;
    renderCurrency()
  }catch (error) {
    currencyOutput.textContent = '—';
    currencyStatus.textContent = 'Could not load rates. Check your connection and try again.'
  }
}
function renderCurrency() {
  if (!activeRates) return;
  let amount = Number(amountInput.value), target = toSelect.value, rate = activeRates.rates[target];
  if (!Number.isFinite(amount) || amount < 0) {
    currencyOutput.textContent = 'Enter a valid amount';
    return
  }
  if (!rate) {
    currencyOutput.textContent = 'Rate unavailable';
    return
  }
  let result = amount * rate;
  currencySummary.textContent = amount + ' ' + fromSelect.value + ' equals';
  try {
    currencyOutput.textContent = new Intl.NumberFormat(undefined, {
      style: 'currency', currency: target, maximumFractionDigits: 2
    }).format(result)
  }catch {
    currencyOutput.textContent = result.toFixed(2) + ' ' + target
  }
  let updated = activeRates.time_last_update_utc?new Date(activeRates.time_last_update_utc).toLocaleString(): 'time unavailable';
  currencyStatus.textContent = 'Rate data last updated: ' + updated + '. Rates may change.'
}
fromSelect.addEventListener('change', loadCurrency);
toSelect.addEventListener('change', renderCurrency);
amountInput.addEventListener('input', renderCurrency);
const slides =[...document.querySelectorAll('.slide')], dots =[...document.querySelectorAll('.dot')], slider = document.querySelector('#photo-slider');
let current = 0, timer;
function show(i) {
  current =(i + slides.length)%slides.length;
  slides.forEach((x, n) => x.classList.toggle('active', n === current));
  dots.forEach((x, n) => x.setAttribute('aria-current', String(n === current)))
}
document.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => show(current + Number(b.dataset.step))));
dots.forEach(b => b.addEventListener('click', () => show(Number(b.dataset.index))));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
function play() {
  if (!reduced.matches && !timer) timer = setInterval(() => show(current + 1), 5000)
}
function pause() {
  clearInterval(timer);
  timer = null
}
play();
slider.addEventListener('mouseenter', pause);
slider.addEventListener('mouseleave', play);
slider.addEventListener('focusin', pause);
slider.addEventListener('focusout', e => {
  if (!slider.contains(e.relatedTarget)) play()
});
