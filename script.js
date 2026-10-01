// Ubay-Ubay artist call page.
// Phase 2 adds the form (validation, signature pad, PDF, sending).

// Scroll animation: anything with class="reveal" fades in the first time it
// scrolls into view. The small script in the <head> only turns this on when the
// browser supports it and the visitor has not asked for reduced motion.
// Without JavaScript, everything simply shows.
if (document.documentElement.classList.contains('js-reveal')) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

// Sticky header: once it reaches the top of the screen, add .is-stuck so the
// stylesheet can square its top corners and draw a line under it.
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const updateHeader = () => {
    siteHeader.classList.toggle('is-stuck', siteHeader.getBoundingClientRect().top <= 0);
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}
