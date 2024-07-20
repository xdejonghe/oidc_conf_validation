import {ClientCredentialsConf} from "./ClientCredentialsConfiguration.js";
import ClientCredentialsFlow from "./ClientCredentialsFlow.js";
import ConfFileLoader from "../../utils/ConfFileLoader.js";


const CONF_PATH = 'src/oauth/clientCredentials/conf/c1.json';

// @ts-ignore
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;


(async () => {

    // Read configuration
    const oauthConfiguration: ClientCredentialsConf = ConfFileLoader.getConf(CONF_PATH);

    const clientCredentialsFlow = new ClientCredentialsFlow(oauthConfiguration);
    const accessToken = await clientCredentialsFlow.getToken();
    console.info(`Success to get client credentials auth - accessToken: \n${accessToken}`)

})();


