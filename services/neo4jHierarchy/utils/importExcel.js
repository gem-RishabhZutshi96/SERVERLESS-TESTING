import { devLogger, errorLogger } from "./log-helper";
const XLSX = require('xlsx');
export const readExcelData = async (event) => {
    try {
        const filterEvent = Object.entries(event).filter(([key, value]) => key !== 'Body');
        devLogger("readExcelData", filterEvent, "event");
        const workbook = XLSX.read(event.Body, { type: 'buffer' });
        const jsonRows = XLSX.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]]
        );
        const response = jsonRows.map(async emp => {
           return getNodeObject(emp);
        });
        const nodes = await Promise.all(response);
        return nodes;
    } catch (e) {
        errorLogger("readExcelData",e,"Error in reading excel");
        throw e;
    }
};

function getNodeObject(nodeData){
    return JSON.parse(
        JSON.stringify(
            {
                nodeID: nodeData['ID'] && String(nodeData['ID']),
                nodeParentID: nodeData['Parent ID'] && String(nodeData['Parent ID'])
            }
        )
    );
}