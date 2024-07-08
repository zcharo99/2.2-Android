var prompt = require('prompt-sync')();
const dl = require('./dl.js');
const zipFolder = require('./zipper');
const fs = require("fs");

var crypto = require("crypto");

const decompress = require("decompress");

async function main() {

    console.log("2.2 maker for Android - Original for iOS https://dimisaio.be\n");

    if (!fs.existsSync("base.apk")) {
        await dl("https://us-east-1.tixte.net/uploads/zchar.discowd.com/base.apk", 'base.apk');
    }

    var name = prompt("Enter GDPS name: ");
    name = name.replaceAll(" ", "");

    var dir = `${name.toLowerCase()}-${crypto.randomBytes(8).toString('hex')}`;

    var bundle = prompt("Enter bundle id (24 chars): ");

    while (bundle.length != 24) {
        console.log("Length isn't 24!!!\n");
        var bundle = prompt("Bundle id: ");
    }

    var base = prompt("Enter URL (33 chars): ");

    while (base.length != 33) {
        console.log("Length isn't 33!!!\n");
        var base = prompt("Enter URL (33 chars): ");
    }
    var b64 = Buffer.from(base).toString('base64');
    var url = `${base}/`;

    console.log("Decompressing base.apk\n");

    await decompress("base.apk", dir);

    console.log("Editing APK at " + dir + "\n")
    
    // change bundle id
    
    var gd = await fs.promises.readFile(`${path}/${name}`, 'binary');
    gd = gd.replaceAll("com.robtop.geometryjump", bundle).replaceAll("https://www.boomlings.com/database", url).replaceAll("aHR0cDovL3d3dy5ib29tbGluZ3MuY29tL2RhdGFiYXNl", b64);
    await fs.promises.writeFile(`${path}/${name}`, gd, 'binary');
    
    console.log("Compressing...\n")

    await zipFolder(dir, `${name}.ipa`);
    
    await fs.promises.rm(dir, { recursive: true, force: true });

    console.log("Done! Project by DimisAIO.be :)")
}

main(); // ok
