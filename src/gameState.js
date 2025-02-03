export class GameState {
    constructor(level, gc) {
        let root = "https://api.jsonbin.io/v3/b/"
        let binId = "67a019cde41b4d34e4830729"
        this.level = level; 
        this.jsonBinUrl = root + binId + "/latest";
        this.jsonBinUrlPut = root + binId;
        this.jsonBinKey = process.env.VITE_JSON_BIN_KEY;
        this.context = [];
        if(gc == null) {
            this.genGameCode();
        }
        else {
            this.gameCode = gc;
            this.loadFromJsonBin(gc);
        }
    }

    async genGameCode() {
        let isItAlreadyHere = true;
        while (isItAlreadyHere) 
            {
            this.gameCode = Math.random().toString(36).substring(2, 7); // Shorter code for easier testing
            try {
                const response = await fetch(this.jsonBinUrl, {
                    headers: {
                        'X-Master-Key': this.jsonBinKey,
                        "Content-Type": "application/json"
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to load game data');
                }

                const data = await response.json();
                const games = data.record || [];
                
                if (!Array.isArray(games)) {
                    isItAlreadyHere = false;
                    continue;
                }

                isItAlreadyHere = games.some(game => game.gameCode === this.gameCode);
            } catch (error) {
                console.error('Error loading game data:', error);
                isItAlreadyHere = false;
            }
        }
    }

    async saveToJsonBin() {
        try {
            // First, get the existing data
            console.log('Fetching existing data from JsonBin...');
            const getResponse = await fetch(this.jsonBinUrl, {
                headers: {
                    'X-Master-Key': this.jsonBinKey,
                    "Content-Type": "application/json"
                }
            });
            
            if (!getResponse.ok) {
                throw new Error(`Failed to get existing game data: ${getResponse.status}`);
            }

            const existingData = await getResponse.json();
            console.log('Existing data:', existingData);
            let games = existingData.record || [];
            
            // If games is not an array, initialize it
            if (!Array.isArray(games)) {
                console.log('Initializing empty games array');
                games = [];
            }

            const gameData = {
                gameCode: this.gameCode,
                context: this.context,
                level: this.level,
                timestamp: new Date().toISOString()
            };
            console.log('New game data:', gameData);

            // Find and update existing game or add new one
            const existingIndex = games.findIndex(game => game.gameCode === this.gameCode);
            if (existingIndex !== -1) {
                console.log('Updating existing game at index:', existingIndex);
                games[existingIndex] = gameData;
            } else {
                console.log('Adding new game');
                games.push(gameData);
            }

            console.log('Saving updated games array:', games);
            // Save the updated array back to JsonBin
            const response = await fetch(this.jsonBinUrlPut, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.jsonBinKey
                },
                body: JSON.stringify(games)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to save game data: ${response.status}`);
            }
            
            console.log('Save successful');
            return true;
        } catch (error) {
            console.error('Error saving game data:', error);
            return false;
        }
    }

    addToContext(message) {
        this.context.push(message);
    }

    async loadFromJsonBin(theGameCode) {
        try {
            console.log('Loading game with code:', theGameCode);
            const response = await fetch(this.jsonBinUrl, {
                headers: {
                    'X-Master-Key': this.jsonBinKey
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load game data');
            }

            const data = await response.json();
            console.log('Received data:', data);
            let games = data.record;
            
            // If games is not an array, initialize it
            if (!Array.isArray(games)) {
                console.log('No games found in bin');
                return false;
            }

            console.log('Looking for game with code:', theGameCode);
            console.log('Available games:', games);
            
            const game = games.find(g => g.gameCode === theGameCode);
            if (game) {
                console.log('Found game:', game);
                this.context = game.context;
                this.level = game.level;
                this.gameCode = game.gameCode;
                return true;
            }
            console.log('Game not found');
            return false;
        } catch (error) {
            console.error('Error loading game data:', error);
            return false;
        }
    }

    generateReport() {
        // Get theme from the first system message
        const theme = this.context[0]?.content?.split('The theme is ')[1]?.split('.')[0] || 'unknown';
        
        // Create pairs of system prompts and user responses
        let choices = [];
        for (let i = 0; i < this.context.length - 1; i++) {
            if (this.context[i].role === "assistant" && this.context[i + 1].role === "user") {
                choices.push([
                    this.context[i].content,
                    this.context[i + 1].content
                ]);
            }
        }

        // Return array with level, theme, and choices
        return [
            this.level - 1,
            theme,
            ...choices
        ];
    }

    getGameCode() {
        return this.gameCode;
    }

    async removeFromJsonBin() {
        try {
            // First, get the existing data
            const getResponse = await fetch(this.jsonBinUrl, {
                headers: {
                    'X-Master-Key': this.jsonBinKey
                }
            });
            
            if (!getResponse.ok) {
                throw new Error('Failed to get existing game data');
            }

            const existingData = await getResponse.json();
            let games = existingData.record || [];
            
            // Filter out the current game
            games = games.filter(game => game.gameCode !== this.gameCode);

            // Save the updated array back to JsonBin
            const response = await fetch(this.jsonBinUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.jsonBinKey
                },
                body: JSON.stringify(games)
            });
            
            if (!response.ok) {
                throw new Error('Failed to remove game data');
            }
            
            return true;
        } catch (error) {
            console.error('Error removing game data:', error);
            return false;
        }
    }
} 