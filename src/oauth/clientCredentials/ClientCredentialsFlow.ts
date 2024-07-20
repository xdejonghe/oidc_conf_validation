import { fetch } from "node-fetch-native/proxy";
import { ClientCredentialsConf } from "./ClientCredentialsConfiguration.js";
import OauthUtils from '../../utils/OauthUtils.js';

export default class ClientCredentialsFlow {
    constructor(private oauthConf: ClientCredentialsConf) {

    }

    async getToken(): Promise<string> {
        const basicAuth = Buffer.from(this.oauthConf.client_id + ":" + this.oauthConf.client_secret).toString('base64');

        const headers = {
            'accept': 'application/json',
            'cache-control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Authorization': `Basic ${basicAuth}`
        }

        const params = {
            scope: OauthUtils.getScopes(this.oauthConf.scopes),
            grant_type: 'client_credentials'
        };
        const body: string = OauthUtils.bodyToUrlEncoded(params);
        try {
            const response = await fetch(this.oauthConf.okta_url, {
                method: 'POST',
                body,
                headers
            })

            const clientCredentialsResponse = await response.json() as ClientCredentialsResponse
            console.log(`Response from authentication - json: ${JSON.stringify(clientCredentialsResponse)}`);
            return clientCredentialsResponse.access_token;
        } catch (error: any)  {
            const msg = `Unable to get access token - error: ${error}`;
            console.log(msg);
            throw new Error(msg);
        }
    }
}

type ClientCredentialsResponse = {
    token_type: string,
    expires_in: number,
    access_token: string,
    scope: string
}