class MenuSystem {
  constructor(overlayElement, titleElement, buttonsElement, instructionsElement) {
    this.overlayElement = overlayElement;
    this.titleElement = titleElement;
    this.buttonsElement = buttonsElement;
    this.instructionsElement = instructionsElement;
    this.currentMenu = null;
  }

  showMenu(menuConfig) {
    this.currentMenu = menuConfig;

    // Set title
    this.titleElement.textContent = menuConfig.title;

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

    // Focus input when created if autofocus is enabled
    if (config.autofocus) {
      setTimeout(() => input.focus(), 100);
    }

    container.appendChild(label);
    container.appendChild(input);
    this.buttonsElement.appendChild(container);
  }

  hideMenu() {
    this.overlayElement.classList.add('hidden');
    this.currentMenu = null;
  }

  isVisible() {
    return !this.overlayElement.classList.contains('hidden');
  }
}
