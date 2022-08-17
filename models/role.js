import { Schema as _Schema,  model } from 'mongoose';
var Schema = _Schema;
const roleSchema = new Schema({
  email: {
    type: String,
  },
  role: {
    type: String,
  }
},{
    timestamps: true
});
export const RoleModel = model("rolemodel", roleSchema);

