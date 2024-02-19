class Voxel {
    constructor(public color: string) {}
}
  
class OctreeNode {
children: Array<OctreeNode | Voxel | null> = [];

constructor(public level: number) {}

isLeaf(): boolean {
    return this.children.every((child) => child instanceof Voxel);
}
}

class SparseVoxelOctree {
root: OctreeNode;

constructor(public maxDepth: number) {
    this.root = new OctreeNode(0);
}

setVoxel(x: number, y: number, z: number, color: string): void {
    this.setVoxelRecursive(this.root, 0, 0, 0, 1 << this.maxDepth, x, y, z, color);
}

setVoxelRecursive(
    node: OctreeNode,
    minX: number,
    minY: number,
    minZ: number,
    size: number,
    x: number,
    y: number,
    z: number,
    color: string
): void {
        if (node.isLeaf() || size === 1) {
            // Create or update voxel at this level
            const voxel = new Voxel(color);
            node.children = [voxel];
            } else {
            // Determine which octant the voxel belongs to
            const midX = minX + size / 2;
            const midY = minY + size / 2;
            const midZ = minZ + size / 2;

            const childIndex =
                (x >= midX ? 1 : 0) |
                ((y >= midY ? 1 : 0) << 1) |
                ((z >= midZ ? 1 : 0) << 2);

            if (!node.children[childIndex]) {
                // Create child node if it doesn't exist
                const newChild = new OctreeNode(node.level + 1);
                node.children[childIndex] = newChild;
            }

            // Recursively set voxel in the appropriate octant
            const newSize = size / 2;
            this.setVoxelRecursive(
                node.children[childIndex] as OctreeNode,
                x >= midX ? midX : minX,
                y >= midY ? midY : minY,
                z >= midZ ? midZ : minZ,
                newSize,
                x,
                y,
                z,
                color
            );
        }
    }

    convertToTexture(svo: SparseVoxelOctree): WebGLTexture {
        const gl = /* Get your WebGL context here */;
    
        // Create and bind a 3D texture
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_3D, texture);
    
        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    
        // Initialize texture data
        const textureData = new Uint8Array(this.size * this.size * this.size * 4); // Assuming RGBA format
    
        // Recursively fill texture data
        this.fillTextureDataRecursive(svo.root, textureData, 0, 0, 0, 1 << svo.maxDepth);
    
        // Upload texture data to the GPU
        gl.texImage3D(
          gl.TEXTURE_3D,
          0, // Level
          gl.RGBA, // Internal format
          this.size,
          this.size,
          this.size,
          0, // Border
          gl.RGBA, // Format
          gl.UNSIGNED_BYTE, // Type
          textureData
        );
    
        // Unbind the texture
        gl.bindTexture(gl.TEXTURE_3D, null);
    
        return texture;
      }
    
      // Recursively fill texture data
      private fillTextureDataRecursive(
        node: OctreeNode,
        textureData: Uint8Array,
        minX: number,
        minY: number,
        minZ: number,
        size: number
      ): void {
        if (node.isLeaf() || size === 1) {
          // Leaf node, fill voxel color
          const voxelColor = (node.children[0] as Voxel).color;
          const dataIndex = (minZ * this.size * this.size + minY * this.size + minX) * 4;
          textureData[dataIndex] = parseInt(voxelColor.substr(1, 2), 16); // Red
          textureData[dataIndex + 1] = parseInt(voxelColor.substr(3, 2), 16); // Green
          textureData[dataIndex + 2] = parseInt(voxelColor.substr(5, 2), 16); // Blue
          textureData[dataIndex + 3] = 255; // Alpha
        } else {
          // Node, recursively fill child nodes
          const newSize = size / 2;
          for (let i = 0; i < 8; i++) {
            const child = node.children[i];
            if (child) {
              const childMinX = minX + (i & 1) * newSize;
              const childMinY = minY + ((i >> 1) & 1) * newSize;
              const childMinZ = minZ + ((i >> 2) & 1) * newSize;
              this.fillTextureDataRecursive(child as OctreeNode, textureData, childMinX, childMinY, childMinZ, newSize);
            }
          }
        }
      }
}

// const svo = new SparseVoxelOctree(4); // maxDepth is 4 in this example
// svo.setVoxel(5, 5, 5, "#ff0000"); // Set voxel at position (5, 5, 5) with color red