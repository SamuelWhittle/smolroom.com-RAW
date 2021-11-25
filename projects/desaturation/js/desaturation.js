// class to contain an array of all the colors needed for the desaturation scale
class DesaturationScale {
    constructor(color, w, h) {
        this.originalColor = color;
        this.originalNegative = this.originalColor.getNegative();
        this.width = w;
        this.height = h;
        
        // all da colors, 3D array of colors, depth = rgb
        this.colorArray = new Array(w);

        for(var i = 0; i < this.colorArray.length; i++) {
            this.colorArray[i] = new Array(h);
            for(var k = 0; k < this.colorArray[i].length; k++) {
                this.colorArray[i][k] = new Color;
            }
        }

        this.desaturate();
    }

    // Change Color
    setOriginalColor(color) {
        this.originalColor = color;
        this.originalNegative = color.getNegative();
        this.desaturate();
    }

    // lerp function given a percent between 0.0 and 1.0
    lerp(start, stop, percent) {
        return (1 - percent) * start + (percent * stop);
    }

    // fill colorArray with colors
    desaturate() {
        var blackColor = new Color(0, 0, 0);
        var whiteColor = new Color(255, 255, 255);

        this.colorArray = this.colorArray.map((column, widthIndex) => {
            return column.map((color, heightIndex) => {
                for(var rgb = 0; rgb < 3; rgb++) {
                    var originalLerp = this.lerp(this.originalColor.rgb[rgb], this.originalNegative.rgb[rgb], widthIndex/this.width);

                    if(heightIndex < Math.floor(this.height/2)) {
                        color.rgb[rgb] = this.lerp(blackColor.rgb[rgb], originalLerp, heightIndex/Math.floor(this.height/2));
                    }else {
                        color.rgb[rgb] = this.lerp(originalLerp, whiteColor.rgb[rgb], heightIndex/Math.floor(this.height/2)-1);
                    }
                }

                return color;
            })
        });
    }
}
