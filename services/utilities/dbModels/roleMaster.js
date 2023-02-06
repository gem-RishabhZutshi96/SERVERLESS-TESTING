import { Schema as _Schema,  model } from 'mongoose';
var Schema = _Schema;
const rolesMaster = new Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    roleId: {
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
export const roleMasterModel = model('rolesMaster', rolesMaster);