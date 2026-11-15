        document.addEventListener("DOMContentLoaded", () => {
            const playButton = document.getElementById("playButton");
            const audio = document.getElementById("bgm");

            playButton.addEventListener("click", () => {
                document.body.classList.add("started");
                document.getElementById("botaoCriar").disabled = false;
                document.getElementById("botaoEntrar").disabled = false;
                document.getElementById("botaoInformacoes").disabled = false;

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

    let BtEntrar = $("#botaoEntrar");

function mudandoPagina() {
    $("#botaoCriar, #botaoEntrar, #botaoInformacoes").prop("disabled", true);

    $("#UsuarioEntrar").prop("disabled", false);
    $("#SenhaEntrar").prop("disabled", false);
    $("#entrar").prop("disabled", false);

    $("#botaoCriar, #botaoEntrar, #botaoInformacoes")
        .removeClass("visivel")
        .addClass("escondido");

        $(".entrando")
            .removeClass("escondido")
            .addClass("visivel");
    }

    function voltarPagina() {
        $("#botaoCriar, #botaoEntrar, #botaoInformacoes")
            .removeClass("escondido")
            .addClass("visivel");

        $("#botaoInformacoes").prop("disabled", false);

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
    $("#botaoCriar, #botaoEntrar, #botaoInformacoes").prop("disabled", true);

    $("#UsuarioCriar").prop("disabled", false);
    $("#SenhaCriar").prop("disabled", false);
    $("#criar").prop("disabled", false);

    $("#botaoCriar, #botaoEntrar, #botaoInformacoes")
        .removeClass("visivel")
        .addClass("escondido");

        $(".criando")
            .removeClass("escondido")
            .addClass("visivel");
    }

    function voltarPagina() {
        $("#botaoCriar, #botaoEntrar, #botaoInformacoes")
            .removeClass("escondido")
            .addClass("visivel");

        $("#botaoInformacoes").prop("disabled", false);

        $(".criando")
            .removeClass("visivel")
            .addClass("escondido");
    }

    BtCriar.on("click", mudandoPagina);

    $("#botaoVoltar").on("click", voltarPagina);

});
$(document).ready(function() {

    function voltarInicio() {
        $("body").removeClass("started");

        $("#botaoCriar, #botaoEntrar, #botaoInformacoes")
            .prop("disabled", true)
            .removeClass("escondido")
            .removeClass("visivel");

        $("#botaoInformacoes").prop("disabled", false);

        $(".entrando").removeClass("visivel");
        $("#UsuarioEntrar").prop("disabled", true).val("");
        $("#SenhaEntrar").prop("disabled", true).val("");
        $("#entrar").prop("disabled", true);

        $(".criando").removeClass("visivel");
        $("#UsuarioCriar").prop("disabled", true).val("");
        $("#SenhaCriar").prop("disabled", true).val("");
        $("#criar").prop("disabled", true);
    }

    $("#botaoVoltar").on("click", voltarInicio);

});

// BOTÃO INFORMAÇÕES
$(document).ready(function() {
    $("#botaoInformacoes").on("click", function() {
        $("#botaoCriar, #botaoEntrar, #botaoInformacoes")
            .addClass("escondido");
        $(".informacoes").addClass("visivel");
    });

    $("#fecharInformacoes").on("click", function() {
        $(".informacoes").removeClass("visivel");
        $("#botaoCriar, #botaoEntrar, #botaoInformacoes")
            .removeClass("escondido");
    });

    // VOLTAR DAS INFORMAÇÕES
    $("#botaoVoltar").on("click", function() {
        if ($(".informacoes").hasClass("visivel")) {
            $(".informacoes").removeClass("visivel");
            $("#botaoCriar, #botaoEntrar, #botaoInformacoes")
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
