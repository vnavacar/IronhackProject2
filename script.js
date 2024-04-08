const gameState = {
    resources: {
        stone: 0,
        carbon: 0,
        mineralHierro: 0,
        mineralCobre: 0,
        placasHierro: 0,
        PlacasCobre: 0,
        engranajes: 0,
        cableCobre: 0,
        circuitos: 0,
        packsInvestigacion: 0,
        acero: 0,
    },
    buildings: {
        idleDrills: 0,
        stoneDrills: 0,
        coalDrills: 0,
        ironDrills: 0,
        copperDrills: 0,
        idleFurnaces: 0,
        brickFurnaces: 0,
        ironFurnaces: 0,
        copperFurnaces: 0,
        steelFurnaces: 0,
        idleAssembler: 0,
        engranajeAssembler: 0,
        cableAssembler: 0,
        circuitoAssembler: 0,
        packInvestigacionAssembler: 0,
    },
    stats: {
        playTime: 0, // Tiempo de juego en segundos
    }
};


window.onload = () => {
    loadGameState();
    // Actualizar la interfaz de usuario aquí basado en gameState
};



setInterval(() => { // guardar cada 10 segundos
    saveGameState();
}, 10000);

setInterval(() => { // tick del juego, uno cada segundo
    gameTick();
}, 1000);


function gameTick() {
    // Lógica para procesar los recursos cada tick

    // Actualizar estadísticas de tiempo de juego
    gameState.stats.playTime += 1;

    // Actualizar la interfaz de usuario aquí basado en gameState
}

function mineStone() {
    gameState.resources.stone += 1;
}

function mineCoal() {
    gameState.resources.coal += 1;
}

function mineIronOre() {
    gameState.resources.mineralHierro += 1;
}

function mineCopperOre() {
    gameState.resources.mineralCobre += 1;
}

function craftGears(){

    if(gameState.resources.placasHierro >= 2){
        gameState.resources.placasHierro -= 2;
        gameState.resources.engranajes += 1;
    }
}

function craftCopperWire(){

    if(gameState.resources.PlacasCobre >= 1){
        gameState.resources.PlacasCobre -= 1;
        gameState.resources.cableCobre += 2;
    }
}
function craftCircuits(){

    if(gameState.resources.PlacasHierro >= 1 && gameState.resources.cableCobre >= 3){
        gameState.resources.PlacasHierro -= 1;
        gameState.resources.cableCobre -= 3;
        gameState.resources.circuitos += 1;
    }
}

function writeToLog(message) {
    const log = document.getElementById('messageLog');
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString();

    // Crear nuevo elemento de mensaje
    const newMessage = document.createElement('p');
    newMessage.textContent = `[${formattedTime}] ${message}`;

    // Añadir el nuevo mensaje al principio del log
    log.prepend(newMessage);

    // Limitar el número de mensajes en el log a 10
    while (log.children.length > 10) {
        log.removeChild(log.lastChild);
    }
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector('.tablink').click();
});

function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        Object.assign(gameState, JSON.parse(savedState));
    }
}

