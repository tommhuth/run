import FontFaceObserver from "fontfaceobserver" 

export default async function fontLoader() {
    try {
        await Promise.all([
            new FontFaceObserver("Roboto", {
                weight: 300,
                style: "normal",
            }).load(),
            new FontFaceObserver("Raleway", {
                weight: 900,
                style: "normal",
            }).load(),
            new FontFaceObserver("Raleway", {
                weight: 100,
                style: "normal",
            }).load(),
        ])
    } catch (e) {
        console.error("fontLoader", e)
    }
}
