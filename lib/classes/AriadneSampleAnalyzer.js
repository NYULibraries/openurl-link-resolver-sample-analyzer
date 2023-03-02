import { AbstractSampleAnalyzer } from './AbstractSampleAnalyzer.js';

export class AriadneSampleAnalyzer extends AbstractSampleAnalyzer {
    constructor() {
        super();

        this.name = 'Ariadne';
        this.serviceName = 'ariadne';
    }

    parseCitation() {
        const citationDiv = this.$( 'div[ class*="list-group-item" ]:first div:first' );
        const [ article, title, author, publishedIn, citationInfo ] =
            // The whitespace massaging might not be necessary, but do it anyway
            // in case we ever decide to prettify the HTML.
            citationDiv[ 0 ].children.map(
                childElement => this.$( childElement )
                    .text()
                    .trim()
                    .replaceAll( '\n', '' )
                    .replaceAll( /\W\W+/g, ' ' )
            );

        return `${ article } | ${ title } | ${ author } | ${ publishedIn } | ${ citationInfo }`;
    }

    parseErrors() {
        // Right now we've only implemented one type of error, but we anticipate
        // more, so we use an array.
        const errors = [];

        const BACKEND_API_FETCH_EXCEPTION_RESPONSE_PREFIX =
            'Error fetching data from the Ariadne API';
        // Example of a backend API HTTP error response
        // GetIt URL:
        //     http://localhost:3001/?genre=article&isbn=&issn=00043079&title=Art%20Bulletin&volume=103&issue=4&date=20211201&atitle=%22Life%22%20Magazine%20and%20the%20Power%20of%20Photography%2C%20edited%20by%20Katherine%20A.%20Bussard%20and%20Kristen%20Gresh%3A%20New%20Haven%2C%20CT%3A%20Yale%20University%20Press%2C%202020.%20336%20pp.%3B%20250%20color%20and%20b%2Fw%20ills.%20%2460.00.&aulast=Berger,%20Martin%20A.&spage=144&sid=EBSCO:Academic%20Search%20Complete&pid=Berger,%20Martin%20A.15393498820211201Academic%20Search%20Complete
        // Response:
        // ...
        // <div class="i-am-centered">The backend API returned an HTTP error response: 400 (Bad Request)</div>
        // ...
        const BACKEND_API_HTTP_ERROR_RESPONSE_PREFIX =
            'The backend API returned an HTTP error response';
        const iAmCenteredDiv = this.$( 'div[ class="i-am-centered" ]' );
        if (
            iAmCenteredDiv.text().startsWith( BACKEND_API_FETCH_EXCEPTION_RESPONSE_PREFIX ) ||
            iAmCenteredDiv.text().startsWith( BACKEND_API_HTTP_ERROR_RESPONSE_PREFIX )
        ) {
            errors.push( iAmCenteredDiv.text() );

            return errors;
        }
    }

    parseLinks() {
        const links = [];

        // <div className="list-group">
        //     ...
        //     <div className="list-group-item list-group-item-action flex-column border-0">
        //         <div className="row">
        //             <h6>
        //                 <a href="http://proxy.library.nyu.edu/login?url=http://gateway.proquest.com/openurl?rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Ajournal&amp;rfr_id=info%3Axri%2Fsid%3Aprimo&amp;res_dat=xri%3Apqm&amp;rft_id=41130&amp;genre=journal&amp;url_ver=Z39.88-2004" target="_blank" rel="noopener noreferrer">Art, Design &amp; Architecture Collection</a>
        //             </h6>
        //             <small>Available from 2002/11/04</small>
        //         </div>
        //     </div>
        //     ...
        //     <div className="list-group-item list-group-item-action flex-column border-0">
        //         <div className="row">
        //             <h6>
        //                 <a href="http://proxy.library.nyu.edu/login?url=https://gateway.proquest.com/openurl?url_ver=Z39.88-2004&amp;genre=journal&amp;rft_id=41130&amp;res_dat=xri%3Apqm&amp;rfr_id=info%3Axri%2Fsid%3Aprimo&amp;rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Ajournal" target="_blank" rel="noopener noreferrer">ProQuest Central</a>
        //             </h6>
        //             <small>Available from 2002/11/04</small>
        //         </div>
        //     </div>
        // </div>
        const linkElements = this.$( 'div[ class*="list-group-item" ] > div.row > h6 > a' );
        if ( linkElements.length > 0 ) {
            linkElements.each( function( index, element ) {
                links.push( element.attribs.href )
            } );

            links.sort();
        }

        return links;
    }
}
