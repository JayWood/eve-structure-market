import 'dotenv/config.js';
import express, {NextFunction, Request, Response} from 'express';
import path from "path";
import {validateToken, login, loginUrl} from "./src/auth";

const app = express();
const PORT = process.env.PORT;
const mainDir = path.dirname( __dirname );

app.use( ( req: Request, res: Response, next: NextFunction ) => {
    const secureToken = process.env?.SECURETOKEN;
    const queryToken = req.query?.token;

    if ( ( ! queryToken || secureToken !== queryToken ) && req.path.includes('/secure/') ) {
        res.status(401).json({ error: 'Forbidden' } );
        next();
    }

    res.set( 'Cache-control', 'public, max-age=300' );

    next();
} );

// Set the views directory
app.set('views', path.join( mainDir, 'views'));
app.set('view engine', 'ejs');

app.get('/calculate', (req, res) => {
    res.render('calculate');
});

interface QueryType {
    code: string;
    state: string;
}

// Define the static directory for CSS and JS files
app.use(express.static(path.join( mainDir, 'public')));

app.get( '/', ( req: Request, res: Response ) => {
    res.status(418).json( { status: "error", message: 'State your intentions!' } );
} );

app.get( '/login', (req, res) => {
    const theUrl = loginUrl( `${req.protocol}://${req.get('host')}/token` );
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.redirect( theUrl );
} );

app.get( '/token', async (request, response ) => {
    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

    // @ts-ignore
    const {code = '',state = '' } = request?.query as QueryType;
    if ( state !== 'eve-structure-market' ) {
        response.status(401).send( 'Unauthorized' );
        return;
    }

    try {
        const result = await login(code);
        const responseData = result.data;
        await validateToken( responseData );
        // TODO: redirect to dashboard w/ login token.
        // TODO: set a cookie for the user for X days to say they're logged in.
        // TODO: Set the value of the cookie to the refresh token.
        response.send( responseData );
    } catch ( e ) {
        console.log( e );
        response.send( 'An error occurred' );
    }
} );

app.listen( PORT, () => {
    console.log( `App listening on port ${PORT}` );
} );