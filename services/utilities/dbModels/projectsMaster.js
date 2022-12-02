import { Schema as _Schema,  model } from 'mongoose';
var Schema = _Schema;
const projectsMaster = new Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    projectId: {
      type: String,
      unique: true,
    },
    description: {
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
export const projectModel = model('projectsMaster', projectsMaster);