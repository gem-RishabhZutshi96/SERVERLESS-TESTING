import { employeeMasterModel } from "../../utilities/dbModels/employeeMaster";
export const exportExcelDataEmpMaster = async (fileName) => {
    try {
        const employees = await employeeMasterModel.find().lean();
        const xls = json2xls(employees.map(emp => getEmpMasterJSONForExcel(emp)));
        const buffer = Buffer.from(xls, 'binary');
        await uploadToS3({
            Bucket: dataStore[process.env.stage].s3Params.sowBucket,
            Key: fileName,
            ContentType: 'application/vnd.ms-excel',
            Body: buffer
        });
        let downloadURL = await getS3SignedUrl({
            Bucket: dataStore[process.env.stage].s3Params.sowBucket,
            Key: fileName,
            Expires: 3600
        });
        return downloadURL;
    } catch (e) {
        console.log('Error in exporting employees excel');
        console.log(e);
        throw e;
    }
};

function getEmpMasterJSONForExcel(emp) {
    const data = {
        'Email Id': emp.EmailId,
        'Employee Code': emp.EmployeeCode,
        'Employee Name': emp.EmployeeName,
        'Department': emp.Department,
        'Designation': emp.Designation,
        'Reporting Manager': emp.ReportingManager,
        'Reporting Manager Id': emp.ReportingManagerId,
        'Location': emp.Location,
        'ImagePath': emp.ImagePath,
    };
    emp.MobileNumber &&
        emp.MobileNumber.forEach((m, i) => {
            data[`Mobile ${i + 1}`] = m;
        });
    return JSON.parse(
        JSON.stringify(data, (key, value) => (value == undefined ? '' : value))
    );
}

async function uploadToS3(s3Data) {
    console.log("---- UPLODAING TO S3 ----",JSON.stringify(`${s3Data.Bucket} ${s3Data.Key}`, null, 2));
    try {
      return await s3.upload(s3Data).promise();
    } catch (error) {
      console.log(error);
      return error;
    }
}
async function getS3SignedUrl(params) {
    console.log("---- GETTING SIGNED URL FROM S3 ----", JSON.stringify(params, null, 2));
    try {
      return s3.getSignedUrl("getObject", {
        Bucket: params.Bucket,
        Key: params.Key,
        Expires: params.Expires,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
}