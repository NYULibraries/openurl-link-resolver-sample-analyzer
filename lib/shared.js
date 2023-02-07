import * as path from 'node:path';
import process from 'process';

import { fileURLToPath } from 'url';

// https://stackoverflow.com/questions/64383909/dirname-is-not-defined-in-node-14-version
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

const ROOT_DIR = path.join( __dirname, '..' );

// Top-level directories
const RESULTS_DIR = path.join( ROOT_DIR, 'results' );

function abort( errorMessage ) {
    console.error( errorMessage );
    process.exit( 1 );
}

export {
    RESULTS_DIR,
    abort,
}
