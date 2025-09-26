

function Water({ position = [0, 0, 0] }) {
    let ref = useRef<Mesh>(null)
    let { camera, gl } = useThree()
    const fbo = useFBO(512, 512, {
        stencilBuffer: false,
        depthBuffer: true, // this adds fbo.depthTexture
    })
    let { onBeforeCompile, uniforms } = useShader({
        uniforms: {
            cameraNear: {
                value: camera.near,
            },
            cameraFar: {
                value: camera.far,
            },
            resolution: {
                value: gl.getSize(new Vector2()).multiplyScalar(gl.getPixelRatio()),
                co: console.log(gl.getSize(new Vector2()))
            },
            cameraMatrixWorld: {
                value: camera.matrixWorld
            },
            tDepth: {
                value: fbo.depthTexture,
            }
        },
        shared: glsl` 
			uniform float cameraNear;
			uniform float cameraFar;
			uniform vec2 resolution;
			varying vec3 worldPos;
			uniform mat4 cameraMatrixWorld;
			uniform sampler2D tDepth;
            varying vec2 vUv;

            // reconstruct linear view-space Z from depth texture
          float getWorldZ(vec2 uv) {
                // sample depth texture (nonlinear)
                float depth = texture2D(tDepth, uv).r;

                // convert to linear view-space Z
                float viewZ = (cameraNear * cameraFar) / ((cameraFar - cameraNear) * depth - cameraFar);

                // view-space Z is along camera local -Z, so world Z along camera forward
                // transform to world space
                vec4 viewPos = vec4(0.0, 0.0, viewZ, 1.0); 
                vec4 worldPos = cameraMatrixWorld * viewPos;

                return worldPos.z; // world-space Z (distance along world Z axis)
            }
        `,
        vertex: {
            main: glsl`
                vUv = uv;

                worldPos =  (modelMatrix * vec4(position, 1.0)).xyz;
            `
        },
        fragment: {
            main: glsl` 
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                float depthz = getWorldZ(uv);

                 // Neighbor offsets
                vec2 offsetX = vec2(1.0 / resolution.x, 0.0) * 5.;
                vec2 offsetY = vec2(0.0, 1.0 / resolution.y) * 5.;
 
                // Sample neighbors
                float depthLeft  = getWorldZ(uv - offsetX);
                float depthRight = getWorldZ(uv + offsetX);
                float depthUp    = getWorldZ(uv + offsetY);
                float depthDown  = getWorldZ(uv - offsetY);

                // Detect edges by comparing differences
                float dx = abs(depthRight - depthLeft);
                float dy = abs(depthUp - depthDown);
                float edge = step(1., dx + dy);
 
                float xx = clamp((abs(min(min(depthLeft,depthRight),min(depthUp,depthDown )) - worldPos.z)) / 3., -1., 1.);
 

                if (depthz > worldPos.z) {  
                    //gl_FragColor.rgb =  vec3(0., 0, 1.);
                } else {
                    //gl_FragColor.rgb = mix(vec3(1.), vec3(0., 0, 1.), xx * (1. - clamp((worldPos.y - depthz) / 2., 0., 1.) )); 
                }

                gl_FragColor.rgb = mix(vec3(1.), vec3(0., 0, 1.), edge * clamp((depthz - worldPos.z) / 2., 0., 1. ));

            `
        }
    })

    useFrame(({ gl, scene, camera }) => {
        ref.current.visible = false
        gl.setRenderTarget(fbo)
        gl.render(scene, camera)
        gl.setRenderTarget(null)
        ref.current.visible = true
    })

    useFrame(() => {
        let { player } = store.getState()

        if (!ref.current || !player.mesh) {
            return
        }

        ref.current.position.z = player.mesh.position.z
    })

    return (
        <group ref= { ref } >
        <mesh
                position - x={ position[0] }
    position - y={ -4.5 }
    rotation - x={ Math.PI * .5 }
            >
        <planeGeometry args={ [111, 111] } />
            < meshPhongMaterial
    attach = "material"
    color = { "blue"}
    side = { DoubleSide }
    transparent
    opacity = { 1}
    onBeforeCompile = { onBeforeCompile }
        />
        </mesh>
        </group>
    )
}