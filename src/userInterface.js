class UserInterface {
    constructor(gameState) {
        this.gameState = gameState;
        this.init();
    }

    init() {
        this.bindNavigationEvents();
        this.setupKeyboardControls();
        this.updateDisplay();
    }

    bindNavigationEvents() {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('href');
                this.navigateToPage(page);
            });
        });
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                    this.nextScene();
                    break;
                case 'ArrowLeft':
                    this.previousScene();
                    break;
                case 'Escape':
                    this.showPauseMenu();
                    break;
            }
        });
    }

    validateUserInput(input) {
        if (!input.trim()) {
            this.showError('Input cannot be empty');
            return false;
        }
        
        if (input.length < 3) {
            this.showError('Input must be at least 3 characters');
            return false;
        }
        
        return true;
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            const div = document.createElement('div');
            div.id = 'error-message';
            div.className = 'bg-red-500 text-white p-4 rounded fixed top-4 right-4';
            document.body.appendChild(div);
        }
        errorDiv.textContent = message;
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    updateDisplay() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${this.gameState.score}`;
        }

        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = `Level: ${this.gameState.level}`;
        }
    }
} 