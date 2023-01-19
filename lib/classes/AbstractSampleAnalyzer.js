import * as path from 'node:path';

import * as cheerio from 'cheerio';

export class AbstractSampleAnalyzer {
    $;
    citation;
    errors;
    links;
    html;

    constructor( html ) {
        if ( this.constructor === AbstractSampleAnalyzer ) {
            throw new Error( "Cannot instantiate abstract class" );
        }

        this.html = html;
        this.$ = cheerio.load( html );
    }
}
