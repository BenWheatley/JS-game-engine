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
}
