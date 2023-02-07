import * as path from 'node:path';

import { RESULTS_DIR } from '../configuration.js';

const STATS_REPORT_FILE = path.join( RESULTS_DIR, 'stats-report.json' );

function statsReportCommand( linksReportFile ) {
    if ( ! ( fs.existsSync( linksReportFile ) && fs.statSync( linksReportFile ).isFile() ) ){
        abort( `${ linksReportFile } is not a file` );
    }

    console.log( linksReportFile );
}

export {
    STATS_REPORT_FILE,
    statsReportCommand,
}
