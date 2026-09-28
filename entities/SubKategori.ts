import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Kategori } from './Kategori';
import { LokasiLayanan } from './LokasiLayanan';

@Entity({ name: 'sub_kategori' })
@Unique(['kategoriId', 'namaSubKategori'])
export class SubKategori {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Index()
  @Column({ name: 'kategori_id', type: 'int' })
  kategoriId!: number;

  @ManyToOne(() => Kategori, (kategori) => kategori.subKategori, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'kategori_id' })
  kategori!: Kategori;

  @Column({ name: 'nama_sub_kategori', type: 'varchar', length: 50 })
  namaSubKategori!: string;

  @OneToMany(() => LokasiLayanan, (lokasiLayanan) => lokasiLayanan.subKategori)
  lokasiLayanan!: LokasiLayanan[];
}
