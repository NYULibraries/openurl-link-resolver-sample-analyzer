import * as fs from 'node:fs';
import * as path from 'node:path';

// https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
// See "Option 2: Leverage the CommonJS require function to load JSON files"
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

import Papa from 'papaparse';

import { RESULTS_DIR, abort, deepFreeze } from '../shared.js';
import { LINKS_REPORT_FILE } from './links.js';

const STATS_REPORT_FILE = path.join( RESULTS_DIR, 'stats-report.csv' );

const ERRORS = {
    ARIADNE: {
        HTTP_400_BAD_REQUEST: 'The backend API returned an HTTP error response: 400 (Bad Request)',
    },
    GETIT: {
        PROBABLE_HTTP_400_BAD_REQUEST: 'Empty response (likely HTTP 400 error)',
        PAGE_NOT_FOUND: 'GetIt: Page Not Found',
        SORRY_SOMETHING_HAS_GONE_WRONG: 'Sorry, something has gone wrong.',
    },
};
// Make ERRORS immutable all the way down
deepFreeze( ERRORS );

function getPercentTotal( part, total ) {
    return total > 0 ?
        ( ( part / total ) * 100 ).toFixed( 0 ) :
        'n/a';
}

function getStatsJson( linksReportFile ) {
    const linksJson = require( LINKS_REPORT_FILE );

    const statsJson = {
        fields : [
            'Key',
            'GetIt citation',
            '# links: common',
            '# links: Ariadne only',
            '# links: GetIt only',
            '# links: Ariadne total',
            '# links: GetIt total',
            '# links: All Total',
            '% total: Ariadne',
            '% total: GetIt',
        ],
        data   : [],
    };

    // Add error fields
    Object.keys( ERRORS ).sort().forEach( serviceName => {
        Object.keys( ERRORS[ serviceName ] ).sort().forEach( error => {
            statsJson.fields.push( `${ serviceName }: ${ error }` );
        } );
    } );

    Object.keys( linksJson ).sort().forEach( testCaseUrl => {
        const linksEntry = linksJson[ testCaseUrl ];
        const statsEntry = [];

        // "Key"
        statsEntry.push( testCaseUrl );

        // "GetIt citation:
        statsEntry.push( linksEntry.citation.getit );

        // # links: common
        const numLinksCommon = linksEntry.links.common.length;
        statsEntry.push( numLinksCommon );

        // # links: Ariadne only
        const numLinksAriadneOnly = linksEntry.links.unique.ariadne.length;
        statsEntry.push( numLinksAriadneOnly );

        // # links: GetIt only
        const numLinksGetItOnly = linksEntry.links.unique.getit.length;
        statsEntry.push( numLinksGetItOnly );

        // # links: Ariadne total
        const numLinksAriadneTotal = numLinksCommon + numLinksAriadneOnly;
        statsEntry.push( numLinksAriadneTotal );

        // # links: GetIt total
        const numLinksGetItTotal = numLinksCommon + numLinksGetItOnly;
        statsEntry.push( numLinksGetItTotal );

        // # links: All Total
        const numLinksAllTotal = numLinksAriadneTotal + numLinksGetItTotal;
        statsEntry.push( numLinksAllTotal );

        // % total: Ariadne
        statsEntry.push( getPercentTotal( numLinksAriadneTotal, numLinksAllTotal ) );

        // % total: GetIt
        statsEntry.push( getPercentTotal( numLinksGetItTotal, numLinksAllTotal ) );

        // Add error counts
        Object.keys( ERRORS ).sort().forEach( serviceName => {
            const errorsForService = linksEntry.errors[ serviceName.toLowerCase() ];

            Object.keys( ERRORS[ serviceName ] ).sort().forEach( error => {
                const errorValue = ERRORS[ serviceName ][ error ];

                if ( errorsForService?.includes( errorValue ) ) {
                    statsEntry.push( 1 );
                } else {
                    statsEntry.push( 0 );
                }
            } );
        } );

        statsJson.data.push( statsEntry );
    } );

    return statsJson;
}

function statsReportCommand( linksReportFile ) {
    if ( ! ( fs.existsSync( linksReportFile ) && fs.statSync( linksReportFile ).isFile() ) ){
        abort( `${ linksReportFile } is not a file` );
    }

    const statsJson = getStatsJson( linksReportFile );
    writeStatsReportFile( statsJson );
}

function writeStatsReportFile( statsJson ) {
    const csv = Papa.unparse( statsJson, {
        quotes: false,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ",",
        header: true,
        newline: "\r\n",
        skipEmptyLines: false,
        columns: null,
        escapeFormulae: false,
    } )

    fs.writeFileSync( STATS_REPORT_FILE, csv, { encoding: 'utf8' } );
}

export {
    ERRORS,
    STATS_REPORT_FILE,
    statsReportCommand,
}
