# Acessibilidade (WCAG 2.1 AA)

Este projeto foi desenvolvido com foco em acessibilidade digital:

- **Navegação via teclado**: todos os elementos interativos (botões, links, formulários, modal) são acessíveis por `Tab`.
- **Foco visível**: elementos recebem realce quando focados.
- **Contraste de cores**: testado com nível mínimo de contraste recomendado (4.5:1).
- **Semântica HTML5**: uso de `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- **Aria-attributes**: suporte a leitores de tela (`aria-hidden`, `aria-expanded`, etc.).
- **Modal acessível**: bloqueia foco fora do modal e fecha com tecla `ESC`.
- **Responsividade**: layout se adapta para dispositivos móveis e desktop.

Ferramentas sugeridas para validação:
- [Lighthouse A11y](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/)
- [WAVE](https://wave.webaim.org/)