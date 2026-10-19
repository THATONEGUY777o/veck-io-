// -------------------------------------------------------------
// 1. Função para Iniciar a Partida Online (Sem Bots)
// -------------------------------------------------------------
function startOnlineMatch(playerName, roomCode) {
    const colorBtn = document.querySelector('.color-btn.ring-2');
    const selectedColor = colorBtn ? colorBtn.getAttribute('data-color') : '#00f3ff';

    // Exibe o código da sala no badge superior
    const badge = document.getElementById('activeRoomBadge');
    const roomCodeText = document.getElementById('activeRoomCode');
    if (badge && roomCodeText) {
        roomCodeText.innerText = roomCode;
        badge.classList.remove('hidden');
    }

    // Inicializa o áudio do jogo
    if (typeof audio !== 'undefined' && audio.init) {
        audio.init();
    }

    if (window.gameInstance) {
        // Limpa jogadores anteriores e bots da memória
        window.gameInstance.players.clear();
        window.gameInstance.bullets = [];

        // Cria apenas o teu jogador local na arena
        const myId = 'player_' + Math.random().toString(36).substring(2, 9);
        const sp = window.gameInstance.spawnPoints[Math.floor(Math.random() * window.gameInstance.spawnPoints.length)];
        
        window.gameInstance.localPlayer = new Player(myId, playerName, selectedColor, sp.x, sp.y, false);
        window.gameInstance.players.set(myId, window.gameInstance.localPlayer);

        // Inicia o Canvas do jogo
        window.gameInstance.startGameLoop();
        window.gameInstance.addChatMessage('SYS', `Conectado à sala online: ${roomCode}`);
    }
}

// -------------------------------------------------------------
// 2. Função para Criar Sala
// -------------------------------------------------------------
function createRoom() {
    if (!window.database || !window.dbRef || !window.dbSet) {
        alert("A conectar ao Firebase, aguarde 2 segundos...");
        return;
    }

    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const nicknameInput = document.getElementById('playerNameInput');
    const playerName = (nicknameInput && nicknameInput.value.trim() !== "") ? nicknameInput.value : 'CyberPilot';

    const roomRef = window.dbRef(window.database, 'rooms/' + roomCode);

    window.dbSet(roomRef, {
        host: playerName,
        status: 'waiting',
        createdAt: Date.now()
    }).then(() => {
        console.log("Sala gerada no Firebase:", roomCode);

        // Altera o botão principal para "JOGAR ONLINE"
        let btnMain = document.getElementById('btnOffline');
        if (btnMain) {
            btnMain.innerHTML = `<i class="fa-solid fa-rocket mr-2"></i> JOGAR ONLINE (SALA: ${roomCode})`;
            btnMain.style.background = "linear-gradient(to right, #10b981, #059669)";

            const newBtn = btnMain.cloneNode(true);
            btnMain.parentNode.replaceChild(newBtn, btnMain);

            newBtn.addEventListener('click', () => {
                startOnlineMatch(playerName, roomCode);
            });
        }

    }).catch((error) => {
        console.error("Erro ao criar sala:", error);
        alert("Erro ao registar a sala no servidor.");
    });
}

// -------------------------------------------------------------
// 3. Função para Entrar numa Sala Existente
// -------------------------------------------------------------
function joinRoom() {
    if (!window.database || !window.dbRef || !window.dbGet) {
        alert("A conectar ao Firebase, aguarde 2 segundos...");
        return;
    }

    const roomInput = document.getElementById('roomCodeInput');
    const roomCode = roomInput ? roomInput.value.trim().toUpperCase() : "";

    if (roomCode.length < 5) {
        alert("Por favor, digita um código de sala válido!");
        return;
    }

    const nicknameInput = document.getElementById('playerNameInput');
    const playerName = (nicknameInput && nicknameInput.value.trim() !== "") ? nicknameInput.value : 'GuestPilot';

    const roomRef = window.dbRef(window.database, 'rooms/' + roomCode);

    // Verifica se a sala existe no Firebase
    window.dbGet(roomRef).then((snapshot) => {
        if (snapshot.exists()) {
            console.log("Sala encontrada! Entrando na sala:", roomCode);
            startOnlineMatch(playerName, roomCode);
        } else {
            alert("Sala não encontrada! Confirma o código digitado.");
        }
    }).catch((error) => {
        console.error("Erro ao procurar sala:", error);
        alert("Erro ao conectar à sala.");
    });
}

// -------------------------------------------------------------
// 4. Associação dos Eventos dos Botões
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Botão Criar Sala
    const btnCreate = document.getElementById('btnCreateRoom');
    if (btnCreate) {
        btnCreate.addEventListener('click', createRoom);
    }

    // Botão que exibe o campo para digitar o código
    const btnJoinRoom = document.getElementById('btnJoinRoom');
    if (btnJoinRoom) {
        btnJoinRoom.addEventListener('click', () => {
            const container = document.getElementById('roomInputContainer');
            if (container) container.classList.toggle('hidden');
        });
    }

    // Botão "ENTRAR" que confirma a junção à sala
    const btnConfirmJoin = document.getElementById('btnConfirmJoin');
    if (btnConfirmJoin) {
        btnConfirmJoin.addEventListener('click', joinRoom);
    }
});
