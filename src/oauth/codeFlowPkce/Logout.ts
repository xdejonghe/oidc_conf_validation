import { fetch } from "node-fetch-native/proxy";
import { CodeFlowConfiguration } from './CodeFlowConfiguration.js';
import OauthUtils from '../../utils/OauthUtils.js';


export default class Logouts {
    constructor(private oauthConfig: CodeFlowConfiguration) {

    }

    async logout(idToken: string): Promise<void> {
        const params: { [key: string]: string } = {
            post_logout_redirect_uri: this.oauthConfig.logout_uri,
            id_token_hint: idToken,
            state: OauthUtils.createState()
        }
        OauthUtils.addClientSecret(params, this.oauthConfig);

        const urlParams: string = OauthUtils.bodyToUrlEncoded(params);

        const headers: { [key: string]: string } = OauthUtils.getFrontHeaders(this.oauthConfig);

        const logoutUrl = `${this.oauthConfig.okta_url}/v1/logout?${urlParams}`;
        console.log(`Try to logout - url: ${logoutUrl}`)

        try {
            const response = await fetch(logoutUrl, {
                headers,
            });
            if (response.status !== 200) {
                throw new Error(`Unexpected tokens response - response: ${response}`)
            }

            console.log('logout success', response);
        } catch (error) {
            console.error(`====> Unexpected error when get signout - error: ${error}`, error);
        }
    }


}


