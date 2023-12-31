class Sprite {
	constructor(imageUrl, position, size) {
		this.imageUrl = imageUrl;
		this.imageBitmap = Sprite.getFromCache(imageUrl);
		if (!this.imageBitmap) {
			console.log(`Image not found in cache: ${imageUrl}`);
		}
		this.position = position;
		this.size = size;
		this.rotation = 0.0;
	}
	
	draw() {
		if (!Sprite._context) {
			throw new Error('Sprite context not set. Call `Sprite.begin(context)` to set the context before drawing.');
		}
		if (this.imageBitmap == null) {
			this.imageBitmap = Sprite.getFromCache(this.imageUrl);
			return;
		}
		
		Sprite._context.save();
		Sprite._context.translate(this.position.x, this.position.y);
		Sprite._context.rotate(this.rotation);
		Sprite._context.drawImage(
			this.imageBitmap,
			-this.size.x/2, -this.size.y/2,
			this.size.x, this.size.y
		);
		Sprite._context.restore();
	}
	
	static _context;
	static cache = {};
	static loadingSprites = {};
	
	static async preloadSprites(imageUrls) {
		for (const imageUrl of imageUrls) {
			await Sprite.preloadSprite(imageUrl);
		}
	}
	
	static async preloadSprite(imageUrl) {
		if (Sprite.isCached(imageUrl)) {
			return;
		}
		
		Sprite.loadingSprites[imageUrl] = true;
		
		try {
			const response = await fetch(imageUrl);
			const blob = await response.blob();
			const imageBitmap = await createImageBitmap(blob);
			Sprite.cache[imageUrl] = imageBitmap;
		} catch (error) {
			console.error(`Failed to load sprite: ${imageUrl}: ${error}`);
			throw error;
		} finally {
			delete Sprite.loadingSprites[imageUrl];
		}
	}
	
	static isCached(imageUrl) {
		return imageUrl in Sprite.cache;
	}
	
	static getFromCache(imageUrl) {
		return Sprite.cache[imageUrl];
	}
	
	static stillLoading() {
		const loadingSprites = Object.keys(Sprite.loadingSprites);
		if (loadingSprites.length > 0) {
			console.log(`Stuck loading sprites: ${loadingSprites.join(", ")}`);
		}
		return loadingSprites.length > 0;
	}
	
	static begin(context) {
		Sprite._context = context;
	}
}
