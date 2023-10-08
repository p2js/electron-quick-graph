const { Plugin } = require('./plugin-common');

function outputPNG(blob) {
    var a = document.createElement("a"),
        url = URL.createObjectURL(blob);
    a.href = url;
    a.download = "chart.png";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0); 
}

module.exports = new Plugin("Output as Image (.png)", "output", null, outputPNG);