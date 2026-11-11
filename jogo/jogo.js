let cliques = 0;
let contador = document.querySelector("#contadorCliques");
let personagem = document.querySelector(".personagem img");
const parado = 'assets/sprites/Default/JerryIdle.gif';
const acao = 'assets/sprites/Default/JerryAction.gif';
let temporizador;

if (personagem && contador) {
    personagem.addEventListener("click", function() {
        cliques++;
        contador.textContent = cliques;
        clearTimeout(temporizador);
        personagem.src = `${acao}?t=${Date.now()}`;
        temporizador = setTimeout(() => {
            personagem.src = parado;
        }, 300);
    });
}

const botaoMelhoria = document.getElementById("melhoriaClique");
const caixaMelhoria = document.getElementById("caixa-melhoria");

if (botaoMelhoria && caixaMelhoria) {
    botaoMelhoria.addEventListener("click", function() {
        caixaMelhoria.classList.toggle("escondido");
    });
}

function comprarMelhoria() {
    if (cliques >= 10) {
        cliques -= 10;
        contador.textContent = cliques;
        alert("Melhoria comprada!");
    } else {
        alert("Você não tem cliques suficientes.");
    }
}

$(document).ready(function() {
    const $lojaPainel = $("#lojaPainel");
    const $loja = $("#loja");
    const $fecharLoja = $("#fecharLoja");

    function abrirLoja() {
        $(".FOV").addClass("modo-fov");
        $lojaPainel.addClass("aberta");
    }

    function fecharLoja() {
        $(".FOV").removeClass("modo-fov");
        $lojaPainel.removeClass("aberta");
    }

    $loja.on("click", abrirLoja);
    $fecharLoja.on("click", fecharLoja);
    $lojaPainel.on("click", function(event) {
        if (event.target === this) {
            fecharLoja();
        }
    });

    $(document).on("keydown", function(event) {
        if (event.key === "Escape") {
            fecharLoja();
        }
    });
});
