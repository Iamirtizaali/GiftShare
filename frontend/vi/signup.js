const signupForm = document.getElementById('signupForm');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const errorMessage = document.getElementById('error-message');
const submitBtn = document.querySelector('.submit-button');

const submit = (event) => {
  event.preventDefault();
  if (passwordInput.value !== confirmPasswordInput.value) {
    addErrorStyles();
    return;
  }

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: passwordInput.value,
  };

  fetch('http://localhost:4000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
    .then((res) => res.text())
    .then((message) => {
      if (message.status === ) {
        alert(message.message);
        return;
      }
      console.log(message);
      alert('Signup successful!');
      // window.location.href = 'success.html';
    })
    .catch((err) => console.error(err));
};

signupForm.addEventListener('submit', SubmitEvent);
submitBtn.addEventListener('submit', SubmitEvent);

function addErrorStyles() {
  passwordInput.classList.add('error-input');
  confirmPasswordInput.classList.add('error-input');
  errorMessage.style.display = 'block';
}

function removeErrorStyles() {
  passwordInput.classList.remove('error-input');
  confirmPasswordInput.classList.remove('error-input');
  errorMessage.style.display = 'none';
}

passwordInput.addEventListener('input', removeErrorStyles);
confirmPasswordInput.addEventListener('input', removeErrorStyles);
