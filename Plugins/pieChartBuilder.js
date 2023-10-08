const { Plugin, Coordinate } = require("./plugin-common");

//set of colors to use in pie slices
const chartColors = ["#cc1b20", "#0b98d9", "#79cc0c", "#cccc00", "#e65ca1", "#e68200", "#7a52cc",
                     "#4d0a0c", "#065073", "#4c8008", "#808000", "#ab1565", "#995700", "#4c3380"]


async function pieChart(valueSet, opts) {
    if (valueSet.type != "Labeled1D") alert("incompatible data type");
    
    valueSet = valueSet.coordArray;
    //if the parameter includes a true "ordered" parameter, sort the array from biggest percentage to smallest

    if (opts.ordered) valueSet = valueSet.sort((a, b) => b.value - a.value);

    //compute the total value of the numbers in the set (to later get a percentage of the total)
    let valueTotal = 0;
    for (let i = 0; i < valueSet.length; i++) {
        valueTotal += valueSet[i].value
    }

    //set up the chart's canvas context
    let canvas = document.getElementById("chartCanvas"); //require("canvas").createCanvas(opts.width, opts.height);
    let ctx = canvas.getContext("2d");
    ctx.font = "24px Calibri";
    ctx.textAlign = "center";

    //fill the chart with a light gray background
    ctx.fillStyle = "#DDDDDD";
    ctx.fillRect(0, 0, opts.width, opts.height);
    ctx.lineWidth = 2;
    //store the center point of the pie in a coordinate
    let center = new Coordinate(opts.width / 2, opts.height / 1.8);
    //set the pie's radius to half of 80% of the smallest image size measure (so the total diameter is 80%)
    let pieRadius = 0.35 * Math.min(opts.height, opts.width);
    //keep a running total (in radians) of the angle that has already been taken up by the chart
    let runningTotalAngle = - Math.PI / 2;

    for (let i = 0; i < valueSet.length; i++) {
        if (valueSet[i].value <= 0) continue;

        //get a ratio of the total and a measure in radians of how much that is
        let ratio = valueSet[i].value / valueTotal;
        let radians = ratio * Math.PI * 2;
        //use the running total angle to figure out angles to and from
        let angleFrom = runningTotalAngle;
        let angleTo = runningTotalAngle + radians;
        //compute the xy coordinates of the to and from angles
        let pointFrom = new Coordinate(pieRadius * Math.cos(angleFrom) + center.x, pieRadius * Math.sin(angleFrom) + center.y);
        let pointTo = new Coordinate(pieRadius * Math.cos(angleTo) + center.x, pieRadius * Math.sin(angleTo) + center.y);
        //begin a path and draw a line from the center to pointFrom, an arc to pointTo, then a line back to center
        ctx.fillStyle = chartColors[i % chartColors.length];
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(pointFrom.x, pointFrom.y);
        ctx.arc(center.x, center.y, pieRadius, angleFrom, angleTo);

        ctx.moveTo(pointTo.x, pointTo.y);
        ctx.lineTo(center.x, center.y);
        ctx.fill();

        let midpointAngle = (angleFrom + angleTo) / 2;
        let labelPoint = new Coordinate(1.05 * pieRadius * Math.cos(midpointAngle) + center.x, 1.2 * pieRadius * Math.sin(midpointAngle) + center.y);
        let labelValue = (ratio * 100).toFixed(1);
        //set the position of the text to either right center or left depending on the position along the circle
        
        if (midpointAngle <= Math.PI / 4 - Math.PI / 2 ||
            midpointAngle >= Math.PI * 7 / 4 - Math.PI / 2 ||
            (midpointAngle >= Math.PI * 3 / 4 - Math.PI / 2 && midpointAngle <= Math.PI * 5 / 4 - Math.PI /2))
        {
            ctx.textAlign = "center";
        } else if (midpointAngle < Math.PI * 3 / 4 - Math.PI / 2) {
            ctx.textAlign = "left";
        } else {
            ctx.textAlign = "right";
        }

        ctx.fillStyle = "#000000";
        ctx.fillText(`${valueSet[i].label}\n${labelValue}%`, labelPoint.x, labelPoint.y);

        //also push the percentage value
        runningTotalAngle += radians;
    }

    //draw chart title
    //draw title
    ctx.textAlign = "center";
    ctx.fillStyle = "#000000";
    ctx.fillText(opts.title, opts.width * 0.50, opts.height * 0.06, opts.width, opts.height);

    //output buffer
    let buffer = await (new Promise(resolve => canvas.toBlob(resolve)));
    return buffer;
}

const pluginOptions = [
    {
        name: "title",
        label: "Chart Title",
        type: "string",
        default: "Pie Chart"
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
        name: "ordered",
        label: "Order by percentage (highest first)",
        type: "boolean",
        default: false
    }
]
    
module.exports = new Plugin("Pie Chart", "chart", pluginOptions, pieChart);