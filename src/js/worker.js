onmessage = (event) => {
    const canvas = event.data.canvas;
    const offCtx = canvas.getContext("2d");
    // draw to the offscreen canvas context
    offCtx.fillStyle = "red";
    offCtx.fillRect(0, 0, 100, 100);
  };