const XLSX = require("xlsx");
const { Plugin, Coordinate } = require('./plugin-common');

//function to convert excel column indices (A, B ... AA, AB, etc) to array indices (0, 1 ... 26, 27, etc)
function ExcelColumnToArrayIndex(letters) {
    letters = letters.toUpperCase();
    let charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 0;
    for (let i = 0; i < letters.length; i++) {
        result += Math.pow(26, letters.length - (i + 1)) * (charset.indexOf(letters[i]) + 1);
    }
    return result - 1;
}

function importSpreadsheet(file, opts) {
    let spreadsheet = XLSX.read(file).Sheets.Sheet1;
    spreadsheet = XLSX.utils.sheet_to_json(spreadsheet, { header: 1, defval: null });

    console.log(spreadsheet);

    opts.x = ExcelColumnToArrayIndex(opts.x);
    let coordArray = [];

    switch (opts.mode) {
        case 'Unlabeled1D':
            for (let i = opts.startRow - 1 || 0; i < (opts.endRow || spreadsheet.length - 1); i++) {
                if (i > spreadsheet.length - 1) break;
                let x = spreadsheet[i][opts.x];
                if (typeof x == "String") throw Error("unexpected string value in import set");
                if (typeof x == null) continue;
                coordArray.push(x);
            }
            break;
        case 'Labeled1D':
            labelRow = ExcelColumnToArrayIndex(opts.y);
            for (let i = opts.startRow - 1 || 0; i < (opts.endRow || spreadsheet.length - 1); i++) {
                if (i > spreadsheet.length - 1) break;
                console.log(i);
                let x = spreadsheet[i][opts.x];
                let label = spreadsheet[i][labelRow];
                if (typeof x == "String") throw Error("unexpected string value in import set");
                if (x == null && label == null) continue;
                if (x == null || label == null) throw Error("unexpected null value in import set");
                coordArray.push({ label, value: x });
            };
            break;
        case '2D':
            opts.y = ExcelColumnToArrayIndex(opts.y);
            //first row can be treated as text in case it is a title
            let firstx = spreadsheet[opts.startRow - 1][opts.x];
            let firsty = spreadsheet[opts.startRow - 1][opts.y];
            if (firstx == null || firsty == null) throw Error("unexpected null value in import set");
            coordArray.push(new Coordinate(firstx, firsty));
            for (let i = (opts.startRow || 1); i < (opts.endRow || spreadsheet.length - 1); i++) {
                if (i > spreadsheet.length - 1) break;
                let x = spreadsheet[i][opts.x];
                let y = spreadsheet[i][opts.y];
                if (typeof x == 'string' || typeof y == 'string') throw Error("unexpected string value in import set");
                if (x == null && y == null) continue;
                if (x == null || y == null) throw Error("unexpected null value in import set");
                coordArray.push(new Coordinate(x, y));
            }
            break;
    }
    return { type: opts.mode, coordArray };
}

const pluginOptions = [
    {
        name: "mode",
        label: "Import As:",
        type: "list",
        values: ["2D", "Labeled1D", "Unlabeled1D"]
    },
    {
        name: "startRow",
        label: "Start at row (include titles if applicable):",
        type: "number",
        default: 1,
        min: 1
    },
    {
        name: "endRow",
        label: "End at row:",
        type: "number",
        default: 100,
        min: 1
    },
    {
        name: "x",
        label: "X column:",
        type: "string",
        default: "A"
    },
    {
        name: "y",
        label: "Y/label column:",
        type: "string",
        default: "B"
    }
];

const plugin = new Plugin(
    "Import from spreadsheet (numbers, xlsx/m, CSV)",
    "input",
    pluginOptions,
    importSpreadsheet
);

module.exports = plugin;