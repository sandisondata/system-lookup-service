import { BaseService, Query } from 'base-service-class';
import { checkUniqueKey } from 'database-helpers';
import { Debug, MessageType } from 'node-debug';

export { Query };

export type PrimaryKey = {
  uuid?: string;
};

export type Data = {
  lookup_type: string;
  meaning: string;
  description?: string | null;
};

export type CreateData = PrimaryKey & Data;
export type UpdateData = Partial<Data>;
export type Row = Required<PrimaryKey> & Required<Data>;

export class Service extends BaseService<
  PrimaryKey,
  CreateData,
  UpdateData,
  Row
> {
  async preCreate() {
    const debug = new Debug(`${this.debugSource}.preCreate`);
    debug.write(MessageType.Entry);
    const uniqueKey1 = { lookup_type: this.createData.lookup_type };
    debug.write(MessageType.Value, `uniqueKey1=${JSON.stringify(uniqueKey1)}`);
    debug.write(MessageType.Step, 'Checking unique key 1...');
    await checkUniqueKey(this.query, this.tableName, uniqueKey1);
    const uniqueKey2 = { meaning: this.createData.meaning };
    debug.write(MessageType.Value, `uniqueKey2=${JSON.stringify(uniqueKey2)}`);
    debug.write(MessageType.Step, 'Checking unique key 2...');
    await checkUniqueKey(this.query, this.tableName, uniqueKey2);
    debug.write(MessageType.Exit);
  }

  async preUpdate() {
    const debug = new Debug(`${this.debugSource}.preUpdate`);
    debug.write(MessageType.Entry);
    if (
      typeof this.updateData.lookup_type !== 'undefined' &&
      this.updateData.lookup_type !== this.row.lookup_type
    ) {
      const uniqueKey1 = { lookup_type: this.updateData.lookup_type };
      debug.write(
        MessageType.Value,
        `uniqueKey1=${JSON.stringify(uniqueKey1)}`,
      );
      debug.write(MessageType.Step, 'Checking unique key 1...');
      await checkUniqueKey(this.query, this.tableName, uniqueKey1);
    }
    if (
      typeof this.updateData.meaning !== 'undefined' &&
      this.updateData.meaning !== this.row.meaning
    ) {
      const uniqueKey2 = {
        meaning: this.updateData.meaning,
      };
      debug.write(
        MessageType.Value,
        `uniqueKey2=${JSON.stringify(uniqueKey2)}`,
      );
      debug.write(MessageType.Step, 'Checking unique key 2...');
      await checkUniqueKey(this.query, this.tableName, uniqueKey2);
    }
    debug.write(MessageType.Exit);
  }

  async preDelete() {
    const debug = new Debug(`${this.debugSource}.preDelete`);
    debug.write(MessageType.Entry);
    // TODO: Check foreign key instance(s) exist (add to database-helpers)
    debug.write(MessageType.Exit);
  }

  async postCreate() {
    const debug = new Debug(`${this.debugSource}.postCreate`);
    debug.write(MessageType.Entry);
    debug.write(MessageType.Step, 'Creating lookup values table...');
    const sql =
      `CREATE TABLE ${this.row.lookup_type}_lookup_values (` +
      'lookup_code varchar(30) NOT NULL, ' +
      'meaning varchar(30) NOT NULL, ' +
      'description text, ' +
      'is_enabled boolean NOT NULL DEFAULT false, ' +
      `CONSTRAINT "${this.row.uuid}_pk" PRIMARY KEY (lookup_code), ` +
      `CONSTRAINT "${this.row.uuid}_uk" UNIQUE (meaning)` +
      ')';
    debug.write(MessageType.Value, `sql=(${sql})`);
    await this.query(sql);
    debug.write(MessageType.Exit);
  }

  async postUpdate() {
    const debug = new Debug(`${this.debugSource}.postUpdate`);
    debug.write(MessageType.Entry);
    if (this.row.lookup_type !== this.oldRow.lookup_type) {
      debug.write(MessageType.Step, 'Renaming lookup values table...');
      const sql =
        `ALTER TABLE ${this.oldRow.lookup_type}_lookup_values ` +
        `RENAME TO ${this.row.lookup_type}_lookup_values`;
      debug.write(MessageType.Value, `sql=(${sql})`);
      await this.query(sql);
    }
    debug.write(MessageType.Exit);
  }

  async postDelete() {
    const debug = new Debug(`${this.debugSource}.postDelete`);
    debug.write(MessageType.Entry);
    debug.write(MessageType.Step, 'Dropping lookup values table...');
    const sql = `DROP TABLE ${this.row.lookup_type}_lookup_values`;
    debug.write(MessageType.Value, `sql=(${sql})`);
    await this.query(sql);
    debug.write(MessageType.Exit);
  }
}
