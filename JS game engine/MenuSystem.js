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

    // Clear existing buttons
    this.buttonsElement.innerHTML = '';

    // Create buttons
    menuConfig.buttons.forEach(buttonConfig => {
      const button = document.createElement('button');
      button.className = 'menu-button';
      button.textContent = buttonConfig.label;
      button.onclick = buttonConfig.action;
      this.buttonsElement.appendChild(button);
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

  hideMenu() {
    this.overlayElement.classList.add('hidden');
    this.currentMenu = null;
  }

  isVisible() {
    return !this.overlayElement.classList.contains('hidden');
  }
}
