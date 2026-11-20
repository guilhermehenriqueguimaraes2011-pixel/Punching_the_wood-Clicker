const jogador = sessionStorage.getItem("jogador");
const senhaJogador = sessionStorage.getItem("senhaJogador");
let dadosJogador = null;
try {
    dadosJogador = JSON.parse(sessionStorage.getItem("dadosJogador"));
} catch (e) {
    dadosJogador = null;
}

const perfilPadrao = "assets/sprites/Default/JerryIdle.gif";
const PRECO_TEMA = 1000;
const chaveTemaLocal = (usuario) => `punching_tema_usuario_${String(usuario || "").trim().toLowerCase()}`;
const chaveFotoPerfilLocal = (usuario) => `punching_foto_perfil_${String(usuario || "").trim().toLowerCase()}`;
const chaveTeclaCliqueLocal = "punching_tecla_clique";
const teclaCliquePadrao = "Space";
const tamanhoMaximoFotoOriginal = 10 * 1024 * 1024;
const tamanhoMaximoFotoPerfil = 100 * 1024;
const chavesVolumeLocal = {
    geral: "punching_volume_geral",
    musica: "punching_volume_musica",
    efeitos: "punching_volume_efeitos"
};

function carregarVolumeLocal(chave) {
    try {
        const volumeSalvo = localStorage.getItem(chave);
        if (volumeSalvo === null) return 100;

        const volume = Number(volumeSalvo);
        return Number.isFinite(volume) ? Math.min(100, Math.max(0, volume)) : 100;
    } catch (erro) {
        console.warn("Não foi possível carregar as configurações de áudio:", erro);
        return 100;
    }
}

function salvarVolumeLocal(chave, volume) {
    try {
        localStorage.setItem(chave, String(volume));
    } catch (erro) {
        console.warn("Não foi possível salvar as configurações de áudio:", erro);
    }
}

function formatarTeclaClique(tecla) {
    const nomesTeclas = {
        Space: "Espaço",
        " ": "Espaço",
        Escape: "Esc",
        ShiftLeft: "Shift esquerdo",
        ShiftRight: "Shift direito",
        ControlLeft: "Ctrl esquerdo",
        ControlRight: "Ctrl direito",
        AltLeft: "Alt esquerdo",
        AltRight: "Alt direito",
        MetaLeft: "Tecla Windows/Command esquerda",
        MetaRight: "Tecla Windows/Command direita",
        ArrowUp: "Seta para cima",
        ArrowDown: "Seta para baixo",
        ArrowLeft: "Seta para a esquerda",
        ArrowRight: "Seta para a direita"
    };

    if (nomesTeclas[tecla]) return nomesTeclas[tecla];
    if (tecla.startsWith("Key")) return tecla.slice(3).toUpperCase();
    if (tecla.startsWith("Digit")) return tecla.slice(5);
    return tecla;
}

async function salvarFotoPerfilNoServidor(usuario, senha, foto) {
    const nomeUsuario = String(usuario || "").trim().toLowerCase();
    const valorFoto = foto || perfilPadrao;

    if (!nomeUsuario) return valorFoto;

    const { error } = await BancoDeDados.rpc("salvar_foto_perfil", {
        p_usuario: nomeUsuario,
        p_senha: senha,
        p_foto: valorFoto
    });

    if (error) throw error;
    return valorFoto;
}

async function prepararFotoPerfil(arquivo) {
    if (!arquivo.type || !arquivo.type.startsWith("image/")) {
        throw new Error("Selecione um arquivo de imagem.");
    }

    if (arquivo.size > tamanhoMaximoFotoOriginal) {
        throw new Error("A imagem original deve ter no máximo 10 MB.");
    }

    const urlTemporaria = URL.createObjectURL(arquivo);
    try {
        const imagem = new Image();
        const carregamento = new Promise((resolve, reject) => {
            imagem.onload = resolve;
            imagem.onerror = () => reject(new Error("Não foi possível abrir esta imagem."));
        });
        imagem.src = urlTemporaria;
        await carregamento;

        const maiorLado = Math.max(imagem.naturalWidth, imagem.naturalHeight);
        if (!maiorLado) {
            throw new Error("A imagem selecionada está vazia ou é inválida.");
        }

        const escala = Math.min(1, 256 / maiorLado);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(imagem.naturalWidth * escala));
        canvas.height = Math.max(1, Math.round(imagem.naturalHeight * escala));

        const contexto = canvas.getContext("2d");
        if (!contexto) {
            throw new Error("Não foi possível processar a imagem neste navegador.");
        }
        contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, "image/webp", 0.8);
        });
        if (!blob) {
            throw new Error("Não foi possível compactar a imagem.");
        }
        if (blob.size > tamanhoMaximoFotoPerfil) {
            throw new Error("A imagem compactada excedeu o limite de 100 KB. Escolha outra imagem.");
        }

        return await new Promise((resolve, reject) => {
            const leitor = new FileReader();
            leitor.onload = () => resolve(String(leitor.result || ""));
            leitor.onerror = () => reject(new Error("Não foi possível ler a imagem compactada."));
            leitor.readAsDataURL(blob);
        });
    } finally {
        URL.revokeObjectURL(urlTemporaria);
    }
}

async function buscarFotoPerfilDoServidor(usuario) {
    const nomeUsuario = String(usuario || "").trim().toLowerCase();

    if (!nomeUsuario) return perfilPadrao;

    try {
        const { data, error } = await BancoDeDados.rpc("buscar_foto_perfil", {
            p_usuario: nomeUsuario
        });

        if (error) throw error;
        return data || perfilPadrao;
    } catch (erro) {
        console.error("Não foi possível buscar a foto do servidor:", erro);
        return perfilPadrao;
    }
}

function getTeclaCliqueSalva() {
    try {
        const teclaSalva = localStorage.getItem(chaveTeclaCliqueLocal);
        return teclaSalva || teclaCliquePadrao;
    } catch (erro) {
        return teclaCliquePadrao;
    }
}

function salvarTeclaClique(tecla) {
    try {
        localStorage.setItem(chaveTeclaCliqueLocal, tecla || teclaCliquePadrao);
    } catch (erro) {
        console.warn("Não foi possível salvar a tecla de clique:", erro);
    }
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
let madeiraImpacto = document.querySelector("#minecraftImpacto");
let particulas = document.querySelector(".particulas");
let notificacaoConquista = document.querySelector("#notificacaoConquista");

const temas = {
    default: {
        personagemParado: "assets/sprites/Default/JerryIdle.gif",
        personagemAcao: "assets/sprites/Default/JerryAction.gif",
        madeiraParada: "assets/sprites/Default/default_wood_idle.png",
        madeiraAcao: "assets/sprites/Default/default_wood_action.png",
        somFixo: "assets/musics/hitsounds/universfield-classic-punch-impact-352711.mp3",
        sonsAleatorios: [],
        fundo: "assets/backgrounds/Clareira_Pixelada.png",
        musica: "assets/musics/Clicker_Default_Variant.mp3"
    },
    sonic: {
        personagemParado: "assets/sprites/Sonic/SonicIdle.gif",
        personagemAcao: "assets/sprites/Sonic/SonicAction.gif",
        madeiraParada: "assets/sprites/Sonic/sonic_monitor_idle.png",
        madeiraAcao: "assets/sprites/Sonic/sonic_monitor_action.gif",
        somFixo: "assets/musics/hitsounds/sonic/sonic-1-kick-drum.mp3",
        interrompeSomAleatorio: true,
        sonsAleatorios: [
            "assets/musics/hitsounds/sonic/alright-sonic-cd.mp3",
            "assets/musics/hitsounds/sonic/cmon-sonic-3-sample.mp3",
            "assets/musics/hitsounds/sonic/sonic-cd-yeah.mp3"
        ],
        fundo: "assets/backgrounds/Green_Hill.png",
        musica: "assets/musics/Clicker_Sonic_Variant.mp3"
    },
    mario: {
        personagemParado: "assets/sprites/Mario-Bros/MarioIdle.gif",
        personagemAcao: "assets/sprites/Mario-Bros/MarioAction.gif",
        madeiraParada: "assets/sprites/Mario-Bros/Koopa_Troopa_Idle.png",
        madeiraAcao: "assets/sprites/Mario-Bros/Koopa_Troopa_Action.png",
        somFixo: "assets/musics/hitsounds/mario/mario-fireball.mp3",
        interrompeSomAleatorio: true,
        sonsAleatorios: [
            "assets/musics/hitsounds/mario/sm64_mario_haha-online-audio-converter.mp3",
            "assets/musics/hitsounds/mario/sm64_mario_hoo.wav",
            "assets/musics/hitsounds/mario/sm64_mario_hoohoo.wav",
            "assets/musics/hitsounds/mario/sm64_mario_waha.wav"
        ],
        fundo: "assets/backgrounds/Mushroom_Kingdom.png",
        musica: "assets/musics/Clicker_Mario_Variant.mp3"
    },
    minecraft: {
        personagemParado: "assets/sprites/Minecraft/Minecraft-Idle.png",
        personagemAcao: "assets/sprites/Minecraft/Minecraft-Action.gif",
        madeiraParada: "assets/sprites/Minecraft/Minecraft_oak_log-Idle.png",
        madeiraAcoes: [
            "assets/sprites/Minecraft/Minecraft_oak_log-Action/sprite_0.png",
            "assets/sprites/Minecraft/Minecraft_oak_log-Action/sprite_1.png",
            "assets/sprites/Minecraft/Minecraft_oak_log-Action/sprite_2.png",
            "assets/sprites/Minecraft/Minecraft_oak_log-Action/sprite_3.png"
        ],
        somFixo: null,
        sonsAleatorios: [
            "assets/musics/hitsounds/minecraft/Wood_dig1.ogg",
            "assets/musics/hitsounds/minecraft/Wood_dig2.ogg",
            "assets/musics/hitsounds/minecraft/Wood_dig3.ogg",
            "assets/musics/hitsounds/minecraft/Wood_dig4.ogg"
        ],
        fundo: "assets/backgrounds/Minecraft-Background.jpg",
        musica: "assets/musics/Clicker_Minecraft_Variant.mp3"
    }
};
let temaAtual = temas.default;
function lerTemasComprados(inventario) {
    if (Array.isArray(inventario)) {
        return inventario.filter((tema) => tema !== "default" && temas[tema]);
    }

    if (inventario && Array.isArray(inventario.temasComprados)) {
        return inventario.temasComprados.filter((tema) => tema !== "default" && temas[tema]);
    }

    return [];
}

const temasComprados = new Set(lerTemasComprados(dadosJogador && dadosJogador.inventario));
const sonsHitAtivos = new Set();
const sonsHitInterrompidos = new WeakSet();
let somAleatorioHitAtivo = null;
let temporizador;
let temporizadorMadeira;
let temporizadorImpacto;
let temporizadorReparo;
let musicaIniciada = false;

function getTemaSalvoNoDispositivo() {
    if (!jogador) return null;

    try {
        const temaSalvo = localStorage.getItem(chaveTemaLocal(jogador));
        return temaSalvo || null;
    } catch (erro) {
        console.warn("Não foi possível ler o tema salvo do navegador:", erro);
        return null;
    }
}

function salvarTemaNoDispositivo(nomeTema) {
    if (!jogador || !nomeTema) return;

    try {
        localStorage.setItem(chaveTemaLocal(jogador), nomeTema);
    } catch (erro) {
        console.warn("Não foi possível salvar o tema no navegador:", erro);
    }
}

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

function pararSomAleatorioHit() {
    if (!somAleatorioHitAtivo) return;

    sonsHitInterrompidos.add(somAleatorioHitAtivo);
    somAleatorioHitAtivo.pause();
    somAleatorioHitAtivo.currentTime = 0;
    sonsHitAtivos.delete(somAleatorioHitAtivo);
    somAleatorioHitAtivo = null;
}

function tocarHitSound(caminho, aleatorio = false) {
    if (somSoco && caminho === temas.default.somFixo) {
        somSoco.currentTime = 0;
        const reproducao = somSoco.play();
        if (reproducao) {
            reproducao.catch((erro) => {
                console.error("Não foi possível reproduzir o hit sound:", erro);
            });
        }
        return;
    }

    const som = new Audio(caminho);
    som.volume = somSoco ? somSoco.volume : 1;
    sonsHitAtivos.add(som);
    if (aleatorio && temaAtual.interrompeSomAleatorio) {
        somAleatorioHitAtivo = som;
    }
    som.addEventListener("ended", () => {
        sonsHitAtivos.delete(som);
        if (somAleatorioHitAtivo === som) {
            somAleatorioHitAtivo = null;
        }
    }, { once: true });
    const reproducao = som.play();
    if (reproducao) {
        reproducao.catch((erro) => {
            sonsHitAtivos.delete(som);
            if (somAleatorioHitAtivo === som) {
                somAleatorioHitAtivo = null;
            }
            if (!sonsHitInterrompidos.has(som)) {
                console.error(`Não foi possível reproduzir o hit sound "${caminho}":`, erro);
            }
        });
    }
}

function tocarSonsTema() {
    if (temaAtual.interrompeSomAleatorio) {
        pararSomAleatorioHit();
    }

    if (temaAtual.somFixo) {
        tocarHitSound(temaAtual.somFixo);
    }

    const sonsAleatorios = temaAtual.sonsAleatorios;
    if (sonsAleatorios.length > 0) {
        const somAleatorio = sonsAleatorios[Math.floor(Math.random() * sonsAleatorios.length)];
        tocarHitSound(somAleatorio, true);
    }
}

function processarClique() {
    if (!personagem || !contador) return;

    tocarSonsTema();

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
        areaPersonagem.classList.remove("mario-idle");
        areaPersonagem.classList.remove("sonic-action");
        madeira.classList.remove("mario-idle");
        personagem.src = `${temaAtual.personagemAcao}?t=${Date.now()}`;
        if (temaAtual === temas.sonic) {
            areaPersonagem.classList.add("sonic-action");
        }
        temporizador = setTimeout(() => {
            personagem.src = temaAtual.personagemParado;
            areaPersonagem.classList.remove("sonic-action");
        areaPersonagem.classList.toggle("mario-idle", temaAtual === temas.mario);
        madeira.classList.toggle("mario-idle", temaAtual === temas.mario);
    }, 300);

    if (temaAtual === temas.mario) {
        lancarBolaDeFogo();
    }

    if (madeira) {
        clearTimeout(temporizadorMadeira);
        clearTimeout(temporizadorImpacto);
        soltarParticulas();
        if (temaAtual === temas.minecraft) {
            const spritesImpacto = temaAtual.madeiraAcoes;
            madeiraImpacto.src = spritesImpacto[Math.floor(Math.random() * spritesImpacto.length)];
            madeiraImpacto.classList.add("visivel");
            temporizadorMadeira = setTimeout(() => {
                madeiraImpacto.classList.remove("visivel");
            }, 300);
        } else {
            madeira.src = `${temaAtual.madeiraAcao}?t=${Date.now()}`;
            madeira.classList.add("impacto");
            temporizadorImpacto = setTimeout(() => {
                madeira.classList.remove("impacto");
            }, 100);
            temporizadorMadeira = setTimeout(() => {
                madeira.src = temaAtual.madeiraParada;
            }, 300);
        }
        clicaNaMadeira();
    }
}

if (personagem && contador) {
    personagem.addEventListener("click", processarClique);
}

const teclaCliqueConfig = document.getElementById("teclaClique");
const teclaCliqueStatus = document.getElementById("teclaCliqueStatus");
let teclaCliqueAtiva = getTeclaCliqueSalva();
let aguardandoTeclaClique = false;

function aplicarTeclaClique(tecla) {
    teclaCliqueAtiva = tecla || teclaCliquePadrao;
    salvarTeclaClique(teclaCliqueAtiva);

    if (teclaCliqueConfig) {
        teclaCliqueConfig.textContent = formatarTeclaClique(teclaCliqueAtiva);
    }
}

if (teclaCliqueConfig) {
    aplicarTeclaClique(teclaCliqueAtiva);
    teclaCliqueConfig.addEventListener("click", function() {
        aguardandoTeclaClique = true;
        teclaCliqueConfig.textContent = "Aguardando tecla...";
        if (teclaCliqueStatus) {
            teclaCliqueStatus.textContent = "Pressione a tecla que deseja usar.";
        }
    });
}

document.addEventListener("keydown", function(event) {
    if (!aguardandoTeclaClique || event.repeat) return;

    const teclaCapturada = event.code && event.code !== "Unidentified" ? event.code : event.key;
    if (!teclaCapturada || teclaCapturada === "Unidentified") return;

    event.preventDefault();
    event.stopImmediatePropagation();
    aguardandoTeclaClique = false;
    aplicarTeclaClique(teclaCapturada);

    if (teclaCliqueStatus) {
        teclaCliqueStatus.textContent = `Tecla selecionada: ${formatarTeclaClique(teclaCapturada)}`;
    }
}, true);

document.addEventListener("keydown", function(event) {
    const alvo = event.target;
    const eInputOuTexto = alvo && (
        alvo.tagName === "INPUT" ||
        alvo.tagName === "SELECT" ||
        alvo.tagName === "TEXTAREA" ||
        alvo.isContentEditable
    );

    if (eInputOuTexto) return;
    const configuracoesPainel = document.getElementById("configuracoesPainel");
    if (configuracoesPainel && configuracoesPainel.classList.contains("aberta")) return;
    if (event.repeat) return;
    if (event.code !== teclaCliqueAtiva && event.key !== teclaCliqueAtiva) return;

    event.preventDefault();
    processarClique();
});

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
        } else if (precisaMigrarTemas) {
            botao.textContent = "Atualização pendente";
            botao.disabled = true;
        } else {
            botao.textContent = `Comprar (${PRECO_TEMA})`;
            botao.disabled = totalCliques < PRECO_TEMA;
        }
    });
}

function aplicarTemaSalvo() {
    const temaSalvo = getTemaSalvoNoDispositivo();
    if (!temaSalvo || !temas[temaSalvo]) return;
    if (temaSalvo === "default" || temasComprados.has(temaSalvo)) {
        selecionarTema(temaSalvo);
    }
}

function selecionarTema(nome) {
    clearTimeout(temporizador);
    clearTimeout(temporizadorMadeira);
    clearTimeout(temporizadorImpacto);
    pararSomAleatorioHit();
    temaAtual = temas[nome] || temas.default;
    document.querySelector(".FOV").classList.toggle("tema-sonic", nome === "sonic");
    document.querySelector(".FOV").classList.toggle("tema-mario", nome === "mario");
    document.querySelector(".FOV").classList.toggle("tema-minecraft", nome === "minecraft");
    personagem.src = temaAtual.personagemParado;
    areaPersonagem.classList.remove("sonic-action");
    areaPersonagem.classList.toggle("sonic-idle", nome === "sonic");
    areaPersonagem.classList.remove("mario-idle");
    madeira.src = temaAtual.madeiraParada;
    madeira.classList.toggle("mario-idle", nome === "mario");
    madeira.classList.remove("impacto");
    madeiraImpacto.classList.remove("visivel");
    document.querySelector(".fundo").style.backgroundImage = `url("${temaAtual.fundo}")`;
    atualizarMusicaTema();
    atualizarBotoesTemas();
    salvarTemaNoDispositivo(nome);
}

function salvarTemaComprado(nomeTema) {
    if (!dadosJogador) return;

    const inventario = dadosJogador.inventario;
    if (Array.isArray(inventario)) {
        if (!inventario.includes(nomeTema)) {
            inventario.push(nomeTema);
        }
    } else {
        const itensInventario = inventario && typeof inventario === "object" ? inventario : {};
        const temasInventario = Array.isArray(itensInventario.temasComprados)
            ? itensInventario.temasComprados
            : [];

        dadosJogador.inventario = {
            ...itensInventario,
            temasComprados: [...new Set([...temasInventario, nomeTema])]
        };
    }

    sessionStorage.setItem("dadosJogador", JSON.stringify(dadosJogador));
}

document.querySelectorAll("[data-theme]").forEach((botao) => {
    botao.addEventListener("click", () => {
        const nomeTema = botao.dataset.theme;

        if (nomeTema === "default" || temasComprados.has(nomeTema)) {
            selecionarTema(nomeTema);
            return;
        }

        if (precisaMigrarTemas) {
            alert("A atualização dos temas ainda não foi aplicada à sua conta. Tente novamente mais tarde.");
            return;
        }

        if (totalCliques < PRECO_TEMA) {
            return;
        }

        totalCliques -= PRECO_TEMA;
        temasComprados.add(nomeTema);
        salvarTemaComprado(nomeTema);
        atualizarTela();
        selecionarTema(nomeTema);
        salvarProgresso();
    });
});


$(document).ready(function() {
    const $lojaPainel = $("#lojaPainel");
    const $loja = $("#loja");
    const $fecharLoja = $("#fecharLoja");
    const $rankingPainel = $("#rankingPainel");
    const $ranking = $("#ranking");
    const $fecharRanking = $("#fecharRanking");
    const $atualizarRanking = $("#atualizarRanking");
   
    const $configuracoesPainel = $("#configuracoesPainel");
    const $configuracoes = $("#configuracoes");
    const $fecharConfiguracoes = $("#fecharConfiguracoes");
    const $volumeGeral = $("#volumeGeral");
    const $volumeMusica = $("#volumeMusica");
    const $volumeSFX = $("#volumeSFX");
    $volumeGeral.val(carregarVolumeLocal(chavesVolumeLocal.geral));
    let volumeMusica = carregarVolumeLocal(chavesVolumeLocal.musica) / 100;
    let volumeSFX = carregarVolumeLocal(chavesVolumeLocal.efeitos) / 100;
    $volumeMusica.val(volumeMusica * 100);
    $volumeSFX.val(volumeSFX * 100);

    function atualizarVolumeMusica() {
        if (musica) {
            musica.volume = (Number($volumeGeral.val()) / 100) * volumeMusica;
        }
    }
    function atualizarVolumeSFX() {
        if (somSoco) {
            somSoco.volume = (Number($volumeGeral.val()) / 100) * volumeSFX;
        }
    }

    atualizarVolumeMusica();
    atualizarVolumeSFX();

    function abrirLoja() {
        $(".FOV").addClass("modo-fov");
        $lojaPainel.addClass("aberta");
    }

    function fecharLoja() {
        $(".FOV").removeClass("modo-fov");
        $lojaPainel.removeClass("aberta");
    }

    async function carregarRanking() {
        const lista = document.getElementById("rankingLista");
        const status = document.getElementById("rankingStatus");
        lista.replaceChildren();
        status.textContent = "Carregando ranking...";
        $atualizarRanking.prop("disabled", true);

        try {
            const { data, error } = await BancoDeDados.rpc("ranking");

            if (error) throw error;

            const { data: fotosData, error: fotosError } = await BancoDeDados.rpc("listar_fotos_perfil");
            const fotosPorUsuario = new Map();

            if (!fotosError && Array.isArray(fotosData)) {
                fotosData.forEach((itemFoto) => {
                    if (!itemFoto || !itemFoto.usuario) return;
                    fotosPorUsuario.set(String(itemFoto.usuario).trim().toLowerCase(), itemFoto.foto || perfilPadrao);
                });
            } else if (fotosError) {
                console.warn("Não foi possível carregar fotos do ranking:", fotosError);
            }

            if (!data || data.length === 0) {
                status.textContent = "Ainda não há jogadores no ranking.";
                return;
            }

            const usuarioAtual = String(jogador || "").toLowerCase();
            data.forEach((item, indice) => {
                const linha = document.createElement("li");
                const posicao = document.createElement("span");
                const avatar = document.createElement("img");
                const nome = document.createElement("span");
                const valores = document.createElement("div");
                const saldo = document.createElement("span");
                const recorde = document.createElement("span");
                const nomeJogador = String(item.usuario || "Jogador");
                const pontos = Number(item.score);
                const pontosMaximos = Math.max(
                    Number(item.score_maximo) || 0,
                    Number(item.scoreMaximo) || 0,
                    Number.isFinite(pontos) ? pontos : 0
                );
                const corAvatarRanking = obterCorBordaAvatarPorUsuario(nomeJogador);
                const fotoRanking = fotosPorUsuario.get(nomeJogador.trim().toLowerCase()) || obterFotoPerfilPorUsuario(nomeJogador);

                linha.className = "ranking-item";
                if (usuarioAtual && nomeJogador.toLowerCase() === usuarioAtual) {
                    linha.classList.add("jogador-atual");
                }
                posicao.className = "ranking-posicao";
                posicao.textContent = indice + 1;
                avatar.className = "ranking-avatar";
                avatar.alt = `${nomeJogador} avatar`;
                avatar.src = fotoRanking || perfilPadrao;
                avatar.style.setProperty("--ranking-avatar-border", corAvatarRanking);
                avatar.style.borderColor = corAvatarRanking;
                avatar.onerror = function() {
                    avatar.src = perfilPadrao;
                };
                nome.className = "ranking-nome";
                nome.textContent = nomeJogador;
                valores.className = "ranking-valores";
                saldo.className = "ranking-saldo";
                saldo.textContent = `Saldo: ${Number.isFinite(pontos) ? pontos.toLocaleString("pt-BR") : 0}`;
                recorde.className = "ranking-recorde";
                recorde.textContent = `Recorde: ${pontosMaximos.toLocaleString("pt-BR")}`;
                valores.append(saldo, recorde);
                linha.append(posicao, avatar, nome, valores);
                lista.appendChild(linha);
            });

            status.textContent = "";
        } catch (erro) {
            console.error("Erro ao carregar ranking:", erro.message || erro);
            status.textContent = "Não foi possível carregar o ranking. Verifique a conexão e as permissões do banco.";
        } finally {
            $atualizarRanking.prop("disabled", false);
        }
    }

    function abrirRanking() {
        $(".FOV").addClass("modo-fov");
        $rankingPainel.addClass("aberta");
        carregarRanking();
    }

    function fecharRanking() {
        $(".FOV").removeClass("modo-fov");
        $rankingPainel.removeClass("aberta");
    }

    $loja.on("click", abrirLoja);
    $fecharLoja.on("click", fecharLoja);
    $lojaPainel.on("click", function(event) {
        if (event.target === this) {
            fecharLoja();
        }
    });
    $ranking.on("click", abrirRanking);
    $fecharRanking.on("click", fecharRanking);
    $atualizarRanking.on("click", carregarRanking);
    $rankingPainel.on("click", function(event) {
        if (event.target === this) {
            fecharRanking();
        }
    });

    $(document).on("keydown", function(event) {
        if (event.key === "Escape") {
            fecharLoja();
            fecharRanking();
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
    $volumeGeral.on("input change", function() {
        salvarVolumeLocal(chavesVolumeLocal.geral, this.value);
        atualizarVolumeMusica();
        atualizarVolumeSFX();
    });
    $volumeMusica.on("input change", function() {
        volumeMusica = Number(this.value) / 100;
        salvarVolumeLocal(chavesVolumeLocal.musica, this.value);
        atualizarVolumeMusica();
    });
    $volumeSFX.on("input change", function() {
        volumeSFX = Number(this.value) / 100;
        salvarVolumeLocal(chavesVolumeLocal.efeitos, this.value);
        atualizarVolumeSFX();
    });
});

let totalCliques = 0;
let scoreMaximo = 0;
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
const precisaMigrarTemas =
    temasComprados.size > 0 && Number(melhoriasSalvas.themePriceVersion) !== 2;
const scoreMaximoSalvo = Math.max(
    Number(dadosJogador && dadosJogador.score_maximo) || 0,
    Number(dadosJogador && dadosJogador.scoreMaximo) || 0,
    Number(dadosJogador && dadosJogador["Score maximo"]) || 0,
    Number(melhoriasSalvas.scoreMaximo) || 0
);
scoreMaximo = scoreMaximoSalvo;

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
custoMelhoria = calcularCustoMelhoria(150, 1.25, nivelMelhoriaClique);
custoMelhoriaSegundo = calcularCustoMelhoria(150, 1.4, nivelMelhoriaSegundo);
let upgradesPrecisamSerSalvos =
    Number(melhoriasSalvas.clickCost) !== custoMelhoria ||
    Number(melhoriasSalvas.perSecondCost) !== custoMelhoriaSegundo ||
    (!precisaMigrarTemas && Number(melhoriasSalvas.themePriceVersion) !== 2);

function atualizarMelhoriasSalvas() {
    if (!dadosJogador) return;

    const upgrades = dadosJogador && dadosJogador.upgrades &&
        typeof dadosJogador.upgrades === "object" && !Array.isArray(dadosJogador.upgrades)
        ? dadosJogador.upgrades
        : {};
    const versaoPrecoTemas = temasComprados.size === 0 || Number(melhoriasSalvas.themePriceVersion) === 2
        ? 2
        : melhoriasSalvas.themePriceVersion;

    dadosJogador.upgrades = {
        ...upgrades,
        punchingTheWood: {
            ...melhoriasSalvas,
            clickLevel: nivelMelhoriaClique,
            clickCost: custoMelhoria,
            perSecondLevel: nivelMelhoriaSegundo,
            perSecondCost: custoMelhoriaSegundo,
            scoreMaximo: scoreMaximo,
            ...(versaoPrecoTemas === undefined ? {} : { themePriceVersion: versaoPrecoTemas })
        }
    };
}

function atualizarScoreMaximo() {
    if (totalCliques > scoreMaximo) {
        scoreMaximo = totalCliques;
        atualizarMelhoriasSalvas();
    }
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
    const loteClique = calcularCustoLote(custoMelhoria, 1.25, quantidadeClique);
    const loteSegundo = calcularCustoLote(custoMelhoriaSegundo, 1.4, quantidadeSegundo);
    const proximoCustoClique = Math.ceil(custoMelhoria * 1.25);
    const proximoCustoSegundo = Math.ceil(custoMelhoriaSegundo * 1.4);
    const botaoClique = document.getElementById("comprarMelhoriaClique");
    const botaoSegundo = document.getElementById("comprarMelhoriaSegundo");

    document.getElementById("nivelMelhoriaClique").textContent =
        `Nível: ${nivelMelhoriaClique} | Próximo custo: ${proximoCustoClique} cliques`;
    document.getElementById("nivelMelhoriaSegundo").textContent =
        `Nível: ${nivelMelhoriaSegundo} | Próximo custo: ${proximoCustoSegundo} cliques`;
    botaoClique.textContent = `Comprar (${loteClique.custoTotal} Cliques)`;
    botaoSegundo.textContent = `Comprar (${loteSegundo.custoTotal} Cliques)`;
    botaoClique.disabled = totalCliques < loteClique.custoTotal;
    botaoSegundo.disabled = totalCliques < loteSegundo.custoTotal;
}

function comprarMelhoria() {
    const quantidade = Number(document.getElementById("quantidadeMelhoriaClique").value);
    const lote = calcularCustoLote(custoMelhoria, 1.25, quantidade);

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
    const lote = calcularCustoLote(custoMelhoriaSegundo, 1.4, quantidade);

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
    atualizarScoreMaximo();
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
    contador.innerText = `Saldo: ${totalCliques}`;
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
    atualizarScoreMaximo();
    atualizarMelhoriasSalvas();
    atualizarTela();

    if (totalCliques > 0 && promptInicio) {
        promptInicio.classList.add("escondido");
    }
}

aplicarTemaSalvo();
atualizarBotoesMelhoria();

let cliquesAutomaticosPendentes = 0;

setInterval(function() {
    if (cliquesPorSegundo > 0) {
        cliquesAutomaticosPendentes += cliquesPorSegundo;
        const novosCliques = Math.floor(cliquesAutomaticosPendentes);

        if (novosCliques > 0) {
            cliquesAutomaticosPendentes -= novosCliques;
            totalCliques += novosCliques;
            atualizarScoreMaximo();
            atualizarTela();
        }
    }
}, 1000);

let ultimoSalvo = totalCliques;
let ultimoScoreMaximoSalvo = Number(melhoriasSalvas.scoreMaximo) || 0;
let salvando = false;
let temporizadorSalvar;

async function salvarProgresso() {
    if (!jogador || !senhaJogador || !dadosJogador) return;
    if (salvando) {
        clearTimeout(temporizadorSalvar);
        temporizadorSalvar = setTimeout(salvarProgresso, 500);
        return;
    }
    if (totalCliques === ultimoSalvo && scoreMaximo === ultimoScoreMaximoSalvo && !upgradesPrecisamSerSalvos) return;

    salvando = true;
    const valor = totalCliques;

    try {
        const { error } = await BancoDeDados.rpc("salvar", {
            p_usuario: jogador,
            p_senha: senhaJogador,
            p_score: valor,
            p_inventario: dadosJogador.inventario,
            p_upgrades: dadosJogador.upgrades
        });
        if (error) throw error;

        ultimoSalvo = valor;
        ultimoScoreMaximoSalvo = scoreMaximo;
        upgradesPrecisamSerSalvos = false;
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
    if (totalCliques === ultimoSalvo && scoreMaximo === ultimoScoreMaximoSalvo && !upgradesPrecisamSerSalvos) return;

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
            p_inventario: dadosJogador.inventario,
            p_upgrades: dadosJogador.upgrades
        })
    });

    ultimoSalvo = totalCliques;
    ultimoScoreMaximoSalvo = scoreMaximo;
    upgradesPrecisamSerSalvos = false;
    dadosJogador.score = totalCliques;
    sessionStorage.setItem("dadosJogador", JSON.stringify(dadosJogador));
}

document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "hidden") salvarAoSair();
});
window.addEventListener("pagehide", salvarAoSair);

if (upgradesPrecisamSerSalvos) {
    salvarProgresso();
}

const usuarioInfo = document.querySelector("#usuarioInfo");
const nickJogador = document.querySelector("#nickJogador");
const fotoPerfil = document.querySelector("#fotoPerfil");
const inputFotoPerfil = document.querySelector("#fotoPerfilUpload");
const inputCorBordaAvatar = document.querySelector("#corBordaAvatar");
const chaveCorBordaAvatarLocal = (usuario) => `punching_cor_borda_avatar_${String(usuario || "").trim().toLowerCase()}`;
const corBordaAvatarPadrao = "#72D6A0";

function obterFotoPerfilPorUsuario(usuario) {
    const chavePerfil = chaveFotoPerfilLocal(String(usuario || ""));

    try {
        return localStorage.getItem(chavePerfil) || perfilPadrao;
    } catch (erro) {
        return perfilPadrao;
    }
}

function obterCorBordaAvatarPorUsuario(usuario) {
    const chaveCor = chaveCorBordaAvatarLocal(String(usuario || ""));

    try {
        return localStorage.getItem(chaveCor) || corBordaAvatarPadrao;
    } catch (erro) {
        return corBordaAvatarPadrao;
    }
}

function aplicarCorBordaAvatar(cor) {
    const novaCor = cor || corBordaAvatarPadrao;
    if (fotoPerfil) {
        fotoPerfil.style.borderColor = novaCor;
    }
    document.documentElement.style.setProperty("--avatar-border-color", novaCor);
}

async function atualizarFotoPerfil() {
    if (!fotoPerfil) return;

    const usuarioAtual = String(jogador || "").trim().toLowerCase();
    const fotoLocal = obterFotoPerfilPorUsuario(jogador || "");
    fotoPerfil.src = fotoLocal;
    aplicarCorBordaAvatar(obterCorBordaAvatarPorUsuario(jogador || ""));

    if (!usuarioAtual) return;

    const fotoServidor = await buscarFotoPerfilDoServidor(usuarioAtual);
    if (fotoServidor && fotoServidor !== fotoLocal) {
        fotoPerfil.src = fotoServidor;
        localStorage.setItem(chaveFotoPerfilLocal(jogador), fotoServidor);
    }
}

if (usuarioInfo && nickJogador) {
    nickJogador.textContent = (jogador || "Visitante");
    usuarioInfo.classList.remove("escondido");
    atualizarFotoPerfil();
}

if (inputFotoPerfil) {
    inputFotoPerfil.addEventListener("change", async function(event) {
        const arquivo = event.target.files && event.target.files[0];
        if (!arquivo) return;

        try {
            if (!jogador) {
                throw new Error("Entre na sua conta antes de trocar a foto.");
            }

            const fotoCompactada = await prepararFotoPerfil(arquivo);
            const fotoSalva = await salvarFotoPerfilNoServidor(jogador, senhaJogador, fotoCompactada);
            if (fotoPerfil) {
                fotoPerfil.src = fotoSalva;
            }
            try {
                localStorage.setItem(chaveFotoPerfilLocal(jogador), fotoSalva);
            } catch (erro) {
                console.warn("Foto salva no servidor, mas não foi possível guardá-la no navegador:", erro);
            }
        } catch (erro) {
            console.error("Não foi possível atualizar a foto de perfil:", erro);
            const detalhe = erro && erro.message ? erro.message : "Erro desconhecido.";
            alert(`Não foi possível salvar a foto de perfil. ${detalhe}`);
        } finally {
            inputFotoPerfil.value = "";
        }
    });
}

if (inputCorBordaAvatar) {
    const corAtual = obterCorBordaAvatarPorUsuario(jogador || "");
    inputCorBordaAvatar.value = corAtual;
    aplicarCorBordaAvatar(corAtual);

    inputCorBordaAvatar.addEventListener("input", function(event) {
        const novaCor = event.target.value || corBordaAvatarPadrao;

        if (jogador) {
            localStorage.setItem(chaveCorBordaAvatarLocal(jogador), novaCor);
        }

        aplicarCorBordaAvatar(novaCor);
    });
}