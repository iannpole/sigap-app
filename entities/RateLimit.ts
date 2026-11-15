import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'rate_limits' })
export class RateLimit {
  @PrimaryColumn({ name: 'key', type: 'varchar', length: 255 })
  key!: string;

  @Column({ name: 'count', type: 'int', default: 0 })
  count!: number;

  @Column({ name: 'reset_at', type: 'timestamptz' })
  resetAt!: Date;
}
