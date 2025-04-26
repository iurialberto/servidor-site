const http = require('http');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const port = 3000;
const hlsFolder = './hls';

if (!fs.existsSync(hlsFolder)) {
    fs.mkdirSync(hlsFolder);
}

function startHLSProxy(req, res) {
    const urlStream = decodeURIComponent(req.url.replace('/stream/', ''));

    if (!urlStream) {
        res.statusCode = 400;
        res.end('Erro: URL do stream não fornecida');
        return;
    }

    console.log("===============================");
    console.log("      INICIANDO PROXY...");
    console.log("===============================");
    console.log(`Iniciando o proxy para: ${urlStream}`);

    const outputPath = `${hlsFolder}/stream.m3u8`;

    // Limpa pasta hls
    try {
        fs.rmSync(hlsFolder, { recursive: true, force: true });
    } catch (e) { }
    fs.mkdirSync(hlsFolder);

    ffmpeg(urlStream)
        .inputOptions([
            '-user_agent', 'Mozilla/5.0',
            '-timeout', '5000000'
        ])
        .outputOptions([
            '-c:v libx264',
            '-c:a aac',
            '-preset veryfast',
            '-f hls',
            '-hls_time 4',
            '-hls_list_size 5',
            '-hls_flags delete_segments'
        ])
        .output(outputPath)
        .on('start', commandLine => {
            console.log('FFmpeg iniciado:', commandLine);
        })
        .on('end', () => {
            console.log('Transmissão finalizada.');
        })
        .on('error', err => {
            console.error('Erro no FFmpeg:', err.message);
        })
        .run();

    // Mostra página com player após 4 segundos
    setTimeout(() => {
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
                    if (Hls.isSupported()) {
                        const video = document.getElementById('video');
                        const hls = new Hls();
                        hls.loadSource('/hls/stream.m3u8');
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            video.play();
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = '/hls/stream.m3u8';
                        video.addEventListener('loadedmetadata', function () {
                            video.play();
                        });
                    }
                </script>
            </body>
            </html>
        `);
    }, 4000);
}

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/stream/')) {
        startHLSProxy(req, res);
    } else if (req.url.startsWith('/hls/')) {
        const filePath = `.${req.url}`;
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.statusCode = 404;
                res.end('Arquivo não encontrado');
            } else {
                const contentType = req.url.endsWith('.m3u8')
                    ? 'application/vnd.apple.mpegurl'
                    : 'video/MP2T';
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    } else {
        res.statusCode = 404;
        res.end('URL inválida');
    }
});

server.listen(port, () => {
    console.log("===============================");
    console.log(`Proxy IPTV HLS rodando em http://localhost:${port}`);
});
