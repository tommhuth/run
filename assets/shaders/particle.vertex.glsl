/**
 * Multiply each vertex by the model-view matrix
 * and the projection matrix (both provided by
 * Three.js) to get a final vertex position
 */
uniform float time;
attribute vec3 offset;
attribute float alpha; 
varying float vAlpha;

void main() {
    vec3 speed = vec3(time * offset[0],time * offset[1],time * offset[2]);
    vec4 mvPosition = modelViewMatrix * vec4(position + speed, 1.0);

    gl_Position = projectionMatrix * mvPosition; 
    gl_PointSize = 12.0 * (12.0 / - mvPosition.z); 

    vAlpha = alpha;
} 