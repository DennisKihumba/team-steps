// ============ Team Steps — shared behaviour ============

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('nav.links');
  if (toggle && links){
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const expanded = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });
  }

  // Render any ladder widgets on the page: <div class="ladder-rungs" data-total="50" data-filled="5">
  document.querySelectorAll('.ladder-rungs[data-total]').forEach(el => {
    const total = parseInt(el.dataset.total, 10) || 50;
    const filled = parseInt(el.dataset.filled, 10) || 0;
    el.innerHTML = '';
    for (let i = 0; i < total; i++){
      const r = document.createElement('div');
      r.className = 'rung' + (i < filled ? ' filled' : '');
      el.appendChild(r);
    }
  });

  // Generic form preview handler: shows a confirmation message, does not submit anywhere yet.
  document.querySelectorAll('form.site-form[data-preview]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = form.querySelector('.form-msg');
      if (msg) msg.classList.add('show');
      form.reset();
    });
  });

  // Footer year
  document.querySelectorAll('.js-year').forEach(el => { el.textContent = new Date().getFullYear(); });
});