
import { useEffect } from "react"
import { useThree } from "react-three-fiber"
import { api } from "../data/store"

export default function Camera() {
    let { camera, gl } = useThree()

    useEffect(() => {
        window.gl = gl

        return api.subscribe((position) => {
            camera.position.z = position.z - 5
            camera.position.y += (position.y + 6 - camera.position.y) * .05
            camera.position.x += (position.x + 5 - camera.position.x) * .05
        }, state => state.data.position)
    }, [])

    useEffect(() => {
        camera.position.set(5, 6, -5)
        camera.lookAt(0, 0, 0)
    }, [])

    return null
}