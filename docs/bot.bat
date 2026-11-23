@echo off
chcp 65001 >nul
title TapMonika Telegram Bot
cd /d "%~dp0"
echo Запуск bot.js...
node bot.js
echo.
echo Бот остановлен или произошла ошибка.
pause