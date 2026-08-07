const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { prepareSql } = require('./sql');

const databasePath = path.resolve(
  process.env.SQLITE_PATH || path.join(__dirname, 'data', 'cosmogis.db')
);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const database = new Database(databasePath);
database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');

const query = async (sql, params = []) => {
  const prepared = prepareSql(sql, params);
  const statement = database.prepare(prepared.sql);

  if (/^\s*(SELECT|PRAGMA|WITH)\b/i.test(sql)) {
    return { rows: statement.all(...prepared.params) };
  }

  const result = statement.run(...prepared.params);
  return { rows: [], rowCount: result.changes, lastID: result.lastInsertRowid };
};

const decodeCopyValue = (value) => {
  if (value === '\\N') return null;

  return value.replace(/\\([bfnrtv\\])/g, (_, character) => ({
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    v: '\v',
    '\\': '\\'
  })[character]);
};

const postgresArrayToJson = (value) => {
  if (!value) return '[]';

  const items = [];
  let current = '';
  let quoted = false;

  for (let index = 1; index < value.length - 1; index += 1) {
    const character = value[index];
    if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      items.push(current);
      current = '';
    } else {
      current += character;
    }
  }
  items.push(current);

  return JSON.stringify(items.filter(Boolean));
};

const importPostgresDump = (sql) => {
  const supportedTables = new Set(['categories', 'messages', 'posts', 'settings', 'users']);
  const copyPattern = /^COPY public\.(\w+) \(([^)]+)\) FROM stdin;$/;
  const importedRows = {};
  const lines = sql.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(copyPattern);
    if (!match || !supportedTables.has(match[1])) continue;

    const [, table, columnList] = match;
    const columns = columnList.split(',').map(column => column.trim());
    const rows = [];

    for (index += 1; index < lines.length && lines[index] !== '\\.'; index += 1) {
      const values = lines[index].split('\t').map(decodeCopyValue);
      if (table === 'posts') {
        const tagsIndex = columns.indexOf('tags');
        values[tagsIndex] = postgresArrayToJson(values[tagsIndex]);
      }
      if (table === 'messages') {
        const readStatusIndex = columns.indexOf('read_status');
        values[readStatusIndex] = values[readStatusIndex] === 't' ? 1 : 0;
      }
      rows.push(values);
    }

    importedRows[table] = { columns, rows };
  }

  const replaceData = database.transaction(() => {
    for (const table of supportedTables) {
      if (!importedRows[table]) continue;

      const { columns, rows } = importedRows[table];
      const placeholders = columns.map(() => '?').join(', ');
      const insert = database.prepare(
        `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
      );

      database.prepare(`DELETE FROM ${table}`).run();
      rows.forEach(row => insert.run(...row));
    }
  });

  replaceData();
  return Object.fromEntries(
    Object.entries(importedRows).map(([table, data]) => [table, data.rows.length])
  );
};

module.exports = {
  databasePath,
  importPostgresDump,
  query
};
