const jogador = sessionStorage.getItem("jogador");
const senhaJogador = sessionStorage.getItem("senhaJogador");
let dadosJogador = null;
try {
    dadosJogador = JSON.parse(sessionStorage.getItem("dadosJogador"));
} catch (e) {
    dadosJogador = null;
}

const SUPABASE_URL = "https://zeaaeiiwftctedrumuzp.supabase.co";
const SUPABASE_KEY = "sb_publishable_dPCcGEn70ozMH7gqL44zxQ_qvIMOpFa";
const BancoDeDados = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let contador = document.querySelector("#contadorCliques");
let personagem = document.querySelector(".personagem img");
let areaPersonagem = document.querySelector(".personagem");
let musica = document.querySelector("#bgm");
let somSoco = document.querySelector("#somSoco");
let promptInicio = document.querySelector("#promptInicio");
let madeira = document.querySelector(".madeira img");
let particulas = document.querySelector(".particulas");
let notificacaoConquista = document.querySelector("#notificacaoConquista");

const temas = {
    default: {
        personagemParado: "assets/sprites/Default/JerryIdle.gif",
        personagemAcao: "assets/sprites/Default/JerryAction.gif",
        madeiraParada: "assets/sprites/Default/default_wood_idle.png",
        madeiraAcao: "assets/sprites/Default/default_wood_action.png",
        fundo: "assets/backgrounds/Clareira_Pixelada.png",
        musica: "assets/musics/Clicker_Default_Variant.mp3"
    },
    sonic: {
        personagemParado: "assets/sprites/Sonic/SonicIdle.gif",
        personagemAcao: "assets/sprites/Sonic/SonicAction.gif",
        madeiraParada: "assets/sprites/Sonic/sonic_monitor_idle.png",
        madeiraAcao: "assets/sprites/Sonic/sonic_monitor_action.gif",
        fundo: "assets/backgrounds/Green_Hill.png",
        musica: "assets/musics/Clicker_Sonic_Variant.mp3"
    },
    mario: {
        personagemParado: "assets/sprites/Mario-Bros/MarioIdle.gif",
        personagemAcao: "assets/sprites/Mario-Bros/MarioAction.gif",
        madeiraParada: "assets/sprites/Mario-Bros/Koopa_Troopa_Idle.png",
        madeiraAcao: "assets/sprites/Mario-Bros/Koopa_Troopa_Action.png",
        fundo: "assets/backgrounds/Mushroom_Kingdom.png",
        musica: "assets/musics/Clicker_Mario_Variant.mp3"
    }
};
let temaAtual = temas.default;
const temasComprados = new Set();
let temporizador;
let temporizadorMadeira;
let temporizadorImpacto;
let temporizadorReparo;
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

function lancarBolaDeFogo() {
    const alvo = document.querySelector("#madeira");
    const fov = document.querySelector(".FOV");

    if (!alvo || !fov) return;

    const fovRect = fov.getBoundingClientRect();
    const personagemRect = personagem.getBoundingClientRect();
    const alvoRect = alvo.getBoundingClientRect();
    const inicioX = personagemRect.left + personagemRect.width * 0.78 - fovRect.left;
    const inicioY = personagemRect.top + personagemRect.height * 0.48 - fovRect.top;
    const destinoX = alvoRect.left + alvoRect.width * 0.2 - fovRect.left;
    const destinoY = alvoRect.top + alvoRect.height * 0.42 - fovRect.top;
    const bola = document.createElement("img");

    bola.className = "bola-de-fogo";
    bola.src = "assets/sprites/Mario-Bros/Fireball.png";
    bola.alt = "";
    bola.draggable = false;
    bola.style.left = `${inicioX}px`;
    bola.style.top = `${inicioY}px`;
    bola.style.setProperty("--dx", `${destinoX - inicioX}px`);
    bola.style.setProperty("--dy", `${destinoY - inicioY}px`);
    fov.appendChild(bola);
    bola.addEventListener("animationend", () => bola.remove(), { once: true });
}

function atualizarMusicaTema() {
    if (!musica) return;

    musica.pause();
    musica.src = temaAtual.musica;
    musica.load();

    if (musicaIniciada) {
        const reproducao = musica.play();
        if (reproducao) {
            reproducao.catch((erro) => {
                musicaIniciada = false;
                console.error("Não foi possível iniciar a música do tema:", erro);
            });
        }
    }
}

if (personagem && contador) {
    personagem.addEventListener("click", function() {

        if (somSoco) {
        somSoco.currentTime = 0;
        somSoco.play();
        }

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
        areaPersonagem.classList.remove("sonic-idle");
        areaPersonagem.classList.remove("mario-idle");
        madeira.classList.remove("mario-idle");
        personagem.src = `${temaAtual.personagemAcao}?t=${Date.now()}`;
        temporizador = setTimeout(() => {
            personagem.src = temaAtual.personagemParado;
            areaPersonagem.classList.toggle("sonic-idle", temaAtual === temas.sonic);
            areaPersonagem.classList.toggle("mario-idle", temaAtual === temas.mario);
            madeira.classList.toggle("mario-idle", temaAtual === temas.mario);
        }, 300);

        if (temaAtual === temas.mario) {
            lancarBolaDeFogo();
        }

        if (madeira) {
            clearTimeout(temporizadorMadeira);
            clearTimeout(temporizadorImpacto);
            madeira.src = `${temaAtual.madeiraAcao}?t=${Date.now()}`;
            madeira.classList.add("impacto");
            soltarParticulas();
            temporizadorImpacto = setTimeout(() => {
                madeira.classList.remove("impacto");
            }, 100);
            temporizadorMadeira = setTimeout(() => {
                madeira.src = temaAtual.madeiraParada;
            }, 300);
            clicaNaMadeira();
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

function atualizarBotoesTemas() {
    document.querySelectorAll("[data-theme]").forEach((botao) => {
        const tema = botao.dataset.theme;
        const comprado = tema === "default" || temasComprados.has(tema);

        if (comprado && temaAtual === temas[tema]) {
            botao.textContent = "Em uso";
            botao.disabled = true;
        } else if (comprado) {
            botao.textContent = "Usar tema";
            botao.disabled = false;
        } else {
            botao.textContent = "Comprar (50)";
            botao.disabled = totalCliques < 50;
        }
    });
}

function selecionarTema(nome) {
    clearTimeout(temporizador);
    clearTimeout(temporizadorMadeira);
    clearTimeout(temporizadorImpacto);
    temaAtual = temas[nome];
    document.querySelector(".FOV").classList.toggle("tema-sonic", nome === "sonic");
    document.querySelector(".FOV").classList.toggle("tema-mario", nome === "mario");
    personagem.src = temaAtual.personagemParado;
    areaPersonagem.classList.toggle("sonic-idle", nome === "sonic");
    areaPersonagem.classList.remove("mario-idle");
    madeira.src = temaAtual.madeiraParada;
    madeira.classList.toggle("mario-idle", nome === "mario");
    madeira.classList.remove("impacto");
    document.querySelector(".fundo").style.backgroundImage = `url("${temaAtual.fundo}")`;
    atualizarMusicaTema();
    atualizarBotoesTemas();
}

document.querySelectorAll("[data-theme]").forEach((botao) => {
    botao.addEventListener("click", () => {
        const nomeTema = botao.dataset.theme;

        if (nomeTema === "default" || temasComprados.has(nomeTema)) {
            selecionarTema(nomeTema);
            return;
        }

        if (totalCliques < 50) {
            return;
        }

        totalCliques -= 50;
        temasComprados.add(nomeTema);
        atualizarTela();
        selecionarTema(nomeTema);
    });
});


$(document).ready(function() {
    const $lojaPainel = $("#lojaPainel");
    const $loja = $("#loja");
    const $fecharLoja = $("#fecharLoja");
   
    const $configuracoesPainel = $("#configuracoesPainel");
    const $configuracoes = $("#configuracoes");
    const $fecharConfiguracoes = $("#fecharConfiguracoes");
    const $volumeGeral = $("#volumeGeral");
    const $volumeMusica = $("#volumeMusica");
    const $volumeSFX = $("#volumeSFX");
    let volumeMusica = 1;
    let volumeSFX = 1;

    function atualizarVolumeMusica() {
    musica.volume = ($volumeGeral.val() / 100) * volumeMusica;
}
function atualizarVolumeSFX() {
    somSoco.volume = ($volumeGeral.val() / 100) * volumeSFX;
}

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
            fecharConfiguracoes();
        }
    });
    function abrirConfiguracoes() {
    $configuracoesPainel.addClass("aberta");
}
$configuracoes.on("click", abrirConfiguracoes);
function fecharConfiguracoes() {
    $configuracoesPainel.removeClass("aberta");
}
$fecharConfiguracoes.on("click", fecharConfiguracoes);
$configuracoesPainel.on("click", function(event) {
    if (event.target === this) {
        fecharConfiguracoes();
    }
});
$volumeGeral.on("input", function() {
atualizarVolumeMusica();
    atualizarVolumeSFX();

});
$volumeMusica.on("input", function() {
    volumeMusica = this.value / 100;
atualizarVolumeMusica();
});
$volumeSFX.on("input", function() {
    volumeSFX = this.value / 100;
    atualizarVolumeSFX();
});
});

let totalCliques = 0;
let cliquesPorClique = 1;
let custoMelhoria = 150;
let nivelMelhoriaClique = 0;
let cliquesPorSegundo = 0;
let nivelMelhoriaSegundo = 0;
let custoMelhoriaSegundo = 150;

const melhoriasSalvas = dadosJogador && dadosJogador.upgrades &&
    typeof dadosJogador.upgrades === "object" && !Array.isArray(dadosJogador.upgrades)
    ? dadosJogador.upgrades.punchingTheWood || {}
    : {};

function calcularCustoMelhoria(base, multiplicador, nivel) {
    let custo = base;

    for (let i = 0; i < nivel; i++) {
        custo = Math.ceil(custo * multiplicador);
    }

    return custo;
}

nivelMelhoriaClique = Math.max(0, Math.floor(Number(melhoriasSalvas.clickLevel) || 0));
nivelMelhoriaSegundo = Math.max(0, Math.floor(Number(melhoriasSalvas.perSecondLevel) || 0));
cliquesPorClique += nivelMelhoriaClique;
cliquesPorSegundo = nivelMelhoriaSegundo * 0.5;
custoMelhoria = Number(melhoriasSalvas.clickCost) > 0
    ? Number(melhoriasSalvas.clickCost)
    : calcularCustoMelhoria(150, 1.4, nivelMelhoriaClique);
custoMelhoriaSegundo = Number(melhoriasSalvas.perSecondCost) > 0
    ? Number(melhoriasSalvas.perSecondCost)
    : calcularCustoMelhoria(150, 1.6, nivelMelhoriaSegundo);

function atualizarMelhoriasSalvas() {
    if (!dadosJogador) return;

    const upgrades = dadosJogador && dadosJogador.upgrades &&
        typeof dadosJogador.upgrades === "object" && !Array.isArray(dadosJogador.upgrades)
        ? dadosJogador.upgrades
        : {};

    dadosJogador.upgrades = {
        ...upgrades,
        punchingTheWood: {
            clickLevel: nivelMelhoriaClique,
            clickCost: custoMelhoria,
            perSecondLevel: nivelMelhoriaSegundo,
            perSecondCost: custoMelhoriaSegundo
        }
    };
}

function calcularCustoLote(custo, multiplicador, quantidade) {
    let custoTotal = 0;
    let proximoCusto = custo;

    for (let i = 0; i < quantidade; i++) {
        custoTotal += proximoCusto;
        proximoCusto = Math.ceil(proximoCusto * multiplicador);
    }

    return { custoTotal, proximoCusto };
}

function atualizarBotoesMelhoria() {
    const quantidadeClique = Number(document.getElementById("quantidadeMelhoriaClique").value);
    const quantidadeSegundo = Number(document.getElementById("quantidadeMelhoriaSegundo").value);
    const loteClique = calcularCustoLote(custoMelhoria, 1.4, quantidadeClique);
    const loteSegundo = calcularCustoLote(custoMelhoriaSegundo, 1.6, quantidadeSegundo);
    const botaoClique = document.getElementById("comprarMelhoriaClique");
    const botaoSegundo = document.getElementById("comprarMelhoriaSegundo");

    document.getElementById("nivelMelhoriaClique").textContent =
        `Nível: ${nivelMelhoriaClique} | Próximo custo: ${custoMelhoria} cliques`;
    document.getElementById("nivelMelhoriaSegundo").textContent =
        `Nível: ${nivelMelhoriaSegundo} | Próximo custo: ${custoMelhoriaSegundo} cliques`;
    botaoClique.textContent = `Comprar (${loteClique.custoTotal} Cliques)`;
    botaoSegundo.textContent = `Comprar (${loteSegundo.custoTotal} Cliques)`;
    botaoClique.disabled = totalCliques < loteClique.custoTotal;
    botaoSegundo.disabled = totalCliques < loteSegundo.custoTotal;
}

function comprarMelhoria() {
    const quantidade = Number(document.getElementById("quantidadeMelhoriaClique").value);
    const lote = calcularCustoLote(custoMelhoria, 1.4, quantidade);

    if (totalCliques < lote.custoTotal) {
        alert("Você não tem cliques suficientes.");
        return;
    }

    totalCliques -= lote.custoTotal;
    nivelMelhoriaClique += quantidade;
    cliquesPorClique += quantidade;
    custoMelhoria = lote.proximoCusto;
    atualizarMelhoriasSalvas();
    atualizarTela();
    atualizarBotoesMelhoria();
    salvarProgresso();
}

function comprarMelhoriaPorSegundo() {
    const quantidade = Number(document.getElementById("quantidadeMelhoriaSegundo").value);
    const lote = calcularCustoLote(custoMelhoriaSegundo, 1.6, quantidade);

    if (totalCliques < lote.custoTotal) {
        alert("Você não tem cliques suficientes.");
        return;
    }

    totalCliques -= lote.custoTotal;
    nivelMelhoriaSegundo += quantidade;
    cliquesPorSegundo += quantidade * 0.5;
    custoMelhoriaSegundo = lote.proximoCusto;
    atualizarMelhoriasSalvas();
    atualizarTela();
    atualizarBotoesMelhoria();
    salvarProgresso();
}

document.getElementById("comprarMelhoriaClique").addEventListener("click", comprarMelhoria);
document.getElementById("comprarMelhoriaSegundo").addEventListener("click", comprarMelhoriaPorSegundo);
document.getElementById("quantidadeMelhoriaClique").addEventListener("change", atualizarBotoesMelhoria);
document.getElementById("quantidadeMelhoriaSegundo").addEventListener("change", atualizarBotoesMelhoria);

let vidaMax = 15;
let vidaAtual = vidaMax;

function clicaNaMadeira() {
    totalCliques += cliquesPorClique;
    vidaAtual = Math.max(0, vidaAtual - cliquesPorClique);

    atualizarTela();
    if (totalCliques === 10) {
    mostrarConquista("WOOD DESTROYER!", 10);
}

if (totalCliques === 30) {
    mostrarConquista("FIRE FINGERS!", 30);
}
if (totalCliques === 100) {
    mostrarConquista("CENTURY SMASH!", 100);
}

if (totalCliques === 300) {
    mostrarConquista("WOOD ANNIHILATOR!", 300);
}

if (totalCliques === 1000) {
    mostrarConquista("LEGENDARY PUNCH!", 1000);
}

    if (vidaAtual === 0 && !temporizadorReparo) {
        temporizadorReparo = setTimeout(() => {
            vidaMax += 10;
            vidaAtual = vidaMax;
            temporizadorReparo = undefined;
        }, 1000);
    }
}

function atualizarTela() {
    contador.innerText = `Cliques: ${totalCliques}`;
    atualizarBotoesTemas();
    atualizarBotoesMelhoria();
}
function mostrarConquista(titulo, pontos) {
    notificacaoConquista.innerHTML = titulo + "<br>+" + pontos;
    notificacaoConquista.classList.add("boing");

    setTimeout(function() {
        notificacaoConquista.classList.remove("boing");
        notificacaoConquista.innerHTML = "";
    }, 1000);
}

atualizarBotoesTemas();

if (dadosJogador) {
    totalCliques = Number(dadosJogador.score) || 0;
    atualizarTela();

    if (totalCliques > 0 && promptInicio) {
        promptInicio.classList.add("escondido");
    }
}

atualizarBotoesMelhoria();

let cliquesAutomaticosPendentes = 0;

setInterval(function() {
    if (cliquesPorSegundo > 0) {
        cliquesAutomaticosPendentes += cliquesPorSegundo;
        const novosCliques = Math.floor(cliquesAutomaticosPendentes);

        if (novosCliques > 0) {
            cliquesAutomaticosPendentes -= novosCliques;
            totalCliques += novosCliques;
            atualizarTela();
        }
    }
}, 1000);

let ultimoSalvo = totalCliques;
let salvando = false;
let temporizadorSalvar;

async function salvarProgresso() {
    if (!jogador || !senhaJogador || !dadosJogador) return;
    if (salvando) {
        clearTimeout(temporizadorSalvar);
        temporizadorSalvar = setTimeout(salvarProgresso, 500);
        return;
    }
    if (totalCliques === ultimoSalvo) return;

    salvando = true;
    const valor = totalCliques;

    try {
        const { error } = await BancoDeDados.rpc("salvar", {
            p_usuario: jogador,
            p_senha: senhaJogador,
            p_score: valor,
            p_moedas: dadosJogador.moedas,
            p_inventario: dadosJogador.inventario,
            p_upgrades: dadosJogador.upgrades,
            p_progresso: dadosJogador.progresso
        });
        if (error) throw error;

        ultimoSalvo = valor;
        dadosJogador.score = valor;
        sessionStorage.setItem("dadosJogador", JSON.stringify(dadosJogador));
    } catch (e) {
        console.error("Erro ao salvar:", e.message);
    }

    salvando = false;
}

new MutationObserver(function() {
    clearTimeout(temporizadorSalvar);
    temporizadorSalvar = setTimeout(salvarProgresso, 1000);
}).observe(contador, { childList: true, characterData: true, subtree: true });

setInterval(salvarProgresso, 5000);

function salvarAoSair() {
    if (!jogador || !senhaJogador || !dadosJogador) return;
    if (totalCliques === ultimoSalvo) return;

    fetch(`${SUPABASE_URL}/rest/v1/rpc/salvar`, {
        method: "POST",
        keepalive: true,
        headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY
        },
        body: JSON.stringify({
            p_usuario: jogador,
            p_senha: senhaJogador,
            p_score: totalCliques,
            p_moedas: dadosJogador.moedas,
            p_inventario: dadosJogador.inventario,
            p_upgrades: dadosJogador.upgrades,
            p_progresso: dadosJogador.progresso
        })
    });

    ultimoSalvo = totalCliques;
    dadosJogador.score = totalCliques;
    sessionStorage.setItem("dadosJogador", JSON.stringify(dadosJogador));
}

document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "hidden") salvarAoSair();
});
window.addEventListener("pagehide", salvarAoSair);

const nickJogador = document.querySelector("#nickJogador");

if (nickJogador) {
    nickJogador.textContent = (jogador || "Visitante");
    nickJogador.classList.remove("escondido");
}