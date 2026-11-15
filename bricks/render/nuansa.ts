import * as THREE from "three";

export interface Ruang {
  w: number;
  d: number;
  tinggi: number;
}

export interface Nuansa {
  update(detik: number): void;
  setMalam(malam: boolean): void;
  dispose(): void;
}

export function nuansa(scene: THREE.Scene, ruang: Ruang): Nuansa {
  const geoKabut = new THREE.PlaneGeometry(ruang.w * 0.9, ruang.tinggi * 0.9);
  const matKabut = new THREE.MeshBasicMaterial({ color: 0xb9c7d6, transparent: true, opacity: 0.22, depthWrite: false });
  const kabut = new THREE.Mesh(geoKabut, matKabut);
  kabut.position.set(ruang.w / 2, ruang.tinggi * 0.35, -ruang.d * 0.9);
  scene.add(kabut);

  const geoDaun = new THREE.SphereGeometry(1, 10, 8);
  const matDaun = new THREE.MeshBasicMaterial({ color: 0x1b7f37, transparent: true, opacity: 0.2, depthWrite: false });
  const daun = [
    { x: -6, y: 4, z: -6, s: 9 },
    { x: ruang.w + 6, y: 4, z: -6, s: 9 },
    { x: -6, y: 4, z: ruang.d + 6, s: 9 },
    { x: ruang.w + 6, y: 4, z: ruang.d + 6, s: 9 },
  ].map((p) => {
    const m = new THREE.Mesh(geoDaun, matDaun);
    m.position.set(p.x, p.y, p.z);
    m.scale.setScalar(p.s);
    scene.add(m);
    return m;
  });

  const geoBulan = new THREE.SphereGeometry(3.2, 20, 16);
  const matBulan = new THREE.MeshBasicMaterial({ color: 0xfff6d5, transparent: true, opacity: 0, depthWrite: false });
  const bulan = new THREE.Mesh(geoBulan, matBulan);
  bulan.position.set(ruang.w * 0.85, ruang.tinggi + 40, -ruang.d * 0.4);
  scene.add(bulan);

  const geoBintang = new THREE.SphereGeometry(0.35, 6, 4);
  const matBintang = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  const bintang = Array.from({ length: 24 }, (_, i) => {
    const m = new THREE.Mesh(geoBintang, matBintang);
    const sudut = (i / 24) * Math.PI * 2;
    m.position.set(ruang.w / 2 + Math.cos(sudut) * ruang.w * 0.9, ruang.tinggi + 30 + (i % 5) * 4, -ruang.d * 0.8 + Math.sin(sudut) * ruang.d * 0.3);
    scene.add(m);
    return m;
  });

  const geoKubus = new THREE.BoxGeometry(1, 1, 1);
  const geoSayap = new THREE.BoxGeometry(1.6, 0.12, 0.45);
  const matAwan = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const matBurung = new THREE.MeshLambertMaterial({ color: 0x1b2433 });

  const bentuk: [number, number, number, number, number, number][] = [
    [0, 0, 0, 6, 2, 4],
    [3, 0.5, 1, 4, 2, 3],
    [-3, 0, 0.5, 4, 2, 3],
  ];

  const awan = [0, 1, 2, 3, 4].map((i) => {
    const g = new THREE.Group();
    for (const [x, y, z, w, h, d] of bentuk) {
      const m = new THREE.Mesh(geoKubus, matAwan);
      m.scale.set(w, h, d);
      m.position.set(x, y, z);
      g.add(m);
    }
    g.position.set(0, ruang.tinggi + 14 + (i % 3) * 3, -ruang.d * 0.3 - i * 3);
    scene.add(g);
    return { g, x0: (ruang.w * i) / 5, laju: 0.6 + (i % 3) * 0.3 };
  });

  const burung = [0, 2, 4].map((fase) => {
    const g = new THREE.Group();
    const kiri = new THREE.Mesh(geoSayap, matBurung);
    kiri.position.x = -0.8;
    const kanan = new THREE.Mesh(geoSayap, matBurung);
    kanan.position.x = 0.8;
    g.add(kiri, kanan);
    scene.add(g);
    return { g, kiri, kanan, fase };
  });

  const update = (detik: number) => {
    const span = ruang.w + 40;
    for (const a of awan) {
      a.g.position.x = (((a.x0 + a.laju * detik) % span) + span) % span - 20;
    }
    for (const b of burung) {
      const sudut = detik * 0.25 + b.fase;
      b.g.position.set(
        ruang.w / 2 + Math.cos(sudut) * ruang.w * 0.5,
        ruang.tinggi + 18 + Math.sin(sudut * 2) * 2,
        ruang.d / 2 + Math.sin(sudut) * ruang.d * 0.4,
      );
      b.g.rotation.y = -sudut + Math.PI / 2;
      const kepak = Math.sin(detik * 8 + b.fase) * 0.6;
      b.kiri.rotation.z = kepak;
      b.kanan.rotation.z = -kepak;
    }
  };

  const setMalam = (nilai: boolean) => {
    matKabut.color.set(nilai ? 0x2a3850 : 0xb9c7d6);
    matKabut.opacity = nilai ? 0.18 : 0.22;
    matDaun.color.set(nilai ? 0x0f4a22 : 0x1b7f37);
    matAwan.color.set(nilai ? 0x3a4660 : 0xffffff);
    matBulan.opacity = nilai ? 1 : 0;
    matBintang.opacity = nilai ? 0.9 : 0;
    matBurung.color.set(nilai ? 0xdfe6f2 : 0x1b2433);
  };

  const dispose = () => {
    geoKubus.dispose();
    geoSayap.dispose();
    geoKabut.dispose();
    geoDaun.dispose();
    geoBulan.dispose();
    geoBintang.dispose();
    matKabut.dispose();
    matDaun.dispose();
    matBulan.dispose();
    matBintang.dispose();
    scene.remove(kabut, bulan, ...daun, ...bintang);
    matAwan.dispose();
    matBurung.dispose();
    for (const a of awan) scene.remove(a.g);
    for (const b of burung) scene.remove(b.g);
  };

  return { update, setMalam, dispose };
}
