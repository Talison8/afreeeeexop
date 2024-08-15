document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const hls = new Hls();
    const streams = [];

    fetch('Animes dublados.json')  // Ajuste o caminho conforme necessário
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const episodesContainer = document.getElementById('episodes-container');
            const videoTitle = document.getElementById('video-title');

            data.forEach((canal, index) => {
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

            function changeStream(index) {
                const streamUrl = streams[index];
                videoTitle.textContent = data[index]['Nome do Canal'];

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
            }

            if (streams.length > 0) {
                changeStream(0);
            }
        })
        .catch(error => console.error('Erro ao carregar o JSON:', error));

    const savedTime = localStorage.getItem('videoTime');
    if (savedTime !== null) {
        video.currentTime = parseFloat(savedTime);
    }

    video.addEventListener('timeupdate', () => {
        localStorage.setItem('videoTime', video.currentTime);
    });

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
});
