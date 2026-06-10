const sections = document.querySelectorAll('.port-section');
const navLinks = document.querySelectorAll('.ribbon-link');
let currentIndex = 0;

const linkMap = {};
navLinks.forEach(function (link) {
  linkMap[link.dataset.section] = link;
});

function setActive(sectionId) {
  navLinks.forEach(function (link) { link.classList.remove('is-active'); });
  if (linkMap[sectionId]) {
    linkMap[sectionId].classList.add('is-active');
  }
  sections.forEach(function (s, i) { if (s.id === sectionId) currentIndex = i; });
}

const sectionObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  },
  { threshold: 0.3, rootMargin: '0px 0px -30% 0px' }
);

sections.forEach(function (section) {
  sectionObserver.observe(section);
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowDown' && currentIndex < sections.length - 1) {
    currentIndex++;
    sections[currentIndex].scrollIntoView({ behavior: 'smooth' });
  } else if (event.key === 'ArrowUp' && currentIndex > 0) {
    currentIndex--;
    sections[currentIndex].scrollIntoView({ behavior: 'smooth' });
  }
});
