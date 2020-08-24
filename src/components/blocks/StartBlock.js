
import React, { useEffect, useRef, useMemo } from "react"
import Coin from "../actors/Coin"
import { Font } from "three"
import materials from "../../shared/materials"
import animate from "../../data/animate"
import oswaldFont from "../../../assets/fonts/oswald.json"

let font = new Font(oswaldFont)

function Text({
    position = [0, 0, 0],
    children,
    index = 0,
    ...rest
}) {
    let ref = useRef() 

    useEffect(() => {
        ref.current.position.x = position[0]
        ref.current.position.z = position[2]
        ref.current.position.y = -75

        return animate({
            from: { y: -75 },
            to: { y: -50 },
            duration: 2000,
            delay: index * 200,
            easing: "easeOutBack",
            render({ y }) {
                ref.current.position.y = y
            }
        })
    }, [])

    return (
        <mesh ref={ref} material={materials.ground} {...rest}>
            <textGeometry
                attach="geometry" 
                args={[
                    children, 
                    {
                        font,
                        size: 12,
                        height: 50,
                        curveSegments: 3,
                        bevelEnabled: false,
                    }
                ]}
            />
        </mesh>
    )
}

function StartBlock(props) {
    return (
        <>
            <Text
                position={[-.5, -50, 1.5]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={1}
            >
                R
            </Text>
            <Text
                position={[-.5, -50, -7]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={2}
            >
                O
            </Text>
            <Text
                position={[-.5, -50, -16]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={3}
            >
                L
            </Text>
            <Text
                position={[-.5, -50, -23]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={4}
            >
                L
            </Text>




            <Text
                position={[14, -50, 1.5]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={0}
            >
                B
            </Text>
            <Text
                position={[14, -50, -7]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={1}
            >
                R
            </Text>
            <Text
                position={[14, -50, -15.5]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={2}
            >
                I
            </Text>
            <Text
                position={[14, -50, -20]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={3}
            >
                T
            </Text>
            <Text
                position={[14, -50, -27]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={4}
            >
                N
            </Text>
            <Text
                position={[14, -50, -35.5]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={5}
            >
                E
            </Text>
            <Text
                position={[14, -50, -43]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={6}
            >
                Y
            </Text> 
        </>
    )
}

export default React.memo(StartBlock)