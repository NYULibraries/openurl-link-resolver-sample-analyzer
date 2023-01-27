# OpenURL link resolver sample analyzer

See monday.com ticket [Write script for testing sample OpenURLs](https://nyu-lib.monday.com/boards/765008773/pulses/3386819884).
This ticket calls for the creation of two components: a sampler which fetches and saves
the responses from various services to OpenURL queries, and an analyzer which generates
reports comparing the service samples. This project is the analyzer component.
The sampler component is [openurl\-link\-resolver\-sampler](https://github.com/NYULibraries/openurl-link-resolver-sampler).

# Usage example:

Generate the links report for the _targeted/_ test group using the `links` command.
The results will be written to _results/links-report.json_.

```shell
# Clone the response samples repo, which is currently 1.4G in size, and will
# likely grow over time.
git clone git@github.com:NYULibraries/openurl-link-resolver-response-samples.git

# Run the `links` command, providing the relative or absolute path to the directory
# you would like to analyze 
node main.js links ../openurl-link-resolver-response-samples/targeted/
```

The `stats` command has not been implemented yet.

# Samples

Samples are being stored in a separate repo: [openurl\-link\-resolver\-response\-samples](https://github.com/NYULibraries/openurl-link-resolver-response-samples).

## Test cases

Google Drive folder: [GetIt Replacement > Test Cases](https://drive.google.com/drive/folders/14HRMxGBCGT7k6xLy8YgFmo7f4CvUNshR)

monday.com ticket: [Compile sample OpenURLs to test functionality in Resolve](https://nyu-lib.monday.com/boards/765008773/pulses/3386767625)

