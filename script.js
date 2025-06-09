const container = document.getElementById("container");
const controlsDiv = document.getElementById("controls");
const tooltip = document.createElement("div");
tooltip.className = "tooltip";
document.body.appendChild(tooltip);

let isPaused = false;
let isDark = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / (window.innerHeight * 0.7),
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight * 0.7);
container.appendChild(renderer.domElement);

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2);
scene.add(pointLight);

// Stars
for (let i = 0; i < 1000; i++) {
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  star.position.set(
    (Math.random() - 0.5) * 400,
    (Math.random() - 0.5) * 400,
    (Math.random() - 0.5) * 400
  );
  scene.add(star);
}

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(4, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
scene.add(sun);

// Planets
const planetsData = [
  { name: "Mercury", color: 0xaaaaaa, size: 0.5, distance: 6, speed: 0.04 },
  { name: "Venus", color: 0xffddaa, size: 0.8, distance: 8, speed: 0.03 },
  { name: "Earth", color: 0x2233ff, size: 1, distance: 11, speed: 0.02 },
  { name: "Mars", color: 0xff4422, size: 0.7, distance: 14, speed: 0.015 },
  { name: "Jupiter", color: 0xd9ad7c, size: 2, distance: 18, speed: 0.01 },
  { name: "Saturn", color: 0xf4e2d8, size: 1.7, distance: 22, speed: 0.009 },
  { name: "Uranus", color: 0xaee0e3, size: 1.3, distance: 26, speed: 0.008 },
  { name: "Neptune", color: 0x2f5cff, size: 1.2, distance: 30, speed: 0.007 },
];

const planets = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

planetsData.forEach(data => {
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, 32, 32),
    new THREE.MeshStandardMaterial({ color: data.color })
  );
  planet.userData = {
    name: data.name,
    angle: 0,
    speed: data.speed,
    distance: data.distance,
  };
  scene.add(planet);
  planets.push(planet);

  // Slider
  const label = document.createElement("label");
  label.textContent = `${data.name}: `;
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0.001;
  slider.max = 0.1;
  slider.step = 0.001;
  slider.value = data.speed;
  slider.addEventListener("input", () => {
    planet.userData.speed = parseFloat(slider.value);
  });
  label.appendChild(slider);
  controlsDiv.appendChild(label);
});

// Camera
camera.position.z = 50;

let animateId;
function animate() {
  animateId = requestAnimationFrame(animate);
  if (!isPaused) {
    planets.forEach(p => {
      p.userData.angle += p.userData.speed;
      p.position.x = Math.cos(p.userData.angle) * p.userData.distance;
      p.position.z = Math.sin(p.userData.angle) * p.userData.distance;
    });
  }

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);

  if (intersects.length > 0) {
    tooltip.style.display = "block";
    tooltip.textContent = intersects[0].object.userData.name;
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY - 20}px`;
  } else {
    tooltip.style.display = "none";
  }

  renderer.render(scene, camera);
}
animate();

// Pause/Resume Button
document.getElementById("toggleAnimation").onclick = () => {
  isPaused = !isPaused;
  document.getElementById("toggleAnimation").textContent = isPaused ? "▶ Resume" : "⏸ Pause";
};

// Dark/Light Toggle
document.getElementById("toggleTheme").onclick = () => {
  isDark = !isDark;
  document.body.classList.toggle("light-mode", !isDark);
  scene.background = new THREE.Color(isDark ? 0x000000 : 0xffffff);
};

// Mouse movement for tooltip
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Zoom camera on click
window.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    camera.position.set(obj.position.x + 5, obj.position.y + 5, obj.position.z + 10);
  }
});
