import React, { useEffect, useRef } from "react"
import { CannonProvider } from "../data/cannon"
import { Canvas } from "react-three-fiber"
import Lights from "./Lights"
import Camera from "./Camera"
import Timer from "./Timer"
import Only from "./Only"
import Path from "./Path"
import Player from "./Player"
import { useStore } from "../data/store"
import GameState from "../data/const/GameState"
import Config from "../data/Config"
import { Vector3 } from "three"

export default function RunGame() {
    let state = useStore(state => state.data.state)
    let reason = useStore(state => state.data.reason)
    let attempts = useStore(state => state.data.attempts)
    let mustRequestOrientationAccess = useStore(state => state.data.mustRequestOrientationAccess)
    let hasDeviceOrientation = useStore(state => state.data.hasDeviceOrientation)
    let actions = useStore(state => state.actions)
    let small = window.matchMedia("(max-width: 600px)").matches
    let tid = useRef()

    useEffect(() => {
        if (state === GameState.INTRO) {
            tid.current = setTimeout(() => actions.ready(), 4500)

            return () => clearTimeout(tid.current)
        }
    }, [state])

    useEffect(() => {
        let listener = () => {
            switch (state) {
                case GameState.REQUEST_ORIENTATION_ACCESS:
                    return actions.requestDeviceOrientation()
                case GameState.READY:
                    return actions.start()
                case GameState.GAME_OVER:
                    return actions.reset()
            }
        }

        window.addEventListener("click", listener)

        return () => window.removeEventListener("click", listener)
    }, [state])

    useEffect(() => {
        let listener = () => {
            if (document.hidden && state === GameState.RUNNING) {
                actions.stopTimer()
            } else if (!document.hidden && state === GameState.RUNNING) {
                actions.startTimer()
            }
        }

        document.addEventListener("visibilitychange", listener)

        return () => document.removeEventListener("visibilitychange", listener)
    }, [state])

    useEffect(() => {
        if (mustRequestOrientationAccess && !hasDeviceOrientation) {
            let listener = () => {
                actions.hasDeviceOrientation()
                window.removeEventListener("deviceorientation", listener)
            }

            window.addEventListener("deviceorientation", listener)

            return () => window.removeEventListener("deviceorientation", listener)
        }
    }, [state, mustRequestOrientationAccess, hasDeviceOrientation])

    return (
        <>
            <Only if={[GameState.REQUEST_ORIENTATION_ACCESS, GameState.READY, GameState.INTRO].includes(state)}>
                <svg
                    viewBox="0 0 409 278"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    className="intro"
                >
                    <g fill="#FFFFF0" fillRule="nonzero">
                        <path className="letter" d="M22.7922078,51.5629157 C32.7662338,48.8705081 40.2077922,48.7664397 45.1168831,51.2507107 C50.025974,53.7349817 52.4805195,59.6112818 52.4805195,68.879611 C52.4805195,74.9275886 51.6038961,80.0929349 49.8506494,84.3756501 C48.0974026,88.6583653 45.0779221,92.2421666 40.7922078,95.1270541 L40.7922078,95.1270541 L54,138.570997 L36.7012987,143.240642 L25.3636364,102.590769 L17.1818182,104.799385 L17.1818182,148.509768 L2.84217094e-14,153.147861 L2.84217094e-14,57.7154879 Z M33.2607362,63.9689837 C31.4345603,62.1645454 28.1513292,61.9117906 23.4110429,63.2107194 L23.4110429,63.2107194 L17,64.9674673 L17,94.2946364 L22.4785276,92.7934154 C27.3742331,91.4518988 30.8517382,89.3465735 32.9110429,86.4774395 C34.9703476,83.6083055 36,79.5509836 36,74.3054737 C36,69.2189186 35.0869121,65.7734219 33.2607362,63.9689837 Z" ></path>
                        <path className="letter" d="M96.5588865,30.6226282 C106.373305,27.9957229 113.400428,28.705169 117.640257,32.7509666 C121.880086,36.7967642 124,43.8825423 124,54.008301 L124,54.008301 L124,89.8016807 C124,99.9274394 121.860457,108.231789 117.58137,114.714729 C113.302284,121.197669 106.294789,125.742084 96.5588865,128.347974 C86.6659529,130.995895 79.5995717,130.238085 75.359743,126.074546 C71.1199143,121.911007 69,114.727111 69,104.522858 L69,104.522858 L69,68.7294788 C69,58.6037201 71.1199143,50.3831189 75.359743,44.067675 C79.5995717,37.7522311 86.6659529,33.2705489 96.5588865,30.6226282 Z M104.023952,44.9788453 C102.706587,42.9789842 100.051896,42.5018663 96.0598802,43.5474919 C92.0678643,44.5931174 89.3932136,46.4856862 88.0359281,49.2251984 C86.6786427,51.9647106 86,55.6012203 86,60.1347276 L86,60.1347276 L86,103.86744 C86,108.479111 86.6786427,111.818731 88.0359281,113.8863 C89.3932136,115.953869 92.0678643,116.464841 96.0598802,115.419215 C99.9720559,114.394502 102.606786,112.492848 103.964072,109.714254 C105.321357,106.93566 106,103.240527 106,98.6288563 L106,98.6288563 L106,54.8961438 C106,50.2844726 105.341317,46.9787064 104.023952,44.9788453 Z" ></path>
                        <polygon className="letter" points="183 103.551396 183 91.6777846 159.520349 97.8755382 159.520349 14.5251375 142 19.1498572 142 114.373869"></polygon>
                        <polygon className="letter" points="238 89.0262585 238 77.1526471 214.520349 83.3504007 214.520349 1.42108547e-14 197 4.62471967 197 99.8487317"></polygon>
                        <path className="letter" d="M251.526316,101.319504 C256.097744,99.2847848 259.486216,96.586757 261.691729,93.2254213 C263.897243,89.8640856 265,85.70241 265,80.7403946 L265,66.4358344 L249,70.5723909 L249,86.2725179 L257.661654,84.0331791 C257.661654,86.7467813 256.93985,89.1236575 255.496241,91.1638077 C254.052632,93.2039579 252.16792,94.8348109 249.842105,96.0563668 L251.526316,101.319504 Z" ></path>
                        <path className="letter" d="M23.4782609,175.274884 C32.4782609,172.853049 39.3652174,172.848005 44.1391304,175.259751 C48.9130435,177.671497 51.3,183.360205 51.3,192.325873 C51.3,198.145692 50.126087,203.003402 47.7782609,206.899003 C45.4304348,210.794604 42.026087,213.696506 37.5652174,215.60471 C48.5217391,214.779837 54,221.170297 54,234.776091 C54,243.977698 51.7695652,251.51842 47.3086957,257.398257 C42.8478261,263.278095 36.2347826,267.397342 27.4695652,269.755999 L27.4695652,269.755999 L-2.84217094e-14,277.147861 L-2.84217094e-14,181.592715 Z M33.8023256,227.255802 C31.6705426,225.186922 28.0852713,224.841818 23.0465116,226.22049 L23.0465116,226.22049 L17,227.874897 L17,260.294636 L23.627907,258.481152 C28.6666667,257.10248 32.1550388,254.920894 34.0930233,251.936394 C36.0310078,248.951893 37,244.649141 37,239.028136 C37,233.248793 35.9341085,229.324681 33.8023256,227.255802 Z M32.4228395,188.115722 C30.0380658,186.996965 26.0699588,187.179326 20.5185185,188.662805 L20.5185185,188.662805 L17,189.603038 L17,216.294636 L22.9814815,214.69624 C27.9855967,213.35902 31.4063786,211.332754 33.2438272,208.617444 C35.0812757,205.902133 36,202.047019 36,197.0521 C36,192.213272 34.8076132,189.234479 32.4228395,188.115722 Z" ></path>
                        <path className="letter" d="M93.7922078,157.17592 C103.766234,154.483512 111.207792,154.379444 116.116883,156.863715 C121.025974,159.347986 123.480519,165.224286 123.480519,174.492615 C123.480519,180.540593 122.603896,185.705939 120.850649,189.988654 C119.097403,194.27137 116.077922,197.855171 111.792208,200.740058 L111.792208,200.740058 L125,244.184002 L107.701299,248.853646 L96.3636364,208.203773 L88.1818182,210.412389 L88.1818182,254.122772 L71,258.760865 L71,163.328492 Z M104.260736,168.581988 C102.43456,166.77755 99.1513292,166.524795 94.4110429,167.823724 L94.4110429,167.823724 L88,169.580472 L88,198.907641 L93.4785276,197.40642 C98.3742331,196.064903 101.851738,193.959578 103.911043,191.090444 C105.970348,188.22131 107,184.163988 107,178.918478 C107,173.831923 106.086912,170.386426 104.260736,168.581988 Z" ></path>
                        <polygon className="letter" points="159 234.775605 159 139.520645 142 144.118909 142 239.373869"></polygon>
                        <polygon className="letter" points="205.992556 222.123722 205.992556 139.813681 221 135.85451 221 123.055944 173 135.719006 173 148.517571 188.364764 144.464135 188.364764 226.774176"></polygon>
                        <polygon className="letter" points="249.92891 210.209554 249.92891 153.276145 273.388626 203.97528 285 200.88963 285 105.608512 270.545024 109.449832 270.545024 163.795358 247.203791 115.652619 235 118.8957 235 214.176819"></polygon>
                        <polygon className="letter" points="345 185.043346 345 173.199959 322.192982 179.322413 322.192982 147.779136 339.97076 143.006761 339.97076 130.928852 322.192982 135.701227 322.192982 108.379354 344.766082 102.319694 344.766082 90.1245238 305 100.799572 305 195.781189"></polygon>
                        <polygon className="letter" points="389.920771 172.936316 389.920771 136.633765 409 72.6791107 393.100642 76.925094 382.029979 117.593915 370.252677 83.0267293 354 87.3670678 373.314775 141.068459 373.314775 177.371009"></polygon>
                    </g>
                </svg>
                <div className="message">
                    Tap to start
                </div>
            </Only>
            <Only if={state === GameState.GAME_OVER}>
                <div className="game-over"> 
                    {"Gurl,".split("").map((i, index) => <span key={index}>{i}</span>)} <br />
                    {(reason || "").split("").map((i, index) => <span key={index}>{i}</span>)}
                </div>
                <div className="message">
                    Tap to restart
                </div>
            </Only>
            <Only if={state === GameState.RUNNING || true}>
                <Timer />
            </Only>

            <Canvas
                orthographic
                noEvents
                pixelRatio={small ? window.devicePixelRatio : 1}
                camera={{
                    position: new Vector3(5, 6, 15),
                    zoom: Config.DEBUG_MODE ? 15 : small ? 20 : 35,
                    near: -50,
                    far: 100,
                    left: -50,
                    right: 50
                }}
            >
                <CannonProvider
                    defaultFriction={.8}
                    defaultRestitution={.5}
                >
                    <Lights />
                    <Camera />
                    <Path />

                    {[GameState.RUNNING, GameState.GAME_OVER].includes(state) ? <Player key={attempts} /> : null}
                </CannonProvider>
            </Canvas>
        </>
    )
}