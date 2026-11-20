import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { FooterLink } from './FooterLink';
import { SocialLink } from './SocialLink';

@Entity({ name: 'site_footer' })
export class SiteFooter {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ name: 'nama', type: 'varchar', length: 80 })
  nama!: string;

  @Column({ name: 'tagline', type: 'varchar', length: 200 })
  tagline!: string;

  @Column({ name: 'email', type: 'varchar', length: 120, nullable: true })
  email!: string | null;

  @Column({ name: 'hak_cipta', type: 'varchar', length: 200 })
  hakCipta!: string;

  @Column({ name: 'alamat', type: 'varchar', length: 300, nullable: true })
  alamat!: string | null;

  @Column({ name: 'tampilkan_alamat', type: 'boolean', default: false })
  tampilkanAlamat!: boolean;

  @Column({ name: 'url_logo', type: 'varchar', length: 200, nullable: true })
  urlLogo!: string | null;

  @OneToMany(() => FooterLink, (link) => link.footer)
  tautan!: FooterLink[];

  @OneToMany(() => SocialLink, (social) => social.footer)
  sosial!: SocialLink[];
}
