const { jsPDF } = require("jspdf");
const { Plugin } = require("./plugin-common");

const blobToBase64 = blob => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
        reader.onloadend = () => {
            resolve(reader.result);
        };
    });
};

async function outputPDF(blob, opts) {
    const pdf = new jsPDF({
        orientation: opts.orientation,
        format: opts.format,
        unit: "in"
    }); 
    const b64 = await blobToBase64(blob);
    pdf.addImage(b64, "png", 1, 1, 4, 3);

    blob = new Blob([pdf.output("arraybuffer")]);
    var a = document.createElement("a"),
        url = URL.createObjectURL(blob);
    a.href = url;
    a.download = "chart.pdf";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0); 
}

const pluginOptions = [
    {
        name: "orientation",
        label: "Document orientation:",
        type: "list",
        values: ["portrait", "landscape"]
    },
    {
        name: "format",
        label: "Document format:",
        type: "list",
        values: ["a4", "a3", "letter"]
    }
]


module.exports = new Plugin("output as PDF", "output", pluginOptions, outputPDF);