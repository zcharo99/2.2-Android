var prompt = require('prompt-sync')();
const dl = require('./dl.js');
const fs = require("fs");
const pathr = require("path");
var crypto = require("crypto");
const { parseApkXml } = require("apk-xml-parser");
const { xml2axml } = require("xml2axml");
const admzip = require('adm-zip');
const { sign } = require("node-apk-signer");

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

    console.log("Changing links")
    var gd = await fs.promises.readFile(`base.apk`, 'binary');
    gd = gd.replaceAll("https://www.boomlings.com/database", url).replaceAll("aHR0cDovL3d3dy5ib29tbGluZ3MuY29tL2RhdGFiYXNl", b64);
    await fs.promises.writeFile(`base.apk`, gd, 'binary');
    
    console.log("Decompressing base.apk\n");

    const zip = new AdmZip("base.apk");
    const dir = "./baseapkunzipped";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    zip.extractAllTo(dir, true);
    const manifestPath = dir + "/AndroidManifest.xml"

    console.log("APK decompressed")
    console.log("Converting APK manifest from binary to readable at " + manifestPath + "\n")
    
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
