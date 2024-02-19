import { IProgramInfo } from './interfaces';
import * as glm from 'gl-matrix';

export function render(gl: WebGLRenderingContext, programInfo: IProgramInfo, buffers: any) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Perspective matrix creation
  const fieldOfView = (45 * Math.PI) / 180;
  const aspect = gl.canvas.width / gl.canvas.height;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = glm.mat4.create();

  glm.mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const modelViewMatrix = glm.mat4.create();

  glm.mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);
  setPositionAttribute(gl, buffers, programInfo);

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);

  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

  gl.uniform2f(gl.getUniformLocation(programInfo.program, 'canvasSize'), gl.canvas.width, gl.canvas.height);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

function setPositionAttribute(gl: WebGLRenderingContext, buffers: any, programInfo: IProgramInfo) {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexPositions, numComponents, type, normalize, stride, offset);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPositions);
}
