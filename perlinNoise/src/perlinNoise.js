console.log("perlinNoise.js");
class perlinNoise {
    constructor(args) {
        this.octaveScale = args.splice(args.length - 1, 1)[0];
        this.numOctaves = args.splice(args.length - 1, 1)[0];
        this.gridStep = args.splice(args.length - 1, 1)[0];

        this.noiseDimensions = args;
        this.gridDimensions = this.getGridDimensions(this.noiseDimensions);

        this.lengthConstants = this.getLengthConstants(this.noiseDimensions);
        
        this.noise = new Array(this.getFlatLength(this.noiseDimensions));
        console.log(this.noise);
    }

    getGridDimensions(noiseDimensions) {

    }

    getLengthConstants(dimensions) {
        var constantLengths = new Array(dimensions.length);
        var total = 1;

        for(var i = constantLengths.length - 1; i >= 0; i--) {
            constantLengths[i] = total;
            
            total*=dimensions[i];
        }

        return constantLengths;
    }

    getFlatLength(dims) {
        console.log('getFlatLength');
        console.log(dims);
        var total = 1;
        for(var i = 0; i < dims.length; i++) {
            total *= dims[i];
        }

        return total;
    }
}