// Remove dotenv import as it's not needed in browser
// dotenv.config();

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
    const OPENAI_API_KEY = 'your-api-key'; // You'll need to handle this securely
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
        console.error('Error calling OpenAI API:', error);
        return 'Sorry, there was an error processing your request.';
    }
}

async function adventureGame() {
    const userInput = document.getElementById('userInput');
    const submitButton = document.getElementById('submitButton');
    
    log("Welcome to the Adventure! Type 'stop' at any time to leave the game.");
    log("\nHow would you like to theme your choose-your-own-adventure game?");

    let gameActive = true;
    let theme = null;
    let messagesUserSide = [];

    // Handle input submission
    submitButton.addEventListener('click', async () => {
        if (!gameActive) return;
        
        const input = userInput.value.trim();
        userInput.value = ''; // Clear input

        if (input.toLowerCase() === 'stop') {
            log("\nThank you for playing!");
            gameActive = false;
            return;
        }

        if (!theme) {
            theme = input;
            messagesUserSide = [
                {
                    role: "system",
                    content: `You are the guide in a choose-your-own-adventure game. The theme is ${theme}. The user should die if they blunder. When the game is over be sure to say Game over! The game should be completely family friendly. There should be a victory ending within 6 or so moves (still end with Game over, you won).`
                },
                {
                    role: "user",
                    content: "I'm ready for an adventure!"
                }
            ];
            log("\nYou are caught at crossroads, which way will you go (you can go any direction): ");
            return;
        }

        log(`\nYour choice: ${input}`);
        messagesUserSide.push({ role: "user", content: input });

        try {
            const aiResponse = await getAIResponse(messagesUserSide);
            log(`\n${aiResponse}`);

            if (aiResponse.toLowerCase().includes('game over')) {
                log("\nThank you for playing!");
                gameActive = false;
                return;
            }

            messagesUserSide.push({ role: "assistant", content: aiResponse });
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
document.addEventListener('DOMContentLoaded', adventureGame);