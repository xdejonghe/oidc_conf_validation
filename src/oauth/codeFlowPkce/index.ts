import AuthorizationCodeFlow from "./AuthorizationCodeFlow.js";
import Logout from './Logout.js';
import {CodeFlowConfiguration} from "./CodeFlowConfiguration.js";
import TokenValidator from "./TokenValidator.js";
import UserInfo from "./UserInfo.js";
import ConfFileLoader from "../../utils/ConfFileLoader.js";


const CONF_PATH = 'src/oauth/codeFlowPkce/conf/c1.json';

const PROXY = 'http://10.146.229.176:80';

// @ts-ignore
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;


(async () => {

    // Read configuration
    const oauthConfiguration: CodeFlowConfiguration = ConfFileLoader.getConf(CONF_PATH);

    const authorizationCodeFlow = new AuthorizationCodeFlow(oauthConfiguration);
    const tokensReponse = await authorizationCodeFlow.getTokens();

    const shouldValidate = false;
    if (shouldValidate) {
        const tokenValidator = new TokenValidator(oauthConfiguration, PROXY)

        console.log(`Try to validate access token: ${tokensReponse.access_token}`)
        await tokenValidator.validate(tokensReponse.access_token);

        console.log(`Try to validate id token: ${tokensReponse.id_token}`)
        await tokenValidator.validate(tokensReponse.id_token);
    }


    const shouldLogout = true;
    if (shouldLogout) {
        const logout = new Logout(oauthConfiguration);
        await logout.logout(tokensReponse.id_token);
    }

    const shouldGetUserInfo = true;
    if (shouldGetUserInfo) {
        const userInfo = new UserInfo(oauthConfiguration);
        await userInfo.getUserInfo(tokensReponse.access_token);
    }


})();


