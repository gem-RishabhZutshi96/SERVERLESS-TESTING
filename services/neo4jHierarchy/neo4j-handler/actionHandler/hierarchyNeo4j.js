import { makeNeo4jDBConnection } from "../../../utilities/db/neo4j";
import { parameterStore } from "../../../utilities/config/commonData";
import { internalServer, successResponse } from "../../../utilities/response";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { verifyData } from "../../utils/verifyExcelData";
import { createHierarchyInDB } from "../../utils/createHierarchyInDB";
import { deleteAllRelationsForView } from "../../utils/deleteAllRelations";
import { saveViewToS3 } from "../../utils/saveView";
export const createHierarchyForExcel = async (event) => {
    try {
      devLogger("createHierarchyForExcel", event, "event");
      const nodeData = event.nodeData;
      const resp = await verifyData({nodeData: nodeData});
      if(resp.success){
        const addRel = await createHierarchyInDB({nodeData: nodeData, relationName: event.relationName});
        return addRel;
      }
      return resp;
    } catch (err) {
      errorLogger("createHierarchyForExcel ", err);
      throw internalServer(`Error in Creating or Updating Node `);
    }
};

export const fetchHierarchy = async (event) => {
  try {
    devLogger("fetchHierarchy", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    const checkRelation = await session.executeRead(async tx => {
      const result = await tx.run(`
        MATCH (a) WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS $rootId)
        MATCH (a)<-[r]-() WHERE type(r) CONTAINS $relN
        RETURN r
      `,{rootId: event.rootId, relN: event.relationName});
      return result.records.map(record => record.get('r'));
    });
    if(checkRelation.length > 1){
      const tree = await session.executeRead(async tx => {
      //   const result = await tx.run(`
      //   MATCH (a) WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS $rootId)
      //   CALL {
      //     MATCH p=(a)<-[:${view.relation}*]-()
      //         WHERE apoc.coll.duplicates(NODES(p)) = []
      //     WITH p ORDER BY length(p) DESC
      //     WITH COLLECT(DISTINCT p) AS ps
      //     RETURN ps
      //   }
      //   WITH ps
      //   CALL apoc.convert.toTree(ps)
      //   YIELD value
      //   RETURN apoc.convert.toJson(value)
      // `,{rootId: view.rootId});
      // return result.records.map(record => record.get('apoc.convert.toJson(value)'))[0];
      const result = await tx.run(`
        MATCH (a) WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS $rootId)
        CALL apoc.path.expandConfig(a, {
          relationshipFilter: "${event.relationName}<",
            minLevel: 1,
            maxLevel: -1,
            uniqueness:'NODE_GLOBAL',
            bfs:true
        })
        YIELD path WHERE all(rel in relationships(path) WHERE rel.isActive)
        WITH COLLECT(path) as ps
        CALL apoc.convert.toTree(ps)
        YIELD value
        RETURN apoc.convert.toJson(value) AS output
      `,{rootId: event.rootId});
        return result.records.map(record => record.get('output'));
      });
      const regex = generateRegex(event.relationName);
      const resp =  tree.toString().replace(regex,`"children":`);
      return successResponse('Hierarchy fetched successfully', resp);
    }
    const rootNode = await session.executeRead(async tx => {
      const result = await tx.run(`
        MATCH (a) WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS $rootId)
        RETURN apoc.convert.toJson(a) AS output
      `,{rootId: event.rootId});
      return result.records.map(record => record.get('output'));
    });
    const resp =  rootNode.toString();
    return successResponse('Hierarchy fetched successfully', resp);
  } catch (err) {
    errorLogger("fetchHierarchy ", err);
    throw internalServer(`Error in fetching Hierarchy `);
  }
};

export const bulkEditHierarchyForExcel = async (event) => {
  try {
    devLogger("bulkEditHierarchyForExcel", event, "event");
    const nodeData = event.nodeData;
    const resp = await verifyData({nodeData: nodeData});
    if(resp.success){
      const saveView = await saveViewToS3({relationName: event.relationName});
      const delAllRels = await deleteAllRelationsForView({relationName: event.relationName});
      if(saveView.success && delAllRels.success){
        const addRel = await createHierarchyInDB({nodeData: nodeData, relationName: event.relationName});
        return addRel;
      }
    }
    return resp;
  } catch (err) {
    errorLogger("bulkEditHierarchyForExcel ", err);
    throw internalServer(`Error in Creating or Updating Node `);
  }
};

function generateRegex(str) {
  return new RegExp(`"${str}":`,"ig");
}