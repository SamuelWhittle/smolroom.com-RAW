console.log("perlinNoise.js");
class perlinNoise {
    constructor(args) {
        this.dimensions = args;

        this.octaveScale = this.dimensions.splice(this.dimensions.length - 1, 1)[0];
        this.numOctaves = this.dimensions.splice(this.dimensions.length - 1, 1)[0];
        this.gridMeter = this.dimensions.splice(this.dimensions.length - 1, 1)[0];
        console.log(this.dimensions, this.octaveScale, this.numOctaves, this.gridMeter);
    }
}