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

async function createMif(filename) {
    const pixels = await getPixels(filename);

    const depth = pixels.shape[2];
    const data = pixels.data;

    let content = [];
    for (let i = 0; i < data.length; i+=4) {
        content.push(getHex(data[i], data[i+1], data[i+2]));
    }
    return `-- MIF file create by mif-creator
-- by Joren Vandeweyer
-- https://github.com/jorenvandeweyer/mif-creator
WIDTH=${24};
DEPTH=${depth};

ADDRESS_RADIX=UNS;
DATA_RADIX=HEX;

CONTENT BEGIN
    ${content.join("\n    ")}
END;`;
}

function hexCheck(hex) {
    if (hex.length === 1) hex = "0" + hex;
    return hex;
}

function getHex(red, green, blue) {
    return hexCheck(red.toString(16)) + hexCheck(green.toString(16)) + hexCheck(blue.toString(16));
}

async function main() {
    const filename = await question("File Name: ");

    const content = await createMif(filename);

    fs.writeFileSync(`${filename}.mif`, content);
}

if (require.main === module) {
    main();
}
