class DialogSystem {
	/**
	 * Dialog type enum values
	 */
	static DialogTypes = {
		ERROR: 'error',
		WARNING: 'warning',
		INFO: 'info',
		CONFIRM: 'confirm'
	};

	constructor(overlayElement, iconElement, titleElement, messageElement, buttonsElement) {
		this.overlayElement = overlayElement;
		this.iconElement = iconElement;
		this.titleElement = titleElement;
		this.messageElement = messageElement;
		this.buttonsElement = buttonsElement;
		this.currentDialog = null;
		this.currentDialogType = null;

		// Gamepad navigation state
		this.selectedIndex = 0;
		this.lastGamepadState = {
			dpadLeft: false,
			dpadRight: false,
			buttonA: false
		};
	}

	/**
	 * Show a dialog
	 * @param {string} dialogType - Type of dialog (ERROR, WARNING, INFO, CONFIRM)
	 * @param {Object} config - Dialog configuration
	 * @param {string} config.title - Dialog title
	 * @param {string} config.message - Dialog message
	 * @param {Array} config.buttons - Array of button configs {label, action}
	 */
	showDialog(dialogType, config) {
		this.currentDialogType = dialogType;
		this.currentDialog = config;

		// Set icon based on dialog type
		const icons = {
			error: '⚠️',
			warning: '⚠️',
			info: 'ℹ️',
			confirm: '?'
		};
		this.iconElement.textContent = icons[dialogType] || '⚠️';

		// Set title
		this.titleElement.textContent = config.title;

		// Set message
		this.messageElement.textContent = config.message;

		// Clear existing buttons
		this.buttonsElement.innerHTML = '';
		this.selectedIndex = 0;

		// Create buttons
		const buttons = config.buttons || [{ label: 'OK', action: () => this.hideDialog() }];
		buttons.forEach(buttonConfig => {
			this.createButton(buttonConfig);
		});

		// Apply dialog type class for styling
		this.overlayElement.className = 'dialog-overlay';
		this.overlayElement.classList.add(`dialog-${dialogType}`);

		// Show overlay
		this.overlayElement.classList.remove('hidden');

		// Highlight first button
		this.updateSelection();
	}

	createButton(config) {
		const button = document.createElement('button');
		button.className = 'dialog-button';
		button.textContent = config.label;
		button.onclick = config.action;

		// Clear gamepad selection on mouse hover
		button.addEventListener('mouseenter', () => this.clearGamepadSelection());

		this.buttonsElement.appendChild(button);
	}

	hideDialog() {
		this.overlayElement.classList.add('hidden');
		this.currentDialog = null;
		this.currentDialogType = null;
	}

	isVisible() {
		return !this.overlayElement.classList.contains('hidden');
	}

	/**
	 * Get all buttons in the dialog
	 * @returns {Array} Array of button elements
	 */
	getSelectableItems() {
		return Array.from(this.buttonsElement.querySelectorAll('.dialog-button'));
	}

	/**
	 * Clear gamepad selection (when mouse is used)
	 */
	clearGamepadSelection() {
		const items = this.getSelectableItems();
		items.forEach(item => {
			item.classList.remove('gamepad-selected');
		});
	}

	/**
	 * Update visual highlighting for currently selected button
	 */
	updateSelection() {
		const items = this.getSelectableItems();
		if (items.length === 0) return;

		// Remove highlight from all items
		items.forEach(item => {
			item.classList.remove('gamepad-selected');
		});

		// Clamp selectedIndex to valid range
		this.selectedIndex = Math.max(0, Math.min(this.selectedIndex, items.length - 1));

		// Add highlight to selected item
		if (items[this.selectedIndex]) {
			items[this.selectedIndex].classList.add('gamepad-selected');
		}
	}

	/**
	 * Navigate to next button (right)
	 */
	selectNext() {
		const items = this.getSelectableItems();
		if (items.length === 0) return;

		this.selectedIndex = (this.selectedIndex + 1) % items.length;
		this.updateSelection();
	}

	/**
	 * Navigate to previous button (left)
	 */
	selectPrevious() {
		const items = this.getSelectableItems();
		if (items.length === 0) return;

		this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
		this.updateSelection();
	}

	/**
	 * Activate currently selected button
	 */
	activateSelected() {
		const items = this.getSelectableItems();
		const selectedItem = items[this.selectedIndex];
		if (selectedItem) {
			selectedItem.click();
		}
	}

	/**
	 * Handle gamepad input for dialog navigation
	 * Called each frame from game loop
	 * @param {Gamepad} gamepad - The gamepad object
	 */
	handleGamepadInput(gamepad) {
		if (!this.isVisible() || this.getSelectableItems().length === 0) {
			return;
		}

		// D-pad or stick for navigation
		// D-pad: buttons[14]=left, [15]=right
		// Left stick: axes[0] for left/right
		const dpadLeft = gamepad.buttons[14]?.pressed || false;
		const dpadRight = gamepad.buttons[15]?.pressed || false;

		const stickLeft = gamepad.axes[0] < -0.5;
		const stickRight = gamepad.axes[0] > 0.5;

		const leftPressed = dpadLeft || stickLeft;
		const rightPressed = dpadRight || stickRight;

		// A button (buttons[0]) to activate
		const buttonA = gamepad.buttons[0]?.pressed || false;

		// Detect rising edge (button just pressed, wasn't pressed before)
		// Left: select previous button
		if (leftPressed && !this.lastGamepadState.dpadLeft) {
			this.selectPrevious();
		}
		// Right: select next button
		if (rightPressed && !this.lastGamepadState.dpadRight) {
			this.selectNext();
		}
		// A button: activate selected button
		if (buttonA && !this.lastGamepadState.buttonA) {
			this.activateSelected();
		}

		// Update last state
		this.lastGamepadState.dpadLeft = leftPressed;
		this.lastGamepadState.dpadRight = rightPressed;
		this.lastGamepadState.buttonA = buttonA;
	}
}

export { DialogSystem };
