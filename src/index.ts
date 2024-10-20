import { Service } from './class';

export const service = new Service(
  'system-lookup-service',
  '_lookups',
  ['uuid'],
  ['lookup_type', 'meaning', 'description'],
  false,
);

export { CreateData, PrimaryKey, Row, UpdateData } from './class';
