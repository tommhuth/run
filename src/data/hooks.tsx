import { patchShader } from "@components/PatchedMaterial"
import random from "@huth/random"
import { useCallback, useMemo } from "react"
import { IUniform, WebGLProgramParametersWithUniforms, WebGLRenderer } from "three"

export interface ShaderPart {
    head?: string
    main?: string
}

type UniformsRecord = Record<string, IUniform>

type ReturnUniformsRecord<T extends Record<string, IUniform> | undefined> = T extends UniformsRecord
    ? {
        [K in keyof T]: {
            value: T[K]["value"];
            needsUpdate?: boolean;
        };
    }
    : undefined;

export interface UseShaderParams<T extends UniformsRecord> {
    uniforms?: T | undefined
    shared?: string
    vertex?: ShaderPart
    fragment?: ShaderPart
}

interface ReturnUseShader<T extends UniformsRecord | undefined> {
    uniforms: ReturnUniformsRecord<T>
    onBeforeCompile: (shader: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => void
    customProgramCacheKey: () => string
}

export function useShader<T extends UniformsRecord>({
    uniforms: incomingUniforms,
    shared = "",
    vertex = {
        head: "",
        main: "",
    },
    fragment = {
        head: "",
        main: "",
    }
}: UseShaderParams<T>): ReturnUseShader<T> {
    const uniforms = useMemo(() => {
        return incomingUniforms || {}
    }, [])
    const id = useMemo(() => random.id(), [])
    const customProgramCacheKey = useCallback(() => id, [id])
    const onBeforeCompile = useCallback((shader: WebGLProgramParametersWithUniforms) => {
        shader.uniforms = {
            ...shader.uniforms,
            ...uniforms
        }

        patchShader(shader, { vertex, fragment, shared })
    }, [vertex?.head, vertex?.main, fragment?.head, fragment?.main])

    return {
        // aaah why is this cast neccessary ts
        uniforms: uniforms as ReturnUniformsRecord<T>,
        customProgramCacheKey,
        onBeforeCompile
    }
}
