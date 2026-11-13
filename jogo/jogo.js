let contador = document.querySelector("#contadorCliques");
let personagem = document.querySelector(".personagem img");
let musica = document.querySelector("#bgm");
let promptInicio = document.querySelector("#promptInicio");
let madeira = document.querySelector(".madeira img");
let particulas = document.querySelector(".particulas");
const parado = 'assets/sprites/Default/JerryIdle.gif';
const acao = 'assets/sprites/Default/JerryAction.gif';
const madeiraParada = 'assets/sprites/Default/default_wood_idle.png';
const madeiraAcao = 'assets/sprites/Default/default_wood_action.png';
let temporizador;
let temporizadorMadeira;
let musicaIniciada = false;

function soltarParticulas() {
    if (!particulas) return;

    for (let i = 0; i < 8; i++) {
        const particula = document.createElement("span");
        const direcaoX = Math.round(Math.random() * 100 - 50);
        const direcaoY = Math.round(Math.random() * -75 - 15);

        particula.className = "particula";
        particula.style.setProperty("--dx", `${direcaoX}px`);
        particula.style.setProperty("--dy", `${direcaoY}px`);
        particulas.appendChild(particula);
        particula.addEventListener("animationend", () => particula.remove(), { once: true });
    }
}

if (personagem && contador) {
    personagem.addEventListener("click", function() {

        if (promptInicio) {
            promptInicio.classList.add("escondido");
        }

        if (musica && !musicaIniciada) {
            musicaIniciada = true;
            const reproducao = musica.play();
            if (reproducao) {
                reproducao.catch(() => {
                    musicaIniciada = false;
                });
            }
        }

        clearTimeout(temporizador);
        personagem.src = `${acao}?t=${Date.now()}`;
        temporizador = setTimeout(() => {
            personagem.src = parado;
        }, 300);

        if (madeira) {
            clearTimeout(temporizadorMadeira);
            madeira.src = `${madeiraAcao}?t=${Date.now()}`;
            soltarParticulas();
            temporizadorMadeira = setTimeout(() => {
                madeira.src = madeiraParada;
            }, 300);
        }
    });
}

const botaoMelhoria = document.getElementById("melhoriaClique");
const caixaMelhoria = document.getElementById("caixa-melhoria");

if (botaoMelhoria && caixaMelhoria) {
    botaoMelhoria.addEventListener("click", function() {
        caixaMelhoria.classList.toggle("escondido");
    });
}
const botaoMelhoriaPorSegundo = document.getElementById("melhoriaSegundo");
const caixaMelhoriaPorSegundo = document.getElementById("caixa-melhoria-por-segundo");

if (botaoMelhoriaPorSegundo && caixaMelhoriaPorSegundo) {
    botaoMelhoriaPorSegundo.addEventListener("click", function() {
        caixaMelhoriaPorSegundo.classList.toggle("escondido");
    });
}

function comprarMelhoria() {
    if (totalCliques >= custoMelhoria) {
        totalCliques -= custoMelhoria;

        cliquesPorClique++;

        custoMelhoria *= 2;

        atualizarTela();

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

let totalCliques = 0;
let cliquesPorClique = 1;
let custoMelhoria = 150;

let vidaMax = 15;
let vidaAtual = vidaMax;

function clicaNaMadeira() {
    totalCliques += cliquesPorClique;
    vidaAtual -= cliquesPorClique;

    atualizarTela();

    madeira2.style.opacity = Math.max(0, vidaAtual / vidaMax);

    if (vidaAtual <= 0) {
        madeira2.style.opacity = 0;

        setTimeout(() => {
            vidaMax += 10;
            vidaAtual = vidaMax;
            madeira2.style.opacity = 1;
        }, 1000);
    }
}

function atualizarTela() {
    contador.innerText = `Cliques: ${totalCliques}`;
}

const personagem2 = document.getElementById('personagem');
const madeira2 = document.getElementById('madeira');

personagem2.addEventListener('click', () => {

    clicaNaMadeira();

    madeira2.classList.add('impacto');

    setTimeout(() => {
        madeira2.classList.remove('impacto');
    }, 100);

});
