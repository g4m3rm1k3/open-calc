const sections = document.querySelectorAll('.port-section');
const navLinks = document.querySelectorAll('.ribbon-link');
const progressFill = document.querySelector('#ribbon-progress');
let currentIndex = 0;

const sectionColors = {
  hero:     'hsl(244, 95%, 65%)',
  work:     'hsl(175, 80%, 50%)',
  canvas:   'hsl(28, 95%, 58%)',
  terminal: 'hsl(152, 60%, 55%)',
  contact:  'hsl(8, 90%, 62%)'
};

const linkMap = {};
navLinks.forEach(function (link) {
  linkMap[link.dataset.section] = link;
});

function setActive(sectionId) {
  navLinks.forEach(function (link) { link.classList.remove('is-active'); });
  if (linkMap[sectionId]) {
    linkMap[sectionId].classList.add('is-active');
    document.documentElement.style.setProperty('--color-primary', sectionColors[sectionId]);
  }
  sections.forEach(function (s, i) { if (s.id === sectionId) currentIndex = i; });
}

window.addEventListener('scroll', function () {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  progressFill.style.height = progress + '%';
});

const sectionObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  },
  { threshold: 0.3 }
);

sections.forEach(function (section) {
  sectionObserver.observe(section);
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowDown' && currentIndex < sections.length - 1) {
    sections[++currentIndex].scrollIntoView({ behavior: 'smooth' });
  } else if (event.key === 'ArrowUp' && currentIndex > 0) {
    sections[--currentIndex].scrollIntoView({ behavior: 'smooth' });
  }
});
