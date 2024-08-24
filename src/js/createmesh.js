// Function to create an offscreen canvas
window.mesh = function() {
    console.log("Mesh() starting...")
    // Check if the canvas already exists
    if (!document.getElementById('domainCanvas')) {
        // Create the canvas element
        const canvas = document.createElement('canvas');
        // Set the canvas dimensions
        canvas.width = 100;
        canvas.height = 100;
        // Set the canvas ID
        canvas.id = 'domainCanvas';
        // Append the canvas to the document body (but keep it offscreen)
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
    }
    const canvas = document.getElementById('domainCanvas');
}
