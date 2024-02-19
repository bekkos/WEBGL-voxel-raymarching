"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shaders_1 = require("./shaders/shaders");
const buffers_1 = require("./buffers/buffers");
const render_1 = require("./render");
var START_TIME = new Date().getTime();
var PLAYER = {
    position: [1.0, 1.0, -6.0],
    speed: 0.02,
};
var VOXEL_DATA = [
    0.5, 0.5, 0.5, 0.0,
    1.0, 2.0, 1.0, 1.0
];
function init() {
    const canvas = document.getElementById('canvas');
    if (!canvas || !(canvas instanceof HTMLCanvasElement))
        return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');
    if (gl === null) {
        alert('Unable it init webgl...');
        return;
    }
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const shaderProgram = (0, shaders_1.initShaderProgram)(gl, shaders_1.VertexShader, shaders_1.FragmentShader);
    if (!shaderProgram) {
        console.error('Could not initialize shaderprogram.');
        return;
    }
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPositions: gl.getAttribLocation(shaderProgram, 'position'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };
    const buffers = (0, buffers_1.initBuffers)(gl);
    if (!buffers) {
        console.error('Could not init buffers.');
        return;
    }
    requestAnimationFrame(() => loop(gl, programInfo, buffers));
}
function update(gl, programInfo) {
    gl.uniform3f(gl.getUniformLocation(programInfo.program, 'playerPos'), PLAYER.position[0], PLAYER.position[1], PLAYER.position[2]);
    const flatVoxelData = new Uint8Array(VOXEL_DATA);
    const voxelTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, voxelTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, VOXEL_DATA.length / 4, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, flatVoxelData);
    // Set texture parameters (e.g., filtering and wrapping modes)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const voxelTextureLocation = gl.getUniformLocation(programInfo.program, 'u_voxelTexture');
    gl.uniform1i(voxelTextureLocation, 0); // 0 corresponds to the texture unit
    gl.activeTexture(gl.TEXTURE0);
    const numVoxelsLocation = gl.getUniformLocation(programInfo.program, 'u_numVoxels');
    gl.uniform1i(numVoxelsLocation, VOXEL_DATA.length);
}
function loop(gl, programInfo, buffers) {
    gl.useProgram(programInfo.program);
    var timeNow = new Date().getTime();
    gl.uniform1f(gl.getUniformLocation(programInfo.program, 'timeSec'), (timeNow - START_TIME) / 1000);
    update(gl, programInfo);
    (0, render_1.render)(gl, programInfo, buffers);
    requestAnimationFrame(() => loop(gl, programInfo, buffers));
}
window.addEventListener('keypress', (e) => {
    if (e.key == 'w') {
        PLAYER.position[2] += PLAYER.speed;
        console.log('forward');
    }
    if (e.key == 's') {
        PLAYER.position[2] -= PLAYER.speed;
        console.log('backward');
    }
    if (e.key == 'a') {
        PLAYER.position[0] -= PLAYER.speed;
        console.log('backward');
    }
    if (e.key == 'd') {
        PLAYER.position[0] += PLAYER.speed;
        console.log('backward');
    }
});
init();
