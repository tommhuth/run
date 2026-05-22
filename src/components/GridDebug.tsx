import PlaceGrid from "@data/PlaceGrid"

export default function GridDebug({ g, scale = .95 }: { g: PlaceGrid; scale?: number }) {
    return (
        <>
            <mesh position={g.origin}>
                <sphereGeometry args={[.5]} />
                <meshBasicMaterial color={"yellow"} />
            </mesh>

            <group>
                {[...g].map(([key, cell]) => {
                    return (
                        <mesh key={key} position={cell.position}>
                            <boxGeometry args={[g.cellSize * scale, .1, g.cellSize * scale]} />
                            <meshBasicMaterial color={cell.occupied ? "red" : "green"} />
                        </mesh>
                    )
                })}
            </group>
        </>
    )
}
