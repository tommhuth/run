import { store } from "@data/store"
import { setState } from "@data/store/actions"
import { useFrame } from "@react-three/fiber"

export default function usePlayerAlive() {
    useFrame(() => {
        const { path, player, state } = store.getState()
        const playerMesh = player.mesh
        const bottomBuffer = 3

        if (state !== "running" || !playerMesh) {
            return
        }

        const activeSection = path.find(({ size, position }) => {
            return position[2] - size[2] / 2 < playerMesh.position.z
                && position[2] + size[2] / 2 > playerMesh.position.z
        })

        if (!activeSection) {
            return
        }

        if (activeSection.position[1] + activeSection.size[1] / 2 - bottomBuffer > playerMesh.position.y) {
            setState({ state: "gameover" })
        }
    })
}
