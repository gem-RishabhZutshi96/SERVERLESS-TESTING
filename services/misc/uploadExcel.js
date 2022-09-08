import { makeDBConnection } from '../utilities/db/database';
import {  EmployeeModel } from '../utilities/dbModels/employee';
const { parse } = require('aws-multipart-parser');
const XLSX = require('xlsx');

const arrayKeysEmployee = () => {
  return ['Documents', 'Achievements', 'Skills', 'MobileNumber'];
};

const filteredValuesByPattern = (obj, filter) => {
  const values = [];
  for (let key in obj)
    if (obj.hasOwnProperty(key) && filter.test(key)) values.push(obj[key]);

  return values;
};
export const uploadExcel = async(event) => {
  try {
    await makeDBConnection();
    const formData = parse(event, true);
    const workbook = XLSX.read(formData.file.content, { type: 'buffer' });
    const jsonRows = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );

   const result = [];
    jsonRows.map((emp) => {
      result.push(getEmployeeObject(emp));
    });

     bulkStoreEmployees(result);

    return {
      statusCode: 200,
      body: JSON.stringify(jsonRows),
    };
  } catch (error) {
    console.log(error);
  }
};

const getEmployeeObject =  (employeeData) => {
  const cost =
    employeeData['Cost'] != undefined &&
    Buffer.from(`${employeeData['Cost']}`).toString('base64');
  const jiraNo = employeeData['JIRA_No']
    ? employeeData['JIRA_No'].split(';')
    : [];
  const jiraLinks = employeeData['JIRA_Link']
    ? employeeData['JIRA_Link'].split(';')
    : [];

  const documentsKey = employeeData['Documents Key']
    ? employeeData['Documents Key'].split(';')
    : [];
  const documentsPath = employeeData['Documents Path']
    ? employeeData['Documents Path'].split(';')
    : [];
  const documentsType = employeeData['Documents Type']
    ? employeeData['Documents Type'].split(';')
    : [];
  const arrayKeys = arrayKeysEmployee();

  return JSON.parse(
    JSON.stringify(
      {
        clientMappingID:
          employeeData['PIMCO Emp ID'] && String(employeeData['PIMCO Emp ID']),
        officialID:
          employeeData['Gemini Emp ID'] &&
          String(employeeData['Gemini Emp ID']),
        Name: employeeData['Employee Name'],
        OfficialParentID:
          employeeData['Offshore Manager Emp ID'] &&
          String(employeeData['Offshore Manager Emp ID']),
        OrgManagerID:
          employeeData['Org manager PIMCO ID'] &&
          String(employeeData['Org manager PIMCO ID']),
        OnShoreManagerID:
          employeeData['Onshore Manager PIMCO ID'] &&
          String(employeeData['Onshore Manager PIMCO ID']),
        OfficialManagerName: employeeData['Offshore Manager'],
        OnShoreManagerName: employeeData['Onshore Manager'],
        OrgManagerName: employeeData['Org Manager'],
        ClientExp: employeeData['Tenure with PIMCO (in months)'],
        TotalExp: employeeData['Total Experience (in months)'],
        Achievements: filteredValuesByPattern(employeeData, /Achievement/)
          .filter((achievement) => achievement != 'N/A')
          .map((achievement) => {
            return { year: 2018, quarter: 4, achievement };
          }),
        ProfileSummary: employeeData['Brief Profile'],
        TechView: employeeData['Tech View'],
        ClientTeam: employeeData['Tech Team'], // modified in excel v5
        ClientSubTeam1: employeeData['Tech Subteam'], // modified in excel v5
        ClientSubTeam2: employeeData['Tech Group'], // modified in excel v5
        ProposedClientTeam: employeeData['Proposed Client Team'],
        ProposedClientSubTeam1: employeeData['Proposed Client SubTeam1'],
        ProposedClientSubTeam2: employeeData['Proposed Client SubTeam2'],
        OfficialTeam: employeeData['Gemini Department'], // modified in excel v5(Product development)
        OfficialSubTeam: employeeData['Gemini Team'], // modified in excel v5
        Role: employeeData['Role'],
        RoleDetail: employeeData['Role Detail'],
        OfficialDesignation: employeeData['Gemini Designation'], // modified in excel v5
        Image: employeeData['Profile Image'],
        Skills: filteredValuesByPattern(employeeData, /Skill/).filter(
          (val) => val != 'N/A'
        ),
        Email: employeeData['Gemini Email'],
        ClientEmail: employeeData['Client Email'],
        MobileNumber: filteredValuesByPattern(employeeData, /Mobile/)
          .filter((val) => val && val != 'N/A')
          .map((val) => String(val)),
        DOB: employeeData['DoB'] && new Date(employeeData['DoB']),
        DOJ: employeeData['DoJ'] && new Date(employeeData['DoJ']),
        OfficeLocation: employeeData['Office Location'],
        WorkstationID:
          employeeData['Workstation ID'] &&
          String(employeeData['Workstation ID']),
        DeskID: employeeData['Desk ID'] && String(employeeData['Desk ID']),
        DesktopExtn:
          employeeData['Desk Extn'] && String(employeeData['Desk Extn']),
        Cost: cost,
        Billed: employeeData['Billed?'],
        OnshoreClientTeam: employeeData['Analytics Lead'], // modified in excel v5
        OnshoreClientLead: employeeData['Analytics Group'], // modified in excel v5
        EmailGroup: employeeData['Email Group'],
        Exit:
          employeeData['Exit or New Hire'] &&
          (employeeData['Exit or New Hire'] === 'Exit'
            ? 'Yes'
            : employeeData['Exit or New Hire']), // modified in excel v5
        ExitDate:
          employeeData['Exit Date'] && new Date(employeeData['Exit Date']),
        FTEorOnSite: employeeData['FTE or Onshore or Offshore'], // modified in excel v5
        ParentTeamID:
          employeeData['Hierarchy Team-wise ID'] &&
          String(employeeData['Hierarchy Team-wise ID']),
        ParentServiceManagerID:
          employeeData['Hierarchy Service Mgr ID'] &&
          String(employeeData['Hierarchy Service Mgr ID']),
        ProjectWiseViewID:
          employeeData['Project-wise View ID'] &&
          String(employeeData['Project-wise View ID']),
        HierarchyView2ID:
          employeeData['Hierarchy View 2 ID'] &&
          String(employeeData['Hierarchy View 2 ID']),
        HierarchyView3ID:
          employeeData['Hierarchy View 3 ID'] &&
          String(employeeData['Hierarchy View 3 ID']),
        DCViewID:
          employeeData['DC View ID'] && String(employeeData['DC View ID']),
        ECViewID:
          employeeData['EC View ID'] && String(employeeData['EC View ID']),
        HRBPViewID:
          employeeData['HRBP View ID'] && String(employeeData['HRBP View ID']),
        TechnologySeniorManager: employeeData['Technology Senior Manager'],
        Active: employeeData['Active'],
        BillingTeam: employeeData['Billing Team'],
        BillingSubTeam: employeeData['Billing Sub Team'],
        SOWLink: employeeData['SOW Link'],
        ProjectName: employeeData['Project Name'],
        ProjectType: employeeData['Project Type'],
        ProjectDescription: employeeData['Project Description'],
        EmployeeProjectId: employeeData['EmployeeID ProjectCode'],
        ProjectStartDate:
          employeeData['Project Start Date'] &&
          (employeeData['Project Start Date'] != '#N/A'
            ? new Date(employeeData['Project Start Date'])
            : null),
        ProgressInLastMonth: employeeData['Progress in Last Month'],
        PMDeliveryLead: employeeData['PM Delivery Lead'],
        PMDeliveryLeadPimcoID: employeeData['PM Delivery Lead PIMCO ID'],
        UtilizationPercentage: employeeData['Utilization Percentage'],
        ActualResourceFTE: employeeData['Actual Resource FTE'],
        JIRA: jiraNo.map((v, i) => {
          return {
            JIRANo: v,
            JIRALinks: jiraLinks[i],
          };
        }),
        Documents: documentsPath.map((dPath, i) => {
          return {
            key: documentsKey[i],
            path: dPath,
            type: documentsType[i],
          };
        }),
        WorkRelatedGoals: filteredValuesByPattern(
          employeeData,
          /ObjectivesW/
        ).filter((val) => val != 'N/A'),
        ManagerialGoals: filteredValuesByPattern(
          employeeData,
          /ObjectivesM/
        ).filter((val) => val != 'N/A'),
        LearningGoals: filteredValuesByPattern(
          employeeData,
          /ObjectivesL/
        ).filter((val) => val != 'N/A'),
        CreativeDevelopmentGoals: filteredValuesByPattern(
          employeeData,
          /ObjectivesC/
        ).filter((val) => val != 'N/A'),
      },
      (key, value) =>
        value == undefined || value == '' || value == '#N/A' || value == 'N/A'
          ? arrayKeys.includes(key)
            ? []
            : null
          : value
    )
  );
};

const bulkStoreEmployees = (employees) => {
  console.log('Save employees',employees);
  if (employees.length) {
    try {
      const bulk = EmployeeModel.collection.initializeOrderedBulkOp();
      bulk.find({}).delete();
      employees.map((emp) => {
        bulk.insert(emp);
      });
      const dbUpdateRes = bulk.execute();
      console.log(
        `Documents removed: ${dbUpdateRes.nRemoved} | Documents inserted: ${dbUpdateRes.nInserted}`
      );
    } catch (e) {
      console.log.error('Error in saving employees');
      this.log.error(e);
      throw e;
    }
  }
};
