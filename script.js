const gameState = {
    resources: {
        stone: 0,
        carbon: 0,
        mineralHierro: 0,
        mineralCobre: 0,
        placasHierro: 0,
        placasCobre: 0,
        brick: 0,
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
    research: {
        drillEfficiency: 0, 
        furnaceEfficiency: 0, 
        assemblerEfficiency: 0, 
    },
    stats: {
        playTime: 0, // Tiempo de juego en segundos
    }
};

function updateResources() {
    for (const [key, value] of Object.entries(gameState.resources)) {
        const resourceId = `resource_${key}`;
        const resourceElement = document.getElementById(resourceId);
        if (resourceElement) {
            resourceElement.children[0].textContent = value;
        }
    }
    
    //document.getElementById("idleDrills").textContent = gameState.buildings.idleDrills;
    //document.getElementById("idleFurnaces").textContent = gameState.buildings.idleFurnaces;
    //document.getElementById("idleAssemblers").textContent = gameState.buildings.idleAssembler;
}

function updateBuildingCounts() {
    for (const [key, value] of Object.entries(gameState.buildings)) {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = value;
        }
    }
}


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

// GAME TICK MAESTOR -------------------------
function gameTick() {
    // Lógica para procesar los recursos cada tick
    processAllDrills();
    processAllFurnaces();
    processAllAssemblers();

    // Actualizar estadísticas de tiempo de juego
    gameState.stats.playTime += 1;
    updateGameTime();

    // Actualizar la interfaz de usuario aquí basado en gameState
    updateResources();
    updateBuildingCounts();
}
// --------------------------------------------------------

function processAllDrills() {
    const drills = [
        { type: 'coalDrills', resource: 'carbon' },
        { type: 'stoneDrills', resource: 'stone' },
        { type: 'ironDrills', resource: 'mineralHierro' },
        { type: 'copperDrills', resource: 'mineralCobre' }
    ];
    document.getElementById(resource_carbon).style.color = '';
    drills.forEach(drill => {
        const drillCount = gameState.buildings[drill.type];
        if(gameState.resources.carbon >= drillCount*0.1){
            const production = drillCount * (1 + gameState.research.drillEfficiency); // Aumenta producción basada en la investigación
            gameState.resources[drill.resource] += production;
            gameState.carbon -= drillCount*0.1;
        }
        else{
            document.getElementById(resource_carbon).style.color = 'red';
        }

    });
}

function processAllFurnaces() {
    const furnaces = [
        { type: 'brickFurnaces', inputResource: 'stone', outputResource: 'ladrillos', inputAmount: 2, outputAmount: 1, resourceId: 'resource_stone' },
        { type: 'ironFurnaces', inputResource: 'mineralHierro', outputResource: 'placasHierro', inputAmount: 1, outputAmount: 1, resourceId: 'resource_mineralHierro' },
        { type: 'copperFurnaces', inputResource: 'mineralCobre', outputResource: 'placasCobre', inputAmount: 1, outputAmount: 1, resourceId: 'resource_mineralCobre' },
        { type: 'steelFurnaces', inputResource: 'placasHierro', outputResource: 'acero', inputAmount: 3, outputAmount: 1, resourceId: 'resource_placasHierro' }
    ];

    // Inicialmente, asumimos que todos los recursos están disponibles
    furnaces.forEach(furnace => document.getElementById(furnace.resourceId).style.color = '');

    furnaces.forEach(furnace => {
        const furnaceCount = gameState.buildings[furnace.type];
        const carbonNeeded = furnaceCount * 0.1;
        if (gameState.resources.carbon >= carbonNeeded) {
            const possibleProduction = Math.floor(gameState.resources[furnace.inputResource] / furnace.inputAmount);
            const actualProduction = Math.min(possibleProduction, furnaceCount * (1 + gameState.research.furnaceEfficiency));
            
            if (actualProduction > 0) {
                gameState.resources.carbon -= carbonNeeded;
                gameState.resources[furnace.inputResource] -= actualProduction * furnace.inputAmount;
                gameState.resources[furnace.outputResource] += actualProduction * furnace.outputAmount;
            } else {
                // Faltan inputs
                document.getElementById(furnace.resourceId).style.color = 'red';
            }
        } else {
            // Falta carbon
            document.getElementById('resource_carbon').style.color = 'red';
        }
    });
}

function processAllAssemblers() {
    const assemblers = [
        { type: 'engranajeAssembler', inputResources: [{ resource: 'placasHierro', amount: 2 }], outputResource: 'engranajes', outputAmount: 1 },
        { type: 'cableAssembler', inputResources: [{ resource: 'placasCobre', amount: 1 }], outputResource: 'cableCobre', outputAmount: 2 },
        { type: 'circuitoAssembler', inputResources: [{ resource: 'cableCobre', amount: 3 }, { resource: 'placasHierro', amount: 1 }], outputResource: 'circuitos', outputAmount: 1 },
        { type: 'packInvestigacionAssembler', inputResources: [{ resource: 'engranajes', amount: 1 }, { resource: 'placasCobre', amount: 1 }], outputResource: 'packsInvestigacion', outputAmount: 1 }
    ];

    assemblers.forEach(assembler => {
        const assemblerCount = gameState.buildings[assembler.type];
        let canProduce = true;

        // Verificar si hay suficientes recursos para cada input requerido
        assembler.inputResources.forEach(input => {
            if (gameState.resources[input.resource] < input.amount * assemblerCount) {
                canProduce = false;
                document.getElementById(`resource_${input.resource}`).style.color = 'red'; // Marcar en rojo si falta
            }
        });

        // Si hay suficientes recursos, proceder con la producción
        if (canProduce) {
            assembler.inputResources.forEach(input => {
                gameState.resources[input.resource] -= input.amount * assemblerCount; // Consumir recursos
            });
            gameState.resources[assembler.outputResource] += assembler.outputAmount * assemblerCount; // Añadir producto

            // Restablecer el color de los recursos de entrada después de la producción
            assembler.inputResources.forEach(input => {
                document.getElementById(`resource_${input.resource}`).style.color = ''; // Restablecer color
            });
        }
    });
}

function buildBuilding(buildingType) {
    const cost = {
        drill: { engranajes: 5, placasHierro: 10 },
        furnace: { stone: 10 },
        assembler: { circuitos: 1, engranajes: 4, placasHierro: 10 }
    };

    let canBuild = true;
    if (cost[buildingType]) {
        Object.entries(cost[buildingType]).forEach(([resource, amount]) => {
            if (gameState.resources[resource] < amount) {
                writeToLog(`No hay suficiente ${resource} para construir ${buildingType}.`);
                canBuild = false;
            }
        });

        if (canBuild) {
            Object.entries(cost[buildingType]).forEach(([resource, amount]) => {
                gameState.resources[resource] -= amount;
            });

            switch(buildingType) {
                case 'drill':
                    gameState.buildings.idleDrills++;
                    break;
                case 'furnace':
                    gameState.buildings.idleFurnaces++;
                    break;
                case 'assembler':
                    gameState.buildings.idleAssembler++;
                    break;
                default:
                    writeToLog("Error de edificio invalido");
                    return;
            }

            writeToLog(`${buildingType} Construido.`);
        }
    } else {
        writeToLog("Error de edificio invalido");
    }
}

function assignBuilding(from, to) {
    if (gameState.buildings[from] > 0) {
        gameState.buildings[from]--;
        gameState.buildings[to]++;
        console.log(`Assigned one building from ${from} to ${to}.`);
    } else {
        console.log(`No ${from} available to assign.`);
    }
}


function mineStone() {
    gameState.resources.stone += 1;
    updateResources();
}

function mineCoal() {
    gameState.resources.carbon += 1;
    updateResources();
}

function mineIronOre() {
    gameState.resources.mineralHierro += 1;
    updateResources();
}

function mineCopperOre() {
    gameState.resources.mineralCobre += 1;
    updateResources();
}

function craftGears(){

    if(gameState.resources.placasHierro >= 2){
        gameState.resources.placasHierro -= 2;
        gameState.resources.engranajes += 1;
        updateResources();
    }
    else{
        writeToLog("Necesitas 2 placas de hierro para construir un engranaje");
    }
}

function craftCopperWires(){

    if(gameState.resources.PlacasCobre >= 1){
        gameState.resources.PlacasCobre -= 1;
        gameState.resources.cableCobre += 2;
        updateResources();
    }
    else{
        writeToLog("Necesitas 1 placa de cobre para construir cable");
    }
}
function craftCircuits(){

    if(gameState.resources.PlacasHierro >= 1 && gameState.resources.cableCobre >= 3){
        gameState.resources.PlacasHierro -= 1;
        gameState.resources.cableCobre -= 3;
        gameState.resources.circuitos += 1;
        updateResources();
    }
    else{
        writeToLog("Necesitas 1 placa de hierro y 3 cables para construir un circuito");
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
function updateGameTime() {
    gameState.stats.playTime += 1;
    document.getElementById('gameTime').textContent = gameState.stats.playTime;
}
