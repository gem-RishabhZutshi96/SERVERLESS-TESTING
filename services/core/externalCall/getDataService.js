import axios from 'axios';
import { parameterStore } from "../../utilities/config/commonData";
import { internalServer } from '../../utilities/response/index';
import { errorLogger, devLogger } from '../utils/log-helper';
const url = parameterStore[process.env.stage].misapi.uri;
export const getDataService = async () => {
    try{
      devLogger('Mis API Hit', "", 'event');
      let result = await axios.get(url);
      return result.data;
    } catch(err) {
        errorLogger('Mis API Hit', err, 'Error in Getting Data from MIS');
        return internalServer(`Error in MIS API`);
    }
};