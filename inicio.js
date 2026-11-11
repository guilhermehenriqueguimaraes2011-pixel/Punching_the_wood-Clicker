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
    $("#botaoCriar, #botaoEntrar").prop("disabled", true);

    $("#UsuarioEntrar").prop("disabled", false);
    $("#SenhaEntrar").prop("disabled", false);
    $("#entrar").prop("disabled", false);

    $("#botaoCriar, #botaoEntrar")
        .removeClass("visivel")
        .addClass("escondido");

        $(".entrando")
            .removeClass("escondido")
            .addClass("visivel");
    }

    function voltarPagina() {
        $("#botaoCriar, #botaoEntrar")
            .removeClass("escondido")
            .addClass("visivel");

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
    $("#botaoCriar, #botaoEntrar").prop("disabled", true);

    $("#UsuarioCriar").prop("disabled", false);
    $("#SenhaCriar").prop("disabled", false);
    $("#criar").prop("disabled", false);

    $("#botaoCriar, #botaoEntrar")
        .removeClass("visivel")
        .addClass("escondido");

        $(".criando")
            .removeClass("escondido")
            .addClass("visivel");
    }

    function voltarPagina() {
        $("#botaoCriar, #botaoEntrar")
            .removeClass("escondido")
            .addClass("visivel");

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

        $("#botaoCriar, #botaoEntrar")
            .prop("disabled", true)
            .removeClass("escondido")
            .removeClass("visivel");

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

