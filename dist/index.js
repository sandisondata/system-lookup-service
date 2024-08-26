"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delete_ = exports.update = exports.findOne = exports.find = exports.create = void 0;
const database_helpers_1 = require("database-helpers");
const node_debug_1 = require("node-debug");
const node_utilities_1 = require("node-utilities");
const debugSource = 'lookup.service';
const debugRows = 3;
const tableName = '_lookups';
const instanceName = 'lookup';
const primaryKeyColumnNames = ['lookup_uuid'];
const dataColumnNames = ['lookup_type', 'meaning', 'description'];
const columnNames = [...primaryKeyColumnNames, ...dataColumnNames];
const create = (query, createData) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.create`);
    debug.write(node_debug_1.MessageType.Entry, `createData=${JSON.stringify(createData)}`);
    const primaryKey = { lookup_uuid: createData.lookup_uuid };
    debug.write(node_debug_1.MessageType.Value, `primaryKey=${JSON.stringify(primaryKey)}`);
    debug.write(node_debug_1.MessageType.Step, 'Checking primary key...');
    yield (0, database_helpers_1.checkPrimaryKey)(query, tableName, instanceName, primaryKey);
    const uniqueKey1 = { lookup_type: createData.lookup_type };
    debug.write(node_debug_1.MessageType.Value, `uniqueKey1=${JSON.stringify(uniqueKey1)}`);
    debug.write(node_debug_1.MessageType.Step, 'Checking unique key 1...');
    yield (0, database_helpers_1.checkUniqueKey)(query, tableName, instanceName, uniqueKey1);
    const uniqueKey2 = { meaning: createData.meaning };
    debug.write(node_debug_1.MessageType.Value, `uniqueKey2=${JSON.stringify(uniqueKey2)}`);
    debug.write(node_debug_1.MessageType.Step, 'Checking unique key 2...');
    yield (0, database_helpers_1.checkUniqueKey)(query, tableName, instanceName, uniqueKey2);
    debug.write(node_debug_1.MessageType.Step, 'Creating lookup values table...');
    const text = `CREATE TABLE ${createData.lookup_type}_lookup_values (` +
        'lookup_code varchar(30) NOT NULL, ' +
        'meaning varchar(30) NOT NULL, ' +
        'description text, ' +
        'is_enabled boolean NOT NULL DEFAULT false, ' +
        `CONSTRAINT "${createData.lookup_uuid}_pk" PRIMARY KEY (lookup_code), ` +
        `CONSTRAINT "${createData.lookup_uuid}_uk" UNIQUE (meaning)` +
        ')';
    debug.write(node_debug_1.MessageType.Value, `text=(${text})`);
    yield query(text);
    debug.write(node_debug_1.MessageType.Step, 'Creating row...');
    const createdRow = (yield (0, database_helpers_1.createRow)(query, tableName, createData, columnNames));
    debug.write(node_debug_1.MessageType.Exit, `createdRow=${JSON.stringify(createdRow)}`);
    return createdRow;
});
exports.create = create;
// TODO: query parameters + add actual query to helpers
const find = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.find`);
    debug.write(node_debug_1.MessageType.Entry);
    debug.write(node_debug_1.MessageType.Step, 'Finding rows...');
    const rows = (yield query(`SELECT * FROM ${tableName} ORDER BY lookup_uuid`))
        .rows;
    debug.write(node_debug_1.MessageType.Exit, `rows(${debugRows})=${JSON.stringify(rows.slice(0, debugRows))}`);
    return rows;
});
exports.find = find;
const findOne = (query, primaryKey) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.findOne`);
    debug.write(node_debug_1.MessageType.Entry, `primaryKey=${JSON.stringify(primaryKey)}`);
    debug.write(node_debug_1.MessageType.Step, 'Finding row by primary key...');
    const row = (yield (0, database_helpers_1.findByPrimaryKey)(query, tableName, instanceName, primaryKey, { columnNames: columnNames }));
    debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row;
});
exports.findOne = findOne;
const update = (query, primaryKey, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.update`);
    debug.write(node_debug_1.MessageType.Entry, `primaryKey=${JSON.stringify(primaryKey)};` +
        `updateData=${JSON.stringify(updateData)}`);
    debug.write(node_debug_1.MessageType.Step, 'Finding row by primary key...');
    const row = (yield (0, database_helpers_1.findByPrimaryKey)(query, tableName, instanceName, primaryKey, { columnNames: columnNames, forUpdate: true }));
    debug.write(node_debug_1.MessageType.Value, `row=${JSON.stringify(row)}`);
    const mergedRow = Object.assign({}, row, updateData);
    debug.write(node_debug_1.MessageType.Value, `mergedRow=${JSON.stringify(mergedRow)}`);
    let updatedRow = Object.assign({}, mergedRow);
    if (!(0, node_utilities_1.objectsEqual)((0, node_utilities_1.pick)(mergedRow, dataColumnNames), (0, node_utilities_1.pick)(row, dataColumnNames))) {
        if (mergedRow.lookup_type !== row.lookup_type) {
            const uniqueKey1 = { lookup_type: updateData.lookup_type };
            debug.write(node_debug_1.MessageType.Value, `uniqueKey1=${JSON.stringify(uniqueKey1)}`);
            debug.write(node_debug_1.MessageType.Step, 'Checking unique key 1...');
            yield (0, database_helpers_1.checkUniqueKey)(query, tableName, instanceName, uniqueKey1);
        }
        if (mergedRow.meaning !== row.meaning) {
            const uniqueKey2 = { meaning: updateData.meaning };
            debug.write(node_debug_1.MessageType.Value, `uniqueKey2=${JSON.stringify(uniqueKey2)}`);
            debug.write(node_debug_1.MessageType.Step, 'Checking unique key 2...');
            yield (0, database_helpers_1.checkUniqueKey)(query, tableName, instanceName, uniqueKey2);
        }
        if (mergedRow.lookup_type !== row.lookup_type) {
            debug.write(node_debug_1.MessageType.Step, 'Renaming lookup values table...');
            const text = `ALTER TABLE ${row.lookup_type}_lookup_values ` +
                `RENAME TO ${updateData.lookup_type}_lookup_values`;
            debug.write(node_debug_1.MessageType.Value, `text=(${text})`);
            yield query(text);
        }
        debug.write(node_debug_1.MessageType.Step, 'Updating row...');
        updatedRow = (yield (0, database_helpers_1.updateRow)(query, tableName, primaryKey, updateData, columnNames));
    }
    debug.write(node_debug_1.MessageType.Exit, `updatedRow=${JSON.stringify(updatedRow)}`);
    return updatedRow;
});
exports.update = update;
const delete_ = (query, primaryKey) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.delete`);
    debug.write(node_debug_1.MessageType.Entry, `primaryKey=${JSON.stringify(primaryKey)}`);
    debug.write(node_debug_1.MessageType.Step, 'Finding row by primary key...');
    const row = (yield (0, database_helpers_1.findByPrimaryKey)(query, tableName, instanceName, primaryKey, { forUpdate: true }));
    debug.write(node_debug_1.MessageType.Value, `row=${JSON.stringify(row)}`);
    debug.write(node_debug_1.MessageType.Step, 'Dropping lookup values table...');
    const text = `DROP TABLE ${row.lookup_type}_lookup_values`;
    debug.write(node_debug_1.MessageType.Value, `text=(${text})`);
    yield query(text);
    debug.write(node_debug_1.MessageType.Step, 'Deleting row...');
    yield (0, database_helpers_1.deleteRow)(query, tableName, primaryKey);
    debug.write(node_debug_1.MessageType.Exit);
});
exports.delete_ = delete_;
