import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { 
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Configuração do Firebase

const firebaseConfig = {

    apiKey: "AIzaSyDFefXIwyDhoKdvuetuMW5YAHRwf1ucanw",
    authDomain: "almoxerifado-e0734.firebaseapp.com",
    projectId: "almoxerifado-e0734",
    storageBucket: "almoxerifado-e0734.firebasestorage.app",
    messagingSenderId: "729405108901",
    appId: "1:729405108901:web:21a59a27ef0f251725d34c"

};


// Inicializar Firebase

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


let todasMovimentacoes = [];

let movimentacoesFiltradas = [];


console.log("Firebase conectado na página de movimentações!");


// Converter data para ordenar

function converterData(data){

    if(!data) return null;


    data = data.replace(",", "");


    let partes = data.split(" ");


    let dataParte = partes[0].split("/");


    let horaParte = partes[1]
        ? partes[1].split(":")
        : [0,0,0];


    return new Date(

        Number(dataParte[2]),
        Number(dataParte[1]) - 1,
        Number(dataParte[0]),
        Number(horaParte[0]),
        Number(horaParte[1]),
        Number(horaParte[2] || 0)

    );

}

document.getElementById(
    "pesquisaMovimentacao"
).addEventListener("input", pesquisarMovimentacoes);

// Buscar movimentações

function gerarPDF(){

    const { jsPDF } = window.jspdf;

    let pdf = new jsPDF();


    pdf.text(
        "Relatório de Movimentações",
        14,
        15
    );


    pdf.autoTable({

        startY:25,

        head:[[
            "Data",
            "Código",
            "Produto",
            "Tipo",
            "Antes",
            "Depois",
            "Qtd",
            "Medida",
            "Responsável",
            "Movimento"
        ]],

        body:movimentacoesFiltradas.map((dados)=>[

            dados.dataHora || "-",
            dados.codigo || "-",
            dados.produto || "-",
            dados.tipo || "-",
            dados.antes || 0,
            dados.depois || 0,
            dados.quantidade || 0,
            dados.medida || "-",
            dados.responsavel || "-",
            dados.movimento || "-"

        ])

    });


    pdf.save("movimentacoes.pdf");

}

async function carregarMovimentacoes(){

    const consulta = await getDocs(
        collection(db,"movimentacoes")
    );

    let movimentacoes = [];

    consulta.forEach((documento)=>{

        movimentacoes.push(documento.data());

    });

    // Mais recente primeiro

    movimentacoes.sort((a,b)=>{

        return converterData(b.dataHora) - converterData(a.dataHora);

    });

    todasMovimentacoes = movimentacoes;

    mostrarMovimentacoes(todasMovimentacoes);

}

// Mostrar tabela

function mostrarMovimentacoes(lista){

    movimentacoesFiltradas = lista;

    const tabela = document.getElementById(
        "lista-movimentacoes"
    );

    tabela.innerHTML = "";

    lista.forEach((dados)=>{

        tabela.innerHTML += `

        <tr>

            <td>${dados.dataHora || "-"}</td>

            <td>${dados.codigo || "-"}</td>

            <td>${dados.produto || "-"}</td>

            <td>${dados.tipo || "-"}</td>

            <td>${dados.antes || 0}</td>

            <td>${dados.depois || 0}</td>

            <td>${dados.quantidade || 0}</td>

            <td>${dados.medida || "-"}</td>

            <td>${dados.responsavel || "-"}</td>

            <td>

               ${
                    dados.movimento === "adicionado"
                    ? "🟢 Adicionado"

                    : dados.movimento === "retirado"
                    ? "🔴 Retirado"

                    : dados.movimento === "cadastrado"
                    ? "🔵 Cadastrado"

                    : "⚫ Apagado"
                }

            </td>
        </tr>
        `;
    });
}

// Filtro de período

function filtrarMovimentacoes(){


    let filtro = document.getElementById(
        "filtroPeriodo"
    ).value;

    console.log(filtro);

    let movimentoSelecionado = document.getElementById(
    "filtroMovimento"
    ).value;

    let hoje = new Date();

    let filtradas = todasMovimentacoes.filter((mov)=>{

        let dataMov = converterData(mov.dataHora);

        console.log(mov.dataHora, dataMov);

        // Se não tiver data, ignora

        if(!dataMov){

            return false;

        }

        if(
                movimentoSelecionado &&
                mov.movimento !== movimentoSelecionado
            ){

                return false;

            }

        if(filtro === "todos"){

            return true;

        }

        if(filtro === "hoje"){

            return (
                dataMov.getDate() === hoje.getDate() &&
                dataMov.getMonth() === hoje.getMonth() &&
                dataMov.getFullYear() === hoje.getFullYear()
            );

        }

        if(filtro === "semana"){

            let seteDias = new Date();

            seteDias.setDate(
                hoje.getDate() - 7
            );

            return dataMov >= seteDias;
        }

        if(filtro === "mes"){

            return (

                dataMov.getMonth()
                ===
                hoje.getMonth()

                &&

                dataMov.getFullYear()
                ===
                hoje.getFullYear()

            );
        }

        if(filtro === "semestre"){

            let semestreAtual =
            hoje.getMonth() < 6 ? 0 : 1;

            let semestreMov =
            dataMov.getMonth() < 6 ? 0 : 1;

            return (

                semestreAtual === semestreMov

                &&

                dataMov.getFullYear()
                ===
                hoje.getFullYear()

            );

        }

        if(filtro === "ano"){

            return (

                dataMov.getFullYear()
                ===
                hoje.getFullYear()

            );
        }

    });

    mostrarMovimentacoes(filtradas);

}

/*Aqui começamos colocar a barra de pesquisa pra funcionar*/

function pesquisarMovimentacoes(){

    let texto = document.getElementById(
        "pesquisaMovimentacao"
    ).value.toLowerCase();


    let resultado = todasMovimentacoes.filter((mov)=>{


        let produto = String(mov.produto || "").toLowerCase();
        let codigo = String(mov.codigo || "").toLowerCase();
        let data = String(mov.dataHora || "").toLowerCase();
        let responsavel = String(mov.responsavel || "").toLowerCase();
        let movimento = String(mov.movimento || "").toLowerCase();


        return (
            produto.includes(texto) ||
            codigo.includes(texto) ||
            data.includes(texto) ||
            responsavel.includes(texto) ||
            movimento.includes(texto)
        );


    });


    mostrarMovimentacoes(resultado);

}

window.filtrarMovimentacoes = filtrarMovimentacoes;
window.gerarPDF = gerarPDF;



carregarMovimentacoes();