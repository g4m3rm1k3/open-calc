const sections = document.querySelectorAll('.reveal-section');

const observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.index * 0.1;
        entry.target.style.transitionDelay = delay + 's';
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

sections.forEach(function (section, index) {
  section.dataset.index = index;
  observer.observe(section);
});
