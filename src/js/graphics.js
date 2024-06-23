// graphics.js
window.mat3 = glMatrix.mat3;
window.vec3 = glMatrix.vec3;

window.GraphicsRenderer = class {
  constructor(canvasId, fragmentShaderSource) {
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext('webgl2');
    if (!this.gl) {
      console.error('Unable to initialize WebGL. Your browser may not support it.');
      return;
    }
    this.setupCanvas();
    this.loadShaders(fragmentShaderSource);

  }

  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.gl.canvas.width = this.canvas.clientWidth / 2;
    this.gl.canvas.height = this.canvas.clientHeight / 2;

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
  }

  async loadShaders(fragmentShaderSource) {
    const vertexShaderSource = 
        `#version 300 es
        in vec2 a_position;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

    this.vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER);
    this.fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);

    if (!this.vertexShader || !this.fragmentShader) {
      console.error('Failed to compile shaders.');
      return;
    }

    this.setupProgram();
  }

  compileShader(source, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  setupProgram() {
    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, this.vertexShader);
    this.gl.attachShader(this.program, this.fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getProgramInfoLog(this.program));
      return;
    }

    this.gl.useProgram(this.program);

    this.setupBuffers();
    // this.setupUniforms();
  }

  setupBuffers() {
    const positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
    const positionBuffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,
      1.0, 1.0,
    ];

    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
  }

  setupUniforms() {
    const resolutionUniformLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
    this.gl.uniform2f(resolutionUniformLocation, this.canvas.width, this.canvas.height);

    this.timeUniformLocation = this.gl.getUniformLocation(this.program, 'u_time');

    this.orientationUniformLocation = this.gl.getUniformLocation(this.program, 'u_orientation');
    this.gl.uniform4fv(this.orientationUniformLocation, [1.0, 0.0, 1.0, 0.0]);

    this.focalLengthUniformLocation = this.gl.getUniformLocation(this.program, 'u_FL');
    this.gl.uniform1f(this.focalLengthUniformLocation, 22.0);

    this.positionUniformLocation = this.gl.getUniformLocation(this.program, 'u_position');
    this.gl.uniform3fv(this.positionUniformLocation, [0.0, 1.0, 0.0]);

    this.matcapTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.matcapTexture);

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    var image = new Image();
    this.matcapTexture = this.gl.createTexture(); // Create the texture object

    image.onload = () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.matcapTexture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      this.gl.generateMipmap(this.gl.TEXTURE_2D); // Optionally generate mipmaps
    };

    image.src = './moon2.png'; // Replace this with your texture's path

    this.matcapTextureLocation = this.gl.getUniformLocation(this.program, 'matcapTexture');
    this.gl.uniform1i(this.matcapTextureLocation, 0); // Use texture unit 0
  }

  updateUniforms() {
    const resolutionUniformLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
    this.gl.uniform2f(resolutionUniformLocation, this.canvas.width, this.canvas.height);

    this.timeUniformLocation = this.gl.getUniformLocation(this.program, 'u_time');

    this.orientationUniformLocation = this.gl.getUniformLocation(this.program, 'u_orientation');
    this.gl.uniform4fv(this.orientationUniformLocation, [1.0, 0.0, 1.0, 0.0]);

    this.focalLengthUniformLocation = this.gl.getUniformLocation(this.program, 'u_FL');
    this.gl.uniform1f(this.focalLengthUniformLocation, 22.0);

    this.positionUniformLocation = this.gl.getUniformLocation(this.program, 'u_position');
    this.gl.uniform3fv(this.positionUniformLocation, [0.0, 1.0, 0.0]);

    this.matcapTextureLocation = this.gl.getUniformLocation(this.program, 'matcapTexture');
    this.gl.uniform1i(this.matcapTextureLocation, 0); // Use texture unit 0
  }

  render() {
    
    const time = performance.now() / 1000.0;
    this.gl.uniform1f(this.timeUniformLocation, time);

    viewEuler.copy(camera.rotation);
    viewQuat.setFromEuler(viewEuler);

    this.gl.uniform4fv(this.orientationUniformLocation, viewQuat.toArray());
    this.gl.uniform1fv(this.focalLengthUniformLocation, Float32Array.from([camera.getFocalLength()]));
    this.gl.uniform3fv(this.positionUniformLocation, camera.position.toArray());

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.matcapTexture);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(() => this.render());
  }
}

// Load the shader files asynchronously
window.loadShaderFiles = async function (dynamicShaderPart) {
  const shader0Text = (await import('../shaders/version.fs?raw')).default;
  const shader1Text = (await import('../shaders/preamble.fs?raw')).default;
  const shader2Text = (await import('../shaders/utilities.fs?raw')).default;
  const shader4Text = (await import('../shaders/gyroid_shader.fs?raw')).default;

  const combinedShaderCode = shader0Text + '\n' + shader1Text + '\n' + shader2Text + '\n' + dynamicShaderPart + '\n' + shader4Text;

  return combinedShaderCode;
}

let gl_renderer;

window.updateShader = async function() {
  const dynamicShaderPart = document.getElementById('entry').textContent;
  const combinedShaderCode = await loadShaderFiles(dynamicShaderPart);

  if (gl_renderer) {
    gl_renderer.loadShaders(combinedShaderCode);
    gl_renderer.updateUniforms();
  } else {
    gl_renderer = new GraphicsRenderer('webgl-canvas', combinedShaderCode);
    gl_renderer.render();
  }
}


window.startGraphics = async function () {
  try {
    const dynamicShaderPart = document.getElementById('entry').textContent;
    const combinedShaderCode = await loadShaderFiles(dynamicShaderPart);

    const gl_renderer = new GraphicsRenderer('webgl-canvas', combinedShaderCode);
    gl_renderer.render();
  } catch (error) {
    console.error('Error initializing GraphicsRenderer:', error);
  }
}