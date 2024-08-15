// Obtém parâmetros da URL
const urlParams = new URLSearchParams(window.location.search);
const subcategoria = urlParams.get('subcategoria');
const video = document.getElementById('video');
const hls = new Hls();
const streams = [];
// const jsonFiles = ['json/Animes dublados.json', 'json/TV.json', 'json/Desenhos.json'];
require('dotenv').config(); // Carrega as variáveis do .env no ambiente de desenvolvimento

// Para produção, Netlify injeta as variáveis de ambiente automaticamente
const token = process.env.GITHUB_API_KEY;

const jsonFiles = [
    'https://raw.githubusercontent.com/Talison8/lerdo/main/Animes%20dublados.json',
    'https://raw.githubusercontent.com/Talison8/lerdo/main/json/TV.json',
    'https://raw.githubusercontent.com/Talison8/lerdo/main/json/Desenhos.json'
];

// Função para carregar e processar cada JSON
const loadJSONData = (url) => {
    return fetch(url, {
        headers: {
            'Authorization': `token ${token}`, // Usa o token para autenticação
            'Accept': 'application/vnd.github.v3.raw'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    });
};

// Carrega todos os arquivos JSON
Promise.all(jsonFiles.map(file => loadJSONData(file)))
    .then(jsonDataArray => {
        // Combina os dados de todos os arquivos JSON em um único array
        const allData = [].concat(...jsonDataArray);

        // Filtra os animes pela subcategoria clicada
        const filteredAnimes = allData.filter(anime => anime['Subcategoria'] === subcategoria);

        const episodesContainer = document.getElementById('episodes-container');
        const videoTitle = document.getElementById('video-title');

        // Cria elementos para cada anime filtrado e adiciona na página
        filteredAnimes.forEach((canal, index) => {
            const episodeDiv = document.createElement('div');
            episodeDiv.classList.add('episode');
            episodeDiv.dataset.episode = index;
            episodeDiv.innerHTML = `
                <img src="${canal['Logo do Canal']}" alt="${canal['Nome do Canal']}" style="width:150px;height:150px;">
                <h3>${canal['Nome do Canal']}</h3>
            `;
            episodeDiv.onclick = () => changeStream(index);
            episodesContainer.appendChild(episodeDiv);

            streams.push(canal['URL do Canal']);
        });

        // Função para trocar o stream de vídeo
        function changeStream(index) {
            const streamUrl = streams[index];
            videoTitle.textContent = filteredAnimes[index]['Nome do Canal'];

            if (streamUrl.endsWith('.m3u8')) {
                if (Hls.isSupported()) {
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        video.play().catch(error => console.error('Erro ao reproduzir o vídeo:', error));
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    video.play().catch(error => console.error('Erro ao reproduzir o vídeo:', error));
                } else {
                    console.error('Seu navegador não suporta HLS.');
                }
            } else if (streamUrl.endsWith('.mp4')) {
                video.src = streamUrl;
                video.play().catch(error => console.error('Erro ao reproduzir o vídeo:', error));
            } else {
                console.error('Formato de vídeo não suportado.');
            }
        }

        // Inicia o primeiro stream, se houver
        if (streams.length > 0) {
            changeStream(0);
        }
    })
    .catch(error => console.error('Erro ao carregar os JSONs:', error));


    // // Recupera o tempo salvo do vídeo
    // const savedTime = localStorage.getItem('videoTime');
    // if (savedTime !== null) {
    //     video.currentTime = parseFloat(savedTime);
    // }

    // // Salva o tempo do vídeo a cada atualização
    // video.addEventListener('timeupdate', () => {
    //     localStorage.setItem('videoTime', video.currentTime);
    // });

    // Marca episódios vistos e atualiza o localStorage
    const episodeLinks = document.querySelectorAll('.episode');
    episodeLinks.forEach(link => {
        const episodeId = link.getAttribute('data-episode');
        const episodeSeen = localStorage.getItem(`episodeSeen-${episodeId}`);

        if (episodeSeen) {
            link.classList.add('episode-seen');
        }

        link.addEventListener('click', () => {
            localStorage.setItem(`episodeSeen-${episodeId}`, 'true');
            link.classList.add('episode-seen');
        });
    });

    // Adiciona eventos aos botões de interação
    const likeButton = document.getElementById("like-button");
    const dislikeButton = document.getElementById("dislike-button");
    const shareButton = document.getElementById("share-button");

    likeButton.addEventListener("click", () => {
        alert("Você gostou deste vídeo!");
    });

    dislikeButton.addEventListener("click", () => {
        alert("Você não gostou deste vídeo.");
    });

    shareButton.addEventListener("click", () => {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                url: window.location.href
            }).then(() => {
                console.log('Conteúdo compartilhado com sucesso');
            }).catch(console.error);
        } else {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                alert("URL copiada para a área de transferência!");
            }, () => {
                alert("Falha ao copiar URL para a área de transferência.");
            });
        }
    });

    // Adiciona e exibe novos comentários
    const commentForm = document.getElementById("comment-form");
    const commentsList = document.getElementById("comments-list");

    commentForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const commentUser = document.getElementById("comment-user").value;
        const commentText = document.getElementById("comment-text").value;

        const newComment = document.createElement("div");
        newComment.classList.add("comment");

        const newUser = document.createElement("div");
        newUser.classList.add("user");
        newUser.textContent = commentUser;

        const newText = document.createElement("div");
        newText.classList.add("text");
        newText.textContent = commentText;

        newComment.appendChild(newUser);
        newComment.appendChild(newText);

        commentsList.appendChild(newComment);

        commentForm.reset();
    });















