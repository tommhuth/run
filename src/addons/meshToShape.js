import * as CANNON from 'cannon';
import * as THREE from 'three';
/**

  QuickHull
  ---------

  The MIT License

  Copyright &copy; 2010-2014 three.js authors

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN

  THE SOFTWARE.


    @author mark lundin / http://mark-lundin.com

    This is a 3D implementation of the Quick Hull algorithm.
    It is a fast way of computing a convex hull with average complexity
    of O(n log(n)).
    It uses depends on three.js and is supposed to create THREE.Geometry.

    It's also very messy

 */

const quickhull = (function () {


    var faces = [],
        faceStack = [],
        i, NUM_POINTS, extremes,
        max = 0,
        dcur, current, j, v0, v1, v2, v3,
        N, D;

    var ab, ac, ax,
        suba, subb, normal,
        diff, subaA, subaB, subC;

    function reset() {

        ab = new THREE.Vector3(),
            ac = new THREE.Vector3(),
            ax = new THREE.Vector3(),
            suba = new THREE.Vector3(),
            subb = new THREE.Vector3(),
            normal = new THREE.Vector3(),
            diff = new THREE.Vector3(),
            subaA = new THREE.Vector3(),
            subaB = new THREE.Vector3(),
            subC = new THREE.Vector3();

    }

    //temporary vectors

    function process(points) {

        // Iterate through all the faces and remove
        while (faceStack.length > 0) {
            cull(faceStack.shift(), points);
        }
    }


    var norm = function () {

        var ca = new THREE.Vector3(),
            ba = new THREE.Vector3(),
            N = new THREE.Vector3();

        return function (a, b, c) {

            ca.subVectors(c, a);
            ba.subVectors(b, a);

            N.crossVectors(ca, ba);

            return N.normalize();
        }

    }();


    function getNormal(face, points) {

        if (face.normal !== undefined) return face.normal;

        var p0 = points[face[0]],
            p1 = points[face[1]],
            p2 = points[face[2]];

        ab.subVectors(p1, p0);
        ac.subVectors(p2, p0);
        normal.crossVectors(ac, ab);
        normal.normalize();

        return face.normal = normal.clone();

    }


    function assignPoints(face, pointset, points) {

        // ASSIGNING POINTS TO FACE
        var p0 = points[face[0]],
            dots = [], apex,
            norm = getNormal(face, points);


        // Sory all the points by there distance from the plane
        pointset.sort(function (aItem, bItem) {


            dots[aItem.x / 3] = dots[aItem.x / 3] !== undefined ? dots[aItem.x / 3] : norm.dot(suba.subVectors(aItem, p0));
            dots[bItem.x / 3] = dots[bItem.x / 3] !== undefined ? dots[bItem.x / 3] : norm.dot(subb.subVectors(bItem, p0));

            return dots[aItem.x / 3] - dots[bItem.x / 3];
        });

        //TODO :: Must be a faster way of finding and index in this array
        var index = pointset.length;

        if (index === 1) dots[pointset[0].x / 3] = norm.dot(suba.subVectors(pointset[0], p0));
        while (index-- > 0 && dots[pointset[index].x / 3] > 0)

            var point;
        if (index + 1 < pointset.length && dots[pointset[index + 1].x / 3] > 0) {

            face.visiblePoints = pointset.splice(index + 1);
        }
    }




    function cull(face, points) {

        var i = faces.length,
            dot, visibleFace, currentFace,
            visibleFaces = [face];

        var apex = points.indexOf(face.visiblePoints.pop());

        // Iterate through all other faces...
        while (i-- > 0) {
            currentFace = faces[i];
            if (currentFace !== face) {
                // ...and check if they're pointing in the same direction
                dot = getNormal(currentFace, points).dot(diff.subVectors(points[apex], points[currentFace[0]]));
                if (dot > 0) {
                    visibleFaces.push(currentFace);
                }
            }
        }

        var index, neighbouringIndex, vertex;

        // Determine Perimeter - Creates a bounded horizon

        // 1. Pick an edge A out of all possible edges
        // 2. Check if A is shared by any other face. a->b === b->a
        // 2.1 for each edge in each triangle, isShared = ( f1.a == f2.a && f1.b == f2.b ) || ( f1.a == f2.b && f1.b == f2.a )
        // 3. If not shared, then add to convex horizon set,
        //pick an end point (N) of the current edge A and choose a new edge NA connected to A.
        //Restart from 1.
        // 4. If A is shared, it is not an horizon edge, therefore flag both faces that share this edge as candidates for culling
        // 5. If candidate geometry is a degenrate triangle (ie. the tangent space normal cannot be computed) then remove that triangle from all further processing


        var j = i = visibleFaces.length;
        var isDistinct = false,
            hasOneVisibleFace = i === 1,
            cull = [],
            perimeter = [],
            edgeIndex = 0, compareFace, nextIndex,
            a, b;

        var allPoints = [];
        var originFace = [visibleFaces[0][0], visibleFaces[0][1], visibleFaces[0][1], visibleFaces[0][2], visibleFaces[0][2], visibleFaces[0][0]];


        if (visibleFaces.length === 1) {
            currentFace = visibleFaces[0];

            perimeter = [currentFace[0], currentFace[1], currentFace[1], currentFace[2], currentFace[2], currentFace[0]];
            // remove visible face from list of faces
            if (faceStack.indexOf(currentFace) > -1) {
                faceStack.splice(faceStack.indexOf(currentFace), 1);
            }


            if (currentFace.visiblePoints) allPoints = allPoints.concat(currentFace.visiblePoints);
            faces.splice(faces.indexOf(currentFace), 1);

        } else {

            while (i-- > 0) {  // for each visible face

                currentFace = visibleFaces[i];

                // remove visible face from list of faces
                if (faceStack.indexOf(currentFace) > -1) {
                    faceStack.splice(faceStack.indexOf(currentFace), 1);
                }

                if (currentFace.visiblePoints) allPoints = allPoints.concat(currentFace.visiblePoints);
                faces.splice(faces.indexOf(currentFace), 1);


                var isSharedEdge;
                let cEdgeIndex = 0;

                while (cEdgeIndex < 3) { // Iterate through it's edges

                    isSharedEdge = false;
                    j = visibleFaces.length;
                    a = currentFace[cEdgeIndex]
                    b = currentFace[(cEdgeIndex + 1) % 3];


                    while (j-- > 0 && !isSharedEdge) { // find another visible faces

                        compareFace = visibleFaces[j];
                        edgeIndex = 0;

                        // isSharedEdge = compareFace == currentFace;
                        if (compareFace !== currentFace) {

                            while (edgeIndex < 3 && !isSharedEdge) { //Check all it's indices

                                nextIndex = (edgeIndex + 1);
                                isSharedEdge = (compareFace[edgeIndex] === a && compareFace[nextIndex % 3] === b) ||
                                    (compareFace[edgeIndex] === b && compareFace[nextIndex % 3] === a);

                                edgeIndex++;
                            }
                        }
                    }

                    if (!isSharedEdge || hasOneVisibleFace) {
                        perimeter.push(a);
                        perimeter.push(b);
                    }

                    cEdgeIndex++;
                }
            }
        }

        // create new face for all pairs around edge
        i = 0;
        var l = perimeter.length / 2;
        var f;

        while (i < l) {
            f = [perimeter[i * 2 + 1], apex, perimeter[i * 2]];
            assignPoints(f, allPoints, points);
            faces.push(f)
            if (f.visiblePoints !== undefined) faceStack.push(f);
            i++;
        }

    }

    var distSqPointSegment = function () {

        var ab = new THREE.Vector3(),
            ac = new THREE.Vector3(),
            bc = new THREE.Vector3();

        return function (a, b, c) {

            ab.subVectors(b, a);
            ac.subVectors(c, a);
            bc.subVectors(c, b);

            var e = ac.dot(ab);
            if (e < 0.0) return ac.dot(ac);
            var f = ab.dot(ab);
            if (e >= f) return bc.dot(bc);
            return ac.dot(ac) - e * e / f;

        }

    }();





    return function (geometry) {

        reset();


        let points = geometry.vertices;
        faces = [],
            faceStack = [],
            i = NUM_POINTS = points.length,
            extremes = points.slice(0, 6),
            max = 0;



        /*
         *  FIND EXTREMETIES
         */
        while (i-- > 0) {
            if (points[i].x < extremes[0].x) extremes[0] = points[i];
            if (points[i].x > extremes[1].x) extremes[1] = points[i];

            if (points[i].y < extremes[2].y) extremes[2] = points[i];
            if (points[i].y < extremes[3].y) extremes[3] = points[i];

            if (points[i].z < extremes[4].z) extremes[4] = points[i];
            if (points[i].z < extremes[5].z) extremes[5] = points[i];
        }


        /*
         *  Find the longest line between the extremeties
         */

        j = i = 6;
        while (i-- > 0) {
            j = i - 1;
            while (j-- > 0) {
                if (max < (dcur = extremes[i].distanceToSquared(extremes[j]))) {
                    max = dcur;
                    v0 = extremes[i];
                    v1 = extremes[j];

                }
            }
        }


        // 3. Find the most distant point to the line segment, this creates a plane
        i = 6;
        max = 0;
        while (i-- > 0) {
            dcur = distSqPointSegment(v0, v1, extremes[i]);
            if (max < dcur) {
                max = dcur;
                v2 = extremes[i];
            }
        }


        // 4. Find the most distant point to the plane.

        N = norm(v0, v1, v2);
        D = N.dot(v0);


        max = 0;
        i = NUM_POINTS;
        while (i-- > 0) {
            dcur = Math.abs(points[i].dot(N) - D);
            if (max < dcur) {
                max = dcur;
                v3 = points[i];
            }
        }



        var v0Index = points.indexOf(v0),
            v1Index = points.indexOf(v1),
            v2Index = points.indexOf(v2),
            v3Index = points.indexOf(v3);


        //  We now have a tetrahedron as the base geometry.
        //  Now we must subdivide the

        var tetrahedron = [
            [v2Index, v1Index, v0Index],
            [v1Index, v3Index, v0Index],
            [v2Index, v3Index, v1Index],
            [v0Index, v3Index, v2Index],
        ];



        subaA.subVectors(v1, v0).normalize();
        subaB.subVectors(v2, v0).normalize();
        subC.subVectors(v3, v0).normalize();
        var sign = subC.dot(new THREE.Vector3().crossVectors(subaB, subaA));


        // Reverse the winding if negative sign
        if (sign < 0) {
            tetrahedron[0].reverse();
            tetrahedron[1].reverse();
            tetrahedron[2].reverse();
            tetrahedron[3].reverse();
        }


        //One for each face of the pyramid
        var pointsCloned = points.slice();
        pointsCloned.splice(pointsCloned.indexOf(v0), 1);
        pointsCloned.splice(pointsCloned.indexOf(v1), 1);
        pointsCloned.splice(pointsCloned.indexOf(v2), 1);
        pointsCloned.splice(pointsCloned.indexOf(v3), 1);


        var i = tetrahedron.length;
        while (i-- > 0) {
            assignPoints(tetrahedron[i], pointsCloned, points);
            if (tetrahedron[i].visiblePoints !== undefined) {
                faceStack.push(tetrahedron[i]);
            }
            faces.push(tetrahedron[i]);
        }

        process(points);


        //  Assign to our geometry object

        var ll = faces.length;
        while (ll-- > 0) {
            geometry.faces[ll] = new THREE.Face3(faces[ll][2], faces[ll][1], faces[ll][0], faces[ll].normal)
        }

        geometry.normalsNeedUpdate = true;

        return geometry;

    }

}())
var PI_2 = Math.PI / 2;

export const ShapeType = {
    BOX: 'Box',
    CYLINDER: 'Cylinder',
    SPHERE: 'Sphere',
    HULL: 'ConvexPolyhedron',
    MESH: 'Trimesh'
};

/**
 * Given a THREE.Object3D instance, creates a corresponding CANNON shape.
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
export const meshToShape = function (object, options) {
    options = options || {};

    var geometry;

    if (options.type === ShapeType.BOX) {
        return createBoundingBoxShape(object);
    } else if (options.type === ShapeType.CYLINDER) {
        return createBoundingCylinderShape(object, options);
    } else if (options.type === ShapeType.SPHERE) {
        return createBoundingSphereShape(object, options);
    } else if (options.type === ShapeType.HULL) {
        return createConvexPolyhedron(object);
    } else if (options.type === ShapeType.MESH) {
        geometry = getGeometry(object);
        return geometry ? createTrimeshShape(geometry) : null;
    } else if (options.type) {
        throw new Error('[CANNON.threeToCannon] Invalid type "%s".', options.type);
    }

    geometry = getGeometry(object);
    if (!geometry) return null;

    var type = geometry.metadata
        ? geometry.metadata.type
        : geometry.type;

    switch (type) {
        case 'BoxGeometry':
        case 'BoxBufferGeometry':
            return createBoxShape(geometry);
        case 'CylinderGeometry':
        case 'CylinderBufferGeometry':
            return createCylinderShape(geometry);
        case 'PlaneGeometry':
        case 'PlaneBufferGeometry':
            return createPlaneShape(geometry);
        case 'SphereGeometry':
        case 'SphereBufferGeometry':
            return createSphereShape(geometry);
        case 'TubeGeometry':
        case 'Geometry':
        case 'BufferGeometry':
            return createBoundingBoxShape(object);
        default:
            console.warn('Unrecognized geometry: "%s". Using bounding box as shape.', geometry.type);
            return createBoxShape(geometry);
    }
};
 

/******************************************************************************
 * Shape construction
 */

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createBoxShape(geometry) {
    var vertices = getVertices(geometry);

    if (!vertices.length) return null;

    geometry.computeBoundingBox();
    var box = geometry.boundingBox;
    return new CANNON.Box(new CANNON.Vec3(
        (box.max.x - box.min.x) / 2,
        (box.max.y - box.min.y) / 2,
        (box.max.z - box.min.z) / 2
    ));
}

/**
 * Bounding box needs to be computed with the entire mesh, not just geometry.
 * @param  {THREE.Object3D} mesh
 * @return {CANNON.Shape}
 */
function createBoundingBoxShape(object) {
    var shape, localPosition,
        box = new THREE.Box3();

    var clone = object.clone();
    clone.quaternion.set(0, 0, 0, 1);
    clone.updateMatrixWorld();

    box.setFromObject(clone);

    if (!isFinite(box.min.lengthSq())) return null;

    shape = new CANNON.Box(new CANNON.Vec3(
        (box.max.x - box.min.x) / 2,
        (box.max.y - box.min.y) / 2,
        (box.max.z - box.min.z) / 2
    ));

    localPosition = box.translate(clone.position.negate()).getCenter(new THREE.Vector3());
    if (localPosition.lengthSq()) {
        shape.offset = localPosition;
    }

    return shape;
}

/**
 * Computes 3D convex hull as a CANNON.ConvexPolyhedron.
 * @param  {THREE.Object3D} mesh
 * @return {CANNON.Shape}
 */
function createConvexPolyhedron(object) {
    var i, vertices, faces, hull,
        eps = 1e-4,
        geometry = getGeometry(object);

    if (!geometry || !geometry.vertices.length) return null;

    // Perturb.
    for (i = 0; i < geometry.vertices.length; i++) {
        geometry.vertices[i].x += (Math.random() - 0.5) * eps;
        geometry.vertices[i].y += (Math.random() - 0.5) * eps;
        geometry.vertices[i].z += (Math.random() - 0.5) * eps;
    }

    // Compute the 3D convex hull.
    hull = quickhull(geometry);

    // Convert from THREE.Vector3 to CANNON.Vec3.
    vertices = new Array(hull.vertices.length);
    for (i = 0; i < hull.vertices.length; i++) {
        vertices[i] = new CANNON.Vec3(hull.vertices[i].x, hull.vertices[i].y, hull.vertices[i].z);
    }

    // Convert from THREE.Face to Array<number>.
    faces = new Array(hull.faces.length);
    for (i = 0; i < hull.faces.length; i++) {
        faces[i] = [hull.faces[i].a, hull.faces[i].b, hull.faces[i].c];
    }

    return new CANNON.ConvexPolyhedron(vertices, faces);
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createCylinderShape(geometry) {
    var shape,
        params = geometry.metadata
            ? geometry.metadata.parameters
            : geometry.parameters;
    shape = new CANNON.Cylinder(
        params.radiusTop,
        params.radiusBottom,
        params.height,
        params.radialSegments
    );

    // Include metadata for serialization.
    shape._type = CANNON.Shape.types.CYLINDER; // Patch schteppe/cannon.js#329.
    shape.radiusTop = params.radiusTop;
    shape.radiusBottom = params.radiusBottom;
    shape.height = params.height;
    shape.numSegments = params.radialSegments;

    shape.orientation = new CANNON.Quaternion();
    shape.orientation.setFromEuler(THREE.Math.degToRad(90), 0, 0, 'XYZ').normalize();
    return shape;
}

/**
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
function createBoundingCylinderShape(object, options) {
    var shape, height, radius,
        box = new THREE.Box3(),
        axes = ['x', 'y', 'z'],
        majorAxis = options.cylinderAxis || 'y',
        minorAxes = axes.splice(axes.indexOf(majorAxis), 1) && axes;

    box.setFromObject(object);

    if (!isFinite(box.min.lengthSq())) return null;

    // Compute cylinder dimensions.
    height = box.max[majorAxis] - box.min[majorAxis];
    radius = 0.5 * Math.max(
        box.max[minorAxes[0]] - box.min[minorAxes[0]],
        box.max[minorAxes[1]] - box.min[minorAxes[1]]
    );

    // Create shape.
    shape = new CANNON.Cylinder(radius, radius, height, 12);

    // Include metadata for serialization.
    shape._type = CANNON.Shape.types.CYLINDER; // Patch schteppe/cannon.js#329.
    shape.radiusTop = radius;
    shape.radiusBottom = radius;
    shape.height = height;
    shape.numSegments = 12;

    shape.orientation = new CANNON.Quaternion();
    shape.orientation.setFromEuler(
        majorAxis === 'y' ? PI_2 : 0,
        majorAxis === 'z' ? PI_2 : 0,
        0,
        'XYZ'
    ).normalize();
    return shape;
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createPlaneShape(geometry) {
    geometry.computeBoundingBox();
    var box = geometry.boundingBox;
    return new CANNON.Box(new CANNON.Vec3(
        (box.max.x - box.min.x) / 2 || 0.1,
        (box.max.y - box.min.y) / 2 || 0.1,
        (box.max.z - box.min.z) / 2 || 0.1
    ));
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createSphereShape(geometry) {
    var params = geometry.metadata
        ? geometry.metadata.parameters
        : geometry.parameters;
    return new CANNON.Sphere(params.radius);
}

/**
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
function createBoundingSphereShape(object, options) {
    if (options.sphereRadius) {
        return new CANNON.Sphere(options.sphereRadius);
    }
    var geometry = getGeometry(object);
    if (!geometry) return null;
    geometry.computeBoundingSphere();
    return new CANNON.Sphere(geometry.boundingSphere.radius);
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createTrimeshShape(geometry) {
    var indices,
        vertices = getVertices(geometry);

    if (!vertices.length) return null;

    indices = Object.keys(vertices).map(Number);
    return new CANNON.Trimesh(vertices, indices);
}

/******************************************************************************
 * Utils
 */

/**
 * Returns a single geometry for the given object. If the object is compound,
 * its geometries are automatically merged.
 * @param {THREE.Object3D} object
 * @return {THREE.Geometry}
 */
function getGeometry(object) {
    var matrix, mesh,
        meshes = getMeshes(object),
        tmp = new THREE.Geometry(),
        combined = new THREE.Geometry();

    if (meshes.length === 0) return null;

    // Apply scale  – it can't easily be applied to a CANNON.Shape later.
    if (meshes.length === 1) {
        var position = new THREE.Vector3(),
            quaternion = new THREE.Quaternion(),
            scale = new THREE.Vector3();
        if (meshes[0].geometry.isBufferGeometry) {
            if (meshes[0].geometry.attributes.position
                && meshes[0].geometry.attributes.position.itemSize > 2) {
                tmp.fromBufferGeometry(meshes[0].geometry);
            }
        } else {
            tmp = meshes[0].geometry.clone();
        }
        tmp.metadata = meshes[0].geometry.metadata;
        meshes[0].updateMatrixWorld();
        meshes[0].matrixWorld.decompose(position, quaternion, scale);
        return tmp.scale(scale.x, scale.y, scale.z);
    }

    // Recursively merge geometry, preserving local transforms.
    while ((mesh = meshes.pop())) {
        mesh.updateMatrixWorld();
        if (mesh.geometry.isBufferGeometry) {
            if (mesh.geometry.attributes.position
                && mesh.geometry.attributes.position.itemSize > 2) {
                var tmpGeom = new THREE.Geometry();
                tmpGeom.fromBufferGeometry(mesh.geometry);
                combined.merge(tmpGeom, mesh.matrixWorld);
                tmpGeom.dispose();
            }
        } else {
            combined.merge(mesh.geometry, mesh.matrixWorld);
        }
    }

    matrix = new THREE.Matrix4();
    matrix.scale(object.scale);
    combined.applyMatrix(matrix);
    return combined;
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {Array<number>}
 */
function getVertices(geometry) {
    if (!geometry.attributes) {
        geometry = new THREE.BufferGeometry().fromGeometry(geometry);
    }
    return (geometry.attributes.position || {}).array || [];
}

/**
 * Returns a flat array of THREE.Mesh instances from the given object. If
 * nested transformations are found, they are applied to child meshes
 * as mesh.userData.matrix, so that each mesh has its position/rotation/scale
 * independently of all of its parents except the top-level object.
 * @param  {THREE.Object3D} object
 * @return {Array<THREE.Mesh>}
 */
function getMeshes(object) {
    var meshes = [];
    object.traverse(function (o) {
        if (o.type === 'Mesh') {
            meshes.push(o);
        }
    });
    return meshes;
}