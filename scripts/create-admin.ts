import 'reflect-metadata';
import * as nextEnv from '@next/env';
import { getDataSource } from '../lib/data-source';
import { hashPassword } from '../lib/auth';
import { Admin } from '../entities';

const loadEnvConfig =
  (nextEnv as any).loadEnvConfig || (nextEnv as any).default?.loadEnvConfig;
if (typeof loadEnvConfig === 'function') loadEnvConfig(process.cwd());

async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password || process.argv.length !== 4) {
    console.error('Usage: tsx scripts/create-admin.ts <username> <password>');
    process.exit(1);
  }

  const ds = await getDataSource();
  const repo = ds.getRepository(Admin);
  const passwordHash = await hashPassword(password);

  const existing = await repo.findOneBy({ username });
  if (existing) {
    await repo.update({ id: existing.id }, { passwordHash });
    console.log(`Admin "${username}" diperbarui (update password).`);
  } else {
    await repo.save(repo.create({ username, passwordHash }));
    console.log(`Admin "${username}" dibuat (create).`);
  }
  await ds.destroy();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('create-admin gagal:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
