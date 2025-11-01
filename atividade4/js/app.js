document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const navButtons = document.querySelectorAll('.nav-btn');
  const contrastToggle = document.getElementById('toggle-contrast');
  const alertBox = document.getElementById('alert');

  // Render inicial
  renderPage('home');

  // Navegação SPA
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => renderPage(btn.dataset.page));
  });

  // Modo de alto contraste
  contrastToggle.addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
    const modo = document.body.classList.contains('high-contrast')
      ? 'Modo de alto contraste ativado'
      : 'Modo de alto contraste desativado';
    alertBox.textContent = modo;
  });

  function renderPage(page) {
    if (page === 'voluntarios') {
      const voluntarios = Storage.getVoluntarios();
      app.innerHTML = Templates.voluntarios(voluntarios);
    } else {
      app.innerHTML = Templates[page]();
    }

    app.focus();

    if (page === 'cadastro') initForm();
  }

  function initForm() {
    const form = document.getElementById('form-cadastro');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = document.getElementById('nome');
      const email = document.getElementById('email');
      const mensagem = document.getElementById('mensagem');

      let valido = true;
      document.querySelectorAll('.error').forEach(e => e.textContent = '');

      if (nome.value.trim().length < 3) {
        document.getElementById('erro-nome').textContent = 'Nome deve ter pelo menos 3 caracteres.';
        valido = false;
      }

      if (!email.value.includes('@')) {
        document.getElementById('erro-email').textContent = 'Email inválido.';
        valido = false;
      }

      if (mensagem.value.trim().length < 10) {
        document.getElementById('erro-mensagem').textContent = 'Mensagem muito curta.';
        valido = false;
      }

      if (!valido) return;

      Storage.salvarVoluntario({
        nome: nome.value.trim(),
        email: email.value.trim(),
        mensagem: mensagem.value.trim()
      });

      alertBox.textContent = 'Cadastro realizado com sucesso!';
      renderPage('voluntarios');
    });
  }
});
