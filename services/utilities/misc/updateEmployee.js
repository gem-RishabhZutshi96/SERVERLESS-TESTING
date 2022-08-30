import { EmployeeModel } from "../dbModels/employee";
export const updateEmployee = async( _id, newEmployeeData ) => {
    if(newEmployeeData.Cost != undefined) {
        newEmployeeData.Cost = Buffer.from(`${newEmployeeData.Cost}`).toString('base64');
    }
    // check view and update
    if (newEmployeeData['view'] == 'gemini') {
        newEmployeeData['OfficialParentID'] = newEmployeeData['HierarchyType'];
    }
    else if (newEmployeeData['view'] == 'team') {
        newEmployeeData['ParentTeamID'] = newEmployeeData['HierarchyType'];
    }
    else if (newEmployeeData['view'] == 'service') {
        newEmployeeData['ParentServiceManagerID'] = newEmployeeData['HierarchyType'];
    }
    else if (newEmployeeData['view'] == 'project') {
        newEmployeeData['ProjectWiseViewID'] = newEmployeeData['HierarchyType'];
    }
    await EmployeeModel.updateOne({ _id }, { $set: newEmployeeData });
    return { success: true, data: { _id }, message: 'Employee updated' };
};
