import Randomstring from 'randomstring';
import crypto from 'crypto';

export default class PkceChallenge {

    readonly codeVerifier!: string;
    readonly codeChallenge: string;

    constructor() {
        this.codeVerifier = Randomstring.generate(128)!;
        if (!this.codeVerifier) {
            throw new Error('====> PkceChallenge - Unable to create a random string !!!');
        }
        this.codeChallenge = PkceChallenge.base64url(crypto.createHash('sha256').update(this.codeVerifier).digest('base64'))
    }

    private static base64url(str: string) {
        return str.replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

}
