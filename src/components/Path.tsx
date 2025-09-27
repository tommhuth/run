import { addPathSection, useStore } from "@data/store"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { Tuple3 } from "src/types/global"
import PathSection from "./PathSection"

export default function Path() {
    let path = useStore(i => i.path)
    let timer = useRef(0)

    useFrame(({ camera, clock }, delta) => {
        let last = path[0]
        let forwardBuffer = 25
        let checkInterval = 250
        let time = clock.getElapsedTime()

        if (
            last
            && camera.position.z > last?.position[2] - forwardBuffer
            && timer.current > checkInterval
        ) {
            let size: Tuple3 = [random.integer(4, 6), 20, random.integer(4, 8)]
            let position: Tuple3 = [
                random.integer(-1, 1) + Math.sin(time * .45) * 2,
                -10 + Math.sin(time * .4) * 3,
                last.position[2] + last.size[2] / 2 + size[2] / 2
            ]

            timer.current = 0
            addPathSection(size, position)
        } else {
            timer.current += delta * 1000
        }
    })

    return path.map(i => {
        return (
            <PathSection {...i} key={i.id} />
        )
    })
}

/*


    let ref = useRef<Mesh>(null)
    let [w, sets] = useState([1, 1])

    useFrame(({ camera }) => {
        let dir = new Vector3(0, -3, 9).normalize()
        ref.current?.position.copy(camera.position).add(dir.multiplyScalar(2))

        let v = viewport.getCurrentViewport(camera, ref.current?.position)

        ref.current?.lookAt(camera.position)
        sets([v.width, v.height])
    })
    */