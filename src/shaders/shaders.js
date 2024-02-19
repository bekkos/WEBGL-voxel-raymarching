"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initShaderProgram = exports.FragmentShader = exports.VertexShader = void 0;
exports.VertexShader = `
  attribute vec3 position;
  varying vec2 uv;

  void main() {
    gl_Position = vec4(position, 1.0);
    uv = position.xy;
  }
`;
exports.FragmentShader = `
  precision highp float;
  uniform vec2 canvasSize;
  uniform vec3 playerPos;
  uniform float timeSec;
  uniform sampler2D u_voxelTexture;
  uniform int u_numVoxels;


  // Constants
  #define PI 3.1415925359
  #define TWO_PI 6.2831852
  #define MAX_STEPS 500
  #define MAX_DIST 500.
  #define SURFACE_DIST .01
  

  float voxelDistance(vec3 p, vec3 v) {
    vec3 q = abs(p) - v;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
  }

  float GetDist(vec3 p) {
    float closest = MAX_DIST * 2.;
    float closestIndex = -1.;

    for (float i = 0.0; i < 2.; i++) {
        // Sample voxel position from the texture
        vec4 voxelData = texture2D(u_voxelTexture, vec2(i, 0.5));

        // Quantize voxel position to the grid and scale appropriately
        vec3 voxelPos = voxelData.xyz * 2.0 - 1.0; // Assuming voxel positions are in the range [0, 1]
        voxelPos *= vec3(100.0, 100.0, 100.0); // Adjust the scale as needed

        float vd = voxelDistance(p - voxelPos, vec3(0.5)); // Adjust the voxel size as needed
        if (closest > vd) {
            closestIndex = i;
        }
        closest = min(vd, closest);
    }

    float planeDist = p.y;
    float d = min(closest, planeDist);

    return d;
  }

  float RayMarch(vec3 ro, vec3 rd) 
  {
      float dO = 0.; //Distane Origin
      for(int i=0;i<MAX_STEPS;i++)
      {
          vec3 p = ro + rd * dO;
          float ds = GetDist(p);
          dO += ds;
          if(dO > MAX_DIST || ds < SURFACE_DIST) break;
      }
      return dO;
  }

  vec3 GetNormal(vec3 p) {
    float d = GetDist(p);
      vec2 e = vec2(.01, 0);
      
      vec3 n = d - vec3(
          GetDist(p-e.xyy),
          GetDist(p-e.yxy),
          GetDist(p-e.yyx));
      
      return normalize(n);
  }

  float GetLight(vec3 p) {
    vec3 lightPos = vec3(0, 5, 6);
    vec3 l = normalize(lightPos-p);
    vec3 n = GetNormal(p);
    
    float dif = clamp(dot(n, l), 0., 1.);
    float d = RayMarch(p+n*SURFACE_DIST*2., l);
    if(d<length(lightPos-p)) dif *= .1;
    
    return dif;
}
  
  void main()
  {
      vec2 uv = (gl_FragCoord.xy-.5*canvasSize.xy)/canvasSize.y;
      vec3 ro = vec3(playerPos.x,playerPos.y,playerPos.z); // Ray Origin/ Camera
      vec3 rd = normalize(vec3(uv.x,uv.y,1));
      float d = RayMarch(ro,rd); // Distance
      vec3 p = ro + rd * d;

      float dif = GetLight(p);
      vec3 color = vec3(dif);
      gl_FragColor = vec4(color,1.0);
  }
`;
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) {
        console.error('Error creating one of the shaders.');
        return;
    }
    const shaderProgram = gl.createProgram();
    if (!shaderProgram) {
        console.error('Error creating shaderprogram...');
        return;
    }
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
        return;
    }
    return shaderProgram;
}
exports.initShaderProgram = initShaderProgram;
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) {
        console.error('Shader could not be created. TYPE: ' + type);
        return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occured compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
