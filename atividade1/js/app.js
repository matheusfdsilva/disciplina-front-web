(function () {
    'use strict';

    const state = {
        projects: [],
        volunteers: [],
        donations: []
    };

    // Util: formatar moeda BRL
    const fmtBRL = val => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // DOM refs
    const projectsGrid = document.querySelector('#projects .cards');
    const yearEl = document.getElementById('year');
    const totalProjects = document.getElementById('totalProjects');
    const totalVolunteers = document.getElementById('totalVolunteers');
    const totalDonations = document.getElementById('totalDonations');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        yearEl.textContent = new Date().getFullYear();
        loadData();
        setupForms();
        setupModal();
        setupFilters();
    }

    // Carrega projetos
    function loadData() {
        fetch('data/data.json')
            .then(r => r.ok ? r.json() : Promise.reject('no data'))
            .then(json => {
                state.projects = json.projects || [];
                renderProjects(state.projects);
                updateDashboard();
            })
            .catch(() => {
                console.warn('Usando dados padrão...');
                state.projects = [
                    { id: 1, title: 'Projeto Educação Infantil', summary: 'Apoio a creches comunitárias', goal: 5000, raised: 1200, categoria: 'educacao' },
                    { id: 2, title: 'Mutirão de Limpeza', summary: 'Ações no bairro X', goal: 2000, raised: 600, categoria: 'meio-ambiente' },
                    { id: 3, title: 'Saúde para Todos', summary: 'Atendimento médico gratuito', goal: 8000, raised: 2500, categoria: 'saude' }
                ];
                renderProjects(state.projects);
                updateDashboard();
            });
    }

    function renderProjects(list) {
        projectsGrid.innerHTML = '';
        list.forEach(p => {
            const card = document.createElement('article');
            card.className = 'card project-card';
            card.tabIndex = 0;
            card.innerHTML = `
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.summary)}</p>
        <p><strong>${fmtBRL(p.raised)}</strong> de ${fmtBRL(p.goal)}</p>
        <div class="card-actions">
          <button data-id="${p.id}" class="btn details">Ver detalhes</button>
          <button data-id="${p.id}" class="btn donate">Doar</button>
        </div>
      `;
            card.querySelector('.details').addEventListener('click', () => openModal(p));
            card.querySelector('.donate').addEventListener('click', () => openDonationPrefill(p));
            projectsGrid.appendChild(card);
        });
    }

    // Filtro por categoria
    function setupFilters() {
        const buttons = document.querySelectorAll('.filter button');
        buttons.forEach(btn => {
            btn.addEventListener('click', e => {
                buttons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.dataset.filter;
                const filtered = filter === 'all' ? state.projects : state.projects.filter(p => p.categoria === filter);
                renderProjects(filtered);
            });
        });
    }

    // Escapar HTML simples
    function escapeHtml(unsafe) {
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Modal
    function setupModal() {
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal(); });
    }

    function openModal(project) {
        modalTitle.textContent = project.title;
        modalBody.innerHTML = `
      <p>${escapeHtml(project.summary)}</p>
      <p><strong>Meta:</strong> ${fmtBRL(project.goal)}</p>
      <p><strong>Arrecadado:</strong> ${fmtBRL(project.raised)}</p>`;
        modal.setAttribute('aria-hidden', 'false');
        trapFocus(modal);
    }

    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        releaseFocus();
    }

    // Preencher formulário de doação
    function openDonationPrefill(project) {
        document.getElementById('donate').scrollIntoView({ behavior: 'smooth' });
        const amount = document.getElementById('amount');
        const projectIdInput = document.getElementById('projectId');

        // Define o ID do projeto no input oculto
        projectIdInput.value = project.id;

        // Sugere um valor padrão de doação
        amount.value = (project.goal - project.raised) > 0 ? Math.min(50, project.goal - project.raised) : 10;
        amount.focus();
    }

    // Forms
    function setupForms() {
        const vform = document.getElementById('volunteerForm');
        vform.addEventListener('submit', e => {
            e.preventDefault();
            const data = new FormData(vform);
            const record = {
                id: Date.now(),
                name: data.get('name'),
                email: data.get('email'),
                interest: data.get('area') // <-- corrigido (era 'interest')
            };
            state.volunteers.push(record);
            localStorage.setItem('volunteers', JSON.stringify(state.volunteers));
            document.getElementById('volunteerMsg').textContent = 'Inscrição enviada — obrigado!';
            vform.reset();
            updateDashboard();
        });

        const dform = document.getElementById('donationForm');
        dform.addEventListener('submit', e => {
            e.preventDefault();
            const data = new FormData(dform);
            const amount = parseFloat(data.get('amount')) || 0;
            const donorName = data.get('donorName');
            const projectId = parseInt(data.get('projectId'), 10);

            if (!amount || amount <= 0) {
                document.getElementById('donationMsg').textContent = 'Informe um valor válido.';
                return;
            }

            // Atualiza o projeto
            const project = state.projects.find(p => p.id === projectId);
            if (project) {
                project.raised += amount;
                // Atualiza o card visual
                const card = document.querySelector(`button[data-id="${project.id}"]`).closest('.card');
                card.querySelector('p strong').textContent = fmtBRL(project.raised);
            }

            // Registra doação no estado e localStorage
            const donation = { id: Date.now(), name: donorName, amount, projectId };
            state.donations.push(donation);
            localStorage.setItem('donations', JSON.stringify(state.donations));

            document.getElementById('donationMsg').textContent = `Doação de ${fmtBRL(amount)} registrada com sucesso!`;
            dform.reset();
            updateDashboard();
        });
    }

    function updateDashboard() {
        totalProjects.textContent = state.projects.length;

        const storedVols = JSON.parse(localStorage.getItem('volunteers') || '[]');
        totalVolunteers.textContent = storedVols.length || state.volunteers.length;

        const storedDonations = JSON.parse(localStorage.getItem('donations') || '[]');
        const sum = storedDonations.reduce((s, d) => s + (d.amount || 0), 0);
        totalDonations.textContent = fmtBRL(sum);
    }

    // Focus trap
    let lastFocused = null;
    function trapFocus(container) {
        lastFocused = document.activeElement;
        const focusables = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        container.addEventListener('keydown', function kb(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });
        container.setAttribute('aria-hidden', 'false');
        setTimeout(() => first && first.focus(), 50);
    }

    function releaseFocus() {
        if (lastFocused) lastFocused.focus();
    }

})();
