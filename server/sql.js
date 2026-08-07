const prepareSql = (sql, params = []) => {
  const sqliteParams = [];
  const sqliteSql = sql.replace(/\$(\d+)/g, (_, rawIndex) => {
    const index = Number(rawIndex) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= params.length) {
      throw new RangeError(`Missing SQL parameter $${rawIndex}`);
    }
    sqliteParams.push(params[index]);
    return '?';
  });
  return { sql: sqliteSql, params: sqliteParams };
};

module.exports = { prepareSql };
