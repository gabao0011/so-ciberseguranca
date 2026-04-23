# S.O. & Cibersegurança — 1° DEV

Site didático em português sobre **Sistemas Operacionais** e **Cibersegurança**, voltado para
estudantes do 2° ano do Ensino Médio (1° DEV) — com aulas teóricas, minigames interativos
e quizzes.

## Como rodar localmente

É um site 100% estático (HTML + CSS + JS puro, sem build). Basta abrir `index.html` em um
navegador ou servir a pasta com qualquer servidor estático:

```bash
# Python 3
python3 -m http.server 8000

# Node (npx)
npx serve .
```

Depois acesse `http://localhost:8000`.

## Estrutura

```
index.html              Landing
so.html                 Índice do módulo S.O.
cyber.html              Índice do módulo Cibersegurança
so-*.html               Aulas de S.O. + quiz final
cyber-*.html            Aulas de Cibersegurança + quiz final
minigames.html          Hub de jogos + flashcards
glossario.html          Glossário pesquisável
css/style.css           Estilos do site
js/layout.js            Header, sidebar e rodapé compartilhados
js/quiz.js              Engine de quizzes
js/games/*.js           Minigames (scheduler, paging, chmod, phishing, password, caesar)
```

## Conteúdo

### Sistemas Operacionais (10 aulas + quiz)
1. Introdução aos S.O.
2. História e evolução
3. Tipos de S.O.
4. Processos e Threads
5. Escalonamento de CPU (com simulador FCFS/SJF/RR)
6. Gerência de memória (com simulador de paginação FIFO/LRU)
7. Sistema de arquivos (com jogo de permissões `chmod`)
8. Deadlocks e concorrência
9. Entrada e Saída (E/S)
10. Virtualização e Nuvem

### Cibersegurança (12 aulas + quiz)
1. O que é Cibersegurança
2. Tríade CIA e princípios
3. Tipos de ameaças
4. Malware
5. Engenharia social (com radar antiphishing)
6. Senhas e autenticação (com medidor de força de senha)
7. Criptografia (com Cifra de César interativa)
8. Redes e firewall
9. Segurança Web e mobile
10. Privacidade e LGPD
11. Boas práticas e hábitos
12. Carreira em Cibersegurança

## Licença

Material didático — uso pedagógico livre.
