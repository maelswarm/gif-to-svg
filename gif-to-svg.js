const pngs = [];
const path = require('path');
const fs = require('fs');
const imageDataURI = require('image-data-uri');
const sizeOf = require('image-size');
const extractFrames = require('gif-extract-frames');
const filePath = process.argv[2];
const rate = Number(process.argv[3]) || 0.1;
let svg = `<svg xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink">
<style>
@keyframes anim {
0% {
   opacity: 0;
}
49% { opacity: 0; }
50% {
   opacity: 1;
}
}
image {
opacity: 0;
}`;

const dir = __dirname + '/frames';
if(fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
}
fs.mkdirSync(dir, 0o777);

extractFrames({
    input: filePath,
    output: './frames/frame-%d.png'
}).then(() => {
    fs.readdir(dir, async (err, files) => {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
    
        for(let i =0; i<files.length; ++i) {
            const dim = sizeOf(path.join(__dirname, 'frames/' + files[i]));
            const dataURI = await imageDataURI.encodeFromFile(path.join(__dirname, 'frames/' + files[i]));
            const svgImageStyle = `
                image#img${i} {
                  animation: anim ${(files.length * rate).toFixed(2)}s linear infinite;
                  animation-delay: ${(i * rate).toFixed(2)}s;
                }
                `;
            const svgImageTag = `<image width="${dim.width}" height="${dim.height}" id="img${i}" xlink:href="${dataURI}" />`;
            pngs.push({ svgImageStyle, svgImageTag });
        }
    
        pngs.forEach(p => {
            svg += p.svgImageStyle;
        });
    
        svg += '</style>';
        pngs.forEach(p => {
            svg += p.svgImageTag;
        });
    
        svg += '</svg>';
    
        fs.writeFileSync("tmp.svg", svg);
    });
});