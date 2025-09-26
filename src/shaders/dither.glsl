const mat4 ditherTable = mat4(
    -4.0, 0.0, -3.0, 1.0,
    2.0, -2.0, 3.0, -1.0,
    -3.0, 1.0, -4.0, 0.0,
    3.0, -1.0, 2.0, -2.0
);

// https://www.shadertoy.com/view/tsKGDm
vec3 dither(
    vec2 position, 
    vec3 color, 
    float colorCount , //= 8., // Higher num - higher colors quality
    float strength // = .005 // dithering strength
) {
    color += ditherTable[int(position.x) % 4][int(position.y) % 4] * strength; 
    color = floor(color * colorCount) / colorCount;     

    return color;
}