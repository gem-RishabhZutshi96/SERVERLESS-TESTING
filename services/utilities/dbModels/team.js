import { Schema as _Schema,  model } from 'mongoose';
var Schema = _Schema;
const teamsMaster = new Schema(
  {
    name: {
      type: String,
    },
    teamId: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
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
export const teamModel = model('teamsMaster', teamsMaster);