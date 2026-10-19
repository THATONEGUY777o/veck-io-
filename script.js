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

        let btnMain = document.getElementById('btnOffline');
        if (btnMain) {
            btnMain.innerHTML = `<i class="fa-solid fa-rocket mr-2"></i> JOGAR ONLINE (SALA: ${roomCode})`;
            btnMain.style.background = "linear-gradient(to right, #10b981, #059669)";

            const newBtn = btnMain.cloneNode(true);
            btnMain.parentNode.replaceChild(newBtn, btnMain);

            newBtn.addEventListener('click', () => {
                const colorBtn = document.querySelector('.color-btn.ring-2');
                const selectedColor = colorBtn ? colorBtn.getAttribute('data-color') : '#00f3ff';
                
                const badge = document.getElementById('activeRoomBadge');
                const roomCodeText = document.getElementById('activeRoomCode');
                if (badge && roomCodeText) {
                    roomCodeText.innerText = roomCode;
                    badge.classList.remove('hidden');
                }

                if (window.gameInstance) {
                    if (typeof audio !== 'undefined') audio.init();
                    window.gameInstance.startOfflineGame(playerName, selectedColor);
                }
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
