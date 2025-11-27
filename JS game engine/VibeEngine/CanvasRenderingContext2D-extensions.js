CanvasRenderingContext2D.prototype.strokeAndFillText = function (text, x, y) {
  this.strokeText(text, x, y);
  this.fillText(text, x, y);
};

// Export is empty since this just extends the global CanvasRenderingContext2D
export {};
