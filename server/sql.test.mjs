import { describe, expect, it } from 'vitest';
import sqlModule from './sql.js';

const { prepareSql } = sqlModule;

describe('SQL placeholder conversion', () => {
  it('duplicates repeated numbered parameters for SQLite placeholders', () => {
    expect(prepareSql('api_key=CASE WHEN $1=1 THEN $2 WHEN $3!=\'\' THEN $3 END', [1, '', 'secret'])).toEqual({
      sql: 'api_key=CASE WHEN ?=1 THEN ? WHEN ?!=\'\' THEN ? END',
      params: [1, '', 'secret', 'secret']
    });
  });

  it('supports numbered parameters used out of order', () => {
    expect(prepareSql('SELECT $2, $1, $2', ['first', 'second']).params).toEqual(['second', 'first', 'second']);
  });

  it('fails clearly when a SQL parameter is missing', () => {
    expect(() => prepareSql('SELECT $2', ['only-one'])).toThrow('Missing SQL parameter $2');
  });
});
