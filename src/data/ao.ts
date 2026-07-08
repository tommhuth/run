import { AO_LAYER } from "@components/Instances"
import { ROAD_FORWARD_EDGE } from "@components/road/const"
import { Camera } from "@react-three/fiber"
import { DoubleSide, Matrix4, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Texture, Vector2, WebGLRenderer, WebGLRenderTarget } from "three"

export const aoMatrix = new Matrix4()
export const AO_TEXTURE_WIDTH = 256
export const AO_TEXTURE_HEIGHT = AO_TEXTURE_WIDTH * 2

const aoCamera = new OrthographicCamera(-20, 20, 40, -40, 0, 100)

const aoMaterial = new ShaderMaterial({
    side: DoubleSide,
    vertexShader: /* glsl */ `
        varying vec3 vWorldPosition;

        void main() {
            #ifdef USE_INSTANCING
                vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
            #else
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            #endif

            vWorldPosition = worldPosition.xyz;
            
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    fragmentShader: /* glsl */ `
        varying vec3 vWorldPosition;

        void main() { 
            // plain mask  
            float height = 1. - step(0., vWorldPosition.y);

            gl_FragColor = vec4(height, height, height, 1.);
        }
    `,
})

const blurScene = new Scene()
const blurCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
const blurMaterial = new ShaderMaterial({
    uniforms: {
        uTexture: { value: null },
        uDirection: { value: new Vector2() },
        uResolution: { value: new Vector2() },
    },
    vertexShader: /* glsl */ `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0., 1.);
        }
    `,
    fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform vec2 uDirection;
        uniform vec2 uResolution;

        void main() {
            vec2 off = uDirection / uResolution;
            vec4 c = vec4(0.);

            c += texture2D(uTexture, vUv - off * 4.0) * 0.05;
            c += texture2D(uTexture, vUv - off * 3.0) * 0.09;
            c += texture2D(uTexture, vUv - off * 2.0) * 0.12;
            c += texture2D(uTexture, vUv - off * 1.0) * 0.15;
            c += texture2D(uTexture, vUv)              * 0.18;
            c += texture2D(uTexture, vUv + off * 1.0) * 0.15;
            c += texture2D(uTexture, vUv + off * 2.0) * 0.12;
            c += texture2D(uTexture, vUv + off * 3.0) * 0.09;
            c += texture2D(uTexture, vUv + off * 4.0) * 0.05;

            gl_FragColor = c;
        }
    `,
})

blurScene.add(new Mesh(new PlaneGeometry(2, 2), blurMaterial))

interface RenderAOParams {
    camera: Camera
    gl: WebGLRenderer
    scene: Scene
    ao: WebGLRenderTarget<Texture<unknown>>
    shadowBlur: WebGLRenderTarget<Texture<unknown>>
    shadowBlurHorizontal: WebGLRenderTarget<Texture<unknown>>
    blurScale?: number
    blurIterations?: number
}

export function renderAO({
    camera,
    gl,
    scene,
    ao,
    shadowBlur,
    shadowBlurHorizontal,
    blurScale = 2,
    blurIterations = 2
}: RenderAOParams) {
    const z = camera.position.z + ROAD_FORWARD_EDGE / 2

    aoCamera.position.set(0, 35, z)
    aoCamera.lookAt(0, 0, z)
    aoCamera.updateMatrixWorld()
    aoMatrix.multiplyMatrices(aoCamera.projectionMatrix, aoCamera.matrixWorldInverse)

    // render top down ao
    aoCamera.layers.disableAll()
    aoCamera.layers.enable(AO_LAYER)
    scene.overrideMaterial = aoMaterial
    gl.setRenderTarget(ao)
    gl.render(scene, aoCamera)
    scene.overrideMaterial = null

    // separable gaussian blur on the AO target (2 iterations, wide kernel)
    blurMaterial.uniforms.uResolution.value.set(AO_TEXTURE_WIDTH, AO_TEXTURE_HEIGHT)

    let src = ao.texture

    for (let i = 0; i < blurIterations; i++) {
        blurMaterial.uniforms.uTexture.value = src
        blurMaterial.uniforms.uDirection.value.set(blurScale, 0)
        gl.setRenderTarget(shadowBlurHorizontal)
        gl.render(blurScene, blurCamera)

        blurMaterial.uniforms.uTexture.value = shadowBlurHorizontal.texture
        blurMaterial.uniforms.uDirection.value.set(0, blurScale)
        gl.setRenderTarget(shadowBlur)
        gl.render(blurScene, blurCamera)

        src = shadowBlur.texture
    }
}
