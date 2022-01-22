//console.log("perlinNoise.js");
class perlinNoise {
    constructor(dims, gridStep, numOctaves, octaveScale, interp) {
        //console.group("constructor");
        // interp function
        this.interp = interp ?? ((start, end, position) => {
            // smooth interp position adjustment
            position = position*position*(3-2*position);
            // return lerp given the start end and position
            return start*(1-position)+end*position;
        });

        // variables that are necessary for perlin Noise and Octaves
        this.octaveScale = octaveScale ?? 1/2;
        this.numOctaves = numOctaves ?? 3;
        this.startingGridStep = gridStep ?? 30;

        // array of dimensions requested of perlin noise in pixels
        this.noiseDimensions = dims ?? [100, 100, 100]; 
        
        // //console.log(
        //     "Arguments Passed to new perlinNoise()" + 
        //     "\nnoiseDimensions = " + this.noiseDimensions +
        //     "\nstartingGridStep = " + this.startingGridStep + 
        //     "\nnumOctaves = " + this.numOctaves + 
        //     "\noctaveScale = " + this.octaveScale
        // );

        //array of gris steps calcualted from the starting grid step, octave scale, and number of octaves
        this.gridSteps = new Array(this.numOctaves).fill().map((_, index) => {
            //octave multiplier
            var octaveMultiplier = Math.pow(this.octaveScale, index);

            //Get the grid step for the current octave
            var currentGridStep = Math.floor(this.startingGridStep*octaveMultiplier);

            return currentGridStep;
        });
        //console.log("grid steps array:", this.gridSteps);

        // array of grid dimensions, one set of dimensions for each octave's grid
        this.gridSizes = new Array(this.numOctaves);
        //console.log(this.gridSizes);

        //Array containing all the grids of vectors
        this.grids = new Array(this.numOctaves).fill().map((_, index) => {

            //Get the current octave grid dimensions
            var currentGridDimensions = this.getGridDimensions(this.noiseDimensions, this.gridSteps[index]);
            this.gridSizes[index] = currentGridDimensions;
            //console.log(currentGridDimensions);

            //Create grid of vectors based on the current octave grid dimensions and a number of dimensions to make the vectors
            var grid = this.createFullFlatGrid(currentGridDimensions);

            return grid;
        });
        //console.log("grids:", this.grids);

        // matrix of Length constants used in conjunction with an x,y,z,...,n position 
        //     to calculate the associated position in a 1 dimensional array
        this.lengthConstants = new Array(this.numOctaves).fill().map((_, index) => {
            return this.getLengthConstants(this.gridSizes[index]);
        });
        //console.log("Length Constants =", this.lengthConstants);


        //array of unit corners based on the number of dimensions in play used to locate local corners
        this.unitCorners = new Array(Math.pow(2, this.noiseDimensions.length)).fill().map((_, index) => {
            return this.numToBinArr(index);
        });
        
        this.numToBinArr(this.noiseDimensions.length);
        //console.log("Unit Corners:", this.unitCorners);

        //console.groupEnd();
    }

    // takes an x, presumably somewhere on a lerp, and makes it a smooth interpolation vs linear
    smoothStep(x) {
        return x*x*(3-2*x);
    }

    // Linear Interpolation function with calculation inserted to produce a smooth interp
    smoothInterp(start, stop, position){
        var smoothPos = this.smoothStep(position);
        return start * (1 - smoothPos) + stop * smoothPos;
    }

    //Dot Product
    dotProduct(vector1, vector2) {
        //console.log("vector 1", vector1, "vector2", vector2)
        return vector1.map((val, index) => {
            return val*vector2[index];
        }).reduce((acc, val) => {
            return acc+val;
        }, 0);
    }


    //Given a set of coords, the grids, and the grid steps, calculate a point of noise
    getNoisePixel(coords) {
        //console.log("coords: ", coords);
        //console.log("gridSized:", this.gridSizes);
        //For each gridStep in GridSteps, get the gridStep and octave and do stuff with em
        return this.gridSteps.reduce((acc, gridStep, octave) => {
            //console.group("Octave: " + octave.toString());
            //console.log("Current gridStep:", gridStep);

            // "local" here-in means "dealing with the grid square the pixel is in"
            // localCornerFloors is the uppermost left grid location 
            //  e.g.(coords = [x, y] = [45, 50], gridStep = 30,
            //  localCornerFloors would be [1, 1]
            var localCornerFloors = coords.map(val => Math.floor(val/gridStep));

            // add the local corner floors to the unit corners to get the local corners surrounding the point
            var localCorners = this.unitCorners
                .map((unitCorner) => unitCorner
                    .map((value, index) => value + localCornerFloors[index]));
            //console.log("LocalCorners pre-modules:", localCorners);

            // get the pixel locations of the local corners given the grid locations of the local corners
            var localPixelCorners = localCorners
                .map((corner) => corner.map((val) => val*gridStep));
            //console.log("local pixel corners:", localPixelCorners);

            localCorners = localCorners.map((corner) => corner.map((value, index) => value % this.gridSizes[octave][index]));
            //console.log("localCorners post-modules:", localCorners);

            // get the vectors that correspond to the local corners after they've been adjusted for looping overflow
            var localCornerVectors = localCorners
                .map((corner) => this.dotProduct(corner, this.lengthConstants[octave]))
                    .map((val) => {
                        //console.log(val);
                        //console.log(this.grids[octave][val]);
                        // implement hashing function instead of array to store vectors
                        return this.grids[octave][val];
                    });
            //console.log("local corner vectors:", localCornerVectors);
            
            var localVectors = localPixelCorners
                .map((corner) => corner
                    .map((coordinate, index) => coords[index]-coordinate)
                    .map((val) => val/gridStep));
            //console.log("localVectors:", localVectors);

            var localGradients = localCornerVectors
                .map((vector, index) => 
                this.dotProduct(vector, localVectors[index]));
            //console.log("local gradient info:", localGradients);

            var interpRatios = localVectors[0];

            var output = new Array();

            while(interpRatios.length > 0) {
                var ratio = interpRatios.pop();

                output = new Array();

                for(var i = 0; i < localGradients.length; i+=2) {
                    output.push(this.interp(localGradients[i], localGradients[i+1], ratio));
                }

                localGradients = output;
            }
            
            //console.groupEnd();
            return acc+localGradients[0]*Math.pow(this.octaveScale, octave);

        }, 0);
    }

    //inline function to create a binary array from a given number
    numToBinArr(num){
        return num.toString(2).padStart(this.noiseDimensions.length, '0').split('').map(val => Number(val)); 
    }

    //create array of vectors, number of vector dims = numDims
    createFullFlatGrid(emptyGridDimensions) {
        //Get the flat length of the provided array
        var flatLength = this.getFlatLength(emptyGridDimensions);
        //console.log(flatLength);

        //Get the number of dimensions of the provided array
        var numDims = emptyGridDimensions.length;

        //new array of length length, fill it.
        var flatGrid = new Array(flatLength).fill();

        // fill array with random vectors given the number of dimensions to make the vectors
        var grid = this.fillWithRandomVectors(flatGrid, numDims);

        return grid;
    }

    // hash function for strings
    hashString(str, seed) {
        let checkedSeed = seed ?? 0
        let h1 = 0xdeadbeef ^ checkedSeed, h2 = 0x41c6ce57 ^ checkedSeed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
        h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1>>>0);
    };

    // given a single dimensional array, a number of dimensions, and a max vector length in any dimension, fill with random vectors
    fillWithRandomVectors(arr, numDims) {
        return arr.map(() => {
            var vector = new Array(numDims).fill();
            return vector.map(() => {
                return Math.random()*2 - 1;
            });
        });
    }

    // given array of dimensions of noise in pixels and a gridstep, returns array of dimensions of grid in gridStep
    getGridDimensions(noiseDimensions, gridStep) {
        return noiseDimensions.map((currentValue) => {
            return Math.ceil(currentValue/gridStep) + 1;
        });
    }

    // given array of dimensions of noise in pixels, returns array of length constants used later to calculate 1d coords from nd coords
    getLengthConstants(dimensions) {
        var lengthConstants = new Array(dimensions.length);
        var total = 1;

        for(var i = lengthConstants.length - 1; i >= 0; i--) {
            lengthConstants[i] = total;
            
            total*=dimensions[i];
        }

        return lengthConstants;
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


// transform a number from one range to another range
function map(num, oldMin, oldMax, min, max) {
    return (num-oldMin)/(oldMax-oldMin)*(max-min)+min;
}
