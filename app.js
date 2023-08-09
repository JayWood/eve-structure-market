require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT;
const path = require('path');
const fetch = require( 'sync-fetch' );

let jsonResponse = [];

// Set the views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Define the static directory for CSS and JS files
app.use(express.static(path.join(__dirname, 'public')));

const refreshToken = token => {
	const refresh_token = process.env.TOKEN;
	const details = {
		grant_type: 'refresh_token',
		refresh_token,
		client_id: process.env.CLIENTID,
		scope: 'esi-markets.structure_markets.v1',
	};

	let formBody = [];
	for (const property in details) {
		const encodedKey = encodeURIComponent(property);
		const encodedValue = encodeURIComponent(details[property]);
		formBody.push(encodedKey + "=" + encodedValue);
	}
	formBody = formBody.join("&");

	const result = fetch( `https://login.eveonline.com/v2/oauth/token`, {
		method: 'POST',
		body: formBody,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Host: 'login.eveonline.com',
		}
	} );

	return result.text();
};

const getToken = () => {
	try {
		const output = refreshToken( process.env.TOKEN );
		const {access_token} = JSON.parse( output );
		return access_token;
	} catch ( err ) {
		console.log( err );
		return false;
	}
}

const getJSON = ( { structureID, page } ) => {
	const token = getToken();
	if ( ! token ) {
		return {
			error: 'No Token',
			message: 'There was a token failure.',
		}
	}

	const result = fetch(
		`https://esi.evetech.net/latest/markets/structures/${structureID}/?datasource=tranquility&page=${page}`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			}
		}
	);

	const json = JSON.parse( result.text() );

	// Read the response.
	jsonResponse = jsonResponse.concat( json );

	const maxPages = parseInt( result.headers.get( 'x-pages' ) ?? 1 );
	if ( page < maxPages ) {
		getJSON( {
			structureID,
			page: page + 1
		} );
	}

	return {
		jsonData: jsonResponse,
		cache: {
			expires: result.headers.get('expires'),
			etag: result.headers.get('etag')
		}
	};
}

app.get('/', (req, res) => {
	const secureToken = process.env?.SECURETOKEN;
	const queryToken = req.query?.token;
	if ( secureToken && secureToken !== queryToken ) {
		res.send( 'Auth failure' );
	}

	const isSummary = req.query?.type === 'summary';
	jsonResponse = [];
	let {jsonData, cache} = getJSON( {
		structureID: req.query?.structure_id ?? '1037562299833',
		page: 1
	} );

	res.set( 'Expires', cache.expires );
	res.set( 'Cache-control', 'public, max-age=300' );

	if ( isSummary ) {
		let newData = {};
		jsonData.forEach( (
			{
				type_id,
				price,
				is_buy_order,
				volume_remain
			}
		) => {
			// Sell orders only
			if ( is_buy_order ) {
				return;
			}

			const { high = 0, low = 0, volume = 0, orders = 0 } = newData[type_id] || {};
			newData = { ...newData, [type_id]: {
					type_id,
					orders: orders + 1,
					low: low > 0 && low < price ? low : price,
					high: high > price ? high : price,
					volume: volume + volume_remain,
				} }
		} );

		jsonData = Object.values( newData );
	}

	res.send( jsonData );
})

app.get('/calculate', (req, res) => {
	res.render('calculate');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})