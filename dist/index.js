"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.service = void 0;
const class_1 = require("./class");
const service = new class_1.Service('system-lookup-service', '_lookups', ['uuid'], ['lookup_type', 'meaning', 'description'], false);
exports.service = service;
