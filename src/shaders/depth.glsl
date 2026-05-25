// thanks chattyman https://chatgpt.com/c/690d05ff-3a88-8325-b817-331a0a2e7eee
// --- For sampling from depth buffer (nonlinear) ---
float linearizeDepth(float depth, float near, float far) {
    // Convert depth buffer value [0,1] -> NDC [-1,1]
    float z = depth * 2.0 - 1.0;
    // Reconstruct view-space z
    float viewZ = (2.0 * near * far) / (far + near - z * (far - near));
    // Convert to linear 0–1 depth (near=0, far=1)
    return (viewZ - near) / (far - near);
}

// --- For world-space position ---
float getLinearDepth(vec3 worldPos, mat4 viewMatrix, float near, float far) {
    // Transform world -> view
    vec4 viewPos = viewMatrix * vec4(worldPos, 1.0);
    float viewZ = -viewPos.z; // camera looks down -Z
    // Normalize to same 0–1 range
    return (viewZ - near) / (far - near);
}

// Returns scene depth minus fragment depth (positive = fragment is in front of scene)
float getFragmentDepth(vec3 worldPos, sampler2D depthTex, vec2 screenUv, mat4 vMatrix, float near, float far) {
    float sceneDepth = linearizeDepth(texture2D(depthTex, screenUv).r, near, far);
    float fragmentDepth = getLinearDepth(worldPos, vMatrix, near, far);

    return sceneDepth - fragmentDepth;
}
