import * as path from 'node:path';

import * as cheerio from 'cheerio';

export class AbstractSampleAnalyzer {
    $;
    citation;
    errors;
    links;
    linksToExcludePrefixes = [
        // Ask A Librarian
        //    NOTE: This link should never be in the list of links returned by
        //          `parseLinks()` because it is usually easily excluded by
        //          employing a selector that does not match the HTML element for
        //          the link.  Nevertheless, we include it here just in case it
        //          somehow makes its way into the links list.
        //          Note that dev GetIt was altered so that it would return the
        //          actual direct links instead of the internal GetIt "link_router"
        //          links, but this only applies to the real results links, not
        //          to the Ask A Librarian link, so currently this filtering would
        //          only work for Ariadne.s
        'https://library.nyu.edu/ask/',
        // Bobst Library Interlibrary Loan
        'http://proxy.library.nyu.edu/login?url=https://ill.library.nyu.edu/illiad/illiad.dll/OpenURL?',
    ];
    html;
    name;
    serviceName;

    constructor() {
        if ( this.constructor === AbstractSampleAnalyzer ) {
            throw new Error( "Cannot instantiate abstract class" );
        }
    }

    filterLinks( links ) {
        return links.filter( link => {
            let exclude = false;

            for ( let i = 0; i < this.linksToExcludePrefixes.length; i++ ) {
                const prefix = this.linksToExcludePrefixes[ i ];
                if ( link.startsWith( prefix ) ) {
                    exclude = true;

                    break;
                }
            }

            return ! exclude;
        } );
    }

    parseHtml( html ) {
        this.html = html;
        this.$ = cheerio.load( html );
        this.citation = this.parseCitation();
        this.errors = this.parseErrors();
        this.links = this.filterLinks( this.parseLinks() );
    }
}
