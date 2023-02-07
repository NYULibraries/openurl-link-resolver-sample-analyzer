import * as fs from 'node:fs';
import * as path from 'node:path';

// https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
// See "Option 2: Leverage the CommonJS require function to load JSON files"
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

import { RESULTS_DIR, abort } from '../shared.js';

import { AriadneSampleAnalyzer } from "../classes/AriadneSampleAnalyzer.js";
import { GetItSampleAnalyzer } from "../classes/GetItSampleAnalyzer.js";

const INDEX_FILE = 'index.json';
const LINKS_REPORT_FILE = path.join( RESULTS_DIR, 'links-report.json' );

function getCommonAndUniqueLinkLists( rawLinkLists ) {
    const serviceNames = Object.keys( rawLinkLists );

    // Abort if there are more than two services that were sampled.
    // We should have previously already asserted that there were no more than two,
    // but check again just in case.
    if ( serviceNames.length > 2 ) {
        abort( 'Only a maximum of two raw link lists are permitted.' );
    }

    const refinedLinksLists = {
        common: [],
        unique: {
        }
    };
    serviceNames.forEach( serviceName => refinedLinksLists.unique[ serviceName ] = [] );

    if ( serviceNames.length === 1 ) {
        const serviceName = serviceNames.pop();
        refinedLinksLists.unique[ serviceName ] = rawLinkLists[ serviceName ];

        return refinedLinksLists;
    }

    // We have exactly two services/link lists.  Assign to A or B depending on length.
    // A is longer or as long as B.
    let serviceNameA, serviceNameB;
    if ( rawLinkLists[ serviceNames[ 0 ] ].length >= rawLinkLists[ serviceNames[ 1 ] ].length ) {
        serviceNameA = serviceNames[ 0 ];
        serviceNameB = serviceNames[ 1 ];
    } else {
        serviceNameA = serviceNames[ 1 ];
        serviceNameB = serviceNames[ 0 ];
    }

    // If the B raw list is empty, set unique list for A service to A raw list
    // and exit early.  Note that it is possible that the A raw list might also be
    // empty.
    if ( rawLinkLists[ serviceNameB ].length === 0 ) {
        refinedLinksLists.unique[ serviceNameA ] = rawLinkLists[ serviceNameA ];

        return refinedLinksLists;
    }

    // A and B raw lists each have at least 1 link.
    const rawListA = rawLinkLists[ serviceNameA ]
        .slice()
        .map( link => normalizeProxyLoginUrl( link ) )
        .sort();
    const rawListB = rawLinkLists[ serviceNameB ]
        .slice()
        .map( link => normalizeProxyLoginUrl( link ) )
        .sort();

    let aIndex = 0;
    let bIndex = 0;
    for ( ; aIndex < rawListA.length && bIndex < rawListB.length ; ) {
        const link = rawListA[ aIndex ];
        const currentB = rawListB[ bIndex ];

        // B doesn't have A's link
        if ( link < currentB ) {
            refinedLinksLists.unique[ serviceNameA ].push( link );
            aIndex++;
            // A and B both have the link
        } else if ( link === currentB ) {
            refinedLinksLists.common.push( link );
            aIndex++;
            bIndex++;
            // A doesn't have B's link
        } else if ( link > currentB ) {
            refinedLinksLists.unique[ serviceNameB ].push( currentB );
            bIndex++;
        } else {
            // Should not be possible to get here.
        }
    }

    // Take care of the remainder of whichever list wasn't used up.  It's only
    // possible for either A or B to have remaining links, not both, but just
    // loop through both for simplicity, don't bother trying to figure out which
    // one has remaining links.
    for ( let i = aIndex; i < rawListA.length; i++ ) {
        refinedLinksLists.unique[ serviceNameA ].push( rawListA[ i ] );
    }
    for ( let i = bIndex; i < rawListB.length; i++ ) {
        refinedLinksLists.unique[ serviceNameB ].push( rawListB[ i ] );
    }

    return refinedLinksLists;
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

    // For now, we only allow at most two sampleAnalyzers, the reason being that in order
    // to save space, save later computation time, and make the output more readable,
    // we store the link lists in this structure:
    //
    // {
    //      common: [
    //          ...
    //      ],
    //      unique: [
    //          service1: [
    //              ...
    //          ],
    //          service2: [
    //              ...
    //          ],
    //      ]
    // }
    //
    // This structure only really makes sense with two services (raw link lists).
    // With more than two, the `unique` lists become a lot more complicated.
    const sampleAnalyzers = [
        new AriadneSampleAnalyzer(),
        new GetItSampleAnalyzer(),
    ];
    // Abort if there are more than two sample analyzers.
    if ( sampleAnalyzers.length > 2 ) {
        abort( 'Only a maximum of two sample analyzers are permitted.' );
    }

    Object.keys( index ).sort().forEach( testCaseUrl => {
        const indexEntry = index[ testCaseUrl ];
        const linksReportEntry = {
            citation: {},
            errors: {},
            links: {},
        };
        const rawLinkLists = {};
        sampleAnalyzers.forEach( sampleAnalyzer => {
            const sampleFile = indexEntry.sampleFiles[ sampleAnalyzer.serviceName ];
            const sampleFilePath = path.join(
                path.dirname( sampleDirectory ), sampleFile
            );
            const html = fs.readFileSync( sampleFilePath, { encoding: 'utf8' } );
            sampleAnalyzer.parseHtml( html );
            linksReportEntry.citation[ sampleAnalyzer.serviceName ] = sampleAnalyzer.citation;
            linksReportEntry.errors[ sampleAnalyzer.serviceName ] = sampleAnalyzer.errors;

            rawLinkLists[ sampleAnalyzer.serviceName ] = ( sampleAnalyzer.links );
        } );
        linksReportEntry.links = getCommonAndUniqueLinkLists( rawLinkLists );

        linksReport[ testCaseUrl ] = linksReportEntry;
    } );

    fs.writeFileSync( LINKS_REPORT_FILE, JSON.stringify( linksReport, null, '   ' ), { encoding: 'utf8' } );
}

// This function normalizes EZProxy URLs to enable accurate comparison of URLs
// that are functionally equivalent but which are unequal strings.
//
// Example: these two URLs should be considered equal, event though they as strings
//     they are unequal:
//
//         ariadne: http://proxy.library.nyu.edu/login?url=https://find.gale.com/openurl/openurl?ctx_enc=info%3Aofi%3Aenc%3AUTF-8&amp;url_ctx_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Actx&amp;rft.atitle=The+Conversion+of+a+Climate-Change+Skeptic&amp;res_id=info%3Asid%2Fgale%3ABIE&amp;req_dat=info%3Asid%2Fgale%3Augnid%3Anysl_me_newyorku&amp;url_ver=Z39.88-2004&amp;rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Aarticle&amp;rft.jtitle=NYTimes.com+Video+Collection
//         getit: http://proxy.library.nyu.edu/login?url=https://find.gale.com/openurl/openurl?res_id=info%3Asid%2Fgale%3ABIE&amp;req_dat=info%3Asid%2Fgale%3Augnid%3Anysl_me_newyorku&amp;rft.atitle=The+Conversion+of+a+Climate-Change+Skeptic&amp;rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Aarticle&amp;url_ctx_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Actx&amp;ctx_enc=info%3Aofi%3Aenc%3AUTF-8&amp;url_ver=Z39.88-2004&amp;rft.jtitle=NYTimes.com+Video+Collection
//
// The EZProxy URLs have been constructed in such a way that using a standard URL
// parser yields incorrect parsing results due to the encoding not being completely
// correct, leading to some of the query string params in the `url` param value
// being "promoted" to the "top-level" query string of the EXProxy URL itself.
// It could be that EZProxy is not using standard query string parsing but is
// instead simply treating the query string as a normal string and removing the
// "url=" prefix and then dealing with the remaining string as a URL.  We will
// do the same here.
function normalizeProxyLoginUrl( url ) {
    const PROXY_LOGIN_URL_PREFIX = 'http://proxy.library.nyu.edu/login?url='
    if ( url.startsWith( PROXY_LOGIN_URL_PREFIX ) ) {
        const urlParamValue = url.substring( PROXY_LOGIN_URL_PREFIX.length );
        const urlObject = new URL( urlParamValue );

        urlObject.searchParams.sort();

        return `${ PROXY_LOGIN_URL_PREFIX }${ urlObject.href }`;
    } else {
        return url;
    }
}

export {
    LINKS_REPORT_FILE,
    linksReportCommand,
}
