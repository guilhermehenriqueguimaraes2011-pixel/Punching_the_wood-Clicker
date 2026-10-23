        document.addEventListener("DOMContentLoaded", () => {
            const playButton = document.getElementById("playButton");
            const audio = document.getElementById("bgm");

            playButton.addEventListener("click", () => {
                document.body.classList.add("started");
                document.getElementById("botaoCriar").disabled = false;
                document.getElementById("botaoEntrar").disabled = false;

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