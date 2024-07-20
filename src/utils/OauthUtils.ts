import { CodeFlowConfiguration } from "../oauth/codeFlowPkce/CodeFlowConfiguration.js";
import Randomstring from 'randomstring'

export default class OauthUtils {

    static bodyToUrlEncoded(form: {[key: string]: string}) {
        const formBody: string[] = [];
        for (const prop in form) {
            const key = encodeURIComponent(prop);
            const value = encodeURIComponent(form[prop]);
            formBody.push(`${key}=${value}`);
        }
        return formBody.join('&');
    }

    static getFrontHeaders(oauthConfig: CodeFlowConfiguration): { [key: string]: string }  {
        const headers: { [key: string]: string } = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
            'accept': 'application/json',
            'cache-control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }

        if (oauthConfig.origin) {
            headers['Origin'] = oauthConfig.origin;
        }

        return headers;
    }

    static addClientSecret(params: {[key: string]: string}, oauthConfig: CodeFlowConfiguration) {
        if (oauthConfig.client_secret) {
            params['client_secret'] = oauthConfig.client_secret;
        }
    }

    static createState():string {
        return Randomstring.generate(128);
    }

    static getScopes(scopes: string[]):string {
        return scopes.join(' ');
    }

}

