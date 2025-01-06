import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// https://www.npmjs.com/package/free-tex-packer-core
import texturePacker from "free-tex-packer-core";

import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminWebp from 'imagemin-webp';

import { config } from './spritesheets.config.js';

debugger;

const fileNames = new Map();
const filesWithHash = new Set();

const { baseOutputPath, baseInputPath } = config;

const packingPromises = config.files.map(sheetConfig => {

    const inputBase = sheetConfig.inputBase || '';
    const namePrefix = sheetConfig.namePrefix || '';
    const filename = sheetConfig.filename;
    const outputPath = sheetConfig.outputPath;
    const sprites = sheetConfig.sprites;

    const images = sprites.map((s) => {
        return {
            path: s.name,
            contents: fs.readFileSync(path.join(baseInputPath, inputBase, s.path))
        }
    });
    return new Promise((resolve, reject) => {

        texturePacker(images, {
            exporter: 'Phaser3',
            textureName: filename,
            packer: 'OptimalPacker',
            padding: 2,
            width: 2048,
            height: 2048,
            detectIdentical: false,
            allowRotation: false,
            allowTrim: false
        }, (files, error) => {
            if (error) {
                console.error('Packaging failed', error);
                reject(error);
            } else {

                resolve(Promise.all(files.map(item => {
                    fs.mkdirSync(path.join(baseOutputPath, outputPath), { recursive: true })

                    return imagemin.buffer(item.buffer, {
                        plugins: [imageminPngquant()]
                    }).then((data) => {
                        fileNames.set(filename, path.join(outputPath, item.name.replace(/\.[^/.]+$/, "")));

                        return fs.promises.writeFile(path.join(baseOutputPath, outputPath, item.name), data)
                    }).catch(error => {
                        console.log(error);
                    })
                })).then((x) => {
                    console.log('Spritesheet generated:', filename);
                }))
            }
        })
    })
});

Promise.all(packingPromises)
    .then(() => {

        fileNames.forEach((filepath, filename) => {

            const PNGFile = path.join(baseOutputPath, filepath + '.png');
            const JSONFile = path.join(baseOutputPath, filepath + '.json');

            const png = fs.readFileSync(PNGFile);
            const json = JSON.parse(fs.readFileSync(JSONFile));

            const hash = crypto.createHash('md5').update(png).digest('hex');

            json.textures.forEach((data) => {
                data.image = data.image.replace(/\.png$/, `.${hash}.png`)
            });
            fs.writeFileSync(JSONFile, JSON.stringify(json, null, 4))


            const newJSONfile = `${filepath}.${hash}.json`;
            const newPNGfile = `${filepath}.${hash}.png`;


            fs.renameSync(path.join(baseOutputPath, filepath + '.png'), path.join(baseOutputPath, newPNGfile));
            fs.renameSync(path.join(baseOutputPath, filepath + '.json'), path.join(baseOutputPath, newJSONfile));

            filesWithHash.add([filename, newPNGfile.replace('\\', '/'), newJSONfile.replace('\\', '/')])
        })

        fs.writeFileSync(path.join('./src/sprites-index.json'), JSON.stringify(Array.from(filesWithHash)));
    })
