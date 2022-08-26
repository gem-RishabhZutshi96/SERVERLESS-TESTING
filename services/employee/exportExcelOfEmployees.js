import { internalServer, forbiddenRequest, successResponse } from "../utilities/response/index";
import { accessAllowed } from "../utilities/validateToken/authorizer";
import { getUserToken } from "../utilities/validateToken/getUserToken";
import { EmployeeModel } from "../utilities/dbModels/employee";
import { storagePath, dateFormat } from "../utilities/misc/utils";
import * as fs from 'fs';
import * as json2xls from 'json2xls';
export const exportExcelOfEmployees = async (event) => {
    try {
        let userToken = null;
        userToken = getUserToken(event);
        let authQuery = {
            token: userToken,
            allowedFor: ['management_su']
        };
        let auth = await accessAllowed(authQuery);
        if (auth !== "allowed") {
            return forbiddenRequest("❌❌User is not allowed to access the data");
        }
        const excelFilePath = await exportExcelDataOfEmployees('excels', `hierarchy-downloaded.xlsx`);
        return successResponse("👍👍Excel Exported Successfully", excelFilePath);
    } catch (err) {
        console.log(err);
        throw internalServer(`Error in DB `, err);
    }
};
async function exportExcelDataOfEmployees(directory, fileName) {
    try {
        const excelFileName = storagePath(directory, fileName);
        const employees = await EmployeeModel.find().lean();
        const xls = json2xls(employees.map(emp => getEmployeeJSONForExcel(emp)));
        // console.log("Excel File Name#########################",excelFileName, fs.existsSync(excelFileName));
        if (!fs.existsSync(excelFileName)){
            console.log("Creating Directory!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(storagePath(directory));
            fs.mkdirSync(storagePath(directory), {recursive: true}, err => {
                console.log(err);
            });
        }
        console.log("Directory Created");
        fs.writeFileSync(excelFileName, xls, 'binary');
        return excelFileName;
    } catch (e) {
        console.log('Error in exporting employees excel');
        console.log(e);
        throw e;
    }
}
function getEmployeeJSONForExcel(emp) {
    const data = {
        'PIMCO Emp ID': emp.clientMappingID,
        'Gemini Emp ID': emp.officialID,
        'Employee Name': emp.Name,
        'Offshore Manager Emp ID': emp.OfficialParentID,
        'Org manager PIMCO ID': emp.OrgManagerID,
        'Onshore Manager PIMCO ID': emp.OnShoreManagerID,
        'Offshore Manager': emp.OfficialManagerName,
        'Onshore Manager': emp.OnShoreManagerName,
        'Org Manager': emp.OrgManagerName,
        'Tenure with PIMCO (in months)': emp.ClientExp,
        'Total Experience (in months)': emp.TotalExp,
        'Brief Profile': emp.ProfileSummary,
        'Tech Team': emp.ClientTeam,
        'Tech Subteam': emp.ClientSubTeam1,
        'Tech Group': emp.ClientSubTeam2,
        'Proposed Client Team': emp.ProposedClientTeam,
        'Proposed Client SubTeam1': emp.ProposedClientSubTeam1,
        'Proposed Client SubTeam2': emp.ProposedClientSubTeam2,
        'Gemini Department': emp.OfficialTeam,
        'Gemini Team': emp.OfficialSubTeam,
        Role: emp.Role,
        'Role Detail': emp.RoleDetail,
        'Gemini Designation': emp.OfficialDesignation,
        'Gemini Email': emp.Email,
        'Client Email': emp.ClientEmail,
        DoB: emp.DOB && dateFormat(new Date(emp.DOB), 'dmy', '/'),
        DoJ: emp.DOJ && dateFormat(new Date(emp.DOJ), 'dmy', '/'),
        'Office Location': emp.OfficeLocation,
        'Workstation ID': emp.WorkstationID,
        'Desk ID': emp.DeskID,
        'Desk Extn': emp.DesktopExtn,
        Cost: emp.Cost && Buffer.from(emp.Cost, 'base64').toString(),
        'Billed?': emp.Billed,
        'Onshore Client Team': emp.OnshoreClientTeam,
        'Onshore Client Lead': emp.OnshoreClientLead,
        'Email Group': emp.EmailGroup,
        'Exit or New Hire': emp.Exit === 'Yes' ? 'Exit' : emp.Exit,
        'Exit Date':
            emp.ExitDate && dateFormat(new Date(emp.ExitDate), 'dmy', '/'),
        'FTE or Onshore or Offshore': emp.FTEorOnSite,
        'Hierarchy Team-wise ID': emp.ParentTeamID,
        'Hierarchy Service Mgr ID': emp.ParentServiceManagerID,
        'Project-wise View ID': emp.ProjectWiseViewID,
        'Hierarchy View 2 ID': emp.HierarchyView2ID,
        'Hierarchy View 3 ID': emp.HierarchyView3ID,
        'Technology Senior Manager': emp.TechnologySeniorManager,
        Active: emp.Active,
        'Billing Team': emp.BillingTeam,
        'Billing Sub Team': emp.BillingSubTeam,
        'SOW Link': emp.SOWLink,
        'Project Name': emp.ProjectName,
        'Project Type': emp.ProjectType,
        'Project Description': emp.ProjectDescription,
        'EmployeeID ProjectCode': emp.EmployeeProjectId,
        'Project Start Date':
            emp.ProjectStartDate &&
            dateFormat(new Date(emp.ProjectStartDate), 'dmy', '/'),
        'Progress in Last Month': emp.ProgressInLastMonth,
        'PM Delivery Lead': emp.PMDeliveryLead,
        'PM Delivery Lead PIMCO ID': emp.PMDeliveryLeadPimcoID,
        'Utilization Percentage': emp.UtilizationPercentage,
        'Actual Resource FTE': emp.ActualResourceFTE,
        'Profile Image': emp.Image,
    };
    emp.Documents &&
        emp.Documents.forEach((doc, i) => {
            if (!data['Documents Path']) {
                data['Documents Key'] = '';
                data['Documents Path'] = '';
                data['Documents Type'] = '';
            }
            data['Documents Key'] += doc.key || '';
            data['Documents Path'] += doc.path || '';
            data['Documents Type'] += doc.type || '';
            if (i < emp.Documents.length - 1) {
                data['Documents Key'] += ';';
                data['Documents Path'] += ';';
                data['Documents Type'] += ';';
            }
        });
    emp.JIRA &&
        emp.JIRA.forEach((j, i) => {
            if (!data['JIRA_No']) {
                data['JIRA_No'] = '';
                data['JIRA_Link'] = '';
            }
            data['JIRA_No'] += j.JIRANo || '';
            data['JIRA_Link'] += j.JIRALinks || '';
            if (i < emp.JIRA.length - 1) {
                data['JIRA_No'] += ';';
                data['JIRA_Link'] += ';';
            }
        });
    emp.Skills &&
        emp.Skills.forEach((s, i) => {
            data[`Skill ${i + 1}`] = s;
        });
    emp.Achievements &&
        emp.Achievements.forEach((a, i) => {
            data[`Achievement${i + 1}`] = a.achievement;
        });
    emp.MobileNumber &&
        emp.MobileNumber.forEach((m, i) => {
            data[`Mobile ${i + 1}`] = m;
        });
    return JSON.parse(
        JSON.stringify(data, (key, value) => (value == undefined ? '' : value))
    );
}