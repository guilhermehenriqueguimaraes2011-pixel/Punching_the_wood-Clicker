        document.addEventListener("DOMContentLoaded", () => {
            const playButton = document.getElementById("playButton");
            const audio = document.getElementById("bgm");

            playButton.addEventListener("click", () => {
                document.body.classList.add("started");
                document.getElementById("botaoCriar").disabled = false;
                document.getElementById("botaoEntrar").disabled = false;
                document.getElementById("botaoInformacoes").disabled = false;
                document.getElementById("botaoExtras").disabled = false;

                if (audio) {
                    audio.volume = 0;
                    const playPromise = audio.play();

                    if (playPromise !== undefined) {
                        playPromise.catch((error) => {
                            console.error("Não foi possível iniciar a música:", error);
                        });
                    }

                    const fadeIn = setInterval(() => {
                        if (audio.volume < 0.95) {
                            audio.volume = Math.min(audio.volume + 0.05, 1);
                        } else {
                            audio.volume = 1;
                            clearInterval(fadeIn);
                        }
                    }, 200);
                }
            });
        });
        //entrando 
$(document).ready(function() {
    const credenciaisSalvas = (() => {
        try {
            return {
                usuario: localStorage.getItem("punching_usuario_salvo") || "",
                senha: localStorage.getItem("punching_senha_salva") || ""
            };
        } catch (erro) {
            return { usuario: "", senha: "" };
        }
    })();

    if (credenciaisSalvas.usuario && credenciaisSalvas.senha) {
        $("#UsuarioEntrar").val(credenciaisSalvas.usuario);
        $("#SenhaEntrar").val(credenciaisSalvas.senha);
    }

    function configurarAlternanciaSenha(idCampo, idBotao) {
        const campo = document.getElementById(idCampo);
        const botao = document.getElementById(idBotao);
        if (!campo || !botao) return;

        botao.addEventListener("click", function() {
            const mostrarSenha = campo.type === "password";
            campo.type = mostrarSenha ? "text" : "password";
            botao.setAttribute("aria-pressed", String(mostrarSenha));
            botao.setAttribute("aria-label", mostrarSenha ? "Ocultar senha" : "Mostrar senha");
        });
    }

    configurarAlternanciaSenha("SenhaEntrar", "mostrarSenhaEntrar");
    configurarAlternanciaSenha("SenhaCriar", "mostrarSenhaCriar");

    let BtEntrar = $("#botaoEntrar");

function mudandoPagina() {
    $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras").prop("disabled", true);

    $("#SenhaEntrar").attr("type", "password");
    $("#mostrarSenhaEntrar")
        .attr("aria-pressed", "false")
        .attr("aria-label", "Mostrar senha");
    $("#UsuarioEntrar").prop("disabled", false);
    $("#SenhaEntrar").prop("disabled", false);
    $("#entrar").prop("disabled", false);

    $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
        .removeClass("visivel")
        .addClass("escondido");

        $(".entrando")
            .removeClass("escondido")
            .addClass("visivel");
    }

    function voltarPagina() {
        $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
            .removeClass("escondido")
            .addClass("visivel");

        $("#botaoInformacoes, #botaoExtras").prop("disabled", false);

        $(".entrando")
            .removeClass("visivel")
            .addClass("escondido");
    }

    BtEntrar.on("click", mudandoPagina);

    $("#botaoVoltar").on("click", voltarPagina);

});
$(document).ready(function() {

    let BtCriar = $("#botaoCriar");
function mudandoPagina() {
    $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras").prop("disabled", true);

    $("#SenhaCriar").attr("type", "password");
    $("#mostrarSenhaCriar")
        .attr("aria-pressed", "false")
        .attr("aria-label", "Mostrar senha");
    $("#UsuarioCriar").prop("disabled", false);
    $("#SenhaCriar").prop("disabled", false);
    $("#criar").prop("disabled", false);

    $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
        .removeClass("visivel")
        .addClass("escondido");

        $(".criando")
            .removeClass("escondido")
            .addClass("visivel");
    }

    function voltarPagina() {
        $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
            .removeClass("escondido")
            .addClass("visivel");

        $("#botaoInformacoes, #botaoExtras").prop("disabled", false);

        $(".criando")
            .removeClass("visivel")
            .addClass("escondido");
    }

    BtCriar.on("click", mudandoPagina);

    $("#botaoVoltar").on("click", voltarPagina);

});
// BOTÃO EXTRAS
$(document).ready(function() {
    $("#botaoExtras").on("click", function() {
        $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
            .addClass("escondido");
        $(".extras").addClass("visivel");
    });

    $("#fecharExtras").on("click", function() {
        $(".extras").removeClass("visivel");
        $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
            .removeClass("escondido");
    });

    $("#botaoVoltar").on("click", function() {
        if ($(".extras").hasClass("visivel")) {
            $(".extras").removeClass("visivel");
            $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
                .removeClass("escondido");
        }
    });

    $("#verAtualizacoes").on("click", function() {
        $(".extras").removeClass("visivel");
        $(".atualizacoes").addClass("visivel");
    });

    $("#fecharAtualizacoes").on("click", function() {
        $(".atualizacoes").removeClass("visivel");
        $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
            .removeClass("escondido");
    });

    $("#botaoVoltar").on("click", function() {
        if ($(".atualizacoes").hasClass("visivel")) {
            $(".atualizacoes").removeClass("visivel");
            $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
                .removeClass("escondido");
        }
    });
});

$(document).ready(function() {

    function voltarInicio() {
        $("body").removeClass("started");

        $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
            .prop("disabled", true)
            .removeClass("escondido")
            .removeClass("visivel");

        $("#botaoInformacoes").prop("disabled", false);

        $(".entrando").removeClass("visivel");
        $("#UsuarioEntrar").prop("disabled", true).val("");
        $("#SenhaEntrar").prop("disabled", true).val("");
        $("#entrar").prop("disabled", true);

        $(".criando").removeClass("visivel");
        $(".extras").removeClass("visivel");
        $(".atualizacoes").removeClass("visivel");
        $("#UsuarioCriar").prop("disabled", true).val("");
        $("#SenhaCriar").prop("disabled", true).val("");
        $("#criar").prop("disabled", true);
    }

    $("#botaoVoltar").on("click", voltarInicio);

});

// BOTÃO INFORMAÇÕES
$(document).ready(function() {
    $("#botaoInformacoes").on("click", function() {
        $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
            .addClass("escondido");
        $(".informacoes").addClass("visivel");
    });

    $("#fecharInformacoes").on("click", function() {
        $(".informacoes").removeClass("visivel");
        $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
            .removeClass("escondido");
    });

    // VOLTAR DAS INFORMAÇÕES
    $("#botaoVoltar").on("click", function() {
        if ($(".informacoes").hasClass("visivel")) {
            $(".informacoes").removeClass("visivel");
            $("#botaoCriar, #botaoEntrar, #botaoInformacoes, #botaoExtras")
                .removeClass("escondido");
        }
    });
});

        //Banco de dados

     const BancoDeDados = supabase.createClient(
    "https://zeaaeiiwftctedrumuzp.supabase.co",
    "sb_publishable_dPCcGEn70ozMH7gqL44zxQ_qvIMOpFa"
);

function entrarNoJogo(usuario, senha, dados) {
    sessionStorage.setItem("jogador", usuario);
    sessionStorage.setItem("senhaJogador", senha);
    localStorage.setItem("punching_usuario_salvo", usuario);
    localStorage.setItem("punching_senha_salva", senha);
    sessionStorage.setItem("dadosJogador", JSON.stringify(dados));
    window.location.href = "jogo/jogo.html";
}


$("#criar").on("click", async function() {
    const usuario = $("#UsuarioCriar").val().trim().toLowerCase();
    const senha = $("#SenhaCriar").val();
    const $erro = $("#erroCriar");
    $erro.text("");

    try {
        const { error } = await BancoDeDados.rpc("criar_conta", {
            p_usuario: usuario,
            p_senha: senha
        });
        if (error) throw error;

        const { data, error: erroLogin } = await BancoDeDados.rpc("entrar", {
            p_usuario: usuario,
            p_senha: senha
        });
        if (erroLogin) throw erroLogin;

        entrarNoJogo(usuario, senha, data);
    } catch (e) {
        console.error(e.message); 
        $erro.text("Erro ao criar conta.");
    }
});

$("#entrar").on("click", async function() {
    const usuario = $("#UsuarioEntrar").val().trim().toLowerCase();
    const senha = $("#SenhaEntrar").val();
    const $erro = $("#erroEntrar");
    $erro.text("");

    try {
        const { data, error } = await BancoDeDados.rpc("entrar", {
            p_usuario: usuario,
            p_senha: senha
        });
        if (error) throw error;

        entrarNoJogo(usuario, senha, data);
    } catch (e) {
        console.error(e.message);
        $erro.text("Erro ao entrar na conta.");
    }
});
