import { CodeFlowConfiguration } from './CodeFlowConfiguration.js';
import { fetch } from "node-fetch-native/proxy";
import OauthUtils from '../../utils/OauthUtils.js';

export default class UserInfo {
    constructor(private oauthConfig: CodeFlowConfiguration) {

    }


    async getUserInfo(accessToken: string): Promise<any> {
        const headers = OauthUtils.getFrontHeaders(this.oauthConfig);
        headers['Authorization'] = `Bearer ${accessToken}`;

        const url = `${this.oauthConfig.okta_url}/v1/userinfo`;

        console.log(`Get USER INFO - url: ${url}, headers: ${JSON.stringify(headers)}`);

        try {
            const response = await fetch(url, { headers })

            if (response.status !== 200) {
                throw new Error(`Unexpected tokens response - response: ${response}`)
            }

            const userInfo: any = await response.json();
            console.log(`Receive user info - tokens: ${JSON.stringify(userInfo)}`);

            return userInfo;
        } catch (error: any) {
            console.error(`====> Unexpected error when get access_token - error: ${error}`, error);
            throw new Error(error);
        }
    }
}