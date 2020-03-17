import {  MeshPhongMaterial, SphereBufferGeometry, DodecahedronBufferGeometry } from "three"

const material = {
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

const geometry = {
    sphere: new SphereBufferGeometry(1, 8, 8),
    coin: new SphereBufferGeometry(1, 6, 2),
    fragment: new DodecahedronBufferGeometry(1, 0)
}

export { geometry, material }