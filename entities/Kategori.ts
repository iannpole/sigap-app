import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SubKategori } from './SubKategori';

@Entity({ name: 'kategori' })
export class Kategori {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ name: 'nama_kategori', type: 'varchar', length: 50, unique: true })
  namaKategori!: string;

  @OneToMany(() => SubKategori, (subKategori) => subKategori.kategori)
  subKategori!: SubKategori[];
}
