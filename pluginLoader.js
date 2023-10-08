//library imports
const fileSystem = require("fs"); //for interacting with the filesystem

function load() {
    //object with 3 arrays corresponding to the 3 plugin types
    let plugins = {
        input: [],
        chart: [],
        output: []
    };

    let pluginError = (name, reason) => {
        alert(`Error in plugin ${name}: ${reason}`);
    }

    //read the contents of the Plugins directory
    let files = fileSystem.readdirSync("./Plugins");
    //filter for js files
    files = files.filter(f => f.split(".").pop() == "js");
    if (files.length == 0) {
        alert("Couldn't find any plugins in the Plugins folder!");
        return;
    }
    files.forEach(f => {
        if (f == "plugin-common.js") return;
        let importedPlugin = require(`./Plugins/${f}`);
        //plugin validation
        if (!importedPlugin) return pluginError(f, "returned undefined value");
        if (!importedPlugin.name) return pluginError(f, "improper format (plugin name missing)");
        if (!importedPlugin.type) return pluginError(f, "improper format (plugin type missing)");
        if (!importedPlugin.run) return pluginError(f, "improper format (plugin run function missing)");
        //add the plugin to the right array
        switch (importedPlugin.type) {
            case "input":
            case "chart":
            case "output":
                plugins[importedPlugin.type].push(importedPlugin);
                break;
            default:
                return pluginError(f, "invalid plugin type");
        }
    });
    
    return plugins;
}

module.exports = load;