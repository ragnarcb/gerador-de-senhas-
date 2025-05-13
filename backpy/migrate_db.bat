@echo off
echo Apagando e recriando o banco de dados...
set RECREATE_DB=true
python run.py
pause 