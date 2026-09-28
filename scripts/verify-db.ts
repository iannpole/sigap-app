import * as nextEnv from '@next/env';
const loadEnvConfig =
  (nextEnv as any).loadEnvConfig || (nextEnv as any).default?.loadEnvConfig;
if (typeof loadEnvConfig === 'function') {
  loadEnvConfig(process.cwd());
}

import { getDataSource } from '../lib/data-source';
import { Kategori, SubKategori, LokasiLayanan, Admin } from '../entities';

async function main() {
  console.log('Connecting to runtime DataSource via DATABASE_URL...');
  const dataSource = await getDataSource();
  console.log('DataSource connected successfully.');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  console.log('Transaction started.');

  try {
    // 0. Insert Admin dummy
    const admin = queryRunner.manager.create(Admin, {
      username: 'admin_test_' + Date.now(),
      passwordHash: '$2b$10$hashedpasswordforexampledummy1234567890',
    });
    const savedAdmin = await queryRunner.manager.save(admin);
    console.log(`Saved Admin dummy (id: ${savedAdmin.id}, username: ${savedAdmin.username})`);

    // 1. Insert Kategori dummy
    const kategori = queryRunner.manager.create(Kategori, {
      namaKategori: 'Kategori Verifikasi Dummy ' + Date.now(),
    });
    const savedKategori = await queryRunner.manager.save(kategori);
    console.log(`Saved Kategori dummy (id: ${savedKategori.id})`);

    // 2. Insert SubKategori dummy
    const subKategori = queryRunner.manager.create(SubKategori, {
      kategoriId: savedKategori.id,
      namaSubKategori: 'SubKategori Verifikasi Dummy ' + Date.now(),
    });
    const savedSubKategori = await queryRunner.manager.save(subKategori);
    console.log(`Saved SubKategori dummy (id: ${savedSubKategori.id})`);

    // 3. Insert LokasiLayanan dummy (Kebun Raya Bogor: lng 106.7976, lat -6.5976)
    const lokasi = queryRunner.manager.create(LokasiLayanan, {
      subKategoriId: savedSubKategori.id,
      createdById: savedAdmin.id,
      nama: 'Kebun Raya Bogor (Dummy Test)',
      alamat: 'Jl. Ir. H. Juanda No. 13, Kota Bogor',
      wilayah: 'Kota Bogor',
      koordinat: {
        type: 'Point',
        coordinates: [106.7976, -6.5976],
      },
      jamOperasional: '08:00 - 16:00',
    });
    const savedLokasi = await queryRunner.manager.save(lokasi);
    console.log(`Saved LokasiLayanan dummy (id: ${savedLokasi.id})`);

    // 4. Baca ulang dan pastikan koordinat GeoJSON Point [lng, lat], relasi, dan updated_at
    const fetched = await queryRunner.manager.findOne(LokasiLayanan, {
      where: { id: savedLokasi.id },
      relations: {
        subKategori: { kategori: true },
        createdBy: true,
      },
    });

    if (!fetched) {
      throw new Error('Gagal membaca ulang data LokasiLayanan yang baru disimpan.');
    }

    console.log('Read back LokasiLayanan:', {
      id: fetched.id,
      nama: fetched.nama,
      wilayah: fetched.wilayah,
      koordinat: fetched.koordinat,
      createdBy: fetched.createdBy?.username,
      kategori: fetched.subKategori.kategori.namaKategori,
      createdAt: fetched.createdAt,
      updatedAt: fetched.updatedAt,
    });

    // Verifikasi updated_at
    if (!(fetched.updatedAt instanceof Date) || isNaN(fetched.updatedAt.getTime())) {
      throw new Error('Kolom updated_at tidak terisi dengan Date yang valid.');
    }

    const [lng, lat] = fetched.koordinat.coordinates;
    const expectedLng = 106.7976;
    const expectedLat = -6.5976;

    if (Math.abs(lng - expectedLng) > 0.00001 || Math.abs(lat - expectedLat) > 0.00001) {
      throw new Error(
        `Koordinat tidak cocok! Ekspektasi: [${expectedLng}, ${expectedLat}], didapat: [${lng}, ${lat}]`
      );
    }
    if (fetched.koordinat.type !== 'Point') {
      throw new Error(`Tipe GeoJSON salah: ${fetched.koordinat.type}, ekspektasi: Point`);
    }

    console.log('✅ Verifikasi koordinat GeoJSON Point [lng, lat] SUKSES!');

    // 5. Verifikasi PostGIS native geography radius search (meter) dan distance (meter)
    const spatialTest = await queryRunner.query(`
      SELECT 
        ST_Distance(koordinat, ST_SetSRID(ST_MakePoint(106.8000, -6.6000), 4326)::geography) as dist_meters,
        ST_DWithin(koordinat, ST_SetSRID(ST_MakePoint(106.8000, -6.6000), 4326)::geography, 1000) as within_1km
      FROM lokasi_layanans
      WHERE id = $1;
    `, [savedLokasi.id]);

    console.log('PostGIS Spatial Query Test:', spatialTest[0]);
    const distMeters = parseFloat(spatialTest[0].dist_meters);
    if (distMeters < 350 || distMeters > 400 || !spatialTest[0].within_1km) {
      throw new Error(`PostGIS spatial query calculation error: dist = ${distMeters}`);
    }
    console.log(`✅ PostGIS geography distance: ${distMeters.toFixed(2)} meter (within 1km: ${spatialTest[0].within_1km})`);

    // 6. Rollback agar tidak ada data yang tersisa
    await queryRunner.rollbackTransaction();
    console.log('✅ Rollback transaksi berhasil. Tidak ada data dummy yang tersisa di DB.');
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
      console.log('Transaksi di-rollback karena error.');
    }
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error('❌ Verifikasi DB gagal:', err);
  process.exit(1);
});
