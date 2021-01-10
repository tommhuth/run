import { SphereBufferGeometry, BoxBufferGeometry } from "three"

export default {
    sphere: new SphereBufferGeometry(1, 24, 24),
    box: new BoxBufferGeometry(1, 1, 1, 1, 1, 1),
    coin: new SphereBufferGeometry(1, 6, 2),
}