class Color {
	constructor(r, g, b) {
		this.rgb = new Array(3);

        this.rgb[0] = r;
        this.rgb[1] = g;
        this.rgb[2] = b;
	}

	getNegative() {
		return new Color(255 - this.rgb[0], 255 - this.rgb[1], 255 - this.rgb[2]);
	}

    getRGBString() {
        return "rgb(" + this.rgb[0] + ", " + this.rgb[1] + ", " + this.rgb[2] + ")";
    }
}
