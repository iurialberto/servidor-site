const http = require('http');
const https = require('https');
const url = require('url');

const port = process.env.PORT || 3000;

function proxyRequest(clientReq, clientRes) {
    const targetUrl = decodeURIComponent(clientReq.url.replace('/stream/', ''));

    if (!targetUrl) {
        clientRes.statusCode = 400;
        clientRes.end('Erro: URL inválida.');
        return;
    }

    console.log("===============================");
    console.log(`🔄 Proxying: ${targetUrl}`);
    console.log("===============================");

    const parsedUrl = url.parse(targetUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const proxyReq = protocol.request(targetUrl, (proxyRes) => {
        clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(clientRes);
    });

    proxyReq.on('error', (err) => {
        console.error('Erro ao buscar stream:', err.message);
        clientRes.statusCode = 500;
        clientRes.end('Erro ao buscar o stream.');
    });

    proxyReq.end();
}

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/stream/')) {
        proxyRequest(req, res);
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <html>
            <head>
                <title>Player IPTV</title>
                <meta charset="UTF-8" />
                <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
            </head>
            <body style="background:#000;color:#fff;text-align:center;font-family:sans-serif">
                <h2>📺 Sessão Filmes Plus</h2>
                <video id="video" controls autoplay width="90%" style="border-radius:10px;max-width:800px;"></video>
                <script>
                    const video = document.getElementById('video');
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource('/stream/http://rota66.bar:80/QGq4YW/xmtDNc/151056');
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            video.play();
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = '/stream/http://rota66.bar:80/QGq4YW/xmtDNc/151056';
                        video.addEventListener('loadedmetadata', function () {
                            video.play();
                        });
                    }
                </script>
            </body>
            </html>
        `);
    }
});

server.listen(port, () => {
    console.log("===============================");
    console.log(`✅ Servidor proxy rodando na porta ${port}`);
});
