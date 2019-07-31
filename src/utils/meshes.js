import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
 
function load(url) {
    return new Promise((resolve, reject) => {
        new GLTFLoader().load(url, resolve, null, reject)
    })
}

export default load("/models/test.glb")
    .then(res => {
        let geometries = {}

        for (let child of res.scene.children) { 
            if (child.isMesh) { 
                geometries[child.name] = child.geometry.clone()
            }
        }
    
        return geometries
    }) 
