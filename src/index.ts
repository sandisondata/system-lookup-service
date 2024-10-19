import {
  CreateData,
  Data,
  PrimaryKey,
  Query,
  Row,
  Service,
  UpdateData,
} from './class';

export { CreateData, Data, PrimaryKey, Query, Row, UpdateData };

const service = new Service(
  'system-lookup-service',
  '_lookups',
  ['uuid'],
  ['lookup_type', 'meaning', 'description'],
  false,
);

export { service };
