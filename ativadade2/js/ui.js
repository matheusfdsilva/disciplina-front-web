// ui.js - mobile nav, dropdown accessibility, modal and toasts
(function(){
  'use strict';

  // hamburger toggle
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  if(burger && mobileNav){
    burger.addEventListener('click', ()=> {
      const expanded = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('show');
      mobileNav.setAttribute('aria-hidden', String(expanded));
    });
  }

  // dropdown accessible: add keyboard support
  document.querySelectorAll('.nav-item').forEach(item=>{
    const trigger = item.querySelector('a');
    const menu = item.querySelector('.dropdown');
    if(!menu) return;
    trigger.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        const visible = menu.style.display === 'block';
        menu.style.display = visible ? 'none' : 'block';
      }
    });
  });

  // modal helpers (for donationModal)
  const donationModal = document.getElementById('donationModal') || document.getElementById('modal');
  if(donationModal){
    donationModal.addEventListener('click', (e)=>{
      if(e.target.classList.contains('modal-close') || e.target === donationModal){
        donationModal.setAttribute('aria-hidden','true');
        donationModal.classList.remove('open');
      }
    });
    document.querySelectorAll('.modal-close').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        donationModal.setAttribute('aria-hidden','true');
        donationModal.classList.remove('open');
      });
    });
  }

  // small toast utility
  window.showToast = function(message, timeout=3000){
    const wrap = document.getElementById('toasts');
    if(!wrap) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(()=> el.classList.add('visible'), 50);
    setTimeout(()=> {
      el.classList.remove('visible');
      setTimeout(()=> wrap.removeChild(el), 300);
    }, timeout);
  };

})();