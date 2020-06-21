console.log("perlinNoise.js");
class perlinNoise {
    constructor(args) {
        // variables that are necessary for perlin Noise and Octaves
        this.octaveScale = args.splice(args.length - 1, 1)[0];
        this.numOctaves = args.splice(args.length - 1, 1)[0];
        this.startingGridStep = args.splice(args.length - 1, 1)[0];

        // dimensions requested of perlin noise in pixels
        this.noiseDimensions = args;

        // dimensions requested of the vector grid in units of startingGridStep
        this.gridDimensions = this.getGridDimensions(this.noiseDimensions, this.startingGridStep);

        // matrix of Length constants used in conjunction with an xyzn position 
        //     to calculate the associated position in a 1 dimensional array
        this.lengthConstants = this.getLengthConstants(this.noiseDimensions);
        
        // single dimensional array that will have all our final noise values between 0 and 1
        this.noise = new Array(this.getFlatLength(this.noiseDimensions));
        console.log(this.noise);

        // single dimensional array that will contain all our random vectors, this will change with each new octave
        this.grid = new Array(this.getFlatLength(this.gridDimensions));
        console.log(this.grid);

        // fill the grid with random n dimensional vectors with each dimension being between -gridStep and gridStep
        this.grid = fillWithRandomVectors(this.grid, this.gridDimensions, this.gridStep);
    }

    // given a single dimensional array that belongs to a perlinNoise object, fill with random vectors
    fillWithRandomVectors(grid, gridDimensions, gridStep) {
        return grid.map((currentValue, index) => {
            var vector = new Array(gridDimensions.length);
            return vector.map(() => {
                return Math.random();
            });
        });
    }

    // given array of dimensions of noise in pixels and a gridstep, returns array of dimensions of grid in gridStep
    getGridDimensions(noiseDimensions, gridStep) {
        return noiseDimensions.map((currentValue) => {
            return Math.ceil(currentValue/gridStep);
        });
    }

    // given array of dimensions of noise in pixels, returns array of length constants used later for Dot Products
    getLengthConstants(dimensions) {
        var constantLengths = new Array(dimensions.length);
        var total = 1;

        for(var i = constantLengths.length - 1; i >= 0; i--) {
            constantLengths[i] = total;
            
            total*=dimensions[i];
        }

        return constantLengths;
    }

    // given an array, return length of single dimensional array required to encompass all the same data
    getFlatLength(dims) {
        var total = 1;
        for(var i = 0; i < dims.length; i++) {
            total *= dims[i];
        }

        return total;
    }
}