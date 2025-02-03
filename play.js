// Remove dotenv import as it's not needed in browser
// dotenv.config();

import { GameState } from './src/gameState.js';

function log(message) {
    const out = document.getElementById('output');
    if (!out) {
        console.log(message);
        return;
    }
    out.innerHTML += message + "<br>";
    // Auto-scroll to bottom
    out.scrollTop = out.scrollHeight;
}

async function getAIResponse(messages) {
    // Don't use process.env directly in browser
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY; // If using Vite
    // OR
    // const OPENAI_API_KEY = window.env.OPENAI_API_KEY; // If using a config file
    
    const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenAI API:', error, " ", );
        return 'Sorry, there was an error processing your request.';
    }
}

async function adventureGame() {
    const userInput = document.getElementById('userInput');
    const submitButton = document.getElementById('submitButton');
    const loadGameButton = document.getElementById('loadGameButton');
    const gameCodeText = document.getElementById('gameCodeText');
    const gameCodeInput = document.getElementById('gameCodeInput');
    const reportText = document.getElementById('reportContent');
    
    // Initialize gameState with null game code
    let gameState = new GameState(0, null);
    
    log("Welcome to the Adventure! Type 'stop' at any time to leave the game.");
    log("\nHow would you like to theme your choose-your-own-adventure game?");

    let gameActive = true;
    let theme = null;
    let messagesUserSide = [];

    // Update load game button handler
    loadGameButton.addEventListener('click', async () => {
        const gameCode = gameCodeInput.value.trim();
        if (gameCode) {
            // Initialize with level 0 when loading a game
            gameState = new GameState(0, gameCode);
            log(`\nLoading game with code: ${gameCode}`);
            gameCodeText.textContent = gameCode;
            
            // Wait for the game to load from JsonBin
            const loadSuccess = await gameState.loadFromJsonBin(gameCode);
            
            if (loadSuccess && gameState.context.length > 0) {
                try {
                    // Get theme from the loaded context
                    const theme = gameState.context[0]?.content?.split('The theme is ')[1]?.split('.')[0] || 'unknown';
                    
                    const aiResponse = await getAIResponse([
                        {
                            role: "user",
                            content: `You are the guide in a choose-your-own-adventure game. The theme is ${theme}. The user should die if they blunder. When the game is over be sure to say Game over! The game should be completely family friendly. I've just loaded into the game and I've made the following choices: ${gameState.context.map(msg => msg.content).join(' | ')}. Please catch me up on what's happening in the story so far.`
                        }
                    ]);
                    log(`\n${aiResponse}`);
                    
                    await gameState.saveToJsonBin();
                } catch (error) {
                    console.error("Error getting story catchup:", error);
                    log("\nSorry, there was an error loading the game state.");
                }
            } else {
                log("\nCould not find a game with that code.");
            }
        }
    });

    // Update game code display
    if (gameState.getGameCode()) {
        gameCodeText.textContent = gameState.getGameCode();
    }

    // Handle input submission
    submitButton.addEventListener('click', async () => {
        if (!gameActive) return;

        const input = userInput.value.trim();
        userInput.value = ''; // Clear input

        if (input.toLowerCase() === 'stop') {
            log("\nThank you for playing!");
            gameActive = false;
            reportText.textContent = gameState.generateReport();
            // Remove the game from JsonBin when it ends
            await gameState.removeFromJsonBin();
            return;
        }

        if (gameState.context.length == 0) {
            theme = input;
            gameState.context = [
                {
                    role: "system",
                    content: `You are the guide in a choose-your-own-adventure game. The theme is ${theme}. The user should die if they blunder. When the game is over be sure to say Game over! The game should be completely family friendly.`
                },
                {
                    role: "user",
                    content: "I'm ready for an adventure!"
                }
            ];
        }

        log(`\nYour choice: ${input}`);
        gameState.context.push({ role: "user", content: input });
        gameState.saveToJsonBin();
        try {
            const aiResponse = await getAIResponse(gameState.context);
            log(`\n${aiResponse}`);
            gameState.context.push({ role: "system", content: aiResponse });
            gameState.level++;
            gameState.saveToJsonBin();
            if (aiResponse.toLowerCase().includes('game over')) {
                log("\nThank you for playing!");
                const report = gameState.generateReport();
                const reportContent = `🎮 Level reached: ${report[0]}\n` +
                                     `🎨 Theme: ${report[1]}\n` +
                                     `\n📖 Story Choices:\n` +
                                     report.slice(2).map((choice, index) => 
                                         `\n━━━ Round ${index + 1} ━━━\n` +
                                         `🤖 AI: ${choice[0]}\n` +
                                         `👤 You: ${choice[1]}`
                                     ).join('\n');
                document.getElementById('gameReport').classList.remove('hidden'); // Show the report
                reportText.textContent = reportContent;
                gameActive = false;
                // Remove the game from JsonBin when it ends
                await gameState.removeFromJsonBin();
                return;
            }

            gameState.context.push({ role: "assistant", content: aiResponse });
            gameState.saveToJsonBin();
        } catch (error) {
            console.error("An error occurred:", error);
            log("\nSorry, there was an error. Please try again.");
        }
    });

    // Handle Enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitButton.click();
        }
    });
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => adventureGame());

// Update the load function to properly reconstruct context
export const loadGame = async () => {
    // ... existing bin fetch code ...

    // Reconstruct the full context when loading
    const systemMessage = createSystemMessage();
    const fullChatHistory = [
        systemMessage,
        ...data.chatHistory
    ];

    return {
        chatHistory: fullChatHistory,
        // ... other state properties ...
    };
}