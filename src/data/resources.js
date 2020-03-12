import {  MeshPhongMaterial, SphereBufferGeometry } from "three"

let material = {
    red: new MeshPhongMaterial({ color: 0xff0000, flatShading: true }),
    blue: new MeshPhongMaterial({ color: 0x00d5ff, flatShading: true, shininess: 1 }),
    white: new MeshPhongMaterial({ 
        color: 0xffffff, 
        shininess: 100, 
        emissive: 0x006666, 
        specular: 0x00FFFF,
        flatShading: true 
    }),
}

let geometry = {
    sphere: new SphereBufferGeometry(1, 8, 8),
    coin: new SphereBufferGeometry(1, 6, 2),
}

export { geometry, material }