[![LinkRippr](https://github.com/sjb-ch1mp/LinkRippr/blob/master/img/banner.png)](https://github.com/sjb-ch1mp/LinkRippr/blob/master/README.md)
> LinkRippr: `CTRL+F` on steroids.
 
[![Creative Commons License](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-nc-sa/4.0/)

### Author 
Samuel Brookes ([@sjb-ch1mp](https://github.com/sjb-ch1mp))

# Summary
LinkRippr is a static analysis tool for HTML files. It was made for cyber security analysts to use during investigations that involve HTML files, such as credential harvesting websites or phishing email attachments. 

LinkRippr searches an HTML file for artifacts of interest, as defined by the analyst, such as element tags and attribute names, or RegExp to search for signatures in `<script>` and `<style>` blocks. LinkRippr will then output a simple summary of any artifacts of interest that were detected in the file.

While LinkRippr is limited in many respects when compared with more robust dynamic analysis solutions, it can serve as a first step in the analysis process by quickly identifying those files that require closer examination due to the presence of suspicious artifacts.  As the analyst becomes aware of new methods used by malicious actors, they can create signatures that detect them.

### Installation
LinkRippr does not require any installation. Simply download the ZIP archive from the [main repository page](https://github.com/sjb-ch1mp/LinkRippr) and extract it onto your local workstation. LinkRippr can then be launched by opening the LinkRippr.html file in a web browser.

### Bug Reporting
If LinkRippr encounters an error, the error message will be announced in the **chatter box**, and the stack trace will be dumped to the summary panel. If you encounter any bugs or errors while using LinkRippr, please feel free to add them as an issue in the [LinkRippr repository](https://github.com/sjb-ch1mp/LinkRippr/issues). 

My preference is that you use the error message as the issue title and paste the stack trace in the comment section. It would also be helpful if you could add the URL to the website that was being analyzed when the error occurred, if possible.

# User Guide
### Submitting an HTML file
HTML files can be submitted to LinkRippr by uploading the file in the _SETTINGS_ panel, under `< Analyze />`, or can be dragged and dropped into the browser. When submitting a HTML document using the drag-and-drop method, however, you must ensure that LinkRippr has detected the file prior to dropping it so that it doesn't render. LinkRippr will inform you that it is ready to receive the sample by announcing in the top panel (the **chatter box**) the following: 
> File detected. Bombs away!

### User Options
User options are located in the _SETTINGS_ panel under `< Options />`. There currently exists four options that can be toggled on or off.

|Option|Description|Default Setting|
|---|---|---|
|Truncate Output|Any lines in the summary that are greater than 100 characters long will be truncated to 97 characters plus '...'. This option simply makes the output more readable.|ON|
|Attempt Simple Deobfuscation|LinkRippr will attempt to deobfuscate simple JavaScript methods that are commonly used to hide malicious content in a HTML file.|ON|
|Extract Conditional HTML|LinkRippr will check comments, denoted in HTML by the tag `<!`, for [conditional comments](https://en.wikipedia.org/wiki/Conditional_comment), and include any that are detected (and are not empty) in the summary.|ON|
|Debug Mode|This mode will dump all the tokens generated by the [DOM Parser](https://github.com/sjb-ch1mp/LinkRippr/blob/master/js/dom_parser.js) to the summary panel. This option is used to debug the tokenizer and parser.|OFF|

### Saving and Loading Settings
You can save your current settings, including all HTML, JavaScript and CSS signatures into a text file. This can then be loaded the next time the you launch LinkRippr so that you don't need to manually enter each signature. This feature is located in the _SETTINGS_ panel under `< Save />`.

## HTML Detections
LinkRippr will search an HTML file for element:attribute combinations and return the associated values, i.e. `<element attribute='values'>`. The simple syntax defined below also allows LinkRippr to be aware of element nesting, to a maximum depth of 1, e.g. `<outer-element><inner-element></inner-element></outer-element>`.

The HTML artifacts that LinkRippr is searching for can be found in the _HTML_ panel, under `< HTML Detections />`. If you accidentally delete an HTML detections, you can click the 'RESET DEFAULTS' button to restore the HTML detections to the default list. If you do not want LinkRippr to include any HTML detections in the summary, you can click the 'CLEAR EXTRACTIONS' button to clear the list.
### Syntax
HTML detections are defined in two parts, the **TAG** and the **ATTRIBUTES**. The **TAG** is the name of the element you wish to search for, and the **ATTRIBUTES** are the attributes within that element that you wish to search for.

#### Tags
Tags are simple; they are just the name of the element that you wish to search for.

#### Attributes
Multiple attributes can be included for a given element; these are written as comma-delimited values:

|Tag|Attribute|
|---|---|
|tag|attribute-1,attribute-2,...,attribute-n|

Nested elements are treated as pseudo-attributes of the primary element. These can be defined by enclosing the tag:attribute-list combination within brackets:

|Tag|Attribute|
|---|---|
|outer-tag|outer-attribute-1,[inner-tag:inner-attribute-1,...,inner-attribute-n],...,outer-attribute-n|

#### Some Rules

##### Tag Uniqueness
The tag column must be a unique value, for example, the following definition is not allowed: 

|Tag|Attributes|
|----|----|
|div|id|
|div|name|

This is **incorrect**, but the same end goal can be achieved using the following definition:

|Tag|Attributes|
|----|----|
|div|id,name|

> This may change in the near term (see [Issue #26](https://github.com/sjb-ch1mp/LinkRippr/issues/26))

### Defaults
### Examples

## JavaScript Detections
### Syntax
### Defaults
### Examples

## CSS Detections
### Syntax
### Defaults
### Examples