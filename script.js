fetch("arquivo_entregas.json")
.then(response => response.json())
.then(dados => {

const total = dados.length;

const atrasadas = dados.filter(
item => item.status === "Atrasada"
);

const percentual =
((atrasadas.length / total) * 100).toFixed(1);

const media =
(
atrasadas.reduce(
(acc,item)=> acc + item.atraso,0
)
/
atrasadas.length
).toFixed(1);

document.getElementById("total").innerText = total;

document.getElementById("atrasadas").innerText =
atrasadas.length;

document.getElementById("percentual").innerText =
percentual + "%";

document.getElementById("media").innerText =
media;

const transp = {};

atrasadas.forEach(item => {

transp[item.transportadora] =
(transp[item.transportadora] || 0) + 1;

});

new Chart(
document.getElementById("transportadoras"),
{
type:"bar",
data:{
labels:Object.keys(transp),
datasets:[{
label:"Atrasos",
data:Object.values(transp)
}]
}
}
);

const regioes = {};

atrasadas.forEach(item => {

regioes[item.regiao] =
(regioes[item.regiao] || 0) + 1;

});

new Chart(
document.getElementById("regioes"),
{
type:"pie",
data:{
labels:Object.keys(regioes),
datasets:[{
data:Object.values(regioes)
}]
}
}
);

atrasadas
.sort((a,b)=> b.atraso - a.atraso)
.forEach(item=>{

let classe =
item.atraso >= 3
? "critico"
: "";

document
.getElementById("tabela")
.innerHTML +=
`
<tr class="${classe}">
<td>${item.id}</td>
<td>${item.regiao}</td>
<td>${item.transportadora}</td>
<td>${item.atraso}</td>
</tr>
`;

});

});
