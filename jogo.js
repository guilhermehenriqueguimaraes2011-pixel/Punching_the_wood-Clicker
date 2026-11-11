// let cliques = 0;
// let contador = document.querySelector("#contadorCliques");
// let personagem = document.querySelector(".personagem img");


// personagem.addEventListener("click", function() {
//     cliques++;
//     contador.textContent = cliques;

//     personagem.classList.remove("soco");
//     // let largura = personagem.offsetWidth;
//     personagem.classList.add("soco");
// });

let cliques = 0;
let contador = document.querySelector("#contadorCliques");
let personagem = document.querySelector(".personagem img");
const parado = 'assets/sprites/Default/JerryIdle.gif';
const acao = 'assets/sprites/Default/JerryAction.gif';
let emAcao = false;
let temporizador;

personagem.addEventListener("click", function() {
   cliques++;
   contador.textContent = cliques;
   clearTimeout(temporizador)
   personagem.src = `${acao}?t=${Date.now()}`;
   temporizador = setTimeout(()=>{
       personagem.src = parado
   }, 300);
});




$(document).ready(function() {

    let BtLoja = $("#loja");
    let BtFecharLoja = $("#fecharLoja");

    function abrirLoja() {
        $(".FOV").addClass("modo-fov");
        $("#lojaPainel").addClass("aberta");
    }

    function fecharLoja() {
        $(".FOV").removeClass("modo-fov");
        $("#lojaPainel").removeClass("aberta");
    }

    function cliqueForaDaLoja(e) {
        if (e.target === this) {
            fecharLoja();
        }
    }
 if (e.key === "Escape") {
            fecharLoja();
        }

    BtLoja.on("click", abrirLoja);
    BtFecharLoja.on("click", fecharLoja);
    $("#lojaPainel").on("click", cliqueForaDaLoja);
    $(document).on("keydown", teclaPressionada);

});
// randomizer para pet;
