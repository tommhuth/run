/**
 * Set the colour to a lovely pink.
 * Note that the color is a 4D Float
 * Vector, R,G,B and A and each part
 * runs from 0.0 to 1.0
 */
varying float vAlpha;

void main() {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = smoothstep(12.0, 30.0, depth);

    gl_FragColor = vec4(1.0, 0.0, 0.0, vAlpha);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0,1.0,1.0), fogFactor);
}