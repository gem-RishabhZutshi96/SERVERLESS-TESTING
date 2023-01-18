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
      await session.run(`
        UNWIND $nodeData as emp
        MATCH (a)
          WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS emp.nodeID)
        MATCH (b)
          WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) CONTAINS emp.nodeParentID)
        CALL apoc.create.relationship(a, $relN, {isActive:true, startDate:"", endDate:""}, b) YIELD rel 
        RETURN rel
      `,{nodeData: nodeData, relN: event.relationName});
    } catch (err) {
      errorLogger("createHierarchyForExcel::::", err);
      throw internalServer(`Error in Creating or Updating Node::::`);
    }
};

export const fetchHierarchy = async (event) => {
  try {
    devLogger("fetchHierarchy", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    let view = parameterStore[process.env.stage].sourceViews[`${event.source}`];
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
        relationshipFilter: "${view.relation}<",
          minLevel: 1,
          maxLevel: -1,
          uniqueness:'NODE_GLOBAL',
          bfs:true
      })
      YIELD path WHERE all(rel in relationships(path) WHERE rel.isActive)
      WITH COLLECT(path) as ps
      CALL apoc.convert.toTree(ps)
      YIELD value
      RETURN apoc.convert.toJson(value)
  `,{rootId: view.rootId});
  return result.records.map(record => record.get('apoc.convert.toJson(value)'));
    });
    const regex = generateRegex(view.relation);
    const resp =  tree.toString().replace(regex,`"children":`);
    return successResponse('Hierarchy fetched successfully', resp);
  } catch (err) {
    errorLogger("fetchHierarchy::::", err);
    throw internalServer(`Error in fetching Hierarchy::::`);
  }
};

export const updateHierarchy = async (event) => {
  try {
    devLogger("updateHierarchy", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    const queryParams = event.queryParams;
    const currentNode = await session.executeRead(async tx => {
      const result = await tx.run(`UNWIND $queryParams as emp
        MATCH (a)
          WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS emp.nodeId)
        RETURN a`,{queryParams:queryParams});
      return result.records.map(record => record.get('a'));
    });
    const parentNode = await session.executeRead(async tx => {
      const result = await tx.run(`UNWIND $queryParams as emp
        MATCH (b)
          WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) CONTAINS emp.parentId)
        RETURN b`,{queryParams: queryParams});
      return result.records.map(record => record.get('b'));
    });
    if(currentNode.length >= 1 || parentNode.length >= 1){
      const removeExistingRelation = await session.executeWrite(tx =>
        tx.run(`
                MATCH (a)
                  WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS $nodeId)
                MATCH (b)
                  WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE NOT(toString(b[k]) CONTAINS $parentId))
                MATCH (a)-[rel:${queryParams.relationName} WHERE rel.isActive=true]->(b)
                WITH rel
                SET rel.isActive = false,
                    rel.endDate = $endDate
                RETURN rel`, { nodeId: queryParams.nodeId, parentId: queryParams.parentId, endDate: moment().format('DD-MM-YYYY')}).then(result => result.records.map(i => i.get('rel'))));
      const addNewRelation = await session.executeWrite(tx =>
        tx.run(`
                MATCH (a)
                  WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS $nodeId)
                MATCH (b)
                  WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) CONTAINS $parentId)
                OPTIONAL MATCH (a)-[r]->(b)
                WITH *, coalesce(r) as r1
                CALL apoc.do.when(r1 IS NOT NULL,
                  'MATCH (a)-[r WHERE type(r) CONTAINS $relN]->(b) SET r.startDate = $startDate RETURN r',
                  'CALL apoc.create.relationship(a, $relN, {isActive:true, startDate:$startDate, endDate:""}, b) YIELD rel RETURN rel',
                  {a:a, b:b, startDate:$startDate, relN:$rel}) YIELD value
                RETURN value`,
                { nodeId: queryParams.nodeId, parentId: queryParams.parentId, startDate: moment().format('DD-MM-YYYY'), rel: queryParams.relationName }).then(result => result.records.map(i => i.get('value'))));
      return successResponse('Hierarchy updated successfully', [{removeExistingRelation:removeExistingRelation, addNewRelation:addNewRelation}]);
    } else {
      return badRequest('Given Node or Parent Node does not exist');
    }
  } catch (err) {
    errorLogger("updateHierarchy::::", err);
    throw internalServer(`Error in Updating Hierarchy::::`);
  }
};

function generateRegex(str) {
  return new RegExp(`"${str}":`,"ig");
}