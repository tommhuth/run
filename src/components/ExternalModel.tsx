import { useLoader } from "@react-three/fiber"
import { ComponentPropsWithoutRef, ReactNode } from "react"
import { Mesh } from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js"

interface ExternalModelProps extends ComponentPropsWithoutRef<"mesh"> {
    url: string
    name: string
    children?: ReactNode
}

export function useExternalModel(url: string): Record<string, Mesh>
export function useExternalModel(url: string, name: string): Mesh
export function useExternalModel(url: string, name?: string) {
    const { nodes } = useLoader(GLTFLoader, url)

    if (!name) {
        return nodes as Record<string, Mesh>
    }

    return nodes[name] as Mesh
}

export default function ExternalModel({ url, children, name, ...props }: ExternalModelProps) {
    const { geometry } = useExternalModel(url, name)

    return (
        <mesh {...props} dispose={null}>
            <primitive
                object={geometry}
                attach="geometry"
            />
            {children}
        </mesh>
    )
}
