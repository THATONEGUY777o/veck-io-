// Variáveis Globais de Estado do Multiplayer
window.currentRoomCode = null;
window.isOnlineMode = false;
window.isHost = false;

// -------------------------------------------------------------
// 1. Função de Lançar a Cena do Jogo (Modo Offline e Online)
// -------------------------------------------------------------
function launchGameView() {
    console.log("Iniciando a partida...", window.isOnlineMode ? "Modo ONLINE" : "Modo OFFLINE");

    // 1. Esconde o menu principal
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu) {
        mainMenu.style.display = 'none';
    }

    // 2. Exibe o Canvas do jogo e força o tamanho total da janela
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.style.display = 'block';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // 3. Força as variáveis de estado do teu motor de jogo
    if (typeof isPlaying !== 'undefined') isPlaying = true;
    if (typeof gameRunning !== 'undefined') gameRunning = true;
    if (typeof isGameStarted !== 'undefined') isGameStarted = true;

    // 4. Executa exatamente a mesma função que carrega a física/canvas no modo offline
    if (typeof startGame === 'function') {
        startGame();
    } else if (typeof initGame === 'function') {
        initGame();
    } else if (typeof init === 'function') {
        init();
    } else if (typeof animate === 'function') {
        animate();
    } else if (typeof loop === 'function') {
        loop();
    } else {
        console.log("Jogo ativado no Canvas.");
    }
}

// -------------------------------------------------------------
// 2. Função para Criar Sala no Firebase
// -------------------------------------------------------------
function createRoom() {
    // Valida se as referências do Firebase foram carregadas
    if (!window.database || !window.dbRef || !window.dbSet) {
        alert("O servidor Firebase ainda está a conectar. Aguarde um segundo...");
        return;
    }

    // Gera um código único de 6 dígitos
    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const nicknameInput = document.getElementById('nicknameInput');
    const playerName = (nicknameInput && nicknameInput.value.trim() !== "") ? nicknameInput.value : 'CyberPilot';

    // Aponta para o nó 'rooms/CODIGO' no Firebase
    const roomRef = window.dbRef(window.database, 'rooms/' + roomCode);

    window.dbSet(roomRef, {
        host: playerName,
        status: 'waiting',
        createdAt: Date.now()
    }).then(() => {
        console.log("✅ Sala criada no Firebase! Código:", roomCode);

        // Regista o estado da sessão online
        window.currentRoomCode = roomCode;
        window.isOnlineMode = true;
        window.isHost = true;

        // Exibe o código da sala no ecrã
        const roomDisplay = document.getElementById('roomDisplay');
        const activeRoomCode = document.getElementById('activeRoomCode');
        if (roomDisplay && activeRoomCode) {
            activeRoomCode.innerText = roomCode;
            roomDisplay.style.display = 'block';
        }

        // Transforma o botão "JOGAR OFFLINE" em "🚀 JOGAR ONLINE"
        const btnPlay = document.getElementById('btnPlayOffline');
        if (btnPlay) {
            btnPlay.innerText = `🚀 JOGAR ONLINE (SALA: ${roomCode})`;
            btnPlay.style.backgroundColor = "#10b981"; // Verde Neon
            btnPlay.style.color = "#ffffff";

            // Substitui o evento do botão para iniciar a mesma transição/loop do modo offline
            const newBtn = btnPlay.cloneNode(true);
            btnPlay.parentNode.replaceChild(newBtn, btnPlay);

            newBtn.addEventListener('click', () => {
                launchGameView();
            });
        }

    }).catch((error) => {
        console.error("Erro ao guardar sala no Firebase:", error);
        alert("Falha ao criar a sala. Verifique a ligação à internet.");
    });
}

// -------------------------------------------------------------
// 3. Configuração dos Botões ao Carregar a Página
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Botão de Criar Sala
    const btnCreate = document.getElementById('btnCreateRoom');
    if (btnCreate) {
        btnCreate.addEventListener('click', createRoom);
    }

    // Botão padrão de Jogar Offline
    const btnPlay = document.getElementById('btnPlayOffline');
    if (btnPlay) {
        btnPlay.addEventListener('click', () => {
            window.isOnlineMode = false;
            launchGameView();
        });
    }
});

// Ajusta o Canvas se a janela mudar de tamanho
window.addEventListener('resize', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas && canvas.style.display === 'block') {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});
