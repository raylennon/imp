var viewWidth,
    viewHeight,
    canvas = document.getElementById("grain-canvas"),
    ctx;

// change these settings
var patternSize = 128,
    patternScaleX = 6,
    patternScaleY = 2,
    patternRefreshInterval = 4,
    patternAlpha = 10; // int between 0 and 255,

var patternPixelDataLength = patternSize * patternSize * 4,
    patternCanvas,
    patternCtx,
    patternData,
    frame = 0;

// create a canvas which will render the grain
function initCanvas() {
    viewWidth = canvas.width = canvas.clientWidth;
    viewHeight = canvas.height = canvas.clientHeight;
    ctx = canvas.getContext('2d');

    ctx.scale(patternScaleX, patternScaleY);
}

// create a canvas which will be used as a pattern
function initGrain() {
    patternCanvas = document.createElement('canvas');
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    patternCtx = patternCanvas.getContext('2d');
    patternData = patternCtx.createImageData(patternSize, patternSize);
}

// put a random shade of gray into every pixel of the pattern
function update() {
    var value;

    for (var i = 0; i < patternPixelDataLength; i += 4) {
        value = (Math.random() * 255) | 0;

        patternData.data[i    ] = value;
        patternData.data[i + 1] = value;
        patternData.data[i + 2] = value;
        patternData.data[i + 3] = patternAlpha;
    }

    patternCtx.putImageData(patternData, 0, 0);
}

// fill the canvas using the pattern
function draw() {
    ctx.clearRect(0, 0, viewWidth, viewHeight);

    ctx.fillStyle = ctx.createPattern(patternCanvas, 'repeat');
    ctx.fillRect(0, 0, viewWidth, viewHeight);
}

function loop() {
    if (++frame % patternRefreshInterval === 0) {
        update();
        draw();
    }

    requestAnimationFrame(loop);
}

initCanvas();
initGrain();
requestAnimationFrame(loop);