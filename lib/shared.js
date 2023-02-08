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

// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
function deepFreeze(object) {
    // Retrieve the property names defined on object
    const propNames = Reflect.ownKeys( object );

    // Freeze properties before freezing self
    for ( const name of propNames ) {
        const value = object[ name ];

        if ((value && typeof value === 'object') || typeof value === 'function') {
            deepFreeze( value );
        }
    }

    return Object.freeze( object );
}

export {
    RESULTS_DIR,
    abort,
    deepFreeze,
}
