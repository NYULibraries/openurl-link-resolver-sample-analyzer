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
        return [ 'error1', 'error2' ];
    }

    parseLinks() {
        return [ 'link1', 'link2' ];
    }
}
