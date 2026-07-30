const campoSenha = document.getElementById("senha");
const botao = document.getElementById("botao-login");

/* Aqui é a sua senha */
const senhaCorreta = "manu.terral";

botao.addEventListener("click", function () {

    let senhaDigitada = campoSenha.value.trim();

    console.log(senhaDigitada);
    console.log(senhaCorreta);

    if (senhaDigitada === senhaCorreta) {

        localStorage.setItem("logado", "true");
        window.location.href = "dashboard.html";

    } else {

        alert("Senha incorreta");

    }

});