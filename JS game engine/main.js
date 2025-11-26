// Main entry point module for the game
import {
	VibeEngine,
	DebugLogger,
	Vector2D,
	Sprite,
	MenuSystem,
	HighScoreManager,
	AchievementManager,
	PreferencesManager,
	SoundManager,
	MusicPlayer,
	AssetLoader,
	Note
} from './VibeEngine/VibeEngine.js';
import { GameConfig } from './GameConfig.js';
import { Game } from './Game.js';

// Enable debug logging only when running on localhost
DebugLogger.debug = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const canvasName = "gameCanvas";
// Get the canvas element
const canvas = document.getElementById(canvasName);
// Get the 2D context
const context = canvas.getContext("2d");

const engine = VibeEngine.begin(document, canvasName);
Sprite.begin(context);

// Initialize menu system
const menuSystem = new MenuSystem(
	document.getElementById('menuOverlay'),
	document.getElementById('menuTitle'),
	document.getElementById('menuButtons'),
	document.getElementById('menuInstructions')
);

// Initialize globals:
const highScoreManager = new HighScoreManager(menuSystem, showMainMenu);
const achievementManager = new AchievementManager(menuSystem);
const preferencesManager = new PreferencesManager();
const soundManager = SoundManager.init(preferencesManager);
const musicPlayer = new MusicPlayer();
let game = null;

// Preload assets
(async () => {
	await AssetLoader.loadAll(soundManager, musicPlayer);

	// Initialize music volume after Note class is available
	Note.setVolume(preferencesManager.musicVolume / 100);
})();

// Background will be tiled - store a single tile sprite
let backgroundTileSize = new Vector2D(1536, 1024); // Actual size of background image
let backgroundSprite = new Sprite(
	'background-fuzzy-edge.png',
	new Vector2D(0, 0),
	backgroundTileSize
);

musicPlayer.play();

// Export globals that Game.js needs to access
window.game = game;
window.context = context;
window.canvas = canvas;
window.engine = engine;
window.soundManager = soundManager;
window.achievementManager = achievementManager;
window.backgroundSprite = backgroundSprite;
window.backgroundTileSize = backgroundTileSize;
window.showUpgradeMenu = showUpgradeMenu;
window.menuSystem = menuSystem;

// Game state management functions
async function startGame() {
	// Resume audio context on user interaction (required by browser autoplay policies)
	await SoundManager.resumeAudioContext();

	game = new Game(canvas);
	window.game = game; // Update global reference

	// Set up event listeners for game events
	game.addEventListener('pause-requested', pauseGame);
	game.addEventListener('resume-requested', resumeGame);
	game.addEventListener('upgrade-menu-requested', showUpgradeMenu);
	game.addEventListener('game-over', () => {
		setCursorVisibility(true);
		showGameOverMenu();
	});
	game.addEventListener('resume-from-upgrade', () => {
		setCursorVisibility(false);
	});
	game.currentState = Game.States.PLAYING;
	menuSystem.hideMenu();
	musicPlayer.play();
	setCursorVisibility(false);
}

function returnToMenu() {
	game.currentState = null; // No longer in active gameplay
	// Don't stop music - keep playing in menus
	setCursorVisibility(true);
	showMainMenu();
}

// Menu configuration functions
function showMainMenu() {
	setMenuOverlayMode(false); // Opaque overlay with background

	// Start music if not already playing
	if (!musicPlayer.isPlaying) {
		musicPlayer.play();
	}

	// Restore title image if it was replaced by text
	const titleElement = document.getElementById('menuTitle');
	if (!titleElement.querySelector('img')) {
		titleElement.innerHTML = '<img id="menuTitleImage" src="title.png" alt="SPACE SHOOTER" style="width: 325px; height: 28px;">';
	}

	menuSystem.showMenu(MenuSystem.MenuTypes.MAIN, {
		title: 'SPACE SHOOTER',
		items: [
			{
				type: 'button',
				label: 'New Game',
				action: () => startGame()
			},
			{
				type: 'button',
				label: 'High Scores',
				action: () => highScoreManager.showHighScoresMenu()
			},
			{
				type: 'button',
				label: 'Options',
				action: () => showOptionsMenu()
			},
			{
				type: 'button',
				label: 'Achievements',
				action: () => showAchievementsMenu()
			}
		],
		instructions: 'Arrow Keys or Left Stick: Move | Space or A Button: Shoot | ESC: Pause'
	});
}


function showGameOverMenu() {
	setMenuOverlayMode(true); // Transparent overlay - show game behind

	let playerName = '';

	// Helper to save score and stop game (shared by all buttons)
	const saveAndStopGame = () => {
		const name = playerName.trim() || 'Anonymous';
		highScoreManager.saveHighScore(name, game.score);
		game.currentState = null;
	};

	// Function to submit the score (shared between button and Enter key)
	const submitScore = () => {
		saveAndStopGame();
		highScoreManager.showHighScoresMenu();
	};

	menuSystem.showMenu(MenuSystem.MenuTypes.GAME_OVER, {
		title: 'GAME OVER',
		items: [
			{
				type: 'textInput',
				id: 'playerNameInput',
				label: 'Enter Your Name:',
				placeholder: 'Player',
				maxLength: 15,
				autofocus: true,
				onChange: (value) => {
					playerName = value;
				},
				onSubmit: submitScore
			},
			{
				type: 'button',
				label: 'Submit Score',
				action: submitScore
			},
			{
				type: 'button',
				label: 'New Game',
				action: () => {
					saveAndStopGame();
					startGame();
				}
			},
			{
				type: 'button',
				label: 'Main Menu',
				action: () => {
					saveAndStopGame();
					returnToMenu();
				}
			}
		],
		instructions: `Final Score: ${game.score}`
	});
}

function pauseGame() {
	if (game.currentState === Game.States.PLAYING) {
		game.currentState = Game.States.PAUSED;
		canvas.classList.remove('hide-cursor');
		showPauseMenu();
	}
}

function resumeGame() {
	game.currentState = Game.States.PLAYING;
	menuSystem.hideMenu();
	musicPlayer.play();
	setCursorVisibility(false);
}

function showPauseMenu() {
	setMenuOverlayMode(true); // Transparent overlay for pause

	menuSystem.showMenu(MenuSystem.MenuTypes.PAUSE, {
		title: 'PAUSED',
		items: [
			{
				type: 'button',
				label: 'Continue',
				action: () => resumeGame()
			},
			...getVolumeSliders(),
			getFullscreenCheckbox(),
			{
				type: 'button',
				label: 'Quit',
				action: () => {
					if (game.score > 0) {
						game.gameOver();
					} else {
						returnToMenu();
					}
				}
			}
		],
		instructions: ''
	});
}

function showUpgradeMenu() {
	// Check Untouchable achievement before advancing
	if (game.achievementStats.damageTakenThisWave === 0) {
		achievementManager.unlock('untouchable');
	}

	// Set upgrading state - time passes but player has no control
	game.currentState = Game.States.UPGRADING;
	setCursorVisibility(true);
	setMenuOverlayMode(true); // Transparent overlay for pause

	// Check max levels
	const maxWeaponLevel = GameConfig.UPGRADES.WEAPON.length - 1;
	const maxEngineLevel = GameConfig.UPGRADES.ENGINE.length - 1;
	const maxShieldLevel = GameConfig.UPGRADES.SHIELD.length - 1;

	const weaponMaxed = game.player.weaponLevel >= maxWeaponLevel;
	const engineMaxed = game.player.engineLevel >= maxEngineLevel;
	const shieldMaxed = game.player.shieldLevel >= maxShieldLevel;
	const allMaxed = weaponMaxed && engineMaxed && shieldMaxed;

	const items = [];

	if (allMaxed) {
		// All upgrades maxed - show "Heal and Continue" button
		items.push({
			type: 'button',
			label: 'Heal and Continue',
			action: () => {
				// Heal to full health
				game.player.health = game.player.getMaxHealth();
				DebugLogger.log(`Healed to full health: ${game.player.health}`);
				game.resumeFromUpgrade();
			}
		});
	} else {
		// Helper to create upgrade button
		const createUpgradeButton = (name, levelProp, achievementId, isMaxed, applyFn = null) => ({
			type: 'button',
			label: isMaxed
				? `${name} Upgrade (MAX LEVEL)`
				: `${name} Upgrade (Level ${game.player[levelProp]} → ${game.player[levelProp] + 1})`,
			disabled: isMaxed,
			action: () => {
				game.player[levelProp]++;
				if (applyFn) applyFn();
				DebugLogger.log(`${name} upgraded to level ${game.player[levelProp]}`);
				achievementManager.setProgress(achievementId, game.player[levelProp]);
				if (game.player.weaponLevel === 10 &&
					game.player.engineLevel === 10 &&
					game.player.shieldLevel === 10) {
					achievementManager.unlock('ultimate_weapon');
				}
				game.resumeFromUpgrade();
			}
		});

		// Show upgrade buttons (disabled if maxed)
		items.push(createUpgradeButton('Weapon', 'weaponLevel', 'fully_armed', weaponMaxed));
		items.push(createUpgradeButton('Engine', 'engineLevel', 'speed_demon', engineMaxed));
		items.push(createUpgradeButton('Shield', 'shieldLevel', 'fortress', shieldMaxed, () => game.player.applyShieldUpgrade()));
	}

	menuSystem.showMenu(MenuSystem.MenuTypes.UPGRADE, {
		title: allMaxed ? 'ALL UPGRADES COMPLETE' : 'CHOOSE UPGRADE',
		items: items,
		instructions: allMaxed
			? 'You have reached maximum power!'
			: 'Select one upgrade before entering the next level'
	});
}

function showOptionsMenu() {
	setMenuOverlayMode(false); // Opaque overlay with background

	menuSystem.showMenu(MenuSystem.MenuTypes.OPTIONS, {
		title: 'OPTIONS',
		items: [
			...getVolumeSliders(),
			getFullscreenCheckbox(),
			{
				type: 'button',
				label: 'Back',
				action: () => showMainMenu()
			}
		],
		instructions: ''
	});
}

function showAchievementsMenu() {
	setMenuOverlayMode(false); // Opaque overlay with background

	// Build achievement list with unlock status and progress
	const achievementList = GameConfig.ACHIEVEMENTS.map(achievement => {
		return {
			...achievement,
			unlocked: achievementManager.isUnlocked(achievement.id),
			progress: achievementManager.getProgress(achievement.id)
		};
	});

	const unlockedCount = achievementManager.getUnlockedCount();
	const totalCount = achievementManager.getTotalCount();

	menuSystem.showMenu(MenuSystem.MenuTypes.ACHIEVEMENTS, {
		title: 'ACHIEVEMENTS',
		items: [
			{
				type: 'achievementList',
				achievements: achievementList,
				headerText: `${unlockedCount} / ${totalCount} Unlocked`
			},
			{
				type: 'button',
				label: 'Back',
				action: () => showMainMenu()
			}
		],
		instructions: ''
	});
}

// Helper: Get volume slider controls (used in Pause and Options menus)
function getVolumeSliders() {
	return [
		{
			type: 'slider',
			label: 'Sound Effects Volume',
			min: 0,
			max: 100,
			value: preferencesManager.soundEffectsVolume,
			suffix: '%',
			onChange: (value) => {
				preferencesManager.soundEffectsVolume = parseInt(value);
			}
		},
		{
			type: 'slider',
			label: 'Music Volume',
			min: 0,
			max: 100,
			value: preferencesManager.musicVolume,
			suffix: '%',
			onChange: (value) => {
				preferencesManager.musicVolume = parseInt(value);
				Note.setVolume(preferencesManager.musicVolume / 100);
			}
		}
	];
}

// Helper: Get fullscreen checkbox control (used in Pause and Options menus)
function getFullscreenCheckbox() {
	return {
		type: 'checkbox',
		label: 'Fullscreen',
		checked: VibeEngine.instance.isFullScreen,
		onChange: (checked) => {
			if (checked && !VibeEngine.instance.isFullScreen) {
				VibeEngine.instance.enterFullScreen();
			} else if (!checked && VibeEngine.instance.isFullScreen) {
				VibeEngine.instance.exitFullScreen();
			}
		}
	};
}

// Helper: Set cursor visibility
function setCursorVisibility(visible) {
	if (visible) {
		canvas.classList.remove('hide-cursor');
	} else {
		canvas.classList.add('hide-cursor');
	}
}

// Helper: Set menu overlay mode (pause = transparent overlay, regular = opaque)
function setMenuOverlayMode(isPauseMode) {
	const overlay = document.getElementById('menuOverlay');
	if (isPauseMode) {
		overlay.classList.add('pause');
	} else {
		overlay.classList.remove('pause');
	}
}

// Wrapper functions for game loop
function update(deltaTime) {
	if (game != null) {
		game.update(deltaTime, {
			engine,
			context,
			canvas,
			soundManager,
			achievementManager,
			backgroundSprite,
			backgroundTileSize,
			showUpgradeMenu,
			menuSystem,
			pauseGame,
			showGameOverMenu
		});
	}
}

function render() {
	if (game != null) {
		game.render(context, canvas, backgroundSprite, backgroundTileSize);
	}
}

// Show main menu and start game loop
showMainMenu();
engine.start(update, render, () => Sprite.stillLoading());
