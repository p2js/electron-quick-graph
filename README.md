# Quick Graph

Quick Graph is an electron app to generate data visualisations from imported data. It uses self-made `CanvasContext2D` based algorithms to build charts from the ground up.

<center>
<img src="/readme-assets/ui.png" width="387" height="345" alt="Quick Graph UI">
<img src="/readme-assets/piechart.png" width="400" height="300" alt="Pie chart example">
<img src="/readme-assets/linechart.png" width="400" height="300" alt="Line chart example">
</center>


This project served as my final project for HS computer science.

## Features

- An intuitive and fully modular plugin system for data importing, chart generation, and output
- Built-in plugins to:
    - Import data from spreadsheets of all types (CSV, XLSX/M, Numbers etc.) with automatic axis title parsing and invalid data filtering
    - Generate pie charts, line charts and scatter plots
    - Output to PNG or PDF
- A UI designed to be easy to use and clear in its error reporting

## Building

The building process for Quick Graph looks the same as any other electron app. Use `npm i` to install the required dependencies, then `npm make` to get started.

## Plugin Development

If you want to write your own plugins, you can find the necessary classes and definitions to get started in `Plugins/plugin-common.js`. It includes the class for a plugin, the structure of a plugin option array (which will automatically generate the option menu elements) and some functions that could be useful when building charts.

If you make a cool plugin, feel free to submit a PR, I have no reason not to include it! :)
