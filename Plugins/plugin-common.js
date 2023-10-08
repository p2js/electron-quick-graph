//A file that contains common elements that could be useful to most, or all, plugins.
/**
     * Class that represents a plugin.
     * @constructor
     * @param {string} name - The plugin's name
     * @param {('input'|'chart'|'output')} type - The plugin's type
     * @param {Object[]} opts - The options for the plugin
     * @param {string} opts.name - The option's name
     * @param {string} opts.label - The option's text label
     * @param {('string'|'number'|'boolean'|'list')} opts.type - The option's type (string/number/boolean/list)
     * @param {any} opts.default - The option's default value
     * @param {number} [opts.min] -  The option's minimum value (for number options)
     * @param {number} [opts.max] - The option's minimum value (for number options)
     * @param {string[]} [opts.values] - The values in the option (for list options)
     * @param {function} run - The plugin's run function
     */

class Plugin {    
    constructor(name, type, opts, run) {
        this.name = name;
        this.type = type;
        this.opts = opts;
        this.run = run;
    }
}


class Coordinate {
    constructor(xp, yp, label) {
        this.x = xp
        this.y = yp
        this.label = label || `${xp}, ${yp}`
    }

    magnitude() {
        return Math.sqrt((this.x ** 2) + (this.y ** 2));
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    scale(n) {
        this.x *= n;
        this.y *= n;
    }
}

//scale function for rescaling numbers according to bounds, usually called map()
function scale(x, inmin, inmax, outmin, outmax) {
    return (x - inmin) * (outmax - outmin) / (inmax - inmin) + outmin;
}

//scale_point is the same, but takes in coordinates as values
function scale_point(input, inmin, inmax, outmin, outmax) {
    let x = (input.x - inmin.x) * (outmax.x - outmin.x) / (inmax.x - inmin.x) + outmin.x;
    let y = (input.y - inmin.y) * (outmax.y - outmin.y) / (inmax.y - inmin.y) + outmin.y;
    return new Coordinate(x, y, input.label);
}

//midpoint returns the midpoint of 2 coordinates
function midpoint(p1, p2) {
    let x = (p1.x + p2.x) / 2;
    let y = (p1.y + p2.y) / 2;
    return new Coordinate(x, y);
}

module.exports = { Plugin, Coordinate, scale, scale_point, midpoint};