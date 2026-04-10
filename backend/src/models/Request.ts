import mongoose, { Schema, models } from 'mongoose';
import { AuthConfig, BodyConfig, KeyValueItem, ResponseData } from '../types';

const KeyValueSchema = new Schema({
  key: { type: String, default: '' },
  value: { type: String, default: '' },
  enabled: { type: Boolean, default: true },
  description: { type: String },
});

const FormDataSchema = new Schema({
  key: { type: String, default: '' },
  value: { type: String, default: '' },
  enabled: { type: Boolean, default: true },
  type: { type: String, enum: ['text', 'file'], default: 'text' },
});

const AuthSchema = new Schema({
  type: { type: String, enum: ['none', 'basic', 'bearer', 'apikey'], default: 'none' },
  basic: {
    username: String,
    password: String,
  },
  bearer: {
    token: String,
  },
  apikey: {
    key: String,
    value: String,
    addTo: { type: String, enum: ['header', 'query'] },
  },
});

const ResponseSchema = new Schema({
  status: Number,
  statusText: String,
  headers: { type: Map, of: String },
  body: String,
  size: Number,
  time: Number,
});

const RequestSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Request name is required'],
    trim: true,
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    default: 'GET',
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
  },
  headers: [KeyValueSchema],
  params: [KeyValueSchema],
  body: {
    type: {
      type: String,
      enum: ['none', 'form-data', 'x-www-form-urlencoded', 'raw', 'json'],
      default: 'none',
    },
    raw: String,
    formUrlEncoded: [KeyValueSchema],
    formData: [FormDataSchema],
  },
  auth: {
    type: AuthSchema,
    default: () => ({ type: 'none' }),
  },
  response: ResponseSchema,
}, {
  timestamps: true,
});

export default models.Request || mongoose.model('Request', RequestSchema);
