import axios from "axios";
import {QueryResponse} from "./types/eveMarketer";

const tradeStations: Record<string, number> = {
    jita: 30000142,
    amarr: 30002187,
    dodixie: 30002659
};

const endpoint = 'https://api.evemarketer.com/ec/marketstat/json';

const eveMarketerQuery = ( typeIds: Array<number>, system: string ) => {
    const url = new URL( endpoint );
    url.searchParams.append( 'typeid', typeIds.join( ',' ) );
    url.searchParams.append( 'usesystem', tradeStations[ system ]?.toString() ?? tradeStations.jita.toString() );
    return axios.get<QueryResponse>( `${endpoint}` )
}

export {
    eveMarketerQuery
}