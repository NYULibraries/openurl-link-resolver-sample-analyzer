import { AbstractSampleAnalyzer } from './AbstractSampleAnalyzer.js';

export class GetItSampleAnalyzer extends AbstractSampleAnalyzer {
    constructor() {
        super();

        this.name = 'GetIt';
        this.serviceName = 'getit';
    }

    parseCitation() {
        const citationDiv = this.$( 'div[ class="resource_info_sections" ]' );
        const [ article, title, author, publishedIn, citationInfo ] =
            citationDiv[ 0 ].children
                .filter( childElement => /\w/.test( childElement.data ) )
                .map( childElement => this.$( childElement )
                    .text()
                    .trim()
                    .replaceAll( '\n', '' )
                    .replaceAll( /\W\W+/g, ' ' ) );

        return `${ article } | ${ title } | ${ author } | ${ publishedIn } | ${ citationInfo }`;
    }
}
