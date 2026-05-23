const THEME_STORAGE_KEY = 'italiaconsapevole-theme';
const themeToggle = document.getElementById('theme-toggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function updateMetaThemeColor() {
  if (!themeMeta) return;
  const surface = getComputedStyle(document.documentElement).getPropertyValue('--md-sys-color-surface').trim();
  if (surface) {
    themeMeta.setAttribute('content', surface);
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeToggle) {
    themeToggle.checked = theme === 'dark';
  }
  updateMetaThemeColor();
}

function highlightHashTarget() {
  const currentHash = window.location.hash.substring(1);
  document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
  if (!currentHash) return;
  const target = document.getElementById(currentHash);
  if (!target) return;
  const parentDetails = target.closest('details');
  if (parentDetails && !parentDetails.open) {
    parentDetails.open = true;
  }
  target.classList.add('highlighted');
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function loadTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = storedTheme || (prefersDark.matches ? 'dark' : 'light');
  applyTheme(theme);
}

function onToggleTheme(event) {
  const nextTheme = event.target.checked ? 'dark' : 'light';
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
}

window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  if (themeToggle) {
    themeToggle.addEventListener('change', onToggleTheme);
  }
  window.highlightHashTarget = highlightHashTarget;
  prefersDark.addEventListener('change', (event) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });
  window.addEventListener('hashchange', highlightHashTarget);
});
