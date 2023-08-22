import 'dotenv/config.js';
import express, {NextFunction, Request, Response} from 'express';
import {eveMarketerQuery} from "./src/apiQueries";
import {QueryResponse} from "./src/types/eveMarketer";
import path from "path";

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

// Define the static directory for CSS and JS files
app.use(express.static(path.join( mainDir, 'public')));

app.get( '/', ( req: Request, res: Response ) => {
    res.status(418).json( { status: "error", message: 'State your intentions!' } );
} );

app.get( '/system-compare', async ( req: Request, res: Response ) => {
    res.send( 'Yep' );
   // try{
   //     const typeids = req.query?.typeids;
   //     const from = req.query?.from;
   //     const to = req.query?.to;
   //
   //     if ( ! typeids || ! from || ! to ) {
   //         res.status(400).json( { error: 'Required variables of systems or typeids are not set.' } );
   //     }
   //
   //     const starting = await eveMarketerQuery( typeids as string, from as string );
   //     const end = await eveMarketerQuery( typeids as string, to as string );
   //
   //     const startingData = starting.data as QueryResponse;
   //     const endData = end.data as QueryResponse;
   //     const types = (typeids as string).split(',');
   //     let output = {};
   //
   //     types.forEach( (typeid, index) => {
   //         const _exp = startingData[index];
   //         const _imp = endData[index];
   //
   //         output[typeid] = {
   //             export: {
   //
   //             },
   //             import: {},
   //         };
   //     } );
   //
   //     res.json( output );
   // } catch( e ) {
   //     res.json( e );
   // }
} );

app.listen( PORT, () => {
    console.log( `App listening on port ${PORT}` );
} );