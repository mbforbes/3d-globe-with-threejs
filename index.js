import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import getStarfield from "./src/getStarfield.js";
import { drawThreeGeo } from "./src/threeGeoJSON.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
// scene.fog = new THREE.FogExp2(0x000000, 0.3);
const camera = new THREE.PerspectiveCamera(75, w / h, 0.01, 100);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
controls.rotateSpeed = 0.5;

const sphereGeometry = new THREE.SphereGeometry(2);
const latLonLineMat = new THREE.LineBasicMaterial({
   color: 0xffffff,
   transparent: true,
   opacity: 0.4,
});
const edges = new THREE.EdgesGeometry(sphereGeometry, 1);
const line = new THREE.LineSegments(edges, latLonLineMat);
scene.add(line);
// const sphereMaterial = new THREE.MeshBasicMaterial({ color: "#88ccff" });
// const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
// scene.add(sphereMesh);

const stars = getStarfield({ numStars: 1000, fog: false });
scene.add(stars);

// check here for more datasets ...
// https://github.com/martynafford/natural-earth-geojson
// non-geojson datasets: https://www.naturalearthdata.com/downloads/

// original:
// fetch('./geojson/ne_110m_land.json')

// amazingly, 10m works, but is slow (~30fps at many zooms). perhaps it'd be possible by not drawing non-visible stuff on the opposite side of the sphere?
// fetch("./geojson/combined-10m.geojson")

// 50m works with lines at 75fps
// fetch("./geojson/countries-50m.geo.json")

fetch("./geojson/combined-10m.geojson")
   .then((response) => response.text())
   .then((text) => {
      const data = JSON.parse(text);
      const countries = drawThreeGeo({
         json: data,
         radius: 2,
         materialOptions: {
            color: 0x80ff80,
         },
      });
      scene.add(countries);
   });

function animate() {
   requestAnimationFrame(animate);
   renderer.render(scene, camera);
   controls.update();
}

animate();

function handleWindowResize() {
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
   renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
