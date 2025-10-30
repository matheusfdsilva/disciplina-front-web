(function () {
    'use strict';

    const state = {
        projects: [],
        volunteers: JSON.parse(localStorage.getItem('volunteers') || '[]'),
        donations: JSON.parse(localStorage.getItem('donations') || '[]')
    };

    // Utils
    const fmtBRL = val => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const escapeHtml = unsafe => String(unsafe)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;").replace(/'/g, "&#039;");

    // DOM
    const yearEl = document.getElementById('year');
    const projectsGrid = document.querySelector('#projects .cards');
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

    // -----------------------------------------------------------
    // Load JSON
    function loadData() {
        fetch('data/data.json')
            .then(r => r.ok ? r.json() : Promise.reject('no data'))
            .then(json => {
                state.projects = json.projects || [];
                renderProjects(state.projects);
                updateDashboard();
            })
            .catch(err => {
                console.warn('Usando dados padrão...', err);
                state.projects = [
                    { id: 1, title: 'Educação Infantil', summary: 'Apoio a creches comunitárias.', goal: 8000, raised: 1200, category: 'educacao' },
                    { id: 2, title: 'Mutirão de Limpeza', summary: 'Limpeza de praças e rios.', goal: 5000, raised: 2000, category: 'meio-ambiente' },
                    { id: 3, title: 'Saúde Cidadã', summary: 'Atendimento médico gratuito.', goal: 10000, raised: 4000, category: 'saude' }
                ];
                renderProjects(state.projects);
                updateDashboard();
            });
    }

    // -----------------------------------------------------------
    // Render cards
    function renderProjects(list) {
        projectsGrid.innerHTML = '';
        list.forEach(p => {
            const progress = Math.min((p.raised / p.goal) * 100, 100);
            const card = document.createElement('article');
            card.className = 'card project-card';
            card.innerHTML = `
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.summary)}</p>
        <div class="meta">
          <span class="badge primary">${fmtBRL(p.raised)}</span>
          <span class="p-muted">de ${fmtBRL(p.goal)}</span>
        </div>
        <div class="progress"><span style="width:${progress}%"></span></div>
        <div class="card-actions">
          <button data-id="${p.id}" class="btn ghost details">Ver detalhes</button>
          <button data-id="${p.id}" class="btn primary donate">Doar</button>
        </div>
      `;
            card.querySelector('.details').addEventListener('click', () => openModal(p));
            card.querySelector('.donate').addEventListener('click', () => openDonationPrefill(p));
            projectsGrid.appendChild(card);
        });
    }

    // -----------------------------------------------------------
    // Filtro (simples)
    function setupFilters() {
        const buttons = document.querySelectorAll('.filter button');
        buttons.forEach(btn => {
            btn.addEventListener('click', e => {
                buttons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.dataset.filter;
                const filtered = filter === 'all' ? state.projects : state.projects.filter(p => p.category === filter);
                renderProjects(filtered);
            });
        });
    }

    // -----------------------------------------------------------
    // Modal (detalhes do projeto)
    function setupModal() {
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    }

    function openModal(project) {
        modalTitle.textContent = project.title;
        modalBody.innerHTML = `
      <p>${escapeHtml(project.summary)}</p>
      <p><strong>Meta:</strong> ${fmtBRL(project.goal)}</p>
      <p><strong>Arrecadado:</strong> ${fmtBRL(project.raised)}</p>
    `;
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
    }

    // -----------------------------------------------------------
    // Doação
    function openDonationPrefill(project) {
        document.getElementById('donate').scrollIntoView({ behavior: 'smooth' });
        const amount = document.getElementById('amount');
        const projectIdInput = document.getElementById('projectId');
        projectIdInput.value = project.id;
        amount.value = 20; // valor sugerido
    }

    // -----------------------------------------------------------
    // Forms
    function setupForms() {
        // voluntário
        const vform = document.getElementById('volunteerForm');
        vform.addEventListener('submit', e => {
            e.preventDefault();
            const data = new FormData(vform);
            const record = {
                id: Date.now(),
                name: data.get('name'),
                email: data.get('email'),
                interest: data.get('area')
            };
            state.volunteers.push(record);
            localStorage.setItem('volunteers', JSON.stringify(state.volunteers));
            document.getElementById('volunteerMsg').textContent = 'Inscrição enviada — obrigado!';
            vform.reset();
            updateDashboard();
        });

        // doação
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

            const project = state.projects.find(p => p.id === projectId);
            if (project) {
                project.raised += amount;

                // Atualiza card
                const card = document.querySelector(`button[data-id="${project.id}"]`).closest('.card');
                const badge = card.querySelector('.badge.primary');
                badge.textContent = fmtBRL(project.raised);
                const bar = card.querySelector('.progress > span');
                bar.style.width = `${Math.min((project.raised / project.goal) * 100, 100)}%`;
            }

            // Salva doação
            const donation = { id: Date.now(), name: donorName, amount, projectId };
            state.donations.push(donation);
            localStorage.setItem('donations', JSON.stringify(state.donations));

            document.getElementById('donationMsg').textContent =
                `Doação de ${fmtBRL(amount)} registrada com sucesso!`;
            dform.reset();
            updateDashboard();
        });
    }

    // -----------------------------------------------------------
    // Dashboard totals
    function updateDashboard() {
        totalProjects.textContent = state.projects.length;
        totalVolunteers.textContent = state.volunteers.length;
        const sum = state.donations.reduce((s, d) => s + (d.amount || 0), 0);
        totalDonations.textContent = fmtBRL(sum);
    }
  

})();
