const http = require('http');
const port = process.env.PORT || 3000;

function startPlayer(res, urlStream) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <html>
        <head>
            <title>Player IPTV - Sessão Filmes Plus</title>
            <meta charset="UTF-8" />
            <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
        </head>
        <body style="background:#000;color:#fff;text-align:center;font-family:sans-serif">
            <h2>📺 Sessão Filmes Plus</h2>
            <video id="video" controls autoplay width="90%" style="border-radius:10px;max-width:800px;"></video>
            <script>
                const url = "${urlStream}";
                if (Hls.isSupported()) {
                    const video = document.getElementById('video');
                    const hls = new Hls();
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play();
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    video.addEventListener('loadedmetadata', function () {
                        video.play();
                    });
                }
            </script>
        </body>
        </html>
    `);
}

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/stream/')) {
        const urlStream = decodeURIComponent(req.url.replace('/stream/', ''));
        if (!urlStream) {
            res.statusCode = 400;
            res.end('Erro: URL do stream não fornecida');
            return;
        }
        console.log("===============================");
        console.log("      INICIANDO PLAYER...");
        console.log("===============================");
        console.log(`Reproduzindo: ${urlStream}`);
        startPlayer(res, urlStream);
    } else {
        res.statusCode = 404;
        res.end('URL inválida');
    }
});

server.listen(port, () => {
    console.log("===============================");
    console.log(`Player IPTV rodando em http://localhost:${port}`);
});
