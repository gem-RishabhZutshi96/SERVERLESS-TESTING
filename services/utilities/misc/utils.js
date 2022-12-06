import { parameterStore } from "../config/commonData";
import * as path from 'path';
export const storagePath = (...relative) => {
    return path.join(parameterStore[process.env.stage].rootDirectory, 'storage', ...relative);
};
export const dateFormat = (date, format, separator) => {
    if (isDate(date)) {
        let dateString;
        switch (format) {
            case 'dmy':
                dateString =
                    date.getDate() +
                    separator +
                    `${date.getMonth() + 1}` +
                    separator +
                    date.getFullYear();
                break;
            case 'mdy':
                dateString =
                    `${date.getMonth() + 1}` +
                    separator +
                    date.getDate() +
                    separator +
                    date.getFullYear();
                break;
            case 'ymd':
                dateString =
                    date.getFullYear() +
                    separator +
                    `${date.getMonth() + 1}` +
                    separator +
                    date.getDate();
                break;
        }
        return dateString;
    }
    return date;
};
function isDate(input) {
    if (Object.prototype.toString.call(input) === '[object Date]') return true;
    return false;
}