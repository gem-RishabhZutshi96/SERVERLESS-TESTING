import { Schema as _Schema,  model } from 'mongoose';
var Schema = _Schema;
const employeeMaster = new Schema(
  {
    EmailId: {
      type: String,
      unique: true,
    },
    EmployeeCode: {
      type: String,
      unique: true,
    },
    EmployeeName: {
      type: String,
    },
    DepartmentName: {
      type: String,
    },
    Designation: {
      type: String,
    },
    ReportingManager: {
      type: String,
    },
    ManagerCode: {
      type: String,
    },
    Location: {
      type: String,
    },
    ImagePath: {
      type: String,
    },
    MobileNumber: {
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