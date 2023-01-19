import * as path from 'node:path';

import * as cheerio from 'cheerio';

export class AbstractSampleAnalyzer {
    $;
    html;

    constructor( html ) {
        if ( this.constructor === AbstractSampleAnalyzer ) {
            throw new Error( "Cannot instantiate abstract class" );
        }

        this.$ = cheerio.load( html );
        this.html = html;
    }

    citation() {
        // In theory can never get here because instantiation of the class is not
        // allowed, but just in case, print an error message.
        console.error( 'This method has not been implemented' );
    }

    links() {
        // In theory can never get here because instantiation of the class is not
        // allowed, but just in case, print an error message.
        console.error( 'This method has not been implemented' );
    }
}
