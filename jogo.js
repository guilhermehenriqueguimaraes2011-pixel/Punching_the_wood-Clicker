let cliques = 0;
let contador = document.querySelector("#contadorCliques");
let personagem = document.querySelector(".personagem img");


personagem.addEventListener("click", function() {
    cliques++;
    contador.textContent = cliques;

    personagem.classList.remove("soco");
    let largura = personagem.offsetWidth;
    personagem.classList.add("soco");
});
