const Storage = {
  getVoluntarios() {
    return JSON.parse(localStorage.getItem('voluntarios') || '[]');
  },

  salvarVoluntario(voluntario) {
    const lista = this.getVoluntarios();
    lista.push(voluntario);
    localStorage.setItem('voluntarios', JSON.stringify(lista));
  }
};
