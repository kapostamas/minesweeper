class HyperDrawing {
	constructor() {
		this.#initializeCanvas();
	}

	#modelProjection = 1; // 0: Klein; 1: Poincaré; 1–∞: ellipses

	set modelProjection(val) {
		this.#modelProjection = val;
		this.redraw();
	}

	#initializeCanvas() {
	}

	#getSegment(normalΦ, normalR, beginΦ, endΦ) {
		return "";
	}

	#hyperPolarToCanvas(φ, r) {

	}
}