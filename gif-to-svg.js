const pngs = [];
const path = require('path');
const fs = require('fs');
const imageDataURI = require('image-data-uri');
const sizeOf = require('image-size');
const extractFrames = require('gif-extract-frames');
const filePath = process.argv[2];
const rate = Number(process.argv[3]) || 0.1;
let svg = ``;

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
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        svg += `<svg xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink">
        <style>
        @keyframes anim {
        0% { opacity: 1; }
        ${100 / files.length}% {
           opacity: 1;
        }
        ${(100 / files.length) + 0.001}% {
            opacity: 0;
        }
        100% {opacity: 0;}
        }
        image {
        opacity: 0;
        }`;
        files = files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        for(let i =0; i<files.length; ++i) {
            const dim = sizeOf(path.join(__dirname, 'frames/' + files[i]));
            const dataURI = await imageDataURI.encodeFromFile(path.join(__dirname, 'frames/' + files[i]));
            const svgImageAllStyle = `image#img${i},`;
            const svgImageStyle = `
                image#img${i} {
                  animation-delay: ${(i * rate).toFixed(2)}s;
                }
                `;
            const svgImageTag = `<image width="${dim.width}" height="${dim.height}" id="img${i}" xlink:href="${dataURI}" />`;
            pngs.push({ svgImageStyle, svgImageTag, svgImageAllStyle });
        }

        pngs.forEach(p => {
            svg += p.svgImageAllStyle;
        });
        svg = svg.slice(0, svg.length - 1);
        svg += ` {
            animation: anim ${(rate * files.length).toFixed(2)}s linear infinite;
        }
        `;
        svg += "\n";
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