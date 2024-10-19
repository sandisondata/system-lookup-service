import { Service } from './class';

export const service = new Service(
  'system-lookup-service',
  '_lookups',
  ['uuid'],
  ['lookup_type', 'meaning', 'description'],
  false,
);

export { CreateData, Data, PrimaryKey, Query, Row, UpdateData } from './class';
