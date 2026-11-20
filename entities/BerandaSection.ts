import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'beranda_section' })
export class BerandaSection {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ name: 'eyebrow', type: 'varchar', length: 40, default: '' })
  eyebrow!: string;

  @Column({ name: 'judul', type: 'varchar', length: 120, default: '' })
  judul!: string;

  @Column({ name: 'deskripsi', type: 'varchar', length: 400, default: '' })
  deskripsi!: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
