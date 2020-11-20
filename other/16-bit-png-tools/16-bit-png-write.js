const fs = require("fs");
const PNG = require("png-coder").PNG;

// a little script for generating 16-bit-color-depth-per-channel png files for testing purpose

var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

if (myArgs.length !== 3) {
    console.error("Usage: node 16-bit-png-write.js channels(r/rg/rgb/rgba) type(u/s) filename")
    process.exit(1);
}

let channels = myArgs[0];
let type = myArgs[1];
let filename = myArgs[2];

let colorType;
let numChannels;
switch (channels) {
    case 'r':
        colorType = 0;
        numChannels = 1;
        break;
    case 'rg':
        colorType = 4;
        numChannels = 2;
        break;
    case 'rgb':
        colorType = 2;
        numChannels = 3;
        break;
    case 'rgba':
    default:
        colorType = 6;
        numChannels = 4;
        break;
}

let png = new PNG({
    width: 1,
    height: 1,
    colorType: colorType,       // 0 = grayscale, 2 = color, 4 = grayscale & alpha, 6 = color & alpha
    depthInBytes: 2,    // 16 bit
    filterType: -1,
});

let pixelValue = [
    // 0x6a35, 0x6a35, 0x6a35, 0x6a35,
    0x6a35, 0x00ff, 0x0000, 0x6a35,
];

for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
        let idx = numChannels * (png.width * y + x);
        let idxPNG = numChannels * ((png.width * y + x) << (png.depthInBytes - 1));
        
        if (type === 'u') {
            png.data.writeUInt16BE(pixelValue[idx], idxPNG);
            png.data.writeUInt16BE(pixelValue[idx + 1], idxPNG + png.depthInBytes);
            png.data.writeUInt16BE(pixelValue[idx + 2], idxPNG + 2 * png.depthInBytes);
            png.data.writeUInt16BE(pixelValue[idx + 3], idxPNG + 3 * png.depthInBytes);
        } else if (type === 's') {
            png.data.writeInt16BE(pixelValue[idx], idxPNG);
            png.data.writeInt16BE(pixelValue[idx + 1], idxPNG + png.depthInBytes);
            png.data.writeInt16BE(pixelValue[idx + 2], idxPNG + 2 * png.depthInBytes);
            png.data.writeInt16BE(pixelValue[idx + 3], idxPNG + 3 * png.depthInBytes);
        }
        
    }
}

png.pack().pipe(fs.createWriteStream(filename));