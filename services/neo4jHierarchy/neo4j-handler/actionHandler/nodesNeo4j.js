import { makeNeo4jDBConnection } from "../../../utilities/db/neo4j";
import { parameterStore } from "../../../utilities/config/commonData";
import { badRequest, internalServer, successResponse } from "../../../utilities/response";
import { devLogger, errorLogger } from "../../utils/log-helper";
import moment from 'moment';
export const addNode = async (event) => {
  try {
    devLogger("addNode", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    const queryParams = event.queryParams;
    const currentNode = await session.executeRead(async tx => {
      const result = await tx.run(`
        MATCH (a)
          WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS $nodeId)
        RETURN a`,{nodeId: queryParams.nodeId});
      return result.records.map(record => record.get('a'));
    });
    const parentNode = await session.executeRead(async tx => {
      const result = await tx.run(`
        MATCH (b)
          WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) CONTAINS $parentId)
        RETURN b`,{parentId: queryParams.parentId});
      return result.records.map(record => record.get('b'));
    });
    if(currentNode.length >= 1 && parentNode.length >= 1){
      const nodeType = await session.executeRead(async tx => {
        const result = await tx.run(`
          MATCH (a)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS $nodeId)
          MATCH (a)-[r WHERE type(r) CONTAINS $relation AND r.isActive = true]->()
          RETURN r
        `,{nodeId: queryParams.nodeId, relation: queryParams.relationName});
        return result.records.map(record => record.get('r'));
      });
      if(nodeType.length >= 1){
        console.log("--------------Node Has Parent In Hierarchy With Given Relation---------------------");
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
              'MATCH (a)-[r WHERE type(r) CONTAINS $relN]->(b) SET isActive:true, startDate:$startDate, endDate:"" RETURN r',
              'CALL apoc.create.relationship(a, $relN, {isActive:true, startDate:$startDate, endDate:""}, b) YIELD rel RETURN rel',
              {a:a, b:b, startDate:$startDate, relN:$rel}) YIELD value
            RETURN value`,
            { nodeId: queryParams.nodeId, parentId: queryParams.parentId, startDate: moment().format('DD-MM-YYYY'), rel: queryParams.relationName }).then(result => result.records.map(i => i.get('value'))));
        return successResponse('Node Added Successfully In Hierarchy', [{removeExistingRelation:removeExistingRelation, addNewRelation:addNewRelation}]);
      } else {
        console.log("--------------Node Does Not Exist In Hierarchy---------------------");
        const addNewRelation = await session.executeWrite(tx =>
          tx.run(`
            MATCH (a)
              WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS $nodeId)
            MATCH (b)
              WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) CONTAINS $parentId)
            CALL apoc.create.relationship(a, $relN, {isActive:true, startDate:$startDate, endDate:""}, b) YIELD rel 
            RETURN rel
          `,{ nodeId: queryParams.nodeId, parentId: queryParams.parentId, startDate: moment().format('DD-MM-YYYY'), relN: queryParams.relationName }).then(result => result.records.map(i => i.get('rel'))));
        return successResponse('Node Added Successfully In Hierarchy', [{addNewRelation: addNewRelation}]);
      }
    } else {
      return badRequest('Given Node or Parent Node Does Not Exist');
    }
  } catch (err) {
    errorLogger("addNode::::", err);
    throw internalServer(`Error in Adding Node::::`);
  }
};
export const deleteNode = async (event) => {
    try {
      devLogger("deleteNode", event, "event");
      const { database } = parameterStore[process.env.stage].NEO4J;
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      const queryParams = event.queryParams;
      const nodeType = await session.executeRead(async tx => {
        const result = await tx.run(`
          MATCH (n) WHERE id(n) = $nodeId
          MATCH (a)-[r WHERE type(r) CONTAINS $relation AND r.isActive = true]->(n)
          RETURN r
        `,{nodeId: queryParams.nodeId, relation: queryParams.relationName});
        return result.records.map(record => record.get('r'));
      });
      if(nodeType.length >= 1){
        console.log("--------------Child Node Deletion---------------------");
        const resp =  await session.run(`
          MATCH (n) WHERE id(n) = $nodeId
          MATCH p=(a)-[r1 WHERE type(r1) CONTAINS $relation AND r1.isActive = true]->(n)-[r2 WHERE type(r2) CONTAINS $relation AND r2.isActive = true]->(b)
          SET r1.isActive = false,
              r1.endDate = $endDate,
              r2.isActive = false,
              r2.endDate = $endDate
          WITH a, b
          OPTIONAL MATCH (a)-[r WHERE type(r1) CONTAINS $relation]->(b)
          WITH *, coalesce(r) as r3
          CALL apoc.do.when(r3 IS NOT NULL,
          'MATCH (a)-[r WHERE type(r) CONTAINS $relation]->(b) SET r.isActive = true, r.endDate ="" ',
          'CALL apoc.create.relationship(a, $relN, {isActive:true, startDate:$startDate, endDate:""}, b) YIELD rel RETURN rel',
            {a:a, b:b, startDate:$startDate, relN:$relation}) YIELD value
          RETURN value
        `,
        { nodeId: queryParams.nodeId, endDate: moment().format('DD-MM-YYYY'), startDate: moment().format('DD-MM-YYYY'), rel: queryParams.relationName }).then(result => result.records.map(i => i.get('value')));
        return successResponse("Child Node Deleted Successfully", resp);
      } else {
        console.log("--------------Leaf Node Deletion---------------------");
        const resp =  await session.run(`
          MATCH (n) WHERE id(n) = $nodeId
          OPTIONAL MATCH ()-[r WHERE type(r) CONTAINS $relation AND r.isActive = true]->(n)
          WITH n, coalesce(r) as r3
          CALL apoc.do.when(r3 IS NULL,
          'MATCH (n)-[r WHERE type(r) CONTAINS relN AND r.isActive = true]->() SET r.isActive = false, r.endDate = $endDate RETURN r',
          'RETURN false', {n:n, endDate:$endDate, relN:$relation}) 
          YIELD value
          RETURN value
        `,
        { nodeId: queryParams.nodeId, endDate: moment().format('DD-MM-YYYY'), relation: queryParams.relationName }).then(result => result.records.map(i => i.get('value')));
        return successResponse("Leaf Node Deleted Successfully", resp);
      }
    } catch (err) {
      errorLogger("deleteNode::::", err);
      throw internalServer(`Error in deleting node::::`);
    }
  };