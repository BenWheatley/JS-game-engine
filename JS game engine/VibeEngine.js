class VibeEngine {
	constructor(document, canvasName) {
		if (!VibeEngine.instance) {
			this._document = document;
			this._canvas = document.getElementById(canvasName);
			this._configureUserInput();

			VibeEngine.instance = this;
		}

		return VibeEngine.instance;
	}
	
	_configureUserInput() {
		this._mousePos = new Vector2D();
		this._canvas.addEventListener("mousemove", (e) => {
			this._mousePos.x = e.clientX;
			this._mousePos.y = e.clientY;
		});
		this._keyDown = {};
		this._document.addEventListener('keydown', (e) => {
			this._keyDown[e.key] = true;
		});
		this._document.addEventListener('keyup', (e) => {
			this._keyDown[e.key] = false;
		});
		this._document.addEventListener("gamepadconnected", function(e) {
			const gamepad = e.gamepad;
			console.log("Gamepad connected:", gamepad.id);
		});
		this._document.addEventListener("gamepaddisconnected", function(e) {
			const gamepad = e.gamepad;
			console.log("Gamepad disconnected:", gamepad.id);
		});

		// Listen for fullscreen changes to restore canvas style
		const fullscreenChangeHandler = () => {
			if (!this.isFullScreen) {
				// Remove fullscreen inline styles to restore canvas to original size
				this._canvas.style.position = '';
				this._canvas.style.top = '';
				this._canvas.style.left = '';
				this._canvas.style.width = '';
				this._canvas.style.height = '';
			}
		};
		this._document.addEventListener('fullscreenchange', fullscreenChangeHandler);
		this._document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
		this._document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
		this._document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);
	}
	
	get mousePos() { return this._mousePos; }
	get keyDown() { return this._keyDown; }
	
	enterFullScreen() {
		const element = this._document.documentElement;
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) { // Firefox
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
			element.webkitRequestFullscreen();
		} else if (element.msRequestFullscreen) { // IE/Edge
			element.msRequestFullscreen();
		}

		// make canvas full screen
		var style = this._canvas.style;
		style.position = 'fixed';
		style.top = '0';
		style.left = '0';
		style.width = '100%';
		style.height = '100%';
	}
	
	exitFullScreen() {
		if (this._document.exitFullscreen) {
			this._document.exitFullscreen();
		} else if (this._document.mozCancelFullScreen) { // Firefox
			this._document.mozCancelFullScreen();
		} else if (this._document.webkitExitFullscreen) { // Chrome, Safari, Opera
			this._document.webkitExitFullscreen();
		} else if (this._document.msExitFullscreen) { // IE/Edge
			this._document.msExitFullscreen();
		}

		// Remove fullscreen inline styles to restore canvas to original size
		this._canvas.style.position = '';
		this._canvas.style.top = '';
		this._canvas.style.left = '';
		this._canvas.style.width = '';
		this._canvas.style.height = '';
	}
	
	get isFullScreen() {
		const doc = this._document;
		return (
			doc.fullscreenElement ||
			doc.mozFullScreenElement ||
			doc.webkitFullscreenElement ||
			doc.msFullscreenElement
		);
	}
	
	toggleFullScreen() {
		if (this.isFullScreen) {
			this.exitFullScreen();
		} else {
			this.enterFullScreen();
		}
	}

	/**
	 * Starts the game loop with provided update and render callbacks
	 * @param {Function} updateCallback - Called each frame with deltaTime (ms)
	 * @param {Function} renderCallback - Called each frame to render
	 * @param {Function} loadingCheckCallback - Optional callback that returns true if still loading
	 */
	start(updateCallback, renderCallback, loadingCheckCallback = null) {
		this._updateCallback = updateCallback;
		this._renderCallback = renderCallback;
		this._loadingCheckCallback = loadingCheckCallback;
		this._lastCallTime = Date.now();
		this._loop();
	}

	_loop() {
		const currentTime = Date.now();
		const deltaTime = currentTime - this._lastCallTime;
		this._lastCallTime = currentTime;

		// Skip update/render if still loading
		if (this._loadingCheckCallback && this._loadingCheckCallback()) {
			window.requestAnimationFrame(() => this._loop());
			return;
		}

		// Call update and render callbacks
		this._updateCallback(deltaTime);
		this._renderCallback();

		// Continue the loop
		window.requestAnimationFrame(() => this._loop());
	}

	static begin(document, canvasName) {
		return new VibeEngine(document, canvasName);
	}
}
