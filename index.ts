import 'dotenv/config.js';
import express, {NextFunction, Request, Response} from 'express';

const app = express();
const PORT = process.env.PORT;

app.use( ( req: Request, res: Response, next: NextFunction ) => {
    const secureToken = process.env?.SECURETOKEN;
    const queryToken = req.query?.token;

    if ( ! queryToken || secureToken !== queryToken ) {
        res.status(401).json({ error: 'Forbidden' } );
    }

    res.set( 'Cache-control', 'public, max-age=300' );

    next();
} );

app.get( '/', ( req: Request, res: Response ) => {
    res.send( 'Hello' );
} );

app.get( '/system-compare', async ( req: Request, res: Response ) => {
    const {string: typeids = '', systems = ''} = req.query;
    if ( ! typeids || ! systems ) {
        res.status(400).json( { error: 'Required variables of systems or typeids are not set.' } );
    }

    const systemArray = systems.split();

} );

app.listen( PORT, () => {
    console.log( `App listening on port ${PORT}` );
} );