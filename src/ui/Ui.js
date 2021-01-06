import Config from "../Config"
import { useStore } from "../data/store" 

export default function Ui() {
    let state = useStore(state => state.state)
    let gameOverReason = useStore(state => state.gameOverReason)
    let score = useStore(state => state.score)
    let z = useStore(state => Math.round(state.position.z))
    let buildTime = new Date(Config.BUILD_TIME) 

    return ( 
        <div className="ui">
            {state} {gameOverReason ? <>({gameOverReason})</> : null}<br />
            Score: {score} <br />
            z={z} <br />
            Built @ {buildTime.getDate().toString().padStart(2, "0")}.{buildTime.getMonth().toString().padStart(2, "0")} {buildTime.getHours().toString().padStart(2, "0")}:{buildTime.getMinutes().toString().padStart(2, "0")} <br />
            <button onClick={() => location.reload(true)}>Reload</button>
        </div>
    )
}