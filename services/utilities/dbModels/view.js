import { Schema as _Schema,  model } from 'mongoose';
var Schema = _Schema;
const viewsMaster = new Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    type: {
      type: String
    },
    rootId: {
      type: String
    },
    viewId: {
      type: String,
      unique: true,
    },
    relationName: {
      type: String,
      unique: true,
    },
    isActive: {
      type: Boolean,
    },
    createdAt: {
      type: String,
    },
    createdBy: {
      type: String,
    },
    updatedAt: {
      type: String,
    },
    updatedBy: {
      type: String,
    }
  },
  {
    toJSON: {
      transform: function(doc, ret, options) {
        delete ret.__v;
      },
    },
  }
);
export const viewModel = model('viewsMaster', viewsMaster);