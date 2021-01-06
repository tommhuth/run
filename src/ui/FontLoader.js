import { useEffect, useMemo, useState, useCallback } from "react"
import FontFaceObserver from "fontfaceobserver"

export default function FontLoader({
    children
}) {
    let fonts = useMemo(() =>  [
        new FontFaceObserver("Oswald", {  weight: 200, style: "normal" }).load(),
        new FontFaceObserver("Oswald", {  weight: 500, style: "normal" }).load()
    ], [])
    let [loading, setLoading] = useState(true)
    let load = useCallback(async () => {
        try {
            await Promise.all(fonts)
        } catch (e) {
            // do nothing
        } finally {
            // kill basic spinner
            document.getElementById("spinner").remove()
            setLoading(false)
        }
    })

    useEffect(() => {
        load()
    }, [])

    return !loading ? <>{children}</> : null
}