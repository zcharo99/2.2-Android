var prompt = require('prompt-sync')();
const dl = require('./dl.js');
const fs = require("fs");
const pathr = require("path");
var crypto = require("crypto");
const { parseApkXml } = require("apk-xml-parser");
const { xml2axml } = require("xml2axml");
const admzip = require('adm-zip');
const signer = require("node-apk-signer");

async function main() {

    console.log("2.2 maker for Android - Original for iOS at https://dimisaio.be\n");

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

    var keystorePath = prompt("Full path to keystore file for signing: ");
    var keyAlias = prompt("Key alias: ");
    var keyPassword = prompt("Key password: ");
    var keystorePassword = prompt("Keystore password: ")

    console.log("Changing links")
    var gd = await fs.promises.readFile(`base.apk`, 'binary');
    gd = gd.replaceAll("https://www.boomlings.com/database", url).replaceAll("aHR0cDovL3d3dy5ib29tbGluZ3MuY29tL2RhdGFiYXNl", b64);
    await fs.promises.writeFile(`base.apk`, gd, 'binary');

    console.log("Decompressing base.apk\n");

    const zip = new AdmZip("base.apk");
    let zipEntries = await zip.getEntries();

    let manifestEntry = null;
    zipEntries.forEach((entry) => {
        if (entry.entryName === "AndroidManifest.xml") {
            manifestEntry = entry;
        }
    });
    if (!manifestEntry) {
        console.error("AndroidManifest.xml not found");
        process.exit(1);
    }
    
    var directory = "./baseapkunzipped";
    if (!fs.existsSync(directory)) {
        await fs.mkdirSync(directory, { recursive: true });
    }
    zip.extractAllTo(directory, true);
    const manifestPath = directory + "/AndroidManifest.xml"

    console.log("APK decompressed\n")
    
    console.log("Converting APK manifest to readable at " + manifestPath + "\n")

    await fs.readFile(manifestPath, (err, data) => {
        if (err) throw err;

        parseApkXml(data)
            .then((plainXml) => {
                const modifiedXml = plainXml.replace(/package="[^"]+"/, `package="${bundle}"`);
                const apkXml = xml2axml(modifiedXml);

                await fs.writeFile(binaryXmlPath, binaryXml, (err) => {
                    if (err) throw err;
                    console.log("Manifest successfully modified\n");
                });
            })
            .catch((error) => {
                console.error('Error parsing XML: ', error);
            });
    });
    
    
    
    console.log("Compressing...\n")

    async function zipFolder(folderPath, zipPath) {
        await fs.readdirSync(folderPath.forEach(file => {
            const filePath = await path.join(folderPath, file);
            if (fs.statSync(filePath).isFile()) {
                await zip.addLocalFile(filePath);
            }
        });
        await zip.writeZip(zipPath);
        console.log("Compressed!\n");
    }
    
    await zipFolder(directory, `${name}-Unsigned.apk`);
    console.log("Signing...\n")

    const newsigner = new signer({
        keyStore: keystorePath,
        keyStorePassword: keystorePassword,
        keyAlias: keyAlias,
        keyPassword: keyPassword
    });
    signer.sign(`${name}-Unsigned`, `${name}`).then(() => {
        console.log("APK signed successfully");
    }).catch((error) => {
        console.error('Error signing APK: ', error);
        process.exit(1);
    });
    
    await fs.promises.rm(directory, { recursive: true, force: true });

    var saveUnsigned = prompt("Save unsigned APK? [y/N]: ");
    if (saveUnsigned == "y") {
        console.log("Saving unsigned APK\n");
    } else {
        console.log("Removing unsigned APK...\n");
        await fs.promises.rm(`${name}-Unsigned.apk`, { force: true });
        console.log("Removed unsigned APK\n")
    }
    
    console.log("Done!")
}

main(); // ok
