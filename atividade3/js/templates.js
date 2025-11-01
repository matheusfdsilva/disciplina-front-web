const Templates = {
  home: () => `
    <section>
      <h2>Bem-vindo à ONG Solidária</h2>
      <p>Faça parte do nosso projeto ajudando como voluntário.</p>
    </section>
  `,

  cadastro: () => `
    <section>
      <h2>Cadastro de Voluntário</h2>
      <form id="form-cadastro">
        <label>Nome:</label>
        <input type="text" id="nome" placeholder="Digite seu nome" required>
        <div class="error" id="erro-nome"></div>

        <label>Email:</label>
        <input type="email" id="email" placeholder="Digite seu email" required>
        <div class="error" id="erro-email"></div>

        <label>Mensagem:</label>
        <textarea id="mensagem" placeholder="Por que quer ser voluntário?" required></textarea>
        <div class="error" id="erro-mensagem"></div>

        <button type="submit">Cadastrar</button>
      </form>
    </section>
  `,

  voluntarios: (voluntarios) => `
    <section>
      <h2>Voluntários Cadastrados</h2>
      ${voluntarios.length === 0 
        ? '<p>Nenhum voluntário cadastrado ainda.</p>' 
        : voluntarios.map(v => `
            <div class="card">
              <h3>${v.nome}</h3>
              <p><b>Email:</b> ${v.email}</p>
              <p>${v.mensagem}</p>
            </div>
          `).join('')}
    </section>
  `
};
