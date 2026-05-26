import { MeshBasicMaterial, MeshPhongMaterial, WebGLProgramParametersWithUniforms } from "three"

import { glsl } from "./helpers"

interface ShaderPart {
    main?: string
    head?: string
    injectAt?: string
}

interface ShaderParts {
    shared?: string
    fragment?: ShaderPart | ShaderPart[]
    vertex?: ShaderPart | ShaderPart[]
}

export function patchShader(
    shader: WebGLProgramParametersWithUniforms,
    patch?: ShaderParts
) {
    const vertexParts = Array.isArray(patch?.vertex) ? patch.vertex : [patch?.vertex]
    const fragmentParts = Array.isArray(patch?.fragment) ? patch.fragment : [patch?.fragment]

    shader.vertexShader = shader.vertexShader.replace("#include <common>", glsl`
        #include <common>
        
        ${patch?.shared || ""}
        ${vertexParts.map((p) => p?.head || "").join("\n")}  
    `)

    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", glsl`
        #include <begin_vertex>

        ${vertexParts.map((p) => p?.main || "").join("\n")}  
    `)

    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", glsl`
        #include <common>
 
        ${patch?.shared || ""}
        ${fragmentParts.map((p) => p?.head || "").join("\n")}
    `)

    for (const part of fragmentParts) {
        const injectAt = part?.injectAt || "#include <dithering_fragment>"

        shader.fragmentShader = shader.fragmentShader.replace(injectAt, glsl` 
            ${injectAt}

            ${part?.main || ""}
        `)
    }
}

export abstract class PatchedPhongMaterial<TUniforms> extends MeshPhongMaterial {
    shader?: ShaderParts
    private rafId?: number
    abstract uniforms: TUniforms

    private raf(lastTime = performance.now()) {
        const now = performance.now()
        const delta = Math.min((now - lastTime) / 1000, 1 / 15) // min 15 fps

        this.update?.(delta)
        this.rafId = requestAnimationFrame(() => this.raf(now))
    }

    abstract update(delta: number): void

    initialize() {
        this.raf()
    }

    onBeforeCompile(shader: WebGLProgramParametersWithUniforms) {
        shader.uniforms = {
            ...shader.uniforms,
            ...this.uniforms
        }
        patchShader(shader, this.shader)
    }

    dispose() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId)
        }

        super.dispose()
    }
}



export abstract class PatchedBasicMaterial<TUniforms> extends MeshBasicMaterial {
    shader?: ShaderParts
    private rafId?: number
    abstract uniforms: TUniforms

    private raf(lastTime = performance.now()) {
        const now = performance.now()
        const delta = Math.min((now - lastTime) / 1000, 1 / 15) // min 15 fps

        this.update?.(delta)
        this.rafId = requestAnimationFrame(() => this.raf(now))
    }

    abstract update(delta: number): void

    initialize() {
        this.raf()
    }

    onBeforeCompile(shader: WebGLProgramParametersWithUniforms) {
        shader.uniforms = {
            ...shader.uniforms,
            ...this.uniforms
        }
        patchShader(shader, this.shader)
    }

    dispose() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId)
        }

        super.dispose()
    }
}
