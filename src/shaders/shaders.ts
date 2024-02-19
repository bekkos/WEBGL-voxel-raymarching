export const VertexShader = `
  attribute vec3 position;
  varying vec2 uv;

  void main() {
    gl_Position = vec4(position, 1.0);
    uv = position.xy;
  }
`;

export const FragmentShader = `
  precision highp float;
  uniform vec2 canvasSize;
  uniform vec3 playerPos;
  uniform float timeSec;
  uniform sampler2D u_voxelTexture;
  uniform int u_numVoxels;

  
  // Constants
  #define PI 3.1415925359
  #define TWO_PI 6.2831852
  #define MAX_STEPS 100
  #define MAX_DIST 100.
  #define SURFACE_DIST .01
   

  float voxelDistance(vec3 p, vec3 v) {
    return length(max(abs(p)-v, 0.));
  }
  float GetDist(vec3 p)
  {
      float closest = MAX_DIST * 2.;
      vec4 voxelData = texture2D(u_voxelTexture, vec2(1.0, 0.5));
      float vd = voxelDistance(p, vec3(voxelData.a));
      closest = min(vd, closest);
      float planeDist = p.y;
      float d = min(closest,planeDist);
   
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
   
  void main()
  {
      vec2 uv = (gl_FragCoord.xy-.5*canvasSize.xy)/canvasSize.y;
      vec3 ro = vec3(playerPos.x,playerPos.y,playerPos.z); // Ray Origin/ Camera
      vec3 rd = normalize(vec3(uv.x,uv.y,1));
      float d = RayMarch(ro,rd); // Distance
      d/= 10.;
      vec3 color = vec3(d);
       
      // Set the output color
      gl_FragColor = vec4(color,1.0);
  }
`;

export function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
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

function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
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
