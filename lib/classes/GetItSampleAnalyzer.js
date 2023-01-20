import { AbstractSampleAnalyzer } from './AbstractSampleAnalyzer.js';

export class GetItSampleAnalyzer extends AbstractSampleAnalyzer {
    constructor() {
        super();

        this.name = 'GetIt';
        this.serviceName = 'getit';
    }

    parseCitation() {
        const citationDiv = this.$( 'div[ class="resource_info_sections" ]' );
        if ( citationDiv.length === 0 ) {
            return '';
        }

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

    parseErrors() {
        // These errors which we currently know about are mutually exclusive,
        // so for now we exit the moment one is found.  There's a possibility
        // that a response might have more than one error (should we discover
        // more types of errors), so we use an array.
        const errors = [];

        const http400Error = this.parseErrors_http400();
        if ( http400Error ) {
            errors.push( http400Error );

            return errors;
        }

        const pageNotFoundError = this.parseErrors_pageNotFound();
        if ( pageNotFoundError ) {
            errors.push( pageNotFoundError );

            return errors;
        }

        const sorrySomethingHasGoneWrongError = this.parseErrors_sorrySomethingHasGoneWrong();
        if ( sorrySomethingHasGoneWrongError ) {
            errors.push( sorrySomethingHasGoneWrongError );

            return errors;
        }
    }

    parseErrors_http400() {
        // Example of an HTTP 400 error
        // GetIt URL:
        //     getit.library.nyu.edu/resolve?genre=article&isbn=&issn=00908878&title=Happi: Household & Personal Products Industry=&volume=58&issue=10&date=20211001&atitle=Est\\u00e9e Lauder's Sales Jump 13% in Fiscal 2021.&aulast=&spage=129&sid=EBSCO:Complementary Index&pid=15291401820211001Complementary Index
        // Response:
        //     HTTP headers:
        //         HTTP/1.1 400 Bad Request
        //         Date: Fri, 20 Jan 2023 22:42:21 GMT
        //         Server: Apache/2.2.15 (Red Hat)
        //         Strict-Transport-Security: max-age=31536000
        //         X-Request-Id: 8a618792-ac1b-4714-a055-103428312d7b
        //         X-Runtime: 0.291734
        //         X-Powered-By: Phusion Passenger 6.0.2
        //         Content-Length: 0
        //         Status: 400 Bad Request
        //         Connection: close
        //         Content-Type: text/html; charset=utf-8
        //     HTML:
        //         <html><head></head><body></body></html>
        const body = this.$( 'body' );
        if ( body.text() === '' ) {
            return 'Empty response (likely HTTP 400 error)'
        }
    }

    parseErrors_pageNotFound() {
        // Example of a "GetIt: Page Not Found" error
        // GetIt URL:
        //     https://getit.library.nyu.edu/doesnotexist
        // Response:
        // ...
        // <title>New York University Division of Libraries | GetIt Error</title>
        // ...
        // <header>
        //     <span><a href="https://library.nyu.edu" target="_blank"><img
        //         src="/assets/nyulibraries_errors-header-86b03936856f3cb5c317dbe8f688cdec.png"
        //         alt="Nyulibraries errors header"></a></span>
        // </header>
        // ...
        // <div className="nyu-container">
        //     <div className="col-sm-12">
        //         <h1>GetIt: Page Not Found</h1>
        //
        //         <p>Oops! It looks like this page is missing.</p> <p>Please
        //         check that there are no typos in your URL.</p>
        // ...
        const PAGE_NOT_FOUND_HEADER_TEXT = 'GetIt: Page Not Found';
        const pageNotFoundH1 = this.$( 'h1' );
        if ( pageNotFoundH1.text() === PAGE_NOT_FOUND_HEADER_TEXT ) {
            return PAGE_NOT_FOUND_HEADER_TEXT;
        }
    }

    parseErrors_sorrySomethingHasGoneWrong() {
        // Example of a "Sorry, something has gone wrong." error
        // GetIt URL:
        //     getit.library.nyu.edu/resolve?umlaut.institution=NYSID&ctx_ver=Z39.88-2004&ctx_enc=info:ofi/enc:UTF-8&ctx_tim=2021-07-11T19:10:13IST&url_ver=Z39.88-2004&url_ctx_fmt=infofi/fmt:kev:mtx:ctx&rfr_id=info:sid/primo.exlibrisgroup.com:primo-dedupmrg913433320&rft_val_fmt=info:ofi/fmt:kev:mtx:book&rft.genre=book&rft.jtitle=&rft.btitle=Designing interiors&rft.aulast=Kilmer&rft.aufirst=Rosemary,&rft.auinit=&rft.auinit1=&rft.auinitm=&rft.ausuffix=&rft.au=Kilmer, Rosemary, author&rft.aucorp=&rft.volume=&rft.issue=&rft.part=&rft.quarter=&rft.ssn=&rft.spage=&rft.epage=&rft.pages=&rft.artnum=&rft.pub=&rft.place=&rft.issn=&rft.eissn=9781118418666&rft.isbn=9781118024645&rft.sici=&rft.coden=&rft_id=info:doi/&rft.object_id=&rft.primo=dedupmrg913433320&rft.eisbn=&rft_dat=
        // Response:
        // ...
        //     <title>GetIt | Error!</title>
        //     <meta name="onlyfortesting" content="onlyfortesting">
        // ...
        // <div class="error_section">
        //
        //     <div class="heading">
        //       <h1>Sorry, something has gone wrong.</h1>
        //     </div>
        //
        //     <h2>Please try one of the following options</h2>
        //      <ol>
        //           <li>If you entered this URL yourself, please check your URL for errors.</li>
        const SORRY_SOMETHING_HAS_GONE_WRONG = 'Sorry, something has gone wrong.';
        const sorrySomethingHasGoneWrongH1 = this.$( 'h1' );
        if ( sorrySomethingHasGoneWrongH1.text() === SORRY_SOMETHING_HAS_GONE_WRONG ) {
            return SORRY_SOMETHING_HAS_GONE_WRONG;
        }
    }

    parseLinks() {
        return [ 'link1', 'link2' ];
    }
}
