import {  MeshPhongMaterial, SphereBufferGeometry, DodecahedronBufferGeometry } from "three"

const material = { 
    blue: new MeshPhongMaterial({ color: 0x00d5ff, flatShading: true, shininess: 1 }),
    white: new MeshPhongMaterial({ 
        color: 0xffec3d, 
        emissive: 0xffec3d,
        emissiveIntensity: .25,
        specular: 0xffffff,
        shininess: 100, 
        flatShading: true 
    }),
}

const geometry = {
    sphere: new SphereBufferGeometry(1, 8, 8),
    coin: new SphereBufferGeometry(1, 6, 2),
    fragment: new DodecahedronBufferGeometry(1, 0)
}

export { geometry, material }