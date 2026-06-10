const root = document.documentElement;
let isDark = true;

const toggleBtn = document.createElement('button');
toggleBtn.textContent = 'Switch to Light Mode';
toggleBtn.className = 'btn btn-outline';
toggleBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;';
document.body.appendChild(toggleBtn);

toggleBtn.addEventListener('click', function () {
  isDark = !isDark;
  if (isDark) {
    root.style.setProperty('--color-bg', 'hsl(240, 20%, 8%)');
    root.style.setProperty('--color-surface', 'hsl(240, 18%, 13%)');
    root.style.setProperty('--color-text', 'hsl(240, 5%, 94%)');
    root.style.setProperty('--color-muted', 'hsl(240, 8%, 42%)');
    toggleBtn.textContent = 'Switch to Light Mode';
  } else {
    root.style.setProperty('--color-bg', 'hsl(240, 5%, 96%)');
    root.style.setProperty('--color-surface', 'hsl(240, 5%, 100%)');
    root.style.setProperty('--color-text', 'hsl(240, 20%, 12%)');
    root.style.setProperty('--color-muted', 'hsl(240, 8%, 50%)');
    toggleBtn.textContent = 'Switch to Dark Mode';
  }
});

const presets = [
  { label: 'Purple', color: 'hsl(244, 95%, 65%)' },
  { label: 'Teal',   color: 'hsl(175, 80%, 50%)' },
  { label: 'Orange', color: 'hsl(28, 95%, 58%)' }
];

const presetRow = document.createElement('div');
presetRow.style.cssText = 'position:fixed;bottom:20px;left:20px;display:flex;gap:8px;';
document.body.appendChild(presetRow);

presets.forEach(function (preset) {
  const b = document.createElement('button');
  b.textContent = preset.label;
  b.className = 'btn btn-outline';
  b.addEventListener('click', function () {
    root.style.setProperty('--primary-500', preset.color);
    root.style.setProperty('--color-brand', preset.color);
  });
  presetRow.appendChild(b);
});
