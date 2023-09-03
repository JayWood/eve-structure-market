/**
 * EveOnline authentication flow.
 */
require('dotenv').config();
import axios from "axios";
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import fireStore from "./fireStore";

const CLIENT_ID: string = process?.env?.EVE_CLIENT_ID || '';
const CLIENT_SECRET: string = process?.env?.EVE_CLIENT_SECRET || '';

const OAUTH_URL = "https://login.eveonline.com/v2/oauth/";
const AUTH_URL = OAUTH_URL + 'authorize/';
const TOKEN_URL = OAUTH_URL + 'token/';

export const COLLECTION_USERS = 'eveUsers';

interface codeResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    refresh_token: string;
}

interface evePayload {
    scp: string[];
    jti: string;
    kid: string;
    sub: string;
    azp: string;
    tenant: string;
    tier: string;
    region: string;
    aud: string;
    name: string;
    owner: string;
    exp: number;
    iat: number;
    iss: string;
}

const SCOPES = [
    'esi-wallet.read_character_wallet.v1',
    'esi-wallet.read_corporation_wallet.v1',
    'esi-assets.read_assets.v1',
    'esi-markets.structure_markets.v1',
    'esi-markets.read_character_orders.v1',
    'esi-wallet.read_corporation_wallets.v1',
    'esi-assets.read_corporation_assets.v1',
    'esi-markets.read_corporation_orders.v1',
];

export const loginUrl = ( redirect: string ): string => {
    const url = new URL( AUTH_URL );
    const params: Record<string, string> = {
        response_type: 'code',
        redirect_uri: redirect,
        client_id: CLIENT_ID,
        scope: SCOPES.join( ' ' ),
        state: 'eve-structure-market',
    };

    for (let paramsKey in params) {
        url.searchParams.set( paramsKey, params[paramsKey] );
    }

    console.log( url.toString() );

    return url.toString();
}

export const login = ( authorizationCode: string ) => {
    const params = {
        grant_type: 'authorization_code',
        code: authorizationCode
    };

    return axios.post(
        TOKEN_URL,
        params,
        {
            headers: {
                'Authorization': 'Basic ' + Buffer.from( `${CLIENT_ID}:${CLIENT_SECRET}` ).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'login.eveonline.com',
            }
        }
    );
}

export const validateToken = async (response: codeResponse ) => {
    const {access_token, refresh_token} = response;
    const client = jwksClient({jwksUri: 'https://login.eveonline.com/oauth/jwks'});
    const key = await client.getSigningKey( 'JWT-Signature-Key' );
    const signingKey = key.getPublicKey();

    const decoded = <evePayload> jwt.verify( access_token, signingKey, {
        audience: "EVE Online",
        issuer: [ "https://login.eveonline.com", "login.eveonline.com" ],
        ignoreExpiration: true,
    } );

    const collectionRef = fireStore.collection(COLLECTION_USERS);
    const sub = decoded.sub.split(":");
    const playerId = sub[sub.length-1];
    const document = {
        access_token,
        refresh_token,
        expiration: decoded.exp as number,
        name: decoded.name,
        playerId: parseInt( playerId )
    }

    await collectionRef.doc( playerId ).set(document);
    console.log( 'Document saved' );
};
