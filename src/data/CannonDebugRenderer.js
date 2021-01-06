import { Vec3, Sphere, Box, ConvexPolyhedron, Plane, Shape } from "cannon-es"
import { Mesh, Geometry, Vector3, Face3, MeshBasicMaterial, PlaneGeometry, BoxGeometry, SphereGeometry } from "three/src/Three"

// cleanup of https://github.com/schteppe/js/blob/master/tools/threejs/CannonDebugRenderer.js
/**
 * Adds js primitives into the scene where all the Cannon bodies and shapes are.
 * @class CannonDebugRenderer
 * @param {Scene} scene
 * @param {World} world
 * @param {object} [options]
 */

export default class CannonDebugRenderer {
    _scene
    _world
    _meshes = []
    _material = new MeshBasicMaterial({ color: 0x000000, wireframe: true })
    _sphereGeometry = new SphereGeometry(1, 16, 16)
    _boxGeometry = new BoxGeometry(1, 1, 1)
    _planeGeometry = new PlaneGeometry(10, 10, 1, 1)
    _tmpVec0 = new Vec3()
    _tmpVec1 = new Vec3()
    _tmpVec2 = new Vec3()
    _tmpQuat0 = new Vec3()

    constructor(scene, world) {
        this._scene = scene
        this._world = world
    }

    update() {
        let bodies = this._world.bodies
        let meshes = this._meshes
        let shapeWorldPosition = this._tmpVec0
        let shapeWorldQuaternion = this._tmpQuat0
        let meshIndex = 0

        for (let i = 0; i !== bodies.length; i++) {
            let body = bodies[i]

            for (let j = 0; j !== body.shapes.length; j++) {
                let shape = body.shapes[j]
                let mesh = meshes[meshIndex]

                this._updateMesh(meshIndex, shape)

                if (mesh) {
                    // Get world position
                    body.quaternion.vmult(body.shapeOffsets[j], shapeWorldPosition)
                    body.position.vadd(shapeWorldPosition, shapeWorldPosition)

                    // Get world quaternion
                    body.quaternion.mult(body.shapeOrientations[j], shapeWorldQuaternion)

                    // Copy to meshes
                    mesh.position.copy(shapeWorldPosition)
                    mesh.quaternion.copy(shapeWorldQuaternion)
                }

                meshIndex++
            }
        }

        for (let i = meshIndex; i < meshes.length; i++) {
            let mesh = meshes[i]

            if (mesh) {
                this._scene.remove(mesh)
            }
        }

        meshes.length = meshIndex
    }

    _updateMesh(index, shape) {
        let mesh = this._meshes[index]

        if (!this._typeMatch(mesh, shape)) {
            if (mesh) {
                this._scene.remove(mesh)
            }
            mesh = this._meshes[index] = this._createMesh(shape)
        }

        this._scaleMesh(mesh, shape)
    }

    _typeMatch(mesh, shape) {
        if (!mesh) {
            return false
        }
        let geo = mesh.geometry

        return (
            (geo instanceof SphereGeometry && shape instanceof Sphere) ||
            (geo instanceof BoxGeometry && shape instanceof Box) ||
            (geo instanceof PlaneGeometry && shape instanceof Plane) ||
            (geo.id === shape.geometryId && shape instanceof ConvexPolyhedron)
        )
    }

    _createSphere(shape, material = this._material) {
        return new Mesh(this._sphereGeometry, material)
    }

    _createBox(shape, material = this._material) {
        return new Mesh(this._boxGeometry, material)
    }

    _createPlane(shape, material = this._material) {
        return new Mesh(this._planeGeometry, material)
    }

    _createConvexPolyhedron(shape, material = this._material) {
        // Create mesh
        let geo = new Geometry()

        // Add vertices
        for (let i = 0; i < shape.vertices.length; i++) {
            let v = shape.vertices[i]

            geo.vertices.push(new Vector3(v.x, v.y, v.z))
        }

        for (let i = 0; i < shape.faces.length; i++) {
            let face = shape.faces[i]

            // add triangles
            let a = face[0]

            for (let j = 1; j < face.length - 1; j++) {
                let b = face[j]
                let c = face[j + 1]

                geo.faces.push(new Face3(a, b, c))
            }
        }
        geo.computeBoundingSphere()
        geo.computeFaceNormals()

        shape.geometryId = geo.id

        return new Mesh(geo, material)
    }

    _createTrimesh(shape, material = this._material) {
        let geometry = new Geometry()
        let v0 = this._tmpVec0
        let v1 = this._tmpVec1
        let v2 = this._tmpVec2

        for (var i = 0; i < shape.indices.length / 3; i++) {
            shape.getTriangleVertices(i, v0, v1, v2)
            geometry.vertices.push(
                new Vector3(v0.x, v0.y, v0.z),
                new Vector3(v1.x, v1.y, v1.z),
                new Vector3(v2.x, v2.y, v2.z)
            )
            let j = geometry.vertices.length - 3

            geometry.faces.push(new Face3(j, j + 1, j + 2))
        }

        geometry.computeBoundingSphere()
        geometry.computeFaceNormals()
        shape.geometryId = geometry.id

        return new Mesh(geometry, material)
    }

    _createHeightfield(shape, material) {
        let geometry = new Geometry()
        let v0 = this._tmpVec0
        let v1 = this._tmpVec1
        let v2 = this._tmpVec2

        for (let xi = 0; xi < shape.data.length - 1; xi++) {
            for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
                for (let k = 0; k < 2; k++) {
                    shape.getConvexTrianglePillar(xi, yi, k === 0)
                    v0.copy(shape.pillarConvex.vertices[0])
                    v1.copy(shape.pillarConvex.vertices[1])
                    v2.copy(shape.pillarConvex.vertices[2])
                    v0.vadd(shape.pillarOffset, v0)
                    v1.vadd(shape.pillarOffset, v1)
                    v2.vadd(shape.pillarOffset, v2)
                    geometry.vertices.push(
                        new Vector3(v0.x, v0.y, v0.z),
                        new Vector3(v1.x, v1.y, v1.z),
                        new Vector3(v2.x, v2.y, v2.z)
                    )

                    let i = geometry.vertices.length - 3

                    geometry.faces.push(new Face3(i, i + 1, i + 2))
                }
            }
        }
        geometry.computeBoundingSphere()
        geometry.computeFaceNormals() 
        shape.geometryId = geometry.id 

        return new Mesh(geometry, material)
    }

    _createMesh(shape) {
        let mesh 

        switch (shape.type) {
            case Shape.types.SPHERE:
                mesh = this._createSphere(shape)
                break
            case Shape.types.BOX:
                mesh = this._createBox(shape)
                break
            case Shape.types.PLANE:
                mesh = this._createPlane(shape)
                break
            case Shape.types.CONVEXPOLYHEDRON:
                mesh = this._createConvexPolyhedron(shape)
                break
            case Shape.types.TRIMESH:
                mesh = this._createTrimesh(shape)
                break
            case Shape.types.HEIGHTFIELD:
                mesh = this._createHeightfield(shape)  
        }

        if (mesh) {
            this._scene.add(mesh)
        }

        return mesh
    }

    _scaleMesh(mesh, shape) {
        switch (shape.type) {
            case Shape.types.SPHERE:
                mesh.scale.set(shape.radius, shape.radius, shape.radius)
                break
            case Shape.types.BOX:
                mesh.scale.copy(shape.halfExtents)
                mesh.scale.multiplyScalar(2)
                break
            case Shape.types.CONVEXPOLYHEDRON:
                mesh.scale.set(1, 1, 1)
                break
        }
    }
} 