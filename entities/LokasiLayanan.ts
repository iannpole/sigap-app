import type { Point } from 'geojson';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';
import { SubKategori } from './SubKategori';
import { Admin } from './Admin';

@Entity({ name: 'lokasi_layanans' })
@Check(`"wilayah" IN ('Kota Bogor', 'Kabupaten Bogor')`)
export class LokasiLayanan {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Index()
  @Column({ name: 'sub_kategori_id', type: 'int' })
  subKategoriId!: number;

  @ManyToOne(() => SubKategori, (subKategori) => subKategori.lokasiLayanan, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'sub_kategori_id' })
  subKategori!: SubKategori;

  @Column({ name: 'nama', type: 'varchar', length: 150 })
  nama!: string;

  @Column({ name: 'alamat', type: 'text', nullable: true })
  alamat!: string | null;

  @Index()
  @Column({ name: 'wilayah', type: 'varchar', length: 30 })
  wilayah!: string;

  @Index({ spatial: true })
  @Column({
    name: 'koordinat',
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  koordinat!: Point;

  @Column({ name: 'no_kontak', type: 'varchar', length: 30, nullable: true })
  noKontak!: string | null;

  @Column({
    name: 'jam_operasional',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  jamOperasional!: string | null;

  @Column({ name: 'foto_url', type: 'varchar', length: 255, nullable: true })
  fotoUrl!: string | null;

  @Index()
  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdById!: number | null;

  @ManyToOne(() => Admin, (admin) => admin.lokasiLayanan, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy!: Admin | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
