// Initialize the game
document.addEventListener('DOMContentLoaded', async () => {
    const gameState = new GameState();
    const ui = new UserInterface(gameState);
    
    // Try to load existing game data
    const loaded = await gameState.loadFromJsonBin();
    if (loaded) {
        ui.updateDisplay();
    }

    // Auto-save every minute
    setInterval(async () => {
        await gameState.saveToJsonBin();
    }, 60000);

    // Add event listener for the report generation
    const reportButton = document.getElementById('generate-report');
    if (reportButton) {
        reportButton.addEventListener('click', () => {
            const report = gameState.generateReport();
            displayReport(report);
        });
    }
});

function displayReport(report) {
    const reportContainer = document.getElementById('report-container');
    if (!reportContainer) return;

    const reportHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg">
            <h2 class="text-2xl font-bold mb-4">Game Progress Report</h2>
            <p>Completion Rate: ${report.completionRate}%</p>
            <p>Current Score: ${report.score}</p>
            <p>Level Reached: ${report.level}</p>
            <p>Choices Made: ${report.playerChoices.length}</p>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
    `;

    reportContainer.innerHTML = reportHTML;
}

// Generate a random 6-character code
function generateGameCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Save game state with code
async function saveGame(gameState) {
    const gameCode = generateGameCode();
    const saveData = {
        code: gameCode,
        state: gameState,
        timestamp: Date.now()
    };
    
    try {
        // Assuming you're using JSONBin.io - replace with your API key and bin ID
        const response = await fetch('https://api.jsonbin.io/v3/b/67917dbead19ca34f8f2d6eb', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': process.env.JSON_BIN_KEY
            },
            body: JSON.stringify(saveData)
        });
        
        if (response.ok) {
            return gameCode; // Return the code to show to the player
        }
        throw new Error('Failed to save game');
    } catch (error) {
        console.error('Error saving game:', error);
        return null;
    }
}

// Load game state using code
async function loadGame(gameCode) {
    try {
        // Assuming you're using JSONBin.io - replace with your API key and bin ID
        const response = await fetch('https://api.jsonbin.io/v3/b/67917dbead19ca34f8f2d6eb', {
            headers: {
                'X-Master-Key': process.env.JSON_BIN_KEY
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const savedGames = data.record;
            
            // Find the game with matching code
            if (savedGames.code === gameCode) {
                return savedGames.state;
            }
            return null; // Code not found
        }
        throw new Error('Failed to load game');
    } catch (error) {
        console.error('Error loading game:', error);
        return null;
    }
}

const gameCode = 'ABC123'; // Get this from user input
const loadedState = await loadGame(gameCode);
if (loadedState) {
    // Restore game state
    console.log('Game loaded successfully!');
} else {
    console.log('Invalid game code or error loading game');
} 