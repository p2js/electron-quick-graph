//library imports
const loadPlugins = require("./pluginLoader");

//load and import all the plugins
plugins = loadPlugins();

let data;
let chart;

//helper to turn a plugin option specification into an html element
const optionToElement = (opt) => {
    let el = `<p class="settingsText">${opt.label}`;
    switch (opt.type) {
        case "boolean":
            el += `<input type="checkbox" id="${opt.name}" class="setting" ${opt.default ? "checked" : ""}/>`
            break;
        case "number":
            el += `<input type="number" id=${opt.name} class="setting" ${opt.min ? `min="${opt.min}"` : ""} ${opt.max ? `max="${opt.max}"` : ""} ${opt.default ? `value="${opt.default}"` : ""}/>`
            break;
        case "string":
            el += `<input type="text" id="${opt.name}" class="setting" value="${opt.default ? opt.default : ""}">`
            break;
        case "list":
            let values = opt.values.map(v => `<option value=${v} ${v == opt.default ? "selected" : ""}>${v}</option>`);
            el += `<select id="${opt.name}" class="setting">${values.join("")}</select>`
            break;
    }
    return el + "<p/>";
}

window.addEventListener("DOMContentLoaded", () => {
    //set elements
    let elements = {};
    let elementNames = [
        "inputPage",
        "inputForward",
        "fileInput",
        "fileLabel",
        "inputSelect",
        "inputOptionsContainer",
        "importButton",
        "importReport",
        "graphPage",
        "graphBackward",
        "graphForward",
        "chartSelect",
        "chartOptionsContainer",
        "chartReport",
        "chartButton",
        "outputPage",
        "outputBackward",
        "chartPreview",
        "outputSelect",
        "outputOptionsContainer",
        "outputReport",
        "outputButton"
    ];
    elementNames.forEach(x => elements[x] = document.getElementById(x));
    //hide the 2 latter pages of the program by default
    graphPage.classList.toggle("hidden");
    outputPage.classList.toggle("hidden");

    //set the navigation buttons' behavior to hide/unhide the relevant pages
    inputForward.addEventListener("click", () => {
        inputPage.classList.toggle("hidden");
        graphPage.classList.toggle("hidden");
    });
    graphBackward.addEventListener("click", () => {
        inputPage.classList.toggle("hidden");
        graphPage.classList.toggle("hidden");
    });

    graphForward.addEventListener("click", () => {
        graphPage.classList.toggle("hidden");
        outputPage.classList.toggle("hidden");
        //this button also has the role of updating the graph preview if the chart exists
        if (chart) {
            chartPreview.src = URL.createObjectURL(chart);
        }
    });
    outputBackward.addEventListener("click", () => {
        graphPage.classList.toggle("hidden");
        outputPage.classList.toggle("hidden");
    });

    //INPUT

    //change the file selection text based on the uploaded file
    fileInput.addEventListener("change", (e) => {
        fileLabel.innerText = `Use file: ${fileInput.files[0].name}`
    });

    //add all the plugins as options in the various plugin selections
    plugins.input.forEach(p => {
        inputSelect.add(new Option(p.name, p.name));
    });

    inputSelect.addEventListener("change", (e) => {
        let selectedPlugin = inputSelect.value;
        selectedPlugin = plugins.input.find(p => p.name == selectedPlugin);
        if (!selectedPlugin.opts) selectedPlugin = "This plugin has no options.";
        else selectedPlugin = selectedPlugin.opts.map(option => optionToElement(option)).join("");
        inputOptionsContainer.innerHTML = `<br/>` + selectedPlugin;
    });

    importButton.addEventListener("click", async () => {
        let statusAlert = (message) => {
            importReport.innerText = message;
            setTimeout(() => { importReport.innerText = "" }, 5000);
        };

        let selectedPlugin = inputSelect.value;
        if (!selectedPlugin) return statusAlert("Error: no import plugin selected");
        if (fileInput.files.length < 1) return statusAlert("Error: no file selected");
        selectedPlugin = plugins.input.find(p => p.name == selectedPlugin);
        let file = await fileInput.files[0].arrayBuffer();

        let pluginOptions = {};
        if (selectedPlugin.opts) selectedPlugin.opts.forEach(option => {
            let optionElement = document.getElementById(option.name);
            let optionValue = option.type == "boolean" ? optionElement.checked : optionElement.value;
            pluginOptions[option.name] = optionValue;
        });

        console.log(pluginOptions);

        data = selectedPlugin.run(file, pluginOptions);
        statusAlert("Data imported!");
        console.log(data);
    });

    //CHART
    plugins.chart.forEach(p => {
        chartSelect.add(new Option(p.name, p.name));
    });

    chartSelect.addEventListener("change", (e) => {
        let selectedPlugin = chartSelect.value;
        selectedPlugin = plugins.chart.find(p => p.name == selectedPlugin);
        if (!selectedPlugin.opts) selectedPlugin = "This plugin has no options.";
        else selectedPlugin = selectedPlugin.opts.map(option => optionToElement(option)).join("");
        chartOptionsContainer.innerHTML = `<br/>` + selectedPlugin;
    });

    chartButton.addEventListener("click", async () => {
        let statusAlert = (message) => {
            chartReport.innerText = message;
            setTimeout(() => { chartReport.innerText = "" }, 5000);
        };

        let selectedPlugin = chartSelect.value;
        if (!selectedPlugin) return statusAlert("Error: no chart plugin selected");
        if (!data) return statusAlert("Error: no data has been imported");

        selectedPlugin = plugins.chart.find(p => p.name == selectedPlugin);;

        let pluginOptions = {};
        if (selectedPlugin.opts) selectedPlugin.opts.forEach(option => {
            let optionElement = document.getElementById(option.name);
            let optionValue = option.type == "boolean" ? optionElement.checked : optionElement.value;
            pluginOptions[option.name] = optionValue;
        });

        console.log(pluginOptions);

        chart = await selectedPlugin.run(data, pluginOptions);
        statusAlert("chart generated!");
        console.log(chart);
    });

    //OUTPUT

    plugins.output.forEach(p => {
        outputSelect.add(new Option(p.name, p.name));
    });

    outputSelect.addEventListener("change", (e) => {
        let selectedPlugin = outputSelect.value;
        selectedPlugin = plugins.output.find(p => p.name == selectedPlugin);
        if (!selectedPlugin.opts) selectedPlugin = "This plugin has no options.";
        else selectedPlugin = selectedPlugin.opts.map(option => optionToElement(option)).join("");
        outputOptionsContainer.innerHTML = `<br/>` + selectedPlugin;
    });

    outputButton.addEventListener("click", async () => {
        let statusAlert = (message) => {
            outputReport.innerText = message;
            setTimeout(() => { outputReport.innerText = "" }, 5000);
        };

        let selectedPlugin = outputSelect.value;
        if (!selectedPlugin) return statusAlert("Error: no output plugin selected");
        if (!chart) return statusAlert("Error: no chart has been generated");

        selectedPlugin = plugins.output.find(p => p.name == selectedPlugin);;

        let pluginOptions = {};
        if(selectedPlugin.opts) selectedPlugin.opts.forEach(option => {
            let optionElement = document.getElementById(option.name);
            let optionValue = option.type == "boolean" ? optionElement.checked : optionElement.value;
            pluginOptions[option.name] = optionValue;
        });

        selectedPlugin.run(chart, pluginOptions);
        statusAlert("Chart output succesful! Enjoy!");
        console.log(":)");
    });

});