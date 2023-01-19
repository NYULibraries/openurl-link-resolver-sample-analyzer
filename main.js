import * as fs from 'node:fs';
import * as path from 'node:path';
import process from 'process';
import { fileURLToPath } from 'url';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'

// https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
// See "Option 2: Leverage the CommonJS require function to load JSON files"
import { createRequire } from "module";

import { AriadneSampleAnalyzer } from './lib/classes/AriadneSampleAnalyzer.js';

// https://stackoverflow.com/questions/64383909/dirname-is-not-defined-in-node-14-version
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

const require = createRequire( import.meta.url );

const INDEX_FILE = 'index.json';

function abort( errorMessage ) {
    console.error( errorMessage );
    process.exit( 1 );
}

function linksReportCommand( sampleDirectory ) {
    if ( ! ( fs.existsSync( sampleDirectory ) && fs.statSync( sampleDirectory ).isDirectory() ) ){
        abort( `${ sampleDirectory } is not a directory` );
    }

    const indexFile = path.join( sampleDirectory, INDEX_FILE );
    if ( ! ( fs.existsSync( indexFile ) && fs.statSync( indexFile ).isFile() ) ) {
        abort( `${ sampleDirectory } does not contain an index file` );
    }

    const index = require( indexFile )

    const linksReport = {};

    const sampleAnalyzers = [
        new AriadneSampleAnalyzer(),
    ];
    Object.keys( index ).sort().forEach( queryString => {
        const indexEntry = index[ queryString ];

        sampleAnalyzers.forEach( sampleAnalyzer => {
            const sampleFile = indexEntry.sampleFiles[ sampleAnalyzer.serviceName ];
            const sampleFilePath = path.join(
                path.dirname( sampleDirectory ), sampleFile
            );
            const html = fs.readFileSync( sampleFilePath, { encoding: 'utf8' } );
            sampleAnalyzer.parseHtml( html );
            linksReport[ queryString ] = {
                citation: sampleAnalyzer.citation,
                errors: sampleAnalyzer.errors,
                links: sampleAnalyzer.links,
            };
        } );
    } );

    console.log( linksReport );
}

function statsReportCommand( linksReportFile ) {
    if ( ! ( fs.existsSync( linksReportFile ) && fs.statSync( linksReportFile ).isFile() ) ){
        abort( `${ linksReportFile } is not a file` );
    }

    console.log( linksReportFile );
}

function parseArgs() {
    return yargs( hideBin( process.argv ) )
        .scriptName( "openurl-link-resolver-sample-analyzer" )
        .usage( '$0 <cmd> [args]' )
        .command( 'links [directory]', 'Generate links report JSON file',
            ( yargs ) => {
                yargs.positional( 'directory', {
                    type     : 'string',
                    describe : 'Directory containing the sample'
                } );
            },
            function ( argv ) {
                const sampleDirectory = path.resolve( argv.directory );

                linksReportCommand( sampleDirectory );
            } )
        .command( 'stats [file]', 'Generate stats report CSV file',
                  ( yargs ) => {
                      yargs.positional( 'file', {
                          type     : 'string',
                          describe : 'File generated by `links-report` command containing the sample'
                      } );
                  },
                  function ( argv ) {
                      const linksReportFile = path.resolve( argv.file );

                      statsReportCommand( linksReportFile );
                  } )
        .help()
        .argv;
}

async function main() {
    const argv = parseArgs();
}

main();
