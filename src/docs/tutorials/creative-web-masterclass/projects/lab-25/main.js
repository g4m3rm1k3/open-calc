const form = document.querySelector('.demo-form');
const submitBtn = form.querySelector('[type="submit"]');

form.addEventListener('submit', function (event) {
  event.preventDefault();
  submitBtn.textContent = 'Sending...';
  submitBtn.classList.add('btn-loading');
  submitBtn.disabled = true;

  setTimeout(function () {
    submitBtn.textContent = 'Send Message';
    submitBtn.classList.remove('btn-loading');
    submitBtn.disabled = false;
  }, 2000);
});
