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

        // Example of a backend API HTTP error response
        // GetIt URL:
        //     http://localhost:3001/?genre=article&isbn=&issn=00043079&title=Art%20Bulletin&volume=103&issue=4&date=20211201&atitle=%22Life%22%20Magazine%20and%20the%20Power%20of%20Photography%2C%20edited%20by%20Katherine%20A.%20Bussard%20and%20Kristen%20Gresh%3A%20New%20Haven%2C%20CT%3A%20Yale%20University%20Press%2C%202020.%20336%20pp.%3B%20250%20color%20and%20b%2Fw%20ills.%20%2460.00.&aulast=Berger,%20Martin%20A.&spage=144&sid=EBSCO:Academic%20Search%20Complete&pid=Berger,%20Martin%20A.15393498820211201Academic%20Search%20Complete
        // Response:
        // ...
        // <div class="i-am-centered">The backend API returned an HTTP error response: 400 (Bad Request)</div>
        // ...
        const BACKEND_API_HTTP_ERROR_RESPONSE_PREFIX =
            `The backend API returned an HTTP error response`;
        const iAmCenteredDiv = this.$( 'div[ class="i-am-centered" ]' );
        if ( iAmCenteredDiv.text().startsWith( BACKEND_API_HTTP_ERROR_RESPONSE_PREFIX ) ) {
            errors.push( iAmCenteredDiv.text() );

            return errors;
        }
    }

    parseLinks() {
        return [ 'link1', 'link2' ];
    }
}
