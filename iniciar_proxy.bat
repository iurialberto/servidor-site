@echo off
title INICIANDO PROXY IPTV...

echo ===============================
echo       INICIANDO PROXY...
echo ===============================

cd /d "C:\Users\Gael & Eloá\Desktop\BOTS\pegar m3u"

:: Verifica se o FFmpeg está instalado
where ffmpeg >nul 2>nul
if errorlevel 1 (
    echo ❌ FFmpeg não está instalado ou não está no PATH!
    pause
    exit
)

:: Inicia o Node.js
node proxy.js

echo ===============================
echo        PROXY ENCERRADO
echo ===============================
pause
