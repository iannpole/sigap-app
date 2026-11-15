import * as THREE from "three";
import { jejakan, PALET, TINGGI_PLAT, type Brick, type Warna } from "../catalog";
import { studSlots } from "../validate";
import { sisaJatuh } from "./anim";
import { NPC, posisiNpc } from "../scene/npc";
import { pencahayaan } from "./lighting";
import { nuansa } from "./nuansa";

export interface Status {
  t: number;
  jalan: boolean;
  layerTampil: number;
  layers: number;
}

export interface Kontrol {
  play(): void;
  pause(): void;
  seek(t: number): void;
  setSpeed(s: number): void;
  aim(nx: number, ny: number): void;
  setMalam(malam: boolean): void;
  dispose(): void;
}

export interface MountOpts {
  canvas: HTMLCanvasElement;
  bricks: Brick[];
  animate: boolean;
  durasiDetik?: number;
  onStatus?: (s: Status) => void;
}

export function mount({ canvas, bricks, animate, durasiDetik = 4, onStatus }: MountOpts): Kontrol {
  const levels = [...new Set(bricks.map((b) => b.y))].sort((a, b) => a - b);
  const indeksLayer = new Map(levels.map((y, i) => [y, i]));
  const topKeLayer = new Map<number, number>();
  for (const b of bricks) topKeLayer.set(b.y + b.tinggi, indeksLayer.get(b.y)!);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(35, 1, 0.1, 500);
  const lebar = Math.max(...bricks.map((b) => b.x + jejakan(b).w));
  const dalam = Math.max(...bricks.map((b) => b.z + jejakan(b).d));
  const tinggi = Math.max(...bricks.map((b) => b.y + b.tinggi));
  const pusat = new THREE.Vector3(lebar / 2, tinggi * 0.45, dalam / 2);
  const radius = Math.hypot(lebar, tinggi, dalam) / 2;
  const dir = new THREE.Vector3(0.95, 0.62, 1.12).normalize();
  const sumbuY = new THREE.Vector3(0, 1, 0);
  let jarak = 0;
  const hitungJarak = () => {
    const vFov = THREE.MathUtils.degToRad(kamera.fov / 2);
    const hFov = Math.atan(Math.tan(vFov) * kamera.aspect);
    jarak = (radius / Math.sin(Math.min(vFov, hFov))) * 0.7;
  };
  let yawTarget = 0;
  let pitchTarget = 0;
  let yaw = 0;
  let pitch = 0;
  let easeFrame = 0;
  kamera.lookAt(pusat);

  const hemi = new THREE.HemisphereLight(0xf3f7ff, 0xd8d0b8, 0.85);
  scene.add(hemi);
  const sinar = new THREE.DirectionalLight(0xfff4e0, 2.1);
  sinar.position.set(12, 26, 10);
  sinar.castShadow = true;
  sinar.shadow.mapSize.set(1024, 1024);
  sinar.shadow.camera.near = 1;
  sinar.shadow.camera.far = 90;
  sinar.shadow.camera.left = -lebar * 0.75;
  sinar.shadow.camera.right = lebar * 0.75;
  sinar.shadow.camera.top = dalam * 0.75;
  sinar.shadow.camera.bottom = -dalam * 0.75;
  sinar.shadow.bias = -0.0012;
  sinar.shadow.normalBias = 0.03;
  scene.add(sinar);
  const isi = new THREE.DirectionalLight(0xc9d8ff, 0.35);
  isi.position.set(-14, 10, -12);
  scene.add(isi);
  const lampuDistrik = pencahayaan(scene);
  const suasana = nuansa(scene, { w: lebar, d: dalam, tinggi });

  // Bayangan kontak lembut: gradasi radial di bawah baseplate supaya model tidak terlihat melayang.
  const kanvasBayangan = document.createElement("canvas");
  kanvasBayangan.width = 256;
  kanvasBayangan.height = 256;
  const ctx = kanvasBayangan.getContext("2d")!;
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, "rgba(27,36,51,0.34)");
  grad.addColorStop(0.55, "rgba(27,36,51,0.16)");
  grad.addColorStop(1, "rgba(27,36,51,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const teksturBayangan = new THREE.CanvasTexture(kanvasBayangan);
  teksturBayangan.colorSpace = THREE.SRGBColorSpace;
  const geoBayangan = new THREE.PlaneGeometry(lebar * 1.25, dalam * 1.25);
  const matBayangan = new THREE.MeshBasicMaterial({ map: teksturBayangan, transparent: true, depthWrite: false });
  const bayanganKontak = new THREE.Mesh(geoBayangan, matBayangan);
  bayanganKontak.rotation.x = -Math.PI / 2;
  bayanganKontak.position.set(lebar / 2, -0.15, dalam / 2);
  scene.add(bayanganKontak);

  const geoBrick = new THREE.BoxGeometry(1, 1, 1);
  const geoStud = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 18);
  const matBrick = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0 });
  const matStud = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0 });
  const dummy = new THREE.Object3D();

  const perLayer = levels.map(() => ({ brick: [] as Brick[], stud: [] as { x: number; y: number; z: number }[] }));
  bricks.forEach((b) => perLayer[indeksLayer.get(b.y)!].brick.push(b));
  for (const s of studSlots(bricks)) {
    const i = topKeLayer.get(s.y);
    if (i !== undefined) perLayer[i].stud.push(s);
  }

  const grupLayer: THREE.Group[] = perLayer.map(({ brick: bs, stud: ss }) => {
    const g = new THREE.Group();
    const meshBrick = new THREE.InstancedMesh(geoBrick, matBrick, bs.length);
    bs.forEach((b, i) => {
      const { w, d } = jejakan(b);
      dummy.position.set(b.x + w / 2, b.y + b.tinggi / 2, b.z + d / 2);
      dummy.scale.set(w, b.tinggi, d);
      dummy.updateMatrix();
      meshBrick.setMatrixAt(i, dummy.matrix);
      meshBrick.setColorAt(i, new THREE.Color(PALET[b.warna as Warna]));
    });
    meshBrick.castShadow = true;
    meshBrick.receiveShadow = true;
    g.add(meshBrick);

    const meshStud = new THREE.InstancedMesh(geoStud, matStud, ss.length);
    ss.forEach((s, i) => {
      dummy.position.set(s.x + 0.5, s.y + 0.125, s.z + 0.5);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      meshStud.setMatrixAt(i, dummy.matrix);
      const penopang = bricks.find((b) => b.y + b.tinggi === s.y && s.x >= b.x && s.x < b.x + jejakan(b).w && s.z >= b.z && s.z < b.z + jejakan(b).d);
      meshStud.setColorAt(i, new THREE.Color(PALET[penopang?.warna ?? "putih"]));
    });
    g.add(meshStud);

    scene.add(g);
    return g;
  });

  const ukuran = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    kamera.aspect = w / Math.max(h, 1);
    kamera.updateProjectionMatrix();
    hitungJarak();
  };
  ukuran();
  const ro = new ResizeObserver(ukuran);
  ro.observe(canvas);

  let t = 1;
  let jalan = false;
  let kecepatan = 1;
  let frame = 0;
  let terakhir = 0;

  const gambar = () => {
    suasana.update(performance.now() / 1000);
    grupLayer.forEach((g, i) => {
      g.position.y = i === 0 ? 0 : sisaJatuh(i, levels.length, t) * 12;
    });
    yaw += (yawTarget - yaw) * 0.08;
    pitch += (pitchTarget - pitch) * 0.08;
    const diam = animate ? Math.sin(performance.now() / 3400) * 0.035 : 0;
    const o = dir.clone().multiplyScalar(jarak).applyAxisAngle(sumbuY, yaw + diam);
    o.y += pitch * jarak * 0.4;
    kamera.position.copy(pusat).add(o);
    kamera.lookAt(pusat);
    gerakNpc();
    renderer.render(scene, kamera);
    const tampil = levels.filter((_, i) => i === 0 || sisaJatuh(i, levels.length, t) === 0).length;
    onStatus?.({ t, jalan, layerTampil: tampil, layers: levels.length });
  };

  const tick = (now: number) => {
    const dt = (now - terakhir) / 1000;
    terakhir = now;
    if (jalan) {
      t = Math.min(1, t + (dt * kecepatan) / durasiDetik);
      if (t >= 1) jalan = false;
    }
    gambar();
    frame = jalan ? requestAnimationFrame(tick) : 0;
  };

  const mulaiLoop = () => {
    if (frame) return;
    terakhir = performance.now();
    frame = requestAnimationFrame(tick);
  };

  const ease = () => {
    gambar();
    const belum = Math.abs(yawTarget - yaw) > 1e-4 || Math.abs(pitchTarget - pitch) > 1e-4;
    easeFrame = belum ? requestAnimationFrame(ease) : 0;
  };

  const matNpc = new THREE.MeshLambertMaterial({ color: new THREE.Color(PALET.tinta) });
  const geoKepala = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const geoBadan = new THREE.BoxGeometry(0.6, 0.8, 0.4);
  const geoKaki = new THREE.BoxGeometry(0.22, 0.5, 0.22);
  const npcGrup = NPC.map((n) => {
    const g = new THREE.Group();
    const bahanBadan = new THREE.MeshLambertMaterial({ color: new THREE.Color(PALET[n.warna]) });
    const kepala = new THREE.Mesh(geoKepala, matNpc);
    kepala.position.y = 1.65;
    const badan = new THREE.Mesh(geoBadan, bahanBadan);
    badan.position.y = 1.0;
    const kakiKiri = new THREE.Mesh(geoKaki, matNpc);
    kakiKiri.position.set(-0.15, 0.25, 0);
    const kakiKanan = new THREE.Mesh(geoKaki, matNpc);
    kakiKanan.position.set(0.15, 0.25, 0);
    g.add(kepala, badan, kakiKiri, kakiKanan);
    scene.add(g);
    return { g, kakiKiri, kakiKanan };
  });

  const mulaiNpc = performance.now();
  const gerakNpc = () => {
    const waktuNpc = (performance.now() - mulaiNpc) / 1000;
    npcGrup.forEach(({ g, kakiKiri, kakiKanan }, i) => {
      const p = posisiNpc(NPC[i], waktuNpc);
      g.position.set(p.x, TINGGI_PLAT, p.z);
      g.rotation.y = p.hadap;
      const ayun = Math.sin(p.langkah * 4) * 0.5;
      kakiKiri.rotation.x = ayun;
      kakiKanan.rotation.x = -ayun;
    });
  };

  gerakNpc();
  gambar();

  let npcFrame = 0;
  const loopNpc = () => {
    gambar();
    npcFrame = requestAnimationFrame(loopNpc);
  };
  if (animate) npcFrame = requestAnimationFrame(loopNpc);

  return {
    setMalam(nilai) {
      suasana.setMalam(nilai);
      hemi.intensity = nilai ? 0.3 : 0.85;
      sinar.intensity = nilai ? 0.35 : 2.1;
      isi.intensity = nilai ? 0.15 : 0.35;
      matBayangan.opacity = nilai ? 0.5 : 1;
      lampuDistrik.forEach((l) => (l.intensity = nilai ? l.userData.dasar * 2.2 : l.userData.dasar));
      gambar();
    },
    aim(nx, ny) {
      yawTarget = Math.max(-1, Math.min(1, nx)) * 0.35;
      pitchTarget = Math.max(-1, Math.min(1, ny)) * 0.15;
      if (!easeFrame) easeFrame = requestAnimationFrame(ease);
    },
    play() {
      if (!animate) return;
      if (t >= 1) t = 0;
      jalan = true;
      mulaiLoop();
    },
    pause() {
      jalan = false;
      gambar();
    },
    seek(v) {
      t = Math.min(1, Math.max(0, v));
      if (t >= 1) jalan = false;
      gambar();
    },
    setSpeed(s) {
      kecepatan = s;
    },
    dispose() {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(easeFrame);
      cancelAnimationFrame(npcFrame);
      frame = 0;
      easeFrame = 0;
      jalan = false;
      ro.disconnect();
      geoBrick.dispose();
      geoStud.dispose();
      matBrick.dispose();
      matStud.dispose();
      geoBayangan.dispose();
      matBayangan.dispose();
      teksturBayangan.dispose();
      scene.remove(bayanganKontak);
      suasana.dispose();
      matNpc.dispose();
      geoKepala.dispose();
      geoBadan.dispose();
      geoKaki.dispose();
      npcGrup.forEach(({ g }) => g.traverse((o) => {
        if (o instanceof THREE.Mesh) (o.material as THREE.Material).dispose();
      }));
      renderer.dispose();
    },
  };
}
