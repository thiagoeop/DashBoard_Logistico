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

// Identifica atrasos
const atrasadas = entregas.filter(e => e.real > e.prazo);

// KPIs
document.getElementById("total").textContent = entregas.length;
document.getElementById("atrasadas").textContent = atrasadas.length;
document.getElementById("percentual").textContent =
    ((atrasadas.length / entregas.length) * 100).toFixed(1) + "%";

const mediaDias =
    entregas.reduce((soma, e) => soma + e.real, 0) / entregas.length;

document.getElementById("media").textContent = mediaDias.toFixed(1);

// Tabela de entregas prioritárias
const tabela = document.getElementById("tabela");

atrasadas.forEach(e => {
    const atraso = e.real - e.prazo;

    tabela.innerHTML += `
        <tr>
            <td>${e.id}</td>
            <td>${e.regioes}</td>
            <td>${e.transportadora}</td>
            <td>${atraso}</td>
        </tr>
    `;
});

// Atrasos por transportadora
const atrasoTransportadora = {};

atrasadas.forEach(e => {
    atrasoTransportadora[e.transportadora] =
        (atrasoTransportadora[e.transportadora] || 0) + 1;
});

new Chart(document.getElementById("transportadoras"), {
    type: "bar",
    data: {
        labels: Object.keys(atrasoTransportadora),
        datasets: [{
            label: "Entregas Atrasadas",
            data: Object.values(atrasoTransportadora)
        }]
    }
});

// Atrasos por região
const atrasoRegiao = {};

atrasadas.forEach(e => {
    atrasoRegiao[e.regioes] =
        (atrasoRegiao[e.regioes] || 0) + 1;
});

new Chart(document.getElementById("regioes"), {
    type: "pie",
    data: {
        labels: Object.keys(atrasoRegiao),
        datasets: [{
            data: Object.values(atrasoRegiao)
        }]
    }
});
