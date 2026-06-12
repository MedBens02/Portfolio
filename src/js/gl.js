import * as THREE from 'three';
import gsap from 'gsap';
import { lerp, clamp } from './utils.js';

/*
 * Hero background: a field of ~30k points displaced by simplex noise,
 * with a gaussian ripple that trails the pointer. Rendered additively
 * so peaks glow acid-green against the near-black page.
 */

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERTEX = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uAmp;
uniform float uSize;
uniform float uPixelRatio;
varying float vElev;
varying float vFade;
${NOISE_GLSL}
void main() {
  vec3 pos = position;
  float n = snoise(vec3(pos.xy * 0.045, uTime * 0.16));
  n += 0.45 * snoise(vec3(pos.xy * 0.12, uTime * 0.26));
  float d = distance(pos.xy, uMouse);
  float ripple = exp(-d * d * 0.006) * uMouseStrength;
  pos.z += n * uAmp + ripple * 9.0;

  vElev = clamp(n * 0.5 + 0.55 + ripple * 0.9, 0.0, 1.6);

  vec2 q = abs(position.xy) / vec2(85.0, 55.0);
  vFade = 1.0 - smoothstep(0.5, 1.0, length(q));

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (1.0 + vElev * 0.7) * (26.0 / -mv.z);
}
`;

const FRAGMENT = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vElev;
varying float vFade;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv);
  float alpha = 1.0 - smoothstep(0.28, 0.5, r);
  vec3 col = mix(uColorA, uColorB, smoothstep(0.5, 1.25, vElev));
  gl_FragColor = vec4(col, alpha * vFade * 0.9);
}
`;

export function initGL(canvas, { reducedMotion } = {}) {
  const noop = { setProgress() {}, setBoost() {} };
  if (!canvas) return noop;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
  } catch {
    canvas.parentElement.style.display = 'none';
    return noop;
  }

  const container = canvas.parentElement;
  const small = window.innerWidth < 768;
  const segX = small ? 130 : 220;
  const segY = small ? 84 : 140;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 300);
  camera.position.set(0, -30, 14);
  camera.lookAt(0, 3, 0);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(1000, 1000) },
    uMouseStrength: { value: 0 },
    uAmp: { value: 3.2 },
    uSize: { value: small ? 3.4 : 3.0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uColorA: { value: new THREE.Color('#565b41') },
    uColorB: { value: new THREE.Color('#c9f73a') },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(new THREE.PlaneGeometry(170, 110, segX, segY), material);
  scene.add(points);

  // Pointer ripple: raycast onto the z=0 plane the points live in.
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const mouseTarget = new THREE.Vector2(1000, 1000);
  let camDriftX = 0;
  let lastMove = -1e4;

  const onMove = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(groundPlane, hit)) {
      mouseTarget.set(clamp(hit.x, -90, 90), clamp(hit.y, -60, 60));
      lastMove = performance.now();
    }
    camDriftX = ndc.x;
  };

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(uniforms.uPixelRatio.value);
    renderer.setSize(w, h, false);
  };

  resize();
  window.addEventListener('resize', resize);

  let progress = 0; // how far the hero has scrolled away (0..1)
  let boost = 0; // scroll velocity feeds wave amplitude

  if (reducedMotion) {
    uniforms.uTime.value = 4;
    renderer.render(scene, camera);
    window.addEventListener('resize', () => renderer.render(scene, camera));
    return {
      setProgress(p) {
        container.style.opacity = String(1 - p);
      },
      setBoost() {},
    };
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });

  gsap.ticker.add((_, deltaMS) => {
    if (progress >= 0.999 || document.hidden) return;
    const dt = Math.min(deltaMS, 50) / 1000;
    uniforms.uTime.value += dt * (1 + boost * 0.9);
    uniforms.uAmp.value = lerp(uniforms.uAmp.value, 3.2 + boost * 2.4, 0.05);

    const active = performance.now() - lastMove < 350 ? 1 : 0;
    uniforms.uMouseStrength.value = lerp(uniforms.uMouseStrength.value, active, active ? 0.08 : 0.03);
    uniforms.uMouse.value.lerp(mouseTarget, 0.07);

    camera.position.x = lerp(camera.position.x, camDriftX * 2.2, 0.04);
    camera.lookAt(0, 3, 0);

    renderer.render(scene, camera);
  });

  return {
    setProgress(p) {
      progress = p;
      container.style.opacity = String(1 - p);
    },
    setBoost(v) {
      boost = v;
    },
  };
}
