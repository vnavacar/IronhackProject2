const gameState = {
    resources: {
        stone: 0,
        carbon: 0,
        mineralHierro: 0,
        mineralCobre: 0,
        placasHierro: 0,
        placasCobre: 0,
        bricks: 0,
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
    progressFlags: {
        spaceshipSalvaged : 0,
    },
    stats: {
        playTime: 0, // Tiempo de juego en segundos
    }
};

const buildingsConfig = [
    { type: 'coalDrills', inputResources: [{ resource: 'carbon', amount: 0.1 }], outputResource: 'carbon', outputAmount: 1 },
    { type: 'stoneDrills', inputResources: [{ resource: 'carbon', amount: 0.1 }], outputResource: 'stone', outputAmount: 1 },
    { type: 'ironDrills', inputResources: [{ resource: 'carbon', amount: 0.1 }], outputResource: 'mineralHierro', outputAmount: 1 },
    { type: 'copperDrills', inputResources: [{ resource: 'carbon', amount: 0.1 }], outputResource: 'mineralCobre', outputAmount: 1 },

    { type: 'brickFurnaces', inputResources: [{ resource: 'stone', amount: 2 },{ resource: 'carbon', amount: 0.1 }], outputResource: 'bricks', outputAmount: 1 },
    { type: 'ironFurnaces', inputResources: [{ resource: 'mineralHierro', amount: 1 },{ resource: 'carbon', amount: 0.1 }], outputResource: 'placasHierro', outputAmount: 1 },
    { type: 'copperFurnaces', inputResources: [{ resource: 'mineralCobre', amount: 1 },{ resource: 'carbon', amount: 0.1 }], outputResource: 'placasCobre', outputAmount: 1 },
    { type: 'steelFurnaces', inputResources: [{ resource: 'placasHierro', amount: 3 },{ resource: 'carbon', amount: 0.1 }], outputResource: 'acero', outputAmount: 1 },

    { type: 'engranajeAssembler', inputResources: [{ resource: 'placasHierro', amount: 2 }], outputResource: 'engranajes', outputAmount: 1 },
    { type: 'cableAssembler', inputResources: [{ resource: 'placasCobre', amount: 1 }], outputResource: 'cableCobre', outputAmount: 2 },
    { type: 'circuitoAssembler', inputResources: [{ resource: 'cableCobre', amount: 3 }, { resource: 'placasHierro', amount: 1 }], outputResource: 'circuitos', outputAmount: 1 },
    { type: 'packInvestigacionAssembler', inputResources: [{ resource: 'engranajes', amount: 1 }, { resource: 'placasCobre', amount: 1 }], outputResource: 'packsInvestigacion', outputAmount: 1 }

];

const researchMapping = {
    'coalDrills': 'drillEfficiency',
    'stoneDrills': 'drillEfficiency',
    'ironDrills': 'drillEfficiency',
    'copperDrills': 'drillEfficiency',

    'brickFurnaces': 'furnaceEfficiency',
    'ironFurnaces': 'furnaceEfficiency',
    'copperFurnaces': 'furnaceEfficiency',
    'steelFurnaces': 'furnaceEfficiency',

    'engranajeAssembler': 'assemblerEfficiency',
    'cableAssembler': 'assemblerEfficiency',
    'circuitoAssembler': 'assemblerEfficiency',
    'packInvestigacionAssembler': 'assemblerEfficiency'
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
    //console.log('Updating building counts', gameState.buildings);
    for (const [key, value] of Object.entries(gameState.buildings)) {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = value;
        } else {
            console.log('Element not found for key:', key);
            writeToLog('Element not found for key mirar consola')
        }
    }
}


document.addEventListener('DOMContentLoaded', (event) => { //Inicializacion de la pagina

    loadGameState();

    updateUpgradeButtons()

    setInterval(gameTick, 1000);
    setInterval(saveGameState,10000);

    checkInitialMessage();
});

// GAME TICK MAESTRO -------------------------
function gameTick() {
    // Lógica para procesar los recursos cada tick
    //processAllDrills();
    //processAllFurnaces();
    //processAllAssemblers();
    processBuildings(buildingsConfig);

    // Actualizar estadísticas de tiempo de juego
    gameState.stats.playTime += 1;
    updateGameTime();

    // Actualizar la interfaz de usuario
    updateResources();
    updateBuildingCounts();
    updateConstructionButtons()
    console.log(gameState)
}
// --------------------------------------------------------

function processBuildings(buildings) {
    buildings.forEach(building => {
        const buildingCount = gameState.buildings[building.type];
        if (!buildingCount) return; // Si no hay edificios de este tipo ignorar
        // return solo termina el forEach para un building

        let canProcess = true;
        let resourcesNeeded = {}; //Objeto conteniendo inputs

        let efficiencyType = researchMapping[building.type] 
        let efficiencyMultiplier = 1 + gameState.research[efficiencyType]

        // inputs necesarios?
        building.inputResources.forEach(input => {
            const totalNeeded = input.amount * buildingCount * efficiencyMultiplier;
            resourcesNeeded[input.resource] = (resourcesNeeded[input.resource] || 0) + totalNeeded;
            if (gameState.resources[input.resource] < totalNeeded) {
                canProcess = false;
                document.getElementById(`resource_${input.resource}`).style.color = 'red';
                writeToLog(`Inputs insuficientes para ${building.type}`);
            }
        });

        // Produccion
        if (canProcess) {
            Object.keys(resourcesNeeded).forEach(resource => {
                gameState.resources[resource] -= resourcesNeeded[resource]; // consumir inputs
                document.getElementById(`resource_${resource}`).style.color = ''; // Restablecer color
            });

            if (building.outputResource && building.outputAmount) { // Para que los idles no rompan js
                gameState.resources[building.outputResource] += building.outputAmount * buildingCount * efficiencyMultiplier; // Añadir outputs
            }
        }
    });
}


function purchaseUpgrade(upgradeType, resourceType, cost) {
    // Verifica si la mejora ya ha sido comprada
    if (gameState.research[upgradeType] >= 1) {
        //console.log("Mejora ya comprada.");
        writeToLog("Mejora ya comprada.");
        return; 
    }

    // Verifica si hay suficientes recursos para la mejora
    if (gameState.resources[resourceType] >= cost) {

        gameState.resources[resourceType] -= cost;

        gameState.research[upgradeType] = 1; 

        // Cambia el estilo del botón para indicar que la mejora ha sido adquirida
        const upgradeButton = document.getElementById(`${upgradeType}Upgrade`);
        upgradeButton.disabled = true; // Ajustar boton despues de comprar
        upgradeButton.style.backgroundColor = "blue"; 
        upgradeButton.textContent = "Mejora Comprada"; 

        //console.log(`Mejora de ${upgradeType} comprada exitosamente.`);
        writeToLog(`Mejora de ${upgradeType} comprada exitosamente.`);
    } else {
        //console.log(`No hay suficientes ${resourceType} para comprar la mejora de ${upgradeType}.`);
        writeToLog(`No hay suficientes ${resourceType} para comprar la mejora de ${upgradeType}.`)
    }
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
            updateBuildingCounts();
        }
    } else {
        writeToLog("Error de edificio invalido");
    }
}

function updateConstructionButtons() { //Actualizar color de botones (puedes construir o no)
    const constructionDetails = [
        { id: 'buildDrillButton', cost:{ engranajes: 5, placasHierro: 10 }},
        { id: 'buildFurnaceButton', cost: { stone: 10 } },
        { id: 'buildAssemblerButton', cost:{ circuitos: 1, engranajes: 4, placasHierro: 10 } }
    ];

    constructionDetails.forEach(detail => {
        const button = document.getElementById(detail.id);
        let canAfford = true;

        Object.entries(detail.cost).forEach(([resource, amount]) => {
            if (gameState.resources[resource] < amount) {
                canAfford = false;
            }
        });

        if (canAfford) {
            button.style.backgroundColor = "#4CAF50"; // Verde, suficientes recursos
        } else {
            button.style.backgroundColor = "#f44336"; // Rojo, no hay suficientes recursos
        }
    });
}


function assignBuilding(from, to) {
    if (gameState.buildings[from] > 0) {
        gameState.buildings[from]--;
        gameState.buildings[to]++;
        console.log(`Assigned one building from ${from} to ${to}.`);
    } else {
        writeToLog(`No quedan ${from} disponibles para asignar`)
    }
    updateBuildingCounts();
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

    if(gameState.resources.placasCobre >= 1){
        gameState.resources.placasCobre -= 1;
        gameState.resources.cableCobre += 2;
        updateResources();
    }
    else{
        writeToLog("Necesitas 1 placa de cobre para construir cable");
    }
}
function craftCircuits(){

    if(gameState.resources.placasHierro >= 1 && gameState.resources.cableCobre >= 3){
        gameState.resources.placasHierro -= 1;
        gameState.resources.cableCobre -= 3;
        gameState.resources.circuitos += 1;
        updateResources();
    }
    else{
        writeToLog("Necesitas 1 placa de hierro y 3 cables para construir un circuito");
    }
}

function checkVictory() {
    const neededPacks = 100;
    if (gameState.resources.packsInvestigacion >= neededPacks) {
        gameState.resources.packsInvestigacion -= neededPacks; 
        writeToLog("Fin del juego, no hay más que ver")
        alert("Fin del juego, no hay más que ver"); 
    } else {
        //alert("Necesitas 100 packs de investigación para terminar el juego.");
        writeToLog("Necesitas 100 packs de investigación para terminar el juego.");
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
    document.getElementById('gameTime').textContent = gameState.stats.playTime;
}

function checkInitialMessage(){
    if (gameState.progressFlags.spaceshipSalvaged === 0) {
        writeToLog("Te has estreñado en un planeta alienigena... Si quieres salir necesitaras recursos... Una fabrica te los podria producir, pero una fabrica requiere recursos... Necesitaras empezar por desguazar tu nave");
    } else {
        document.getElementById("desguazarNave").style.display = "none";
    }
}

function desguazarNave(){
    if(gameState.progressFlags.spaceshipSalvaged === 0){ // porsi acaso
        
        writeToLog("Con estos recursos deberias tener suficiente para unos cuantos taladros, carbon sera un buen punto de partida, lo necesitaras para hornos y taladros, construye tu fabrica poco a poco y cuando tengas una buena cantidad de recursos investiga");

        gameState.resources.placasHierro += 200;
        gameState.resources.engranajes += 40;

        gameState.resources.cableCobre += 100;
        gameState.resources.circuitos += 5;

        gameState.progressFlags.spaceshipSalvaged = 1;
        document.getElementById("desguazarNave").style.display = "none";

    } else {
        writeToLog("Esto no deberia ser possible, pero como intentaste volver a desguazar tu nave?");
    }
}



function updateUpgradeButtons() {
    Object.entries(gameState.research).forEach(([upgradeType, value]) => {
        const upgradeButton = document.getElementById(`${upgradeType}Upgrade`);
        if (value >= 1) {
            upgradeButton.disabled = true;
            upgradeButton.style.backgroundColor = "blue";
            upgradeButton.textContent = "Mejora Comprada";
        } else {
            upgradeButton.disabled = false;
            upgradeButton.style.backgroundColor = ""; 
        }
    });
}

/*
function processAllDrills() {
    const drills = [
        { type: 'coalDrills', resource: 'carbon' },
        { type: 'stoneDrills', resource: 'stone' },
        { type: 'ironDrills', resource: 'mineralHierro' },
        { type: 'copperDrills', resource: 'mineralCobre' }
    ];
    const element = document.getElementById('resource_carbon');
    element.style.color = '';
    //document.getElementById(resource_carbon).style.color = '';
    drills.forEach(drill => {
        const drillCount = gameState.buildings[drill.type];
        if(gameState.resources.carbon >= drillCount*0.1){
            const production = drillCount * (1 + gameState.research.drillEfficiency);
            gameState.resources[drill.resource] += production;
            gameState.resources.carbon -= drillCount*0.1;
        }
        else{
            //document.getElementById(resource_carbon).style.color = 'red';
            element.style.color = 'red';
        }

    });
}

function processAllFurnaces() {
    const furnaces = [
        { type: 'brickFurnaces', inputResource: 'stone', outputResource: 'bricks', inputAmount: 2, outputAmount: 1, resourceId: 'resource_stone' },
        { type: 'ironFurnaces', inputResource: 'mineralHierro', outputResource: 'placasHierro', inputAmount: 1, outputAmount: 1, resourceId: 'resource_mineralHierro' },
        { type: 'copperFurnaces', inputResource: 'mineralCobre', outputResource: 'placasCobre', inputAmount: 1, outputAmount: 1, resourceId: 'resource_mineralCobre' },
        { type: 'steelFurnaces', inputResource: 'placasHierro', outputResource: 'acero', inputAmount: 3, outputAmount: 1, resourceId: 'resource_placasHierro' }
    ];

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

        assembler.inputResources.forEach(input => {
            if (gameState.resources[input.resource] < input.amount * assemblerCount && assemblerCount >= 1) {
                canProduce = false;
                document.getElementById(`resource_${input.resource}`).style.color = 'red'; 
            }
        });

        if (canProduce) {
            assembler.inputResources.forEach(input => {
                gameState.resources[input.resource] -= input.amount * assemblerCount; // Consumir recursos
            });
            gameState.resources[assembler.outputResource] += assembler.outputAmount * assemblerCount; // Añadir producto

            assembler.inputResources.forEach(input => {
                document.getElementById(`resource_${input.resource}`).style.color = ''; // Restablecer color
            });
        }
    });
}
*/
