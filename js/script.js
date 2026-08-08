// Header scroll effect
const header = document.getElementById('header');
let lastScroll = 0;

// Scroll spy: highlight the nav link of the section currently in view
// (runs on the homepage, where the sections below exist)
const spySections = [
  { id: 'hero', href: 'index.html' },
  { id: 'about', href: 'about.html' },
  { id: 'services', href: 'services.html' },
  { id: 'projects', href: 'projects.html' },
  { id: 'testimonials', href: 'contact.html' }
].map(s => ({ ...s, el: document.getElementById(s.id) })).filter(s => s.el);

const spyLinks = {};
document.querySelectorAll('.nav a').forEach(a => {
  spyLinks[a.getAttribute('href')] = a;
});

function updateSpy() {
  if (!spySections.length) return;
  let current = spySections[0];
  for (const s of spySections) {
    if (s.el.getBoundingClientRect().top <= 140) current = s;
  }
  document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));
  const target = spyLinks[current.href];
  if (target) target.classList.add('active');
}

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  header.classList.toggle('scrolled', currentScroll > 80);
  lastScroll = currentScroll;
});

window.addEventListener('scroll', updateSpy, { passive: true });
updateSpy();

// Mobile menu
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

// Scroll lock (position-fixed pattern avoids the body{overflow:hidden}
// scroll-position desync that breaks wheel-up scrolling in Chrome)
let scrollLockCount = 0;
let savedScrollY = 0;

function lockScroll() {
  if (scrollLockCount === 0) {
    savedScrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + savedScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.width = '100%';
  }
  scrollLockCount++;
}

function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    window.scrollTo(0, savedScrollY);
  }
}

function closeNav() {
  hamburger.classList.remove('active');
  nav.classList.remove('active');
  unlockScroll();
}

hamburger.addEventListener('click', () => {
  if (typeof lightbox !== 'undefined' && lightbox && lightbox.classList.contains('open')) {
    closeLightbox();
  }
  const opening = !nav.classList.contains('active');
  hamburger.classList.toggle('active');
  nav.classList.toggle('active');
  if (opening) {
    lockScroll();
  } else {
    unlockScroll();
  }
});

// Close when clicking nav backdrop
nav.addEventListener('click', (e) => {
  if (e.target === nav) closeNav();
});

// Close on link click
document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', closeNav);
});

// Animated counter
function animateCounter(element) {
  const target = parseInt(element.dataset.count);
  const duration = 2000;
  const start = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    element.textContent = current + (target === 50 || target === 100 ? '+' : target === 4 ? '.8' : '+');

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target + (target === 50 || target === 100 ? '+' : target === 4 ? '.8' : '+');
    }
  }

  requestAnimationFrame(update);
}

// Intersection Observer for stats
const statsSection = document.querySelector('.hero-stats, .about-hero-stats');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !statsAnimated) {
      statsAnimated = true;
      document.querySelectorAll('.stat-number[data-count]').forEach(animateCounter);
    }
  });
}, { threshold: 0.5 });

if (statsSection) {
  statsObserver.observe(statsSection);
}

// Fade-in on scroll
const fadeElements = document.querySelectorAll(
  '.about-grid, .service-card, .project-card, .testimonial-card, .contact-grid, .section-header, .cta-banner'
);

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 100);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeElements.forEach(el => {
  el.classList.add('fade-in');
  fadeObserver.observe(el);
});

// Contact form
const contactForm = document.getElementById('contactForm');

if (contactForm) {
contactForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const btn = this.querySelector('button');
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;

  const name = this.querySelector('input[type="text"]').value;
  const phone = this.querySelector('input[type="tel"]').value;
  const email = this.querySelector('input[type="email"]').value;
  const service = this.querySelector('select').value;
  const msg = this.querySelector('textarea').value;

  const formStatus = document.getElementById('formStatus');

  // Save to Formspree spreadsheet
  fetch('https://formspree.io/f/xgogbzrj', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      name,
      phone,
      email,
      service,
      message: msg,
      _subject: 'New Enquiry - SP Home Constructions'
    })
  })
    .then(res => res.json())
    .then(() => {
      if (formStatus) {
        formStatus.textContent = 'Thank you! Your message has been sent.';
        formStatus.className = 'form-status success';
      }
    })
    .catch(() => {
      if (formStatus) {
        formStatus.textContent = 'Something went wrong. Please try again or WhatsApp us directly.';
        formStatus.className = 'form-status error';
      }
    });

  // Open WhatsApp
  const text = `Hi SP Home Constructions! I'm ${name} (${phone}). ${msg ? 'Message: ' + msg : "I'm interested in your services."}`;
  window.open(`https://wa.me/919937994806?text=${encodeURIComponent(text)}`, '_blank');

  btn.innerHTML = orig;
  btn.disabled = false;
  this.reset();
});
}

// Projects gallery filter
const galFilters = document.getElementById('galFilters');
const galCards = document.querySelectorAll('.gal-grid .project-card');

if (galFilters && galCards.length) {
  const filterButtons = galFilters.querySelectorAll('.gal-filter');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

// Projects lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let lightboxItems = [];
let lightboxIndex = 0;

function openLightbox(index) {
  if (!lightbox || !lightboxItems.length) return;
  lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
  const item = lightboxItems[lightboxIndex];
  lightboxImg.src = item.src;
  lightboxImg.alt = item.alt;
  lightboxCaption.textContent = item.caption;
  lightbox.classList.add('open');
  lockScroll();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  unlockScroll();
}

if (lightbox) {
  lightboxItems = Array.from(document.querySelectorAll('.project-card')).map(card => {
    const img = card.querySelector('.project-img img');
    const h3 = card.querySelector('.project-overlay h3');
    const p = card.querySelector('.project-overlay p');
    return {
      src: img.src,
      alt: img.alt,
      caption: [h3.textContent, p.textContent].filter(Boolean).join(' — ')
    };
  });

  document.querySelectorAll('.project-card').forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  lightboxPrev.addEventListener('click', () => openLightbox(lightboxIndex - 1));
  lightboxNext.addEventListener('click', () => openLightbox(lightboxIndex + 1));

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(lightboxIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(lightboxIndex + 1);
  });
}

// Expandable "Why Choose Us" cards (about page)
document.querySelectorAll('.page-about .value-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('open');
    card.setAttribute('aria-expanded', card.classList.contains('open'));
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

// FAQ accordion: keep only one question open at a time
document.querySelectorAll('details.faq-item').forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    const scope = item.closest('.container') || item.parentElement;
    scope.querySelectorAll('details.faq-item').forEach(sib => {
      if (sib !== item) sib.open = false;
    });
  });
});
