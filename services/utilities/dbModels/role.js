import { Schema as _Schema,  model } from 'mongoose';
var Schema = _Schema;
const Role = new Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    role: {
      type: String,
    },
  },
  {
    toJSON: {
      transform: function(doc, ret, options) {
        delete ret.__v;
      },
    },
  }
);
export const RoleModel = model('Role', Role);