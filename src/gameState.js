class GameState {
    constructor() {
        this.currentScene = null;
        this.playerChoices = [];
        this.gameProgress = 0;
        this.score = 0;
        this.level = 1;
        this.jsonBinUrl = 'https://api.jsonbin.io/v3/b/67917dbead19ca34f8f2d6eb';
        this.jsonBinKey = process.env.JSON_BIN_KEY;
    }

    async saveToJsonBin() {
        const gameData = {
            currentScene: this.currentScene,
            playerChoices: this.playerChoices,
            gameProgress: this.gameProgress,
            score: this.score,
            level: this.level,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(this.jsonBinUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.jsonBinKey
                },
                body: JSON.stringify(gameData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save game data');
            }
            
            return true;
        } catch (error) {
            console.error('Error saving game data:', error);
            return false;
        }
    }

    async loadFromJsonBin() {
        try {
            const response = await fetch(this.jsonBinUrl, {
                headers: {
                    'X-Master-Key': this.jsonBinKey
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load game data');
            }

            const data = await response.json();
            this.currentScene = data.record.currentScene;
            this.playerChoices = data.record.playerChoices;
            this.gameProgress = data.record.gameProgress;
            this.score = data.record.score;
            this.level = data.record.level;
            
            return true;
        } catch (error) {
            console.error('Error loading game data:', error);
            return false;
        }
    }

    generateReport() {
        return {
            playerChoices: this.playerChoices,
            completionRate: (this.gameProgress / 10) * 100, // Assuming 10 total scenes
            score: this.score,
            level: this.level,
            timestamp: new Date().toISOString()
        };
    }
} 