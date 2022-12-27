import { Schema as _Schema,  model } from 'mongoose';
var Schema = _Schema;
const viewsMaster = new Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    viewId: {
      type: String,
      unique: true,
    },
    relationName: {
        type: String,
        unique: true,
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