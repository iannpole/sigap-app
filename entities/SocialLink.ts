import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SiteFooter } from './SiteFooter';

@Entity({ name: 'social_link' })
export class SocialLink {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ name: 'footer_id', type: 'int' })
  footerId!: number;

  @ManyToOne(() => SiteFooter, (footer) => footer.sosial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'footer_id' })
  footer!: SiteFooter;

  @Column({ name: 'platform', type: 'varchar', length: 40 })
  platform!: string;

  @Column({ name: 'url', type: 'varchar', length: 2048 })
  url!: string;

  @Column({ name: 'urutan', type: 'int', default: 0 })
  urutan!: number;
}
