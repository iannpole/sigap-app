import * as THREE from "three";

const SUMBER = [
  { x: 60, z: 48, warna: 0xffd9a0, intensitas: 5 },
  { x: 88, z: 36, warna: 0xbfd8ff, intensitas: 5 },
  { x: 18, z: 52, warna: 0xfff1c0, intensitas: 4 },
];

export function pencahayaan(scene: THREE.Scene): THREE.PointLight[] {
  return SUMBER.map((s) => {
    const lampu = new THREE.PointLight(s.warna, s.intensitas, 70, 1.5);
    lampu.position.set(s.x, 8, s.z);
    lampu.userData.dasar = s.intensitas;
    scene.add(lampu);
    return lampu;
  });
}
