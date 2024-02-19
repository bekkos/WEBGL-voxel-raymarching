"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBuffers = void 0;
function initBuffers(gl) {
    const positionBuffer = initPositionBuffer(gl);
    return {
        position: positionBuffer,
    };
}
exports.initBuffers = initBuffers;
function initPositionBuffer(gl) {
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
