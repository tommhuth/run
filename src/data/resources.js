import { DoubleSide, MeshPhongMaterial, SphereBufferGeometry } from "three"

let material = {
    red: new MeshPhongMaterial({ color: 0xff0000, flatShading: true }),
    blue: new MeshPhongMaterial({ color: 0x00d5ff, flatShading: true, shininess: 1 }),
    white: new MeshPhongMaterial({ color: 0xffffff, flatShading: true, side: DoubleSide }),
}

let geometry = {
    sphere: new SphereBufferGeometry(1, 8, 8)
}

export { geometry, material }