import { Query } from 'database';
import {
  checkPrimaryKey,
  checkUniqueKey,
  createRow,
  deleteRow,
  findByPrimaryKey,
  updateRow,
} from 'database-helpers';
import { Debug, MessageType } from 'node-debug';
import { objectsEqual, pick } from 'node-utilities';

const debugSource = 'lookup.service';
const debugRows = 3;

const tableName = '_lookups';
const instanceName = 'lookup';

const primaryKeyColumnNames = ['uuid'];
const dataColumnNames = ['lookup_type', 'meaning', 'description'];
const columnNames = [...primaryKeyColumnNames, ...dataColumnNames];

export type PrimaryKey = {
  uuid: string;
};

export type Data = {
  lookup_type: string;
  meaning: string;
  description?: string | null;
};

export type CreateData = Partial<PrimaryKey> & Data;
export type Row = PrimaryKey & Required<Data>;
export type UpdateData = Partial<Data>;

export const create = async (query: Query, createData: CreateData) => {
  const debug = new Debug(`${debugSource}.create`);
  debug.write(MessageType.Entry, `createData=${JSON.stringify(createData)}`);
  if (typeof createData.uuid !== 'undefined') {
    const primaryKey: PrimaryKey = { uuid: createData.uuid };
    debug.write(MessageType.Value, `primaryKey=${JSON.stringify(primaryKey)}`);
    debug.write(MessageType.Step, 'Checking primary key...');
    await checkPrimaryKey(query, tableName, instanceName, primaryKey);
  }
  const uniqueKey1 = { lookup_type: createData.lookup_type };
  debug.write(MessageType.Value, `uniqueKey1=${JSON.stringify(uniqueKey1)}`);
  debug.write(MessageType.Step, 'Checking unique key 1...');
  await checkUniqueKey(query, tableName, instanceName, uniqueKey1);
  const uniqueKey2 = { meaning: createData.meaning };
  debug.write(MessageType.Value, `uniqueKey2=${JSON.stringify(uniqueKey2)}`);
  debug.write(MessageType.Step, 'Checking unique key 2...');
  await checkUniqueKey(query, tableName, instanceName, uniqueKey2);
  debug.write(MessageType.Step, 'Creating row...');
  const createdRow = (await createRow(
    query,
    tableName,
    createData,
    columnNames,
  )) as Row;
  debug.write(MessageType.Step, 'Creating lookup values table...');
  const text =
    `CREATE TABLE ${createdRow.lookup_type}_lookup_values (` +
    'lookup_code varchar(30) NOT NULL, ' +
    'meaning varchar(30) NOT NULL, ' +
    'description text, ' +
    'is_enabled boolean NOT NULL DEFAULT false, ' +
    `CONSTRAINT "${createdRow.uuid}_pk" PRIMARY KEY (lookup_code), ` +
    `CONSTRAINT "${createdRow.uuid}_uk" UNIQUE (meaning)` +
    ')';
  debug.write(MessageType.Value, `text=(${text})`);
  await query(text);
  debug.write(MessageType.Exit, `createdRow=${JSON.stringify(createdRow)}`);
  return createdRow;
};

// TODO: query parameters + add actual query to helpers
export const find = async (query: Query) => {
  const debug = new Debug(`${debugSource}.find`);
  debug.write(MessageType.Entry);
  debug.write(MessageType.Step, 'Finding rows...');
  const rows = (await query(`SELECT * FROM ${tableName} ORDER BY uuid`))
    .rows as Row[];
  debug.write(
    MessageType.Exit,
    `rows(${debugRows})=${JSON.stringify(rows.slice(0, debugRows))}`,
  );
  return rows;
};

export const findOne = async (query: Query, primaryKey: PrimaryKey) => {
  const debug = new Debug(`${debugSource}.findOne`);
  debug.write(MessageType.Entry, `primaryKey=${JSON.stringify(primaryKey)}`);
  debug.write(MessageType.Step, 'Finding row by primary key...');
  const row = (await findByPrimaryKey(
    query,
    tableName,
    instanceName,
    primaryKey,
    { columnNames: columnNames },
  )) as Row;
  debug.write(MessageType.Exit, `row=${JSON.stringify(row)}`);
  return row;
};

export const update = async (
  query: Query,
  primaryKey: PrimaryKey,
  updateData: UpdateData,
) => {
  const debug = new Debug(`${debugSource}.update`);
  debug.write(
    MessageType.Entry,
    `primaryKey=${JSON.stringify(primaryKey)};` +
      `updateData=${JSON.stringify(updateData)}`,
  );
  debug.write(MessageType.Step, 'Finding row by primary key...');
  const row = (await findByPrimaryKey(
    query,
    tableName,
    instanceName,
    primaryKey,
    { columnNames: columnNames, forUpdate: true },
  )) as Row;
  debug.write(MessageType.Value, `row=${JSON.stringify(row)}`);
  const mergedRow: Row = Object.assign({}, row, updateData);
  debug.write(MessageType.Value, `mergedRow=${JSON.stringify(mergedRow)}`);
  let updatedRow: Row = Object.assign({}, mergedRow);
  if (
    !objectsEqual(pick(mergedRow, dataColumnNames), pick(row, dataColumnNames))
  ) {
    if (mergedRow.lookup_type !== row.lookup_type) {
      const uniqueKey1 = { lookup_type: updateData.lookup_type! };
      debug.write(
        MessageType.Value,
        `uniqueKey1=${JSON.stringify(uniqueKey1)}`,
      );
      debug.write(MessageType.Step, 'Checking unique key 1...');
      await checkUniqueKey(query, tableName, instanceName, uniqueKey1);
    }
    if (mergedRow.meaning !== row.meaning) {
      const uniqueKey2 = { meaning: updateData.meaning! };
      debug.write(
        MessageType.Value,
        `uniqueKey2=${JSON.stringify(uniqueKey2)}`,
      );
      debug.write(MessageType.Step, 'Checking unique key 2...');
      await checkUniqueKey(query, tableName, instanceName, uniqueKey2);
    }
    debug.write(MessageType.Step, 'Updating row...');
    updatedRow = (await updateRow(
      query,
      tableName,
      primaryKey,
      updateData,
      columnNames,
    )) as Row;
    if (updatedRow.lookup_type !== row.lookup_type) {
      debug.write(MessageType.Step, 'Renaming lookup values table...');
      const text =
        `ALTER TABLE ${row.lookup_type}_lookup_values ` +
        `RENAME TO ${updatedRow.lookup_type}_lookup_values`;
      debug.write(MessageType.Value, `text=(${text})`);
      await query(text);
    }
  }
  debug.write(MessageType.Exit, `updatedRow=${JSON.stringify(updatedRow)}`);
  return updatedRow;
};

export const delete_ = async (query: Query, primaryKey: PrimaryKey) => {
  const debug = new Debug(`${debugSource}.delete`);
  debug.write(MessageType.Entry, `primaryKey=${JSON.stringify(primaryKey)}`);
  debug.write(MessageType.Step, 'Finding row by primary key...');
  const row = (await findByPrimaryKey(
    query,
    tableName,
    instanceName,
    primaryKey,
    { forUpdate: true },
  )) as Row;
  debug.write(MessageType.Value, `row=${JSON.stringify(row)}`);
  debug.write(MessageType.Step, 'Deleting row...');
  await deleteRow(query, tableName, primaryKey);
  debug.write(MessageType.Step, 'Dropping lookup values table...');
  const text = `DROP TABLE ${row.lookup_type}_lookup_values`;
  debug.write(MessageType.Value, `text=(${text})`);
  await query(text);
  debug.write(MessageType.Exit);
};
