const Templates = {
  home: () => `
    <section>
      <h2 tabindex="0">Bem-vindo à ONG Solidária</h2>
      <p>Participe como voluntário e ajude nossa causa!</p>
      <img src="assets/logo.png" alt="Logo da ONG Solidária" style="max-width:200px;">
    </section>
  `,

  cadastro: () => `
    <section>
      <h2 tabindex="0">Cadastro de Voluntário</h2>
      <form id="form-cadastro" aria-label="Formulário de cadastro de voluntário">
        <label for="nome">Nome:</label>
        <input type="text" id="nome" placeholder="Digite seu nome" required aria-required="true">
        <div class="error" id="erro-nome"></div>

        <label for="email">Email:</label>
        <input type="email" id="email" placeholder="Digite seu email" required aria-required="true">
        <div class="error" id="erro-email"></div>

        <label for="mensagem">Mensagem:</label>
        <textarea id="mensagem" placeholder="Por que quer ser voluntário?" required aria-required="true"></textarea>
        <div class="error" id="erro-mensagem"></div>

        <button type="submit">Cadastrar</button>
      </form>
    </section>
  `,

  voluntarios: (voluntarios) => `
    <section>
      <h2 tabindex="0">Voluntários Cadastrados</h2>
      ${voluntarios.length === 0 
        ? '<p>Nenhum voluntário cadastrado ainda.</p>' 
        : voluntarios.map(v => `
            <div class="card" tabindex="0">
              <h3>${v.nome}</h3>
              <p><b>Email:</b> ${v.email}</p>
              <p>${v.mensagem}</p>
            </div>
          `).join('')}
    </section>
  `
};
