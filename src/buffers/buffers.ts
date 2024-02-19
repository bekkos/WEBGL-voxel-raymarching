export function initBuffers(gl: WebGLRenderingContext) {
  const positionBuffer = initPositionBuffer(gl);

  return {
    position: positionBuffer,
  };
}

function initPositionBuffer(gl: WebGLRenderingContext): WebGLBuffer | null {
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    console.error('Error creating positionBuffer');
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [-1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}
