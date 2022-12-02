import { Schema as _Schema,  model } from 'mongoose';
var Schema = _Schema;
const empRoleMap = new Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    roleId: {
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
export const empRoleMapModel = model('empRoleMap', empRoleMap);