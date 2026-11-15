import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'homepage_feature' })
export class HomepageFeature {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ name: 'judul', type: 'varchar', length: 80 })
  judul!: string;

  @Column({ name: 'deskripsi', type: 'varchar', length: 160 })
  deskripsi!: string;

  @Column({ name: 'ikon_key', type: 'varchar', length: 40 })
  ikonKey!: string;

  @Column({ name: 'tautan', type: 'varchar', length: 2048, nullable: true })
  tautan!: string | null;

  @Column({ name: 'urutan', type: 'int', default: 0 })
  urutan!: number;

  @Column({ name: 'aktif', type: 'boolean', default: true })
  aktif!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
