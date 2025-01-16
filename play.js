import dotenv from 'dotenv';
dotenv.config();

function log(message) {
    out = document.getElementById('output');
    out.innerHTML += message + "\n";
}





async function adventureGame() {
    log("Welcome to the Adventure! Type 'stop' at any time to leave the game.");

    // Using prompt() for browser-based input
    const theme = prompt("How would you like to theme your choose-your-own-adventure game?");
    
    if (theme?.toLowerCase().includes('stop')) {
        log("Thank you for playing!");
        return;
    }

    // Initialize the chat history
    const messagesUserSide = [
        {
            role: "system", 
            content: `You are the guide in a choose-your-own-adventure game. The theme is ${theme}. The user should die if they blunder. When the game is over be sure to say Game over! The game should be completely family friendly. There should be a victory ending within 6 or so moves (still end with Game over, you won).`
        },
        {
            role: "user", 
            content: "I'm ready for an adventure!"
        }
    ];

    let userPrompt = prompt("\nYou are caught at crossroads, which way will you go (you can go any direction): ");
    
    if (userPrompt?.toLowerCase().includes('stop')) {
        log("Thank you for playing!");
        return;
    }

    log("From here on out please type the number of your choice.");

    while (true) {
        // Add user's choice to conversation
        messagesUserSide.push({ role: "user", content: userPrompt });

        try {
            const aiResponse = await getAIResponse(messagesUserSide);

            // Check if game is over
            if (aiResponse.toLowerCase().includes('game over')) {
                log(aiResponse);
                log("Thank you for playing!");
                return;
            }

            // Display the response to user
            log(aiResponse);

            // Add the AI's response to chat history
            messagesUserSide.push({ role: "assistant", content: aiResponse });

            // Get user's choice
            userPrompt = prompt("\nYour choice: ");
            log("\n");

            // Exit if user types stop
            if (userPrompt?.toLowerCase().includes('stop')) {
                log("Thank you for playing!");
                break;
            }

        } catch (error) {
            console.error("An error occurred:", error);
            break;
        }
    }
}

// Helper function to simulate AI response (replace with actual AI implementation)
async function getAIResponse(messages) {
    const OPENAI_API_KEY = process.env.API_KEY;
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not found in environment variables');
    }

    const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
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
adventureGame();