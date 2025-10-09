import { MeshBasicMaterial, MeshPhongMaterial, WebGLProgramParametersWithUniforms } from "three"

import { glsl } from "./helpers"

interface ShaderPart {
    main?: string
    head?: string
}

interface ShaderParts {
    shared?: string
    fragment?: ShaderPart
    vertex?: ShaderPart
}

export function patchShader(
    shader: WebGLProgramParametersWithUniforms,
    patch?: ShaderParts
) {
    shader.vertexShader = shader.vertexShader.replace("#include <common>", glsl`
        #include <common>
        
        ${patch?.shared || ""}
        ${patch?.vertex?.head || ""}  
    `)

    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", glsl`
        #include <begin_vertex>

        ${patch?.vertex?.main || ""}  
    `)

    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", glsl`
        #include <common>
 
        ${patch?.shared || ""}
        ${patch?.fragment?.head || ""}
    `)

    shader.fragmentShader = shader.fragmentShader.replace("#include <dithering_fragment>", glsl` 
        #include <dithering_fragment>

        ${patch?.fragment?.main || ""}
    `)
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
