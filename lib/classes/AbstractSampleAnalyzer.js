import * as path from 'node:path';

import * as cheerio from 'cheerio';

export class AbstractSampleAnalyzer {
    $;
    citation;
    errors;
    links;
    html;
    name;
    serviceName;

    constructor() {
        if ( this.constructor === AbstractSampleAnalyzer ) {
            throw new Error( "Cannot instantiate abstract class" );
        }
    }

    parseHtml( html ) {
        this.html = html;
        this.$ = cheerio.load( html );
        this.citation = this.parseCitation();
        this.errors = [ 'error1', 'error2' ];
        this.links = [ 'error1', 'error2' ];
    }
}
