import { Schema as _Schema,  model } from 'mongoose';
var Schema = _Schema;
const AchievementSchema = new Schema(
  {
    year: Number,
    quarter: Number,
    achievement: String,
  },
  { _id: false }
);

const DocumentSchema = new Schema({
  key: String,
  path: String,
  type: String,
});

const Employee = new Schema(
  {
    clientMappingID: String, // Pimco ID for Pimco Employees
    officialID: String, // Gemini Emp ID
    Name: String,
    OfficialParentID: String,
    OrgManagerID: String,
    OnShoreManagerID: String,
    OfficialManagerName: String,
    OnShoreManagerName: String,
    OrgManagerName: String,
    ClientExp: Number, // months
    TotalExp: Number,
    Achievements: [AchievementSchema],
    ProfileSummary: String,
    ClientTeam: String, // Team in current scenario
    ClientSubTeam1: String,
    ClientSubTeam2: String,
    ProposedClientTeam: String, // Team in current scenario
    ProposedClientSubTeam1: String,
    ProposedClientSubTeam2: String,
    OfficialTeam: String,
    OfficialSubTeam: String,
    Role: String,
    RoleDetail: String,
    OfficialDesignation: String,
    Image: String,
    Skills: [String],
    WorkRelatedGoals: [String],
    ManagerialGoals: [String],
    LearningGoals: [String],
    CreativeDevelopmentGoals: [String],
    Documents: [DocumentSchema],
    Email: String,
    ClientEmail: String,
    MobileNumber: [String],
    DOB: Date,
    DOJ: Date,
    OfficeLocation: String, // Panchkula/Gurgaon
    WorkstationID: String,
    DeskID: String,
    DesktopExtn: String,
    Cost: String, // encrypted
    Billed: String,
    OnshoreClientTeam: String,
    OnshoreClientLead: String,
    EmailGroup: String, // Client Email Group
    Exit: { type: String, enum: ['Yes', 'No', 'New Hire'] },
    ExitDate: Date,
    FTEorOnSite: {
      type: String,
      enum: ['FTE', 'Offshore', 'Onshore'],
    },
    ParentTeamID: String,
    ParentServiceManagerID: String,
    ProjectWiseViewID: String,
    HierarchyView2ID: String,
    HierarchyView3ID: String,
    // new fields(excel v5)
    TechnologySeniorManager: String,
    Active: String,
    BillingTeam: String,
    BillingSubTeam: String,
    SOWLink: String,
    ProjectName: String,
    ProjectType: String,
    ProjectDescription: String,
    EmployeeProjectId: String,
    ProjectStartDate: Date,
    ProgressInLastMonth: String,
    PMDeliveryLead: String,
    UtilizationPercentage: String,
    ActualResourceFTE: String,
    JIRA: [{
      JIRANo: String,
      JIRALinks: String
    }]
  },
  {
    toJSON: {
      transform: function(doc, ret, options) {
        delete ret.__v;
      },
    },
  }
);
export const EmployeeModel = model("Employee", Employee);