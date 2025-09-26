import { store } from "@data/store"

export default function Ui() {
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: "2em",
                    bottom: "3em"
                }}
            >
                R3F boilerplate
                <Debug />
            </div>
        </>
    )
}

function Debug() {
    let state = store(i => i.state)
    let path = store(i => i.path)

    return (
        <div
            style={{ position: "absolute", bottom: "100%", marginBottom: "1em" }}
        >
            <div>{state}</div>
            <div />
        </div>
    )
}