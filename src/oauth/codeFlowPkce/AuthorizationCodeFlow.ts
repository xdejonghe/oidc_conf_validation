import express from 'express';
import fs from 'fs';
import https, { Server } from 'https';
import open from 'open';
import OauthUtils from "../../utils/OauthUtils.js";
import PkceChallenge from "../../utils/pkceChallenge.js";
import { CodeFlowConfiguration } from "./CodeFlowConfiguration.js";
import { fetch } from "node-fetch-native/proxy";


export default class AuthorizationCodeFlow {

       private pkceChallenger: PkceChallenge;
    private server!: Server;

    constructor(private oauthConfig: CodeFlowConfiguration) {
        this.pkceChallenger = new PkceChallenge();
    }


    async getTokens(): Promise<OidcResponseTokens> {
        const tokensResponse = this.startCallbackServer();
        await this.redirectToOauthServer();
        return tokensResponse;
    }

    private startCallbackServer(): Promise<OidcResponseTokens> {
        const certificate = {
            key: fs.readFileSync('cert/localhost.key'),
            cert: fs.readFileSync('cert/localhost.crt')
        };

        // Create a service (the app object is just a callback).
        const app = express();

        // Create an HTTPS service identical to the HTTP service.
        const url = new URL(this.oauthConfig.redirect_uri);
        const port = url.port ? parseInt(url.port) : 443;
        const hostname = url.hostname || 'localhost'

        console.log(`Start callback server - host: ${hostname}, port: ${port}`);

        this.server = https.createServer(certificate, app);
        this.server.listen(port, hostname);


        return new Promise((resolve, reject) => {
            console.log(`Add listener on path - path : ${url.pathname}`)

            app.get(url.pathname, async (req, res) => {
                try {
                    const tokens = await this.getAccessTokenFromAuthorizationCode(req, res)
                    console.log(`TOKENS : ${tokens}`)
                    resolve(tokens)
                } catch (error) {
                    reject(error);
                }
            });
        })

    }

    private async redirectToOauthServer() {
        var authorizeUrl = this.buildAuthorizeUrl();

        console.log(`\n====> Redirect to oauth server - url: ${authorizeUrl}`);

        await open(authorizeUrl);
    }

    private buildAuthorizeUrl() {
        const path = `${this.oauthConfig.okta_url}/v1/authorize?`;
        const params: { [key: string]: string } = {
            client_id: this.oauthConfig.client_id,
            redirect_uri: this.oauthConfig.redirect_uri,
            response_type: 'code',
            scope: OauthUtils.getScopes(this.oauthConfig.scopes),
            state: OauthUtils.createState(),
            code_challenge_method: 'S256',
            code_challenge: this.pkceChallenger.codeChallenge
        }
        OauthUtils.addClientSecret(params, this.oauthConfig);

        const encodedParams = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')


        return path + encodedParams;
    }

    private async getAccessTokenFromAuthorizationCode(req: any, res: any): Promise<OidcResponseTokens> {

        const queryAsJon = JSON.stringify(req.query);
        console.info(`\n====> Get access token from authorization code: ${queryAsJon}`);

        var htmlBbody = `<html><body><h4>OAuth2 authorize complete.
        <br> Query: ${queryAsJon} 
        <br> You can close this tab.</h4></body></html>`;
        res.writeHead(200, {
            'Content-Length': Buffer.byteLength(htmlBbody),
            'Content-Type': 'text/html'
        });
        res.write(htmlBbody);
        res.end();

        this.stopCallbackServer();

        const authorizationCode = req.query.code;
        if (!authorizationCode) {
            console.error(`Fail to get the authorization code ${queryAsJon}`);
        }

        const form: { [key: string]: string } = {
            client_id: this.oauthConfig.client_id,
            code_verifier: this.pkceChallenger.codeVerifier!,
            redirect_uri: this.oauthConfig.redirect_uri,
            grant_type: 'authorization_code',
            scope: OauthUtils.getScopes(this.oauthConfig.scopes),
            code: req.query.code
        };

        OauthUtils.addClientSecret(form, this.oauthConfig);


        // Step 3: call token endpoint where Okta will exchange code for tokens
        const body = OauthUtils.bodyToUrlEncoded(form);

        console.log(`\n====> POST on ${this.oauthConfig.okta_url + '/v1/token'}, with body: ${body}`)

        const headers: { [key: string]: string } = OauthUtils.getFrontHeaders(this.oauthConfig);

        try {
            const response = await fetch(this.oauthConfig.okta_url + '/v1/token', {
                method: 'POST',
                body,
                headers,
            });
            if (response.status !== 200) {
                throw new Error(`Unexpected tokens response - response: ${response}`)
            }

            const tokens: OidcResponseTokens = await response.json() as OidcResponseTokens;
            console.log(`Receive tokens - tokens: ${JSON.stringify(tokens)}`, response);
            return tokens;
        } catch (error: any) {
            console.error(`====> Unexpected error when get access_token - error: ${error}`, error);
            throw new Error(error);
        }
    }


    private stopCallbackServer() {
        console.log(`Stop callback server - uri : ${this.oauthConfig.redirect_uri}`);

        this.server.close();
    }

}


export type OidcResponseTokens = {
    token_type: string,
    expires_in: number,
    scope: string,
    access_token: string,
    refresh_token: string
    id_token: string,
}
