const { Plugin, Coordinate, scale_point} = require("./plugin-common");

//function for determining an upper/lower bound to the graph given the range of values
//by calling the function with (max, min) it will return the upper bound
//by calling the function with (min, max) it will return the lower bound
function bound(valueA, valueB) {
    let range = valueA - valueB;
    //calculate the rounded down power of 10 of the range (for rounding)
    let flooredp10 = floorp10(range)
    return valueA + Math.round((0.05 * range) / flooredp10) * flooredp10
}

//function for calculating the rounded down power of 10 of a number
//this is very useful for rounding or figuring out the order of magnitude we're working with
const floorp10 = (val) => 10 ** (Math.floor(Math.log10(Math.abs(val))) - 1);

async function scatterPlot(coordset, opts) {
    coordset = coordset.coordArray;
    //if the coordinate set has axis titles in the first row, use them, unless axis titles weren't defined in the opts
    if ((typeof coordset[0].x == "string") || (typeof coordset[0].y) == "string") {
        if (!opts.xtitle) opts.xtitle = coordset[0].x
        if (!opts.ytitle) opts.ytitle = coordset[0].y
        coordset = coordset.slice(1);
    }

    if (!opts.title) {
        opts.title (opts.xtitle && opts.ytitle) ? `${opts.xtitle} vs.${opts.ytitle}` : "Scatter Plot";
    }

    //sort the coordinate set according to ascending x values
    coordset.sort((a, b) => { return a.x - b.x });

    //create new arrays with the x and y coordinates from the input set
    let xset = coordset.map(c => c.x);
    let yset = coordset.map(c => c.y).sort((a, b) => { return a - b });
    //get the max and min values from these sets
    const min = new Coordinate(xset[0], bound(yset[0], yset[yset.length - 1]));
    //for the maximum Y value we use upperBound function as defined earlier
    const max = new Coordinate(xset[xset.length - 1], bound(yset[yset.length - 1], yset[0]));

    //we want the graph itself to be some % of the real image size
    //in both width and height such that we can add some border stuff
    const graphWidth = opts.width * 0.85;
    const graphHeight = opts.height * 0.75;
    let graphCanvas = document.getElementById("chartCanvas");  //cv.createCanvas(graphWidth, graphHeight);
    let graphCtx = graphCanvas.getContext("2d");

    //fill the chart with a light gray background
    graphCtx.fillStyle = "#EEEEEE";
    graphCtx.fillRect(0, 0, graphWidth, graphHeight);
    graphCtx.lineWidth = 2;

    //figure out the graph bounds using the max plus a little bit of arbitrary tolerance
    const xTolerance = 0.04;
    const yTolerance = 0//.05;
    const graphMax = new Coordinate(graphWidth * (1 - xTolerance), graphHeight * yTolerance);
    const graphMin = new Coordinate(graphWidth * xTolerance, graphHeight * (1 - yTolerance));

    graphCtx.fillStyle = opts.color;
    //draw lines if the option is set to true
    if (opts.lines) {
        graphCtx.globalAlpha = 0.5;
        graphCtx.strokeStyle = opts.color;
        graphCtx.beginPath();
        let initialPoint = scale_point(coordset[0], min, max, graphMin, graphMax);
        graphCtx.moveTo(initialPoint.x, initialPoint.y);
        for (let i = 1; i < xset.length; i++) {
            let nextPoint = scale_point(coordset[i], min, max, graphMin, graphMax);
            graphCtx.lineTo(nextPoint.x, nextPoint.y);
        };
        graphCtx.stroke();
        graphCtx.globalAlpha = 1;
    }


    //plot the points
    let pointRadius = (graphWidth + graphHeight) / 300;
    for (let coordinate of coordset) {
        let scaled = scale_point(coordinate, min, max, graphMin, graphMax);
        graphCtx.beginPath();
        graphCtx.arc(scaled.x, scaled.y, pointRadius, 0, 2 * Math.PI);
        graphCtx.fill();
    }

    //make the bigger image and put the graph on it
    let imageCanvas = document.getElementById("chartCanvas2");
    let imageCtx = imageCanvas.getContext("2d");
    imageCtx.fillStyle = "#EEEEEE";
    imageCtx.fillRect(0, 0, opts.width, opts.height);
    imageCtx.drawImage(graphCanvas, (opts.width - graphWidth) / 1.6, (opts.height - graphHeight) / 2.3);
    
    imageCtx.textAlign = "center";


    imageCtx.fillStyle = "#000000";
    //x and y axis label/grid lines
    let xOffset = graphWidth * xTolerance;
    let xPosition = (opts.width - graphWidth) / 1.6 + xOffset;
    let xLength = graphWidth - 2 * xOffset;
    let xHeight = graphHeight + (opts.height - graphHeight) / 2.3

    let yOffset = graphHeight * yTolerance;
    let yPosition = (opts.height - graphHeight) / 2.3 + yOffset;
    let yLength = graphHeight - 2 * yOffset;
    let yWidth = (opts.width - graphWidth) / 1.6 + xOffset - 1;

    //x axis
    //make an array of the numbers that will go in the 5 label lines
    let xLabelRatio = (max.x - min.x) / 4
    let xLabelArray = [min.x, min.x + xLabelRatio, min.x + 2 * xLabelRatio, min.x + 3 * xLabelRatio, max.x];
    imageCtx.font = "20px Calibri";
    for (let i = 0; i < 5; i++) {
        let xLineCoord = xPosition + i / 4 * xLength;
        imageCtx.fillRect(xLineCoord - 1, xHeight * 0.98, 2, xHeight * 0.04);
        imageCtx.fillText(xLabelArray[i].toString(), xLineCoord - 1, xHeight * 1.06);
        imageCtx.globalAlpha = 0.3;
        imageCtx.fillRect(xLineCoord, (opts.height - graphHeight) / 2.3, 2, yLength);
        imageCtx.globalAlpha = 1;
    }
    //y axis
    //array
    let yLabelRatio = (max.y - min.y) / 4
    let yLabelArray = [min.y, min.y + yLabelRatio, min.y + 2 * yLabelRatio, min.y + 3 * yLabelRatio, max.y];
    for (let i = 0; i < 5; i++) {
        let yLineCoord = yPosition + i / 4 * yLength;
        imageCtx.fillRect(yWidth * 0.90, yLineCoord, yWidth * 0.2, 2);
        imageCtx.fillText(yLabelArray[4 - i].toString(), yWidth * 0.70, yLineCoord + 7);
        imageCtx.globalAlpha = 0.3;
        imageCtx.fillRect(yWidth, yLineCoord, xLength, 2);
        imageCtx.globalAlpha = 1;
    }

    //axis lines
    if(opts.xtitle) imageCtx.fillRect(xPosition, xHeight, xLength, 2);
    if(opts.ytitle) imageCtx.fillRect(yWidth, yPosition, 2, yLength);

    //draw title
    imageCtx.fillStyle = "#000000";
    imageCtx.font = "bold 28px Calibri";
    imageCtx.fillText(opts.title, opts.width * 0.50, opts.height * 0.07, opts.width, opts.height);

    //draw x-axis title
    imageCtx.font = "24px Calibri";
    imageCtx.fillText(opts.xtitle, opts.width * 0.50, opts.height * 0.97, opts.width, opts.height);

    //draw y-axis title
    imageCtx.save();
    imageCtx.translate(0, 0);
    imageCtx.rotate(-Math.PI / 2);
    imageCtx.fillText(opts.ytitle, -opts.height * 0.5, opts.width * 0.035, opts.width, opts.height);
    imageCtx.restore();

    //output buffer
    let buffer = await(new Promise(resolve => imageCanvas.toBlob(resolve)));
    return buffer;
}

const pluginOptions = [
    {
        name: "title",
        label: "Chart Title",
        type: "string",
        default: "Scatter Plot"
    },
    {
        name: "width",
        label: "Chart width (px)",
        type: "number",
        default: "800",
        min: "800"
    },
    {
        name: "height",
        label: "Chart height (px)",
        type: "number",
        default: "600",
        min: "600"
    },
    {
        name: "xtitle",
        label: "X-axis Title",
        type: "string",
    },
    {
        name: "ytitle",
        label: "Y-axis Title",
        type: "string",
    },
    {
        name: "lines",
        label: "Enable Lines",
        type: "boolean",
        default: true
    },
    {
        name: "color",
        label: "Data color",
        type: "string",
        default: "#0352fc"
    }
];

const plugin = new Plugin("Scatter plot / line chart", "chart", pluginOptions, scatterPlot);

module.exports = plugin;