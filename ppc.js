import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyDFefXIwyDhoKdvuetuMW5YAHRwf1ucanw",
    authDomain: "almoxerifado-e0734.firebaseapp.com",
    projectId: "almoxerifado-e0734",
    storageBucket: "almoxerifado-e0734.firebasestorage.app",
    messagingSenderId: "729405108901",
    appId: "1:729405108901:web:21a59a27ef0f251725d34c"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let listaProdutos = [];


async function carregarProdutosReposicao(){

    listaProdutos = [];

    const tabela = document.getElementById("tabelaProdutos");

    tabela.innerHTML = "";


    const consulta = await getDocs(
        collection(db, "produtos")
    );


   consulta.forEach((documento)=>{


    const produto = documento.data();


    const quantidade = Number(produto.quantidade);
    const minimo = Number(produto.estoqueMinimo);



    let situacao;
    let status;



    if(quantidade < minimo){

        situacao = "abaixo";

        status = `
        <span class="vermelho">
        🔴 Abaixo do mínimo
        </span>
        `;

    }


    else if(quantidade <= minimo * 1.2){

        situacao = "alerta";

        status = `
        <span class="amarelo">
        🟡 Alerta
        </span>
        `;

    }


    else{

        situacao = "normal";

        status = `
        <span class="verde">
        🟢 Normal
        </span>
        `;

    }



    listaProdutos.push({

        codigo: produto.codigo,
        nome: produto.nome,
        quantidade: quantidade,
        estoqueMinimo: minimo,
        situacao: situacao,
        status: status

    });


    });

    mostrarProdutos();
}

function mostrarProdutos(){

    const tabela = document.getElementById("tabelaProdutos");

    tabela.innerHTML = "";


    const filtro = document.getElementById("filtroSituacao").value;


    const pesquisa = document
    .getElementById("pesquisarProduto")
    .value
    .toLowerCase();



    listaProdutos.forEach((produto)=>{


        if(filtro !== "todos" && filtro !== produto.situacao){

            return;

        }



        const correspondePesquisa =

        produto.nome.toLowerCase().includes(pesquisa)

        ||

        String(produto.codigo).includes(pesquisa);



        if(!correspondePesquisa){

            return;

        }



        tabela.innerHTML += `

        <tr>

            <td>${produto.codigo}</td>

            <td>${produto.nome}</td>

            <td>${produto.quantidade}</td>

            <td>${produto.estoqueMinimo}</td>

            <td>${produto.status}</td>

        </tr>

        `;


    });


}


carregarProdutosReposicao();

document
.getElementById("filtroSituacao")
.addEventListener("change", mostrarProdutos);

document
.getElementById("pesquisarProduto")
.addEventListener("input", mostrarProdutos);