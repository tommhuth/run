import { useLoader } from "@react-three/fiber"
import { ComponentPropsWithoutRef, ReactNode } from "react"
import { Mesh } from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js"

interface ExternalModelProps extends ComponentPropsWithoutRef<"mesh"> {
    url: string
    name: string
    children?: ReactNode
}

export default function ExternalModel({ url, children, name, ...props }: ExternalModelProps) {
    const dirt = useLoader(GLTFLoader, url)

    return (
        <mesh {...props}>
            <primitive
                object={(dirt.nodes[name] as Mesh).geometry}
                dispose={null}
                attach="geometry"
            />
            {children}
        </mesh>
    )
}
