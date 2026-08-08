import { afterAll, describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'cosmogis-db-'));
process.env.SQLITE_PATH = path.join(directory, 'transaction.db');
const require = createRequire(import.meta.url);
const db = require('./db.js');

afterAll(async () => {
  db.close();
  await fs.rm(directory, { recursive: true, force: true });
});

describe('SQLite batch transactions', () => {
  it('commits all operations together', async () => {
    await db.query('CREATE TABLE items (id TEXT PRIMARY KEY, value TEXT NOT NULL)');
    await db.batch([
      { sql: 'INSERT INTO items (id, value) VALUES ($1, $2)', params: ['one', 'first'] },
      { sql: 'INSERT INTO items (id, value) VALUES ($1, $2)', params: ['two', 'second'] }
    ]);
    expect((await db.query('SELECT id FROM items ORDER BY id')).rows).toEqual([{ id: 'one' }, { id: 'two' }]);
  });

  it('rolls back earlier writes when ownership is lost', async () => {
    await expect(db.batch([
      { sql: 'INSERT INTO items (id, value) VALUES ($1, $2)', params: ['rollback', 'temporary'] },
      { sql: 'UPDATE items SET value=$1 WHERE id=$2', params: ['never', 'missing'], requireChanges: true }
    ])).rejects.toMatchObject({ code: 'TRANSACTION_OWNERSHIP_LOST' });
    expect((await db.query('SELECT id FROM items WHERE id=$1', ['rollback'])).rows).toEqual([]);
  });
});
