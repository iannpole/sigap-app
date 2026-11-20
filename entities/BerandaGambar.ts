import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'beranda_gambar' })
export class BerandaGambar {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ name: 'label', type: 'varchar', length: 80, default: '' })
  label!: string;

  @Column({ name: 'gambar', type: 'bytea', nullable: true, select: false })
  gambar!: Buffer | null;

  @Column({ name: 'gambar_mime', type: 'varchar', length: 40, nullable: true })
  gambarMime!: string | null;

  @Column({ name: 'urutan', type: 'int', default: 0 })
  urutan!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
