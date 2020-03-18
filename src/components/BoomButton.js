import React from "react" 
import "./style/boom-button.scss"

export default function BoomButton({ boom }) {
    return (
        <button
            className="boom-button"
            type="button"
            onClick={(e) => {
                e.stopPropagation()
                boom()
            }}
        >
            Bitch
        </button>
    )
}