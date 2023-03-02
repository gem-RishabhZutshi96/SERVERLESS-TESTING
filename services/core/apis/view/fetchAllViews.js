import { makeDBConnection } from "../../../utilities/db/mongo";
import { viewModel } from "../../../utilities/dbModels/view";
import { projectModel } from "../../../utilities/dbModels/project";
import { teamModel } from "../../../utilities/dbModels/team";
import { failResponse, internalServer, successResponse } from "../../../utilities/response/index";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { employeeMasterModel } from "../../../utilities/dbModels/employeeMaster";
export const fetchAllViews = async(event) => {
    try{
        devLogger("fetchAllViews", event, "event");
        await makeDBConnection();
        let resultArray = [];
        const documents = await viewModel.find({isActive: true});
        if(documents.length < 1){
            return failResponse('Views Not Found', 404);
        } else {
            for (let document of documents) {
                if(generateRegex('Employee').test(document.type)){
                const emp =  await employeeMasterModel.find({ 'EmployeeCode': { '$regex': document.rootId, '$options': 'i' } });
                if(emp.length < 1){
                    return internalServer('Invalid rootId');
                }
                resultArray.push({
                    name: document.name,
                    type: document.type,
                    rootId: document.rootId,
                    rootName : emp[0].name,
                    relationName: document.relationName,
                    viewId: document.viewId,
                    isActive: document.isActive,
                    createdAt: document.createdAt,
                    createdBy: document.createdBy,
                    updatedAt: document.updatedAt,
                    updatedBy: document.updatedBy
                });
                } else if(generateRegex('Project').test(document.type)){
                    const emp =  await projectModel.find({ 'projectId': { '$regex': document.rootId, '$options': 'i' } });
                    if(emp.length < 1){
                        return internalServer('Invalid rootId');
                    }
                    let doc = {
                        name: document.name,
                        type: document.type,
                        rootId: document.rootId,
                        rootName : emp[0].name,
                        relationName: document.relationName,
                        viewId: document.viewId,
                    };
                    resultArray.push(doc);
                } else {
                const emp =  await teamModel.find({ 'teamId': { '$regex': document.rootId, '$options': 'i' } });
                if(emp.length < 1){
                    return internalServer('Invalid rootId');
                }
                let doc = {
                    name: document.name,
                    type: document.type,
                    rootId: document.rootId,
                    rootName : emp[0].name,
                    relationName: document.relationName,
                    viewId: document.viewId,
                };
                resultArray.push(doc);
                }
            };
            return successResponse('Views Fetched Successfully', resultArray);
        }
    } catch(err) {
        errorLogger("fetchAllViews", err, "Error db call");
        return internalServer(`Error in DB `);
    }
};
function generateRegex(str) {
    return new RegExp(`${str}`,"i");
}