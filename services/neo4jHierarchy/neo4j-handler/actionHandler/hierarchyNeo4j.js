import { makeNeo4jDBConnection } from "../../../utilities/db/neo4j";
import { parameterStore } from "../../../utilities/config/commonData";
import { badRequest, internalServer, successResponse } from "../../../utilities/response";
import { devLogger, errorLogger } from "../../utils/log-helper";
import moment from 'moment';
export const createHierarchyForExcel = async (event) => {
    try {
      devLogger("createHierarchyForExcel", event, "event");
      const { database } = parameterStore[process.env.stage].NEO4J;
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      const nodeData = event.nodeData;
      const allNodeIds = await session.executeRead(async tx => {
        const result = await tx.run(`
          UNWIND $nodeData as emp
          MATCH (a)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS emp.nodeID)
          WITH emp, COLLECT(emp.nodeID) AS nodeIds
          MATCH (b)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) CONTAINS emp.nodeParentID)
          WITH nodeIds, COLLECT({nodeID:emp.nodeID, nodeParentID: emp.nodeParentID}) AS ids
          UNWIND ids AS nIds
          RETURN nIds
        `,{nodeData: nodeData, relN: event.relationName});
        return result.records.map(record => record.get('nIds'));
      });
      if(allNodeIds.length == nodeData.length){
        await session.run(`
          UNWIND $nodeData as emp
          MATCH (a)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS emp.nodeID)
          MATCH (b)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) CONTAINS emp.nodeParentID)
          CALL apoc.create.relationship(a, $relN, {isActive:true, startDate: $startDate, endDate:""}, b) YIELD rel
          SET rel.rIndex = id(rel)
          RETURN rel
        `,{nodeData: nodeData, relN: event.relationName, startDate: moment().format()});
        return successResponse("Excel reading is completed and hierarchy is created successfully for data uploaded", []);
      }
      return badRequest('Excel file contains IDs which are non existent in DB',[]);
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
function generateRegex(str) {
  return new RegExp(`"${str}":`,"ig");
}