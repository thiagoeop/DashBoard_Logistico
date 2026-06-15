const entregas = [
    { id: 301, transportadora: "RotaMax", regioes: "Sudeste", prazo: 3, real: 7 },
    { id: 302, transportadora: "ViaCargo", regioes: "Sul", prazo: 5, real: 5 },
    { id: 303, transportadora: "FlashLog", regioes: "Nordeste", prazo: 4, real: 9 },
    { id: 304, transportadora: "RotaMax", regioes: "Norte", prazo: 6, real: 4 },
    { id: 305, transportadora: "ViaCargo", regioes: "Centro-Oeste", prazo: 2, real: 6 },
    { id: 306, transportadora: "FlashLog", regioes: "Sul", prazo: 5, real: 12 },
    { id: 307, transportadora: "RotaMax", regioes: "Sul", prazo: 6, real: 9 },
    { id: 308, transportadora: "ViaCargo", regioes: "Sudeste", prazo: 3, real: 4 },
    { id: 309, transportadora: "FlashLog", regioes: "Norte", prazo: 5, real: 5 },
    { id: 310, transportadora: "ViaCargo", regioes: "Nordeste", prazo: 4, real: 8 }
];

// Estado da aplicação
const appState = {
    atrasadas: [],
    filteredData: [],
    sortBy: 'atraso',
    sortOrder: 'desc',
    viewLimit: 10,
    searchTerm: '',
    filters: {
        transportadora: '',
        regiao: '',
        criticidade: ''
    }
};

// Paleta de cores moderna
const cores = {
    primaria: ['#3b82f6', '#2563eb', '#1d4ed8'],
    acentos: ['#7c3aed', '#a78bfa', '#c4b5fd'],
    sucesso: ['#16a34a', '#22c55e', '#86efac'],
    aviso: ['#ea580c', '#fb923c', '#fed7aa'],
    erro: ['#dc2626', '#ef4444', '#fca5a5']
};

const coresArco = ['#3b82f6', '#7c3aed', '#16a34a', '#ea580c', '#db2777', '#0891b2'];

// ========== INICIALIZAÇÃO ==========
function init() {
    calculateKPIs();
    populateFilterSelects();
    renderTable();
    createCharts();
    setupEventListeners();
}

// ========== KPIs ==========
function calculateKPIs() {
    appState.atrasadas = entregas.filter(e => e.real > e.prazo);
    
    document.getElementById("total").textContent = entregas.length;
    document.getElementById("atrasadas").textContent = appState.atrasadas.length;
    document.getElementById("badge-count").textContent = appState.atrasadas.length;
    
    const percentualAtraso = ((appState.atrasadas.length / entregas.length) * 100).toFixed(1);
    document.getElementById("percentual").textContent = percentualAtraso + "%";
    
    const mediaDias = entregas.reduce((soma, e) => soma + e.real, 0) / entregas.length;
    document.getElementById("media").textContent = mediaDias.toFixed(1);
}

// ========== FILTROS E BUSCA ==========
function populateFilterSelects() {
    const transportadoras = [...new Set(appState.atrasadas.map(e => e.transportadora))];
    const selectTransp = document.getElementById('filter-transportadora');
    transportadoras.forEach(t => {
        const option = document.createElement('option');
        option.value = t;
        option.textContent = t;
        selectTransp.appendChild(option);
    });
    
    const regioes = [...new Set(appState.atrasadas.map(e => e.regioes))];
    const selectRegiao = document.getElementById('filter-regiao');
    regioes.forEach(r => {
        const option = document.createElement('option');
        option.value = r;
        option.textContent = r;
        selectRegiao.appendChild(option);
    });
}

function applyFiltersAndSearch() {
    let filtered = [...appState.atrasadas];
    
    if (appState.filters.transportadora) {
        filtered = filtered.filter(e => e.transportadora === appState.filters.transportadora);
    }
    
    if (appState.filters.regiao) {
        filtered = filtered.filter(e => e.regioes === appState.filters.regiao);
    }
    
    if (appState.filters.criticidade) {
        filtered = filtered.filter(e => {
            const atraso = e.real - e.prazo;
            if (appState.filters.criticidade === 'critico') return atraso > 7;
            if (appState.filters.criticidade === 'alerta') return atraso >= 4 && atraso <= 7;
            if (appState.filters.criticidade === 'aviso') return atraso < 4;
        });
    }
    
    if (appState.searchTerm) {
        const term = appState.searchTerm.toLowerCase();
        filtered = filtered.filter(e => 
            e.id.toString().includes(term) ||
            e.regioes.toLowerCase().includes(term) ||
            e.transportadora.toLowerCase().includes(term)
        );
    }
    
    return filtered;
}

function sortData(data) {
    const sorted = [...data];
    
    sorted.sort((a, b) => {
        let compareA, compareB;
        
        if (appState.sortBy === 'id') {
            compareA = a.id;
            compareB = b.id;
        } else if (appState.sortBy === 'atraso') {
            compareA = a.real - a.prazo;
            compareB = b.real - b.prazo;
        } else if (appState.sortBy === 'regiao') {
            compareA = a.regioes.toLowerCase();
            compareB = b.regioes.toLowerCase();
        }
        
        if (appState.sortOrder === 'asc') {
            return compareA > compareB ? 1 : -1;
        } else {
            return compareA < compareB ? 1 : -1;
        }
    });
    
    return sorted;
}

// ========== RENDER TABLE ==========
function renderTable() {
    const tabela = document.getElementById("tabela");
    tabela.innerHTML = '';
    
    let filtered = applyFiltersAndSearch();
    const sorted = sortData(filtered);
    const displayed = appState.viewLimit === 'all' ? sorted : sorted.slice(0, appState.viewLimit);
    
    appState.filteredData = filtered;
    
    if (displayed.length === 0) {
        tabela.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: #64748b;">Nenhuma entrega encontrada</td></tr>';
        return;
    }
    
    displayed.forEach(e => {
        const atraso = e.real - e.prazo;
        const nivelCriticidade = atraso > 7 ? 'critico' : atraso > 4 ? 'alerta' : 'aviso';
        const corBg = nivelCriticidade === 'critico' ? 'rgba(220, 38, 38, 0.1)' : 
                      nivelCriticidade === 'alerta' ? 'rgba(234, 88, 12, 0.1)' : 
                      'rgba(59, 130, 246, 0.1)';
        const corTxt = nivelCriticidade === 'critico' ? '#dc2626' : 
                       nivelCriticidade === 'alerta' ? '#ea580c' : 
                       '#3b82f6';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${e.id}</strong></td>
            <td>${e.regioes}</td>
            <td><span style="background: rgba(124, 58, 237, 0.1); padding: 4px 8px; border-radius: 4px; color: #7c3aed; font-weight: 500;">${e.transportadora}</span></td>
            <td><span style="background: ${corBg}; color: ${corTxt}; padding: 6px 10px; border-radius: 6px; font-weight: 600;">${atraso} dias</span></td>
            <td><button class="btn-action" onclick="showDetails(${e.id})">Ver Detalhes</button></td>
        `;
        tabela.appendChild(row);
    });
    
    const footer = document.getElementById('table-footer');
    footer.textContent = `Exibindo ${displayed.length} de ${appState.filteredData.length} entregas prioritárias`;
}

// ========== MODAL DE DETALHES ==========
function showDetails(id) {
    const entrega = appState.atrasadas.find(e => e.id === id);
    if (!entrega) return;
    
    const atraso = entrega.real - entrega.prazo;
    const modal = document.getElementById('modal-detalhes');
    const backdrop = document.getElementById('modal-backdrop');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = `Detalhes da Entrega #${id}`;
    body.innerHTML = `
        <div style="display: grid; gap: 12px;">
            <div><strong>ID da Entrega:</strong><br/>#${entrega.id}</div>
            <div><strong>Região:</strong><br/>${entrega.regioes}</div>
            <div><strong>Transportadora:</strong><br/>${entrega.transportadora}</div>
            <div><strong>Prazo Previsto:</strong><br/>${entrega.prazo} dias</div>
            <div><strong>Dias Decorridos:</strong><br/>${entrega.real} dias</div>
            <div><strong>Atraso:</strong><br/><span style="background: ${atraso > 7 ? '#fee2e2' : atraso > 4 ? '#fed7aa' : '#dbeafe'}; color: ${atraso > 7 ? '#dc2626' : atraso > 4 ? '#ea580c' : '#2563eb'}; padding: 8px; border-radius: 6px; font-weight: 600; display: inline-block;">${atraso} dias</span></div>
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 3px solid #3b82f6;"><strong>Status:</strong> ${atraso > 7 ? '🔴 Crítico' : atraso > 4 ? '🟠 Alerta' : '🔵 Aviso'}</div>
        </div>
    `;
    
    modal.style.display = 'block';
    backdrop.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal-detalhes').style.display = 'none';
    document.getElementById('modal-backdrop').style.display = 'none';
}

// ========== GRÁFICOS ==========
function createCharts() {
    const atrasoTransportadora = {};
    appState.atrasadas.forEach(e => {
        atrasoTransportadora[e.transportadora] = (atrasoTransportadora[e.transportadora] || 0) + 1;
    });
    
    new Chart(document.getElementById("transportadoras"), {
        type: "bar",
        data: {
            labels: Object.keys(atrasoTransportadora),
            datasets: [{
                label: "Entregas Atrasadas",
                data: Object.values(atrasoTransportadora),
                backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(124, 58, 237, 0.8)', 'rgba(234, 88, 12, 0.8)'],
                borderColor: ['#3b82f6', '#7c3aed', '#ea580c'],
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: ['rgba(37, 99, 235, 1)', 'rgba(109, 40, 217, 1)', 'rgba(194, 65, 12, 1)'],
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, labels: { font: { family: "'Inter', sans-serif", size: 12, weight: '500' }, color: '#64748b', padding: 16, usePointStyle: true } },
                tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.8)', titleFont: { family: "'Inter', sans-serif", size: 12 }, bodyFont: { family: "'Inter', sans-serif", size: 12 }, borderColor: '#7c3aed', borderWidth: 1, padding: 12, displayColors: true, callbacks: { label: function(context) { return context.dataset.label + ': ' + context.parsed.y + ' entregas'; } } }
            },
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false }, ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#64748b' } }, x: { grid: { display: false }, ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#64748b' } } }
        }
    });
    
    const atrasoRegiao = {};
    appState.atrasadas.forEach(e => {
        atrasoRegiao[e.regioes] = (atrasoRegiao[e.regioes] || 0) + 1;
    });
    
    new Chart(document.getElementById("regioes"), {
        type: "pie",
        data: {
            labels: Object.keys(atrasoRegiao),
            datasets: [{
                data: Object.values(atrasoRegiao),
                backgroundColor: coresArco,
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { font: { family: "'Inter', sans-serif", size: 12, weight: '500' }, color: '#64748b', padding: 16, usePointStyle: true } },
                tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.8)', titleFont: { family: "'Inter', sans-serif", size: 12 }, bodyFont: { family: "'Inter', sans-serif", size: 12 }, borderColor: '#7c3aed', borderWidth: 1, padding: 12, callbacks: { label: function(context) { return context.label + ': ' + context.parsed + ' atrasos'; } } }
            }
        }
    });
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    document.getElementById('filter-transportadora').addEventListener('change', (e) => {
        appState.filters.transportadora = e.target.value;
        renderTable();
    });
    
    document.getElementById('filter-regiao').addEventListener('change', (e) => {
        appState.filters.regiao = e.target.value;
        renderTable();
    });
    
    document.getElementById('filter-criticidade').addEventListener('change', (e) => {
        appState.filters.criticidade = e.target.value;
        renderTable();
    });
    
    document.getElementById('search-input').addEventListener('input', (e) => {
        appState.searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('btn-reset-filters').addEventListener('click', () => {
        appState.filters = { transportadora: '', regiao: '', criticidade: '' };
        appState.searchTerm = '';
        document.getElementById('filter-transportadora').value = '';
        document.getElementById('filter-regiao').value = '';
        document.getElementById('filter-criticidade').value = '';
        document.getElementById('search-input').value = '';
        renderTable();
        showNotification('Filtros removidos com sucesso', 'info');
    });
    
    document.getElementById('sort-id').addEventListener('click', () => {
        appState.sortBy = 'id';
        appState.sortOrder = appState.sortOrder === 'asc' ? 'desc' : 'asc';
        renderTable();
    });
    
    document.getElementById('sort-atraso').addEventListener('click', () => {
        appState.sortBy = 'atraso';
        appState.sortOrder = appState.sortOrder === 'asc' ? 'desc' : 'asc';
        renderTable();
    });
    
    document.getElementById('sort-regiao').addEventListener('click', () => {
        appState.sortBy = 'regiao';
        appState.sortOrder = appState.sortOrder === 'asc' ? 'desc' : 'asc';
        renderTable();
    });
    
    document.getElementById('view-10').addEventListener('click', () => {
        appState.viewLimit = 10;
        updateViewButtons();
        renderTable();
    });
    
    document.getElementById('view-20').addEventListener('click', () => {
        appState.viewLimit = 20;
        updateViewButtons();
        renderTable();
    });
    
    document.getElementById('view-all').addEventListener('click', () => {
        appState.viewLimit = 'all';
        updateViewButtons();
        renderTable();
    });
    
    document.getElementById('btn-refresh').addEventListener('click', () => {
        location.reload();
    });
    
    document.getElementById('btn-export').addEventListener('click', () => {
        exportToCSV(appState.filteredData.length > 0 ? appState.filteredData : appState.atrasadas, 'entregas_atrasadas.csv');
        showNotification('Dados exportados com sucesso!', 'success');
    });
    
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('btn-modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-backdrop').addEventListener('click', closeModal);
}

function updateViewButtons() {
    document.querySelectorAll('.view-controls .btn-small').forEach(btn => btn.classList.remove('active'));
    
    if (appState.viewLimit === 10) {
        document.getElementById('view-10').classList.add('active');
    } else if (appState.viewLimit === 20) {
        document.getElementById('view-20').classList.add('active');
    } else {
        document.getElementById('view-all').classList.add('active');
    }
}

function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = 'notification notification-' + type;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', init);
