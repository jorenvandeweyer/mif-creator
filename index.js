const util = require("util");
const readline = require('readline');
const fs = require("fs");
const gp = require("get-pixels")

async function getPixels(path) {
    return new Promise((resolve, reject) => {
        gp(path, (err, pixels) => {
            if (err) {
                console.log("bad image path");
                return reject("bad image path");
            }
            resolve(pixels);
        });
    });
}

async function question(string) {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(string, (answer) => {
            resolve(answer);
            rl.close();
        })
    });
}

async function main() {
    const compress = process.argv.includes("--compress");
    const filename = await question("File Name: ");

    console.log("Creating mif file...");
    console.log("");
    const mif = await createMif(filename, compress);

    if (compress) {
        fs.writeFileSync(`${filename}.mif`, mif.content);
        fs.writeFileSync(`${filename}.colors.mif`, mif.colors);
        console.log(`File was compressed to ${mif.compressionRate}% of the original size`);
        console.log(`Created: ${filename}.mif`);
        console.log(`Created: ${filename}.colors.mif`);
    } else {
        fs.writeFileSync(`${filename}.mif`, mif.content);
        console.log(`Created: ${filename}.mif`);
        if (mif.compressionRate < 100) {
            console.log(`Use "npm start -- --compress" to compress file to ${mif.compressionRate}% of the original size`);
        }
    }
}

async function createMif(filename, compress) {
    const pixels = await getPixels(filename);

    const normal = createContent(pixels);
    const compressed = createColorPallete(pixels);

    if (compress) {
        return compressed;
    } else {
        return {
            content: normal,
            compressionRate: compressed.compressionRate,
        };
    }
}

function createContent(pixels) {
    const data = pixels.data;

    let content = [];
    for (let i = 0; i < data.length; i+=4) {
        content.push(`${i/4}\t:\t${getHex(data[i], data[i+1], data[i+2])};`);
    }

    return template(24, content);
}

function createColorPallete(pixels) {
    const data = pixels.data;

    const colors = {};
    let content_content = new Array(data.length/4);
    let counter = 0;

    for (let i = 0; i < data.length; i+=4) {
        const hex = getHex(data[i], data[i+1], data[i+2]);
        if (!(hex in colors)) {
            colors[hex] = counter++;
        }
        const address = colors[hex];
        content_content[i/4] = `${i/4}\t:\t${address};`;
    }

    const color_keys = Object.keys(colors);
    const content_colors = color_keys.sort((a, b) => colors[a] - colors[b]).map((color, index) => `${index}\t:\t${color}`);

    return {
        content: template(color_keys.length.toString(2).length, content_content, "DEC"),
        colors: template(24, content_colors),
        compressionRate: parseInt(100*(color_keys.length*24 + data.length*color_keys.length.toString(2).length)/(data.length*24)),
    }
}

function hexCheck(hex) {
    return (hex.length === 1) ? "0" + hex : hex
}

function getHex(red, green, blue) {
    return hexCheck(red.toString(16)) + hexCheck(green.toString(16)) + hexCheck(blue.toString(16));
}

function template(width, content, data_radix="HEX", address_radix="UNS") {
    return `-- MIF file created by mif-creator
-- by Joren Vandeweyer
-- https://github.com/jorenvandeweyer/mif-creator
WIDTH=${width};
DEPTH=${content.length};

ADDRESS_RADIX=${address_radix};
DATA_RADIX=${data_radix};

CONTENT BEGIN
    ${content.join("\n    ")}
END;\n`;
}

if (require.main === module) {
    main();
}
