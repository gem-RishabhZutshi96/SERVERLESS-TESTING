import { Schema as _Schema,  model } from 'mongoose';
var Schema = _Schema;
const employeeMaster = new Schema(
  {
    officialEmail: {
      type: String,
      unique: true,
    },
    officialID: {
        type: String,
        unique: true,
      },
    empName: {
        type: String,
    },
    department: {
        type: String,
    },
    designation: {
        type: String,
    },
    reportingManager: {
        type: String,
    },
    reportingManagerID: {
        type: String
    },
    location: {
      type: String,
    },
    imagePath: {
        type: String,
    },
    mobile: {
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
export const employeeMasterModel = model('employeeMaster', employeeMaster);