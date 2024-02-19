export interface IProgramInfo {
  program: WebGLShader;
  attribLocations: {
    vertexPositions: number;
  };
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation | null;
    modelViewMatrix: WebGLUniformLocation | null;
  };
}
