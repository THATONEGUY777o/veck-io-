// Função para entrar na sala online sem bots
function startOnlineMatch(playerName, roomCode) {
    const colorBtn = document.querySelector('.color-btn.ring-2');
    const selectedColor = colorBtn ? colorBtn.getAttribute('data-color') : '#00f3ff';

    // Exibe o código da sala no topo
    const badge = document.getElementById('activeRoomBadge');
    const roomCodeText = document.getElementById('activeRoomCode');
    if (badge && roomCodeText) {
        roomCodeText.innerText = roomCode;
        badge.classList.remove('hidden');
    }

    if (typeof audio !== 'undefined' && audio.init) {
        audio.init();
    }

    if (window.gameInstance) {
        // 1. Limpa os jogadores antigos e os bots da memória
        window.gameInstance.players.clear();
        window.gameInstance.bullets = [];

        // 2. Cria apenas o teu jogador local
        const myId = 'player_' + Math.random().toString(36).substring(2, 9);
        const sp = window.gameInstance.spawnPoints[Math.floor(Math.random() * window.gameInstance.spawnPoints.length)];
        
        window.gameInstance.localPlayer = new Player(myId, playerName, selectedColor, sp.x, sp.y, false);
        window.gameInstance.players.set(myId, window.gameInstance.localPlayer);

        // 3. Inicia o loop do Canvas sem criar bots
        window.gameInstance.startGameLoop();
        window.gameInstance.addChatMessage('SYS', `Conectado à sala online: ${roomCode}`);
    }
}

// Função de criar sala no Firebase
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

        // Transforma o botão em "JOGAR ONLINE"
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
        alert("Erro ao registar a sala.");
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnCreate = document.getElementById('btnCreateRoom');
    if (btnCreate) {
        btnCreate.addEventListener('click', createRoom);
    }
});
