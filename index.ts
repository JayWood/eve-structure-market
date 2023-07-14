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

    next();
} );

app.get( '/', ( req: Request, res: Response ) => {
    res.send( 'Hello' );
} );

app.listen( PORT, () => {
    console.log( `App listening on port ${PORT}` );
} );