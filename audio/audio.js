import audiosprite from 'audiosprite';
import fs from 'fs';
import path from 'path';

var files = ['./audio/*.wav']
var opts = {
    output: './public/generated/audio/audio-album',
    format: 'howler2'
}

audiosprite(files, opts, function (err, obj) {
    if (err) return console.error(err)

    const json = JSON.stringify(obj, null, 2)
        .replace(/public\//g, '');

    writeFileSyncRecursive('./public/generated/audio/audio.json', json)
});

function writeFileSyncRecursive(filename, content = '') {
    fs.mkdirSync(path.dirname(filename), {recursive: true})
    fs.writeFileSync(filename, content)
}
