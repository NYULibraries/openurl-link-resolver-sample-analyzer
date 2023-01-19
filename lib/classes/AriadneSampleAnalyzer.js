import { AbstractSampleAnalyzer } from './AbstractSampleAnalyzer.js';

export class AriadneSampleAnalyzer extends AbstractSampleAnalyzer {
    constructor( html ) {
        super( html );

        this.citation = this.parseCitation();
        this.errors = [ 'error1', 'error2' ];
        this.links = [ 'error1', 'error2' ];
    }

    parseCitation() {
        const citationDiv = this.$( 'div[ class*="list-group-item" ]:first div:first' );
        const [ article, title, author, p, citationInfo ] =
            // The whitespace massaging might not be necessary, but do it anyway
            // in case we ever decide to prettify the HTML.
            citationDiv[ 0 ].children.map(
                childElement => this.$( childElement )
                    .text()
                    .trim()
                    .replaceAll( '\n', '' )
                    .replaceAll( /\W\W+/g, ' ' ) );

        return `${ article } | ${ title } | ${ author } | ${ p } | ${ citationInfo }`;
    }
}
