class MenuSystem {
  /**
   * Menu type enum values
   */
  static MenuTypes = {
    MAIN: 'main',
    PAUSE: 'pause',
    OPTIONS: 'options',
    GAME_OVER: 'gameOver',
    HIGH_SCORES: 'highScores',
    UPGRADE: 'upgrade',
    ACHIEVEMENTS: 'achievements'
  };

  constructor(overlayElement, titleElement, buttonsElement, instructionsElement) {
    this.overlayElement = overlayElement;
    this.titleElement = titleElement;
    this.buttonsElement = buttonsElement;
    this.instructionsElement = instructionsElement;
    this.currentMenu = null;
    this.currentMenuType = null;

    // Gamepad navigation state
    this.selectedIndex = -1; // -1 means no selection (default state for mouse users)
    this.lastGamepadState = {
      dpadUp: false,
      dpadDown: false,
      dpadLeft: false,
      dpadRight: false,
      buttonA: false
    };
  }

  showMenu(menuType, menuConfig) {
    this.currentMenuType = menuType;
    this.currentMenu = menuConfig;

    // Set title - only set text if there's no image child (preserves title.png on main menu)
    const hasImageChild = this.titleElement.querySelector('img');
    if (!hasImageChild) {
      this.titleElement.textContent = menuConfig.title;
    }

    // Clear existing items
    this.buttonsElement.innerHTML = '';
    this.selectedIndex = -1; // Reset to no selection

    // Create menu items
    menuConfig.items.forEach(itemConfig => {
      switch(itemConfig.type) {
        case 'button':
          this.createButton(itemConfig);
          break;
        case 'slider':
          this.createSlider(itemConfig);
          break;
        case 'checkbox':
          this.createCheckbox(itemConfig);
          break;
        case 'textInput':
          this.createTextInput(itemConfig);
          break;
        case 'scoreList':
          this.createScoreList(itemConfig);
          break;
        case 'achievementList':
          this.createAchievementList(itemConfig);
          break;
      }
    });

    // Set instructions
    if (menuConfig.instructions) {
      this.instructionsElement.textContent = menuConfig.instructions;
      this.instructionsElement.style.display = 'block';
    } else {
      this.instructionsElement.style.display = 'none';
    }

    // Show overlay
    this.overlayElement.classList.remove('hidden');

    // Don't highlight anything by default - gamepad input will trigger first highlight
    this.updateSelection();
  }

  createButton(config) {
    const button = document.createElement('button');
    button.className = 'menu-button';
    button.textContent = config.label;
    button.onclick = config.action;

    // Support disabled state
    if (config.disabled) {
      button.disabled = true;
      button.classList.add('disabled');
    }

    // Clear gamepad selection on mouse hover
    button.addEventListener('mouseenter', () => this.clearGamepadSelection());

    this.buttonsElement.appendChild(button);
  }

  createSlider(config) {
    const container = document.createElement('div');
    container.className = 'menu-slider-container';

    const label = document.createElement('label');
    label.className = 'menu-slider-label';
    label.textContent = config.label;

    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'menu-slider-wrapper';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'menu-slider';
    slider.min = config.min !== undefined ? config.min : 0;
    slider.max = config.max !== undefined ? config.max : 100;
    slider.value = config.value !== undefined ? config.value : config.max;
    slider.oninput = (e) => {
      valueDisplay.textContent = e.target.value + (config.suffix || '');
      if (config.onChange) config.onChange(e.target.value);
    };

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'menu-slider-value';
    valueDisplay.textContent = slider.value + (config.suffix || '');

    // Clear gamepad selection on mouse hover
    container.addEventListener('mouseenter', () => this.clearGamepadSelection());

    sliderWrapper.appendChild(slider);
    sliderWrapper.appendChild(valueDisplay);
    container.appendChild(label);
    container.appendChild(sliderWrapper);
    this.buttonsElement.appendChild(container);
  }

  createCheckbox(config) {
    const container = document.createElement('div');
    container.className = 'menu-checkbox-container';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'menu-checkbox';
    checkbox.id = 'menu-checkbox-' + Math.random();
    checkbox.checked = config.checked || false;
    checkbox.onchange = (e) => {
      if (config.onChange) config.onChange(e.target.checked);
    };

    const label = document.createElement('label');
    label.className = 'menu-checkbox-label';
    label.htmlFor = checkbox.id;
    label.textContent = config.label;

    // Clear gamepad selection on mouse hover
    container.addEventListener('mouseenter', () => this.clearGamepadSelection());

    container.appendChild(checkbox);
    container.appendChild(label);
    this.buttonsElement.appendChild(container);
  }

  createTextInput(config) {
    const container = document.createElement('div');
    container.className = 'menu-text-input-container';

    const label = document.createElement('label');
    label.className = 'menu-text-input-label';
    label.textContent = config.label;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'menu-text-input';
    input.placeholder = config.placeholder || '';
    input.value = config.value || '';
    input.maxLength = config.maxLength || 20;

    // Store reference for later retrieval
    if (config.id) {
      input.id = config.id;
    }

    input.oninput = (e) => {
      if (config.onChange) config.onChange(e.target.value);
    };

    // Handle Enter/Return key to trigger onSubmit action
    input.onkeydown = (e) => {
      // Check for Enter key (key code 13, or key name 'Enter')
      // Use both e.key and e.keyCode for cross-browser compatibility
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault(); // Prevent default form submission behavior
        if (config.onSubmit) {
          config.onSubmit();
        }
      }
    };

    // Focus input when created if autofocus is enabled
    if (config.autofocus) {
      setTimeout(() => input.focus(), 100);
    }

    container.appendChild(label);
    container.appendChild(input);
    this.buttonsElement.appendChild(container);
  }

  createScoreList(config) {
    const container = document.createElement('div');
    container.className = 'menu-score-list-container';

    const scores = config.scores || [];
    const maxScores = 10;

    // Create rows for all 10 positions
    for (let i = 0; i < maxScores; i++) {
      const row = document.createElement('div');
      row.className = 'menu-score-row';

      const rank = document.createElement('span');
      rank.className = 'menu-score-rank';

      const nameAndScore = document.createElement('span');
      nameAndScore.className = 'menu-score-content';

      if (i < scores.length) {
        const entry = scores[i];

        // Set rank from entry (may differ from position for recent scores outside top 10)
        rank.textContent = `${entry.rank}.`;

        if (entry.isEllipsis) {
          // Show ellipsis row
          rank.textContent = '';
          nameAndScore.textContent = '…';
          row.classList.add('ellipsis');
        } else {
          // Show score entry
          const date = new Date(entry.date);
          const dateStr = date.toLocaleDateString();
          const timeStr = date.toLocaleTimeString();
          // SECURITY: Use textContent (not innerHTML) to prevent XSS attacks
          // Even though names are sanitized on input, this provides defense-in-depth
          nameAndScore.textContent = `${entry.name} - ${entry.score} (${dateStr} ${timeStr})`;

          // Highlight recent score
          if (entry.isRecent) {
            row.classList.add('recent');
          }
        }
      } else {
        // Empty row
        rank.textContent = `${i + 1}.`;
        nameAndScore.textContent = '-';
        row.classList.add('empty');
      }

      row.appendChild(rank);
      row.appendChild(nameAndScore);
      container.appendChild(row);
    }

    this.buttonsElement.appendChild(container);
  }

  createAchievementList(config) {
    const container = document.createElement('div');
    container.className = 'menu-achievement-list-container';

    const achievements = config.achievements || [];

    // Create header showing progress
    const header = document.createElement('div');
    header.className = 'menu-achievement-header';
    header.textContent = config.headerText || 'Achievements';
    container.appendChild(header);

    // Create achievement rows
    achievements.forEach(achievement => {
      const row = document.createElement('div');
      row.className = 'menu-achievement-row';

      // Add locked/unlocked class
      if (achievement.unlocked) {
        row.classList.add('unlocked');
      } else {
        row.classList.add('locked');
      }

      // Achievement icon (checkmark or lock)
      const icon = document.createElement('span');
      icon.className = 'menu-achievement-icon';
      icon.textContent = achievement.unlocked ? '✓' : '🔒';

      // Achievement content
      const content = document.createElement('div');
      content.className = 'menu-achievement-content';

      const name = document.createElement('div');
      name.className = 'menu-achievement-name';
      name.textContent = achievement.name;

      const description = document.createElement('div');
      description.className = 'menu-achievement-description';
      description.textContent = achievement.description;

      content.appendChild(name);
      content.appendChild(description);

      // Add progress bar if achievement tracks progress and isn't unlocked
      if (achievement.trackProgress && !achievement.unlocked && achievement.maxProgress) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'menu-achievement-progress-container';

        const progressBar = document.createElement('div');
        progressBar.className = 'menu-achievement-progress-bar';

        const progressFill = document.createElement('div');
        progressFill.className = 'menu-achievement-progress-fill';
        const progressPercent = Math.min(100, (achievement.progress / achievement.maxProgress) * 100);
        progressFill.style.width = `${progressPercent}%`;

        const progressText = document.createElement('div');
        progressText.className = 'menu-achievement-progress-text';
        progressText.textContent = `${achievement.progress} / ${achievement.maxProgress}`;

        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);
        content.appendChild(progressContainer);
      }

      row.appendChild(icon);
      row.appendChild(content);
      container.appendChild(row);
    });

    this.buttonsElement.appendChild(container);
  }

  hideMenu() {
    this.overlayElement.classList.add('hidden');
    this.currentMenu = null;
    this.currentMenuType = null;
  }

  isVisible() {
    return !this.overlayElement.classList.contains('hidden');
  }

  /**
   * Get all selectable items (buttons, checkboxes, sliders - not text inputs or lists)
   * Returns items in DOM order (top to bottom as displayed)
   * @returns {Array} Array of selectable item elements with metadata
   */
  getSelectableItems() {
    const items = [];

    // Traverse children in DOM order to maintain visual order
    for (const child of this.buttonsElement.children) {
      // Buttons (not disabled)
      if (child.classList.contains('menu-button') && !child.disabled) {
        items.push({ element: child, type: 'button' });
      }
      // Checkboxes (target the container for selection visual)
      else if (child.classList.contains('menu-checkbox-container')) {
        items.push({
          element: child,
          type: 'checkbox',
          input: child.querySelector('.menu-checkbox')
        });
      }
      // Sliders (target the container for selection visual)
      else if (child.classList.contains('menu-slider-container')) {
        items.push({
          element: child,
          type: 'slider',
          input: child.querySelector('.menu-slider'),
          valueDisplay: child.querySelector('.menu-slider-value')
        });
      }
    }

    return items;
  }

  /**
   * Clear gamepad selection (when mouse is used)
   */
  clearGamepadSelection() {
    const items = this.getSelectableItems();
    items.forEach(item => {
      item.element.classList.remove('gamepad-selected');
    });
  }

  /**
   * Update visual highlighting for currently selected item
   */
  updateSelection() {
    const items = this.getSelectableItems();
    if (items.length === 0) return;

    // Remove highlight from all items
    items.forEach(item => {
      item.element.classList.remove('gamepad-selected');
    });

    // If selectedIndex is -1 (no selection), don't highlight anything
    if (this.selectedIndex === -1) return;

    // Clamp selectedIndex to valid range
    this.selectedIndex = Math.max(0, Math.min(this.selectedIndex, items.length - 1));

    // Add highlight to selected item
    if (items[this.selectedIndex]) {
      items[this.selectedIndex].element.classList.add('gamepad-selected');
    }
  }

  /**
   * Navigate to next menu item (down/left)
   */
  selectNext() {
    const items = this.getSelectableItems();
    if (items.length === 0) return;

    // If no selection, start at first item
    if (this.selectedIndex === -1) {
      this.selectedIndex = 0;
    } else {
      this.selectedIndex = (this.selectedIndex + 1) % items.length;
    }
    this.updateSelection();
  }

  /**
   * Navigate to previous menu item (up/right)
   */
  selectPrevious() {
    const items = this.getSelectableItems();
    if (items.length === 0) return;

    // If no selection, start at first item
    if (this.selectedIndex === -1) {
      this.selectedIndex = 0;
    } else {
      this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
    }
    this.updateSelection();
  }

  /**
   * Activate currently selected item
   */
  activateSelected() {
    // Can't activate if nothing is selected
    if (this.selectedIndex === -1) return;

    const items = this.getSelectableItems();
    const selectedItem = items[this.selectedIndex];
    if (!selectedItem) return;

    switch (selectedItem.type) {
      case 'button':
        selectedItem.element.click();
        break;

      case 'checkbox':
        // Toggle checkbox state
        selectedItem.input.checked = !selectedItem.input.checked;
        // Trigger change event to call onChange callback
        selectedItem.input.dispatchEvent(new Event('change'));
        break;

      case 'slider':
        // Cycle through preset values: 0, 25, 50, 75, 100
        const presets = [0, 25, 50, 75, 100];
        const currentValue = parseInt(selectedItem.input.value);

        // Find next preset value
        let nextPreset = presets[0]; // Default to 0
        for (let i = 0; i < presets.length; i++) {
          if (currentValue < presets[i]) {
            nextPreset = presets[i];
            break;
          }
        }
        // If we're at or above the last preset, wrap to first
        if (currentValue >= presets[presets.length - 1]) {
          nextPreset = presets[0];
        }

        // Update slider value
        selectedItem.input.value = nextPreset;
        // Update display
        const suffix = selectedItem.valueDisplay.textContent.replace(/\d+/g, '').trim();
        selectedItem.valueDisplay.textContent = nextPreset + (suffix || '');
        // Trigger input event to call onChange callback
        selectedItem.input.dispatchEvent(new Event('input'));
        break;
    }
  }

  /**
   * Handle gamepad input for menu navigation
   * Called each frame from game loop
   * @param {Gamepad} gamepad - The gamepad object
   */
  handleGamepadInput(gamepad) {
    if (!this.isVisible()) {
      return;
    }

    // D-pad or stick for navigation
    // D-pad: buttons[12]=up, [13]=down, [14]=left, [15]=right
    // Left stick: axes[1] for up/down, axes[0] for left/right
    const dpadUp = gamepad.buttons[12]?.pressed || false;
    const dpadDown = gamepad.buttons[13]?.pressed || false;
    const dpadLeft = gamepad.buttons[14]?.pressed || false;
    const dpadRight = gamepad.buttons[15]?.pressed || false;

    const stickUp = gamepad.axes[1] < -0.5;
    const stickDown = gamepad.axes[1] > 0.5;
    const stickLeft = gamepad.axes[0] < -0.5;
    const stickRight = gamepad.axes[0] > 0.5;

    const upPressed = dpadUp || stickUp;
    const downPressed = dpadDown || stickDown;
    const leftPressed = dpadLeft || stickLeft;
    const rightPressed = dpadRight || stickRight;

    // A button (buttons[0]) to activate
    const buttonA = gamepad.buttons[0]?.pressed || false;

    // Check if there's a scrollable container in the current menu
    // Only treat it as scrollable if it has overflow-y: auto and content that can scroll
    const scrollableContainer = this.buttonsElement.querySelector('.menu-achievement-list-container');
    const hasSelectableItems = this.getSelectableItems().length > 0;

    // Check if container is actually scrollable (has overflow content)
    const isScrollable = scrollableContainer &&
                        scrollableContainer.scrollHeight > scrollableContainer.clientHeight;

    if (isScrollable && this.selectedIndex === -1) {
      // Scrollable menu mode with no button selected - use D-pad up/down to scroll content
      const scrollSpeed = 30; // pixels per input
      const isAtTop = scrollableContainer.scrollTop === 0;
      const isAtBottom = scrollableContainer.scrollTop + scrollableContainer.clientHeight >= scrollableContainer.scrollHeight;

      // Detect rising edge for scrolling
      if (upPressed && !this.lastGamepadState.dpadUp) {
        if (isAtTop && hasSelectableItems) {
          // At top - select previous button
          this.selectPrevious();
        } else {
          scrollableContainer.scrollTop -= scrollSpeed;
        }
      }
      if (downPressed && !this.lastGamepadState.dpadDown) {
        if (isAtBottom && hasSelectableItems) {
          // At bottom - select next button
          this.selectNext();
        } else {
          scrollableContainer.scrollTop += scrollSpeed;
        }
      }

      // Allow left/right to select the Back button
      if ((leftPressed && !this.lastGamepadState.dpadLeft) ||
          (rightPressed && !this.lastGamepadState.dpadRight)) {
        if (hasSelectableItems) {
          this.selectNext(); // Select first (and likely only) button
        }
      }
    } else if (hasSelectableItems) {
      // Button navigation mode - use D-pad to navigate items
      // Detect rising edge (button just pressed, wasn't pressed before)
      // Up/Right: select previous item
      if ((upPressed && !this.lastGamepadState.dpadUp) ||
          (rightPressed && !this.lastGamepadState.dpadRight)) {
        this.selectPrevious();
      }
      // Down/Left: select next item
      if ((downPressed && !this.lastGamepadState.dpadDown) ||
          (leftPressed && !this.lastGamepadState.dpadLeft)) {
        this.selectNext();
      }
      // A button: activate selected item
      if (buttonA && !this.lastGamepadState.buttonA) {
        this.activateSelected();
      }
    }

    // Update last state
    this.lastGamepadState.dpadUp = upPressed;
    this.lastGamepadState.dpadDown = downPressed;
    this.lastGamepadState.dpadLeft = leftPressed;
    this.lastGamepadState.dpadRight = rightPressed;
    this.lastGamepadState.buttonA = buttonA;
  }
}

export { MenuSystem };
