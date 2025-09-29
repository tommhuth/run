import { store } from "@data/store"

export default function Ui() {
    let motionAccessDenied = store(i => i.motionAccessDenied)

    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: "2em",
                    bottom: "3em",
                }}
            >
                Run
                <Debug />
            </div>

            <p
                style={{
                    display: motionAccessDenied ? "block" : "none",
                    position: "absolute",
                    bottom: "1em",
                    padding: ".75em 1em",
                    background: "black",
                    color: "white",
                    left: "50%",
                    translate: "-50% 0",
                    maxWidth: "75%",
                    width: "100%",
                    zIndex: 100,
                }}
            >
                You need to allow motion access, reload and try again
            </p>
        </>
    )
}

function Debug() {
    let state = store(i => i.state)

    return (
        <div
            style={{
                position: "absolute",
                bottom: "100%",
                marginBottom: "1em",
            }}
        >
            <div>{state}</div>
        </div>
    )
}