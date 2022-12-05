import axios from 'axios';
import {
    dataStore
} from "../../utilities/config/commonData";
import {
    internalServer
  } from '../../utilities/response/index';
import {
    errorLogger,
    devLogger
  } from '../utils/log-helper';
const url = dataStore[process.env.stage].misApi.uri;
export const getDataService = async () => {
    try{
      devLogger('Mis API Hit', "", 'event');
      let result = await axios.get(url);
      return result.data;
    } catch(err) {
        errorLogger('Mis API Hit', err, 'Error in Getting Data from MIS');
        throw internalServer(`Error in MIS API`, err);
    }
};