const revealElements = document.querySelectorAll('[data-reveal]');
const staggerParents = document.querySelectorAll('[data-stagger-parent]');

const revealObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

revealElements.forEach(function (el) {
  if (!el.closest('[data-stagger-parent]')) {
    revealObserver.observe(el);
  }
});

const staggerObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll('[data-stagger-child]');
        children.forEach(function (child, index) {
          child.style.transitionDelay = (index * 0.12) + 's';
          child.classList.add('is-visible');
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

staggerParents.forEach(function (parent) {
  staggerObserver.observe(parent);
});
