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
exports.Service = void 0;
const base_service_class_1 = require("base-service-class");
const database_helpers_1 = require("database-helpers");
const node_debug_1 = require("node-debug");
class Service extends base_service_class_1.BaseService {
    preCreate() {
        return __awaiter(this, void 0, void 0, function* () {
            const debug = new node_debug_1.Debug(`${this.debugSource}.preCreate`);
            debug.write(node_debug_1.MessageType.Entry);
            const uniqueKey1 = { lookup_type: this.createData.lookup_type };
            debug.write(node_debug_1.MessageType.Value, `uniqueKey1=${JSON.stringify(uniqueKey1)}`);
            debug.write(node_debug_1.MessageType.Step, 'Checking unique key 1...');
            yield (0, database_helpers_1.checkUniqueKey)(this.query, this.tableName, uniqueKey1);
            const uniqueKey2 = { meaning: this.createData.meaning };
            debug.write(node_debug_1.MessageType.Value, `uniqueKey2=${JSON.stringify(uniqueKey2)}`);
            debug.write(node_debug_1.MessageType.Step, 'Checking unique key 2...');
            yield (0, database_helpers_1.checkUniqueKey)(this.query, this.tableName, uniqueKey2);
            debug.write(node_debug_1.MessageType.Exit);
        });
    }
    preUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            const debug = new node_debug_1.Debug(`${this.debugSource}.preUpdate`);
            debug.write(node_debug_1.MessageType.Entry);
            if (typeof this.updateData.lookup_type !== 'undefined' &&
                this.updateData.lookup_type !== this.row.lookup_type) {
                const uniqueKey1 = { lookup_type: this.updateData.lookup_type };
                debug.write(node_debug_1.MessageType.Value, `uniqueKey1=${JSON.stringify(uniqueKey1)}`);
                debug.write(node_debug_1.MessageType.Step, 'Checking unique key 1...');
                yield (0, database_helpers_1.checkUniqueKey)(this.query, this.tableName, uniqueKey1);
            }
            if (typeof this.updateData.meaning !== 'undefined' &&
                this.updateData.meaning !== this.row.meaning) {
                const uniqueKey2 = {
                    meaning: this.updateData.meaning,
                };
                debug.write(node_debug_1.MessageType.Value, `uniqueKey2=${JSON.stringify(uniqueKey2)}`);
                debug.write(node_debug_1.MessageType.Step, 'Checking unique key 2...');
                yield (0, database_helpers_1.checkUniqueKey)(this.query, this.tableName, uniqueKey2);
            }
            debug.write(node_debug_1.MessageType.Exit);
        });
    }
    preDelete() {
        return __awaiter(this, void 0, void 0, function* () {
            const debug = new node_debug_1.Debug(`${this.debugSource}.preDelete`);
            debug.write(node_debug_1.MessageType.Entry);
            // TODO: Check foreign key instance(s) exist (add to database-helpers)
            debug.write(node_debug_1.MessageType.Exit);
        });
    }
    postCreate() {
        return __awaiter(this, void 0, void 0, function* () {
            const debug = new node_debug_1.Debug(`${this.debugSource}.postCreate`);
            debug.write(node_debug_1.MessageType.Entry);
            debug.write(node_debug_1.MessageType.Step, 'Creating lookup values table...');
            const sql = `CREATE TABLE ${this.createdRow.lookup_type}_lookup_values (` +
                'lookup_code varchar(30) NOT NULL, ' +
                'meaning varchar(30) NOT NULL, ' +
                'description text, ' +
                'is_enabled boolean NOT NULL DEFAULT false, ' +
                `CONSTRAINT "${this.createdRow.uuid}_pk" PRIMARY KEY (lookup_code), ` +
                `CONSTRAINT "${this.createdRow.uuid}_uk" UNIQUE (meaning)` +
                ')';
            debug.write(node_debug_1.MessageType.Value, `sql=(${sql})`);
            yield this.query(sql);
            debug.write(node_debug_1.MessageType.Exit);
        });
    }
    postUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            const debug = new node_debug_1.Debug(`${this.debugSource}.postUpdate`);
            debug.write(node_debug_1.MessageType.Entry);
            if (this.updatedRow.lookup_type !== this.row.lookup_type) {
                debug.write(node_debug_1.MessageType.Step, 'Renaming lookup values table...');
                const sql = `ALTER TABLE ${this.row.lookup_type}_lookup_values ` +
                    `RENAME TO ${this.updatedRow.lookup_type}_lookup_values`;
                debug.write(node_debug_1.MessageType.Value, `sql=(${sql})`);
                yield this.query(sql);
            }
            debug.write(node_debug_1.MessageType.Exit);
        });
    }
    postDelete() {
        return __awaiter(this, void 0, void 0, function* () {
            const debug = new node_debug_1.Debug(`${this.debugSource}.postDelete`);
            debug.write(node_debug_1.MessageType.Entry);
            debug.write(node_debug_1.MessageType.Step, 'Dropping lookup values table...');
            const sql = `DROP TABLE ${this.row.lookup_type}_lookup_values`;
            debug.write(node_debug_1.MessageType.Value, `sql=(${sql})`);
            yield this.query(sql);
            debug.write(node_debug_1.MessageType.Exit);
        });
    }
}
exports.Service = Service;
