import jwksClient, { JwksClient } from 'jwks-rsa';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { CodeFlowConfiguration } from './CodeFlowConfiguration.js';
import JsonWebToken from 'jsonwebtoken';
import JwksRsa from 'jwks-rsa';

export default class TokenValidator {

    private client: JwksClient | null = null;

    constructor(private oauthConfiguration: CodeFlowConfiguration, private proxy: string) {
    }

    async validate(jwtToken: string) {
        if (!this.client) {
            await this.loadJwks();
        }

        const getKey = async (header: any, callback: any) => {
            await this.client!.getSigningKey(header.kid, function (err: any, key: any) {
                if (err) {
                    console.error(`Impossible to get signing key - error`, err, key)
                    throw new Error(`Impossible to get signing key - error: ${err}`);
                }
                var signingKey = key!.getPublicKey();
                console.log(`Get public key - key: ${signingKey}`);
                callback(null, signingKey);
            });

        }

        return new Promise((resolve, reject) => {
            JsonWebToken.verify(jwtToken, getKey, {}, function (err, decoded) {
                if (err) {
                    console.error(`====> Validation failed : ${err}`)
                    reject(err)
                } else {
                    console.info(`====> Validation ok: ${JSON.stringify(decoded)}`)
                    resolve(decoded)
                }
            });
        });
    }

    private async loadJwks() {

        const options: JwksRsa.Options = {
            jwksUri: `${this.oauthConfiguration.okta_url}/v1/keys`,
        }

        if (this.proxy) {
            options['requestAgent'] = new HttpsProxyAgent(this.proxy);
        }

        console.log(`\n====> Init token validation - conf : ${JSON.stringify(options)}`);

        this.client = await jwksClient(options);
    }


}
