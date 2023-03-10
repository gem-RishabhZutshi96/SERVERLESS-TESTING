import { makeNeo4jDBConnection } from "../../../utilities/db/neo4j";
import { parameterStore } from "../../../utilities/config/commonData";
import { badRequest, internalServer, successResponse } from "../../../utilities/response";
import { devLogger, errorLogger } from "../../utils/log-helper";
import cryptoRandomString from 'crypto-random-string';
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
          WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) = $nodeId)
        RETURN a`,{nodeId: queryParams.nodeId});
      return result.records.map(record => record.get('a'));
    });
    const parentNode = await session.executeRead(async tx => {
      const result = await tx.run(`
        MATCH (b)
          WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) = $parentId)
        RETURN b`,{parentId: queryParams.parentId});
      return result.records.map(record => record.get('b'));
    });
    if(currentNode.length >= 1 && parentNode.length >= 1){
      const nodeType = await session.executeRead(async tx => {
        const result = await tx.run(`
          MATCH (a)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) = $nodeId)
          MATCH (a)-[r WHERE type(r) = $relation AND r.isActive = true]->()
          RETURN r
        `,{nodeId: queryParams.nodeId, relation: queryParams.relationName});
        return result.records.map(record => record.get('r'));
      });
      if(nodeType.length >= 1){
        console.log("--------------Node Has Parent In Hierarchy With Given Relation---------------------");
        const removeExistingRelation = await session.executeWrite(tx =>
          tx.run(`
            MATCH (a)
              WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) = $nodeId)
            MATCH (b)
              WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE NOT(toString(b[k]) = $parentId))
            MATCH (a)-[r:${queryParams.relationName} WHERE r.isActive=true]->(b)
            WITH r
            SET r.isActive = false,
                r.endDate = $endDate
            RETURN apoc.convert.toJson(r) AS output`, { nodeId: queryParams.nodeId, parentId: queryParams.parentId, endDate: new Date().toISOString()}).then(result => result.records.map(i => i.get('output'))));
        const addNewRelation = await session.executeWrite(tx =>
          tx.run(`
            MATCH (a)
              WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) = $nodeId)
            MATCH (b)
              WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) = $parentId)
            OPTIONAL MATCH (a)-[r]->(b)
            WITH *, coalesce(r) as r1
            CALL apoc.do.when(r1 IS NOT NULL,
              'MATCH (a)-[r WHERE type(r) = $relN]->(b) SET r.isActive = true, r.startDate = $startDate, r.endDate ="" RETURN r',
              'CALL apoc.create.relationship(a, $relN, {isActive:true, startDate:$startDate, endDate:""}, b) YIELD rel SET rel.rIndex = id(rel) RETURN rel',
              {a:a, b:b, startDate:$startDate, relN:$rel}) YIELD value
            RETURN apoc.convert.toJson(value) AS output`,
            { nodeId: queryParams.nodeId, parentId: queryParams.parentId, startDate: new Date().toISOString(), rel: queryParams.relationName }).then(result => result.records.map(i => i.get('output'))));
          if(removeExistingRelation.length < 1){
            return badRequest('Node Does Not Exist In Hierarchy');
          }
        return successResponse('Node Added Successfully In Hierarchy', [{removeExistingRelation:JSON.parse(removeExistingRelation.toString()), addNewRelation:JSON.parse(addNewRelation.toString())}]);
      } else {
        console.log("--------------Node Does Not Exist In Hierarchy---------------------");
        const addNewRelation = await session.executeWrite(tx =>
          tx.run(`
            MATCH (a)
              WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) = $nodeId)
            MATCH (b)
              WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) = $parentId)
            CALL apoc.create.relationship(a, $relN, {isActive:true, startDate:$startDate, endDate:""}, b) YIELD rel
            SET rel.rIndex = id(rel)
            RETURN apoc.convert.toJson(rel) AS output
          `,{ nodeId: queryParams.nodeId, parentId: queryParams.parentId, startDate: new Date().toISOString(), relN: queryParams.relationName }).then(result => result.records.map(i => i.get('output'))));
        return successResponse('Node Added Successfully In Hierarchy', [{addNewRelation: JSON.parse(addNewRelation.toString())}]);
      }
    } else {
      return badRequest('Given Node or Parent Node Does Not Exist');
    }
  } catch (err) {
    errorLogger("addNode ", err);
    throw internalServer(`Error in Adding Node `);
  }
};

export const addDuplicateNode = async (event) => {
  try {
    devLogger("addDuplicateNode", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    const queryParams = event.queryParams;
    const currentNode = await session.executeRead(async tx => {
      const result = await tx.run(`
        MATCH (a)
          WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) = $nodeId)
        RETURN a`,{nodeId: queryParams.nodeId});
      return result.records.map(record => record.get('a'));
    });
    const parentNode = await session.executeRead(async tx => {
      const result = await tx.run(`
        MATCH (b)
          WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) = $parentId)
        RETURN b`,{parentId: queryParams.parentId});
      return result.records.map(record => record.get('b'));
    });
    if(currentNode.length >= 1 && parentNode.length >= 1){
      let newNodeId;
      const duplicateRel = await session.executeRead(async tx => {
        const result = await tx.run(`
          MATCH (a)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS $nodeId)
          MATCH (b)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) = $parentId)
          MATCH (a)-[r WHERE type(r) = $relation AND r.isActive = true]->(b)
          RETURN r
        `,{nodeId: queryParams.nodeId, parentId: queryParams.parentId, relation: queryParams.relationName});
        return result.records.map(record => record.get('r'));
      });
      if(duplicateRel.length >= 1){
        return badRequest('An active relation of same type already exists between current node and parent node');
      }
      const nodeType = await session.executeRead(async tx => {
        const result = await tx.run(`
          MATCH (a)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) = $nodeId)
          MATCH (a)-[r WHERE type(r) = $relation AND r.isActive = true]->()
          RETURN r
        `,{nodeId: queryParams.nodeId, relation: queryParams.relationName});
        return result.records.map(record => record.get('r'));
      });
      if(nodeType.length >= 1){
        console.log("--------------Node Exist In Hierarchy---------------------", currentNode);
        let props = {};
        Object.entries(currentNode[0].properties).forEach(([key, value]) => {
          if([key][0].toString() == 'teamId' || [key][0].toString() == 'projectId' || [key][0].toString() == 'EmployeeCode'){
            newNodeId = value.concat(cryptoRandomString({length: 3, type: 'url-safe'}));
            Object.assign(props, {[key]:newNodeId});
          } else {
            Object.assign(props, {[key]:value});
          }
        });
        await session.executeWrite(tx =>
          tx.run(`
            MATCH (x)
              WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(x[k]) = $currentNodeId)
            WITH x, LABELS(x) AS labls
            CALL apoc.create.node(labls, $props) YIELD node
            RETURN apoc.convert.toJson(node) AS output
            `,
            { currentNodeId: queryParams.nodeId, props: props, parentId: queryParams.parentId }).then(result => result.records.map(i => i.get('output'))));
          const addRelation = await session.executeWrite(tx =>
            tx.run(`
              MATCH (a)
                WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) = $newNodeId)
              MATCH (b)
                WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) = $parentId)
              OPTIONAL MATCH (a)-[r]->(b)
              WITH *, coalesce(r) as r1
              CALL apoc.do.when(r1 IS NOT NULL,
                'MATCH (a)-[r WHERE type(r) = $relN]->(b) SET r.isActive = true, r.startDate = $startDate, r.endDate ="" RETURN r',
                'CALL apoc.create.relationship(a, $relN, {isActive:true, startDate:$startDate, endDate:""}, b) YIELD rel SET rel.rIndex = id(rel) RETURN rel',
                {a:a, b:b, startDate:$startDate, relN:$rel}) YIELD value
              RETURN apoc.convert.toJson(value) AS output`,
            { newNodeId: newNodeId, parentId: queryParams.parentId, startDate: new Date().toISOString(), rel: queryParams.relationName }).then(result => result.records.map(i => i.get('output'))));
          return successResponse('Node Added Successfully In Hierarchy', [{addRelation:JSON.parse(addRelation[0].toString())}]);
      } else {
        console.log("--------------Node Does Not Exist In Hierarchy---------------------");
        const addNewRelation = await session.executeWrite(tx =>
          tx.run(`
            MATCH (a)
              WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) = $nodeId)
            MATCH (b)
              WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) = $parentId)
            CALL apoc.create.relationship(a, $relN, {isActive:true, startDate:$startDate, endDate:""}, b) YIELD rel SET rel.rIndex = id(rel)
            RETURN apoc.convert.toJson(rel) AS output
          `,{ nodeId: queryParams.nodeId, parentId: queryParams.parentId, startDate: new Date().toISOString(), relN: queryParams.relationName }).then(result => result.records.map(i => i.get('output'))));
        return successResponse('Node Added Successfully In Hierarchy', [{addNewRelation: JSON.parse(addNewRelation.toString())}]);
      }
    } else {
      return badRequest('Given Node or Parent Node Does Not Exist');
    }
  } catch (err) {
    errorLogger("addDuplicateNode ", err);
    throw internalServer(`Error in Adding Duplicate Node `);
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
          MATCH (a)-[r WHERE type(r) = $relation AND r.isActive = true]->(n)
          RETURN r
        `,{nodeId: queryParams.nodeId, relation: queryParams.relationName});
        return result.records.map(record => record.get('r'));
      });
      if(nodeType.length >= 1){
        console.log("--------------Child Node Deletion---------------------");
        const resp =  await session.run(`
          MATCH (n) WHERE id(n) = $nodeId
          MATCH p=(a)-[r1 WHERE type(r1) = $relation AND r1.isActive = true]->(n)-[r2 WHERE type(r2) = $relation AND r2.isActive = true]->(b)
          SET r1.isActive = false,
              r1.endDate = $endDate,
              r2.isActive = false,
              r2.endDate = $endDate
          WITH a, b
          OPTIONAL MATCH (a)-[r WHERE type(r) = $relation]->(b)
          WITH *, coalesce(r) as r3
          CALL apoc.do.when(r3 IS NOT NULL,
          'MATCH (a)-[r WHERE type(r) = $relation]->(b) SET r.isActive = true, r.endDate ="" RETURN r',
          'CALL apoc.create.relationship(a, $relN, {isActive:true, startDate:$startDate, endDate:""}, b) YIELD rel SET rel.rIndex = id(rel) RETURN rel',
            {a:a, b:b, startDate:$startDate, relN:$relation}) YIELD value
          RETURN apoc.convert.toJson(value) AS output
        `,
        { nodeId: queryParams.nodeId, endDate: new Date().toISOString(), startDate: new Date().toISOString(), relation: queryParams.relationName }).then(result => result.records.map(i => i.get('output')));
        if(resp.length < 1){
          return badRequest('Invalid Node Found');
        }
        return successResponse("Child Node Deleted Successfully");
      } else {
        console.log("--------------Leaf Node Deletion---------------------");
        const resp =  await session.run(`
          MATCH (n) WHERE id(n) = $nodeId
          OPTIONAL MATCH ()-[r WHERE type(r) = $relation AND r.isActive = true]->(n)
          WITH n, coalesce(r) as r3
          CALL apoc.do.when(r3 IS NULL,
          'MATCH (n)-[r WHERE type(r) = relN AND r.isActive = true]->() SET r.isActive = false, r.endDate = $endDate RETURN r',
          'RETURN false', {n:n, endDate:$endDate, relN:$relation}) 
          YIELD value
          RETURN apoc.convert.toJson(value) AS output
        `,
        { nodeId: queryParams.nodeId, endDate: new Date().toISOString(), relation: queryParams.relationName }).then(result => result.records.map(i => i.get('output')));
        if(resp.length < 1){
          return badRequest('Invalid Node Found');
        }
        return successResponse("Leaf Node Deleted Successfully");
      }
    } catch (err) {
      errorLogger("deleteNode ", err);
      throw internalServer(`Error in deleting node `);
    }
  };