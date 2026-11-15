import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SiteFooter } from './SiteFooter';

@Entity({ name: 'footer_link' })
export class FooterLink {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ name: 'footer_id', type: 'int' })
  footerId!: number;

  @ManyToOne(() => SiteFooter, (footer) => footer.tautan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'footer_id' })
  footer!: SiteFooter;

  @Column({ name: 'label', type: 'varchar', length: 60 })
  label!: string;

  @Column({ name: 'url', type: 'varchar', length: 2048 })
  url!: string;

  @Column({ name: 'urutan', type: 'int', default: 0 })
  urutan!: number;
}
