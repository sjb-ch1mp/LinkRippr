[![LinkRippr](https://github.com/sjb-ch1mp/LinkRippr/blob/readme/img/readme-banner.png)](https://github.com/sjb-ch1mp/LinkRippr/blob/master/README.md)
> **`CTRL+F` on steroids.**
 
[![Creative Commons License](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-nc-sa/4.0/)

### Author 
Samuel Brookes ([@sjb-ch1mp](https://github.com/sjb-ch1mp))

# Contents

**[SUMMARY](#summary)**
 
> _[Installation](#installation)_ > _[Bug Reporting](#bug-reporting)_

**[USER GUIDE](#user-guide)** 
> _[Submitting an HTML file](#submitting-an-html-file)_ > _[User options](#user-options)_ > _[Saving and loading settings](#saving-and-loading-settings)_
>
> **[HTML SIGNATURES](#html-signatures)**
> 
> > _[Syntax](#syntax)_ > _[Defaults](#defaults)_ > _[Examples](#examples)_ 
>
> **[JAVASCRIPT SIGNATURES](#javascript-signatures)**
> 
> > _[Syntax](#syntax-1)_ > _[Defaults](#defaults-1)_ > _[Examples](#examples-1)_
>
> **[CSS SIGNATURES](#css-signatures)**
> 
> > _[Syntax](#syntax-2)_ > _[Defaults](#defaults-2)_ > _[Examples](#examples-2)_

# Summary
LinkRippr is a static analysis tool for HTML files. It was made for cyber security analysts to use during investigations that involve HTML files, such as credential harvesting websites or phishing email attachments. 

LinkRippr searches an HTML file for artifacts of interest, as defined by the analyst, such as elements and attribute names, and uses regex to search for signatures in `<script>` and `<style>` blocks. LinkRippr will then output a simple summary of any artifacts of interest that were detected in the file.

While LinkRippr is limited in many respects when compared with more robust dynamic analysis solutions, it can serve as a first step in the analysis process by quickly identifying those files that require closer examination due to the presence of suspicious artifacts.  As the analyst becomes aware of new methods used by malicious actors, they can create signatures that detect them specifically.

### Installation
LinkRippr does not require any installation. Simply download the ZIP archive from the [main repository page](https://github.com/sjb-ch1mp/LinkRippr) and extract it onto your local workstation. LinkRippr can then be launched by opening the `LinkRippr.html` file in a web browser.

### Bug Reporting
If LinkRippr encounters an error, the error message will be announced in the top banner (the **chatter box**), and the stack trace will be dumped to the summary panel. If you encounter any bugs or errors while using LinkRippr, please feel free to add them as an issue in the [LinkRippr repository](https://github.com/sjb-ch1mp/LinkRippr/issues). 

My preference is that you use the error message as the issue title and paste the stack trace in the comment section. It would also be helpful if you could add the URL to the website that was being analyzed when the error occurred, if possible.

Alternatively, if you have come across any common tactics or methods used by phishers that you think would make a good addition to the default detections, please feel free to submit your idea/s as an issue as well.

# User Guide
### Submitting an HTML file
HTML files can be submitted to LinkRippr by uploading the file in the _SETTINGS_ panel, under `< Analyze />`, or can be dragged and dropped into the browser. When submitting an HTML document using the drag-and-drop method you must ensure that LinkRippr has detected the file prior to dropping it so that it doesn't render. LinkRippr will inform you that it is ready to receive the sample by announcing in the **chatter box** the following:
 
> File detected. Bombs away!

If you wish to make changes to the settings and analyze the same HTML file again, you can click the 'Redo' button that appears at the top of the results to re-analyze the same HTML file. 

### User Options
User options are located in the _SETTINGS_ panel under `< Options />`. There currently exists four options that can be toggled on or off.

|Option|Description|Default Setting|
|---|---|---|
|Truncate Output|Any lines in the summary that are greater than 100 characters long will be truncated to 97 characters plus '...'. This option simply makes the output more readable.|ON|
|Attempt Simple Deobfuscation|LinkRippr will attempt to deobfuscate simple JavaScript methods that are commonly used to hide malicious content in a HTML file. This is a very limited feature and is not able to evaluate complex JavaScript obfuscation techniques.|ON|
|Extract Conditional HTML|LinkRippr will check comments, denoted in HTML by the marker `<!`, for [conditional comments](https://en.wikipedia.org/wiki/Conditional_comment), and include any that are detected (and are not empty) in the summary. An example is shown below, as detected in the [W3 - Learn HTML](https://www.w3schools.com/html/default.asp) page.|ON|
|Debug Mode|This mode will dump all the tokens generated by the [DOM Parser](https://github.com/sjb-ch1mp/LinkRippr/blob/master/js/dom_parser.js) to the summary panel. This option is used to debug the tokenizer and parser.|OFF|

**Example of Conditional HTML detection:**
```
| < CONDITIONAL HTML : hidden />
|====================================================================================================
| 001 | [if lt IE 9]
| 001 | <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script><script s...
|----------------------------------------------------------------------------------------------------
```

### Saving and Loading Settings
You can save your current settings, including all HTML, JavaScript and CSS signatures into a text file. This can then be loaded the next time the you launch LinkRippr so that you don't need to manually enter each signature. This feature is located in the _SETTINGS_ panel under `< Save />`.

## HTML Signatures
LinkRippr will search an HTML file for element:attribute combinations and return the associated values, i.e. `<element attribute='values'>`. The simple syntax defined below also allows LinkRippr to be aware of element nesting, to a maximum depth of 1, e.g. `<outer-element><inner-element></inner-element></outer-element>`.

The HTML artifacts that LinkRippr is searching for can be found in the _HTML_ panel, under `< HTML signatures />`. If you accidentally delete an HTML signature, you can click the 'RESET DEFAULTS' button to restore the HTML signatures to the default list. If you do not want LinkRippr to include any detections of HTML signatures in the summary, you can click the 'CLEAR EXTRACTIONS' button to clear the list.
### Syntax
HTML signatures are defined in two parts, the **ELEMENT** and the **ATTRIBUTES**. The **ELEMENT** is the name of the element you wish to search for, and the **ATTRIBUTES** are the attributes within that element that you wish to search for.

#### Elements
Elements are simple; they are just the name of the element that you wish to search for.

#### Attributes
Multiple attributes can be included for a given element; these are written as comma-delimited values:

|Element|Attribute|
|---|---|
|element|attribute-1,attribute-2,...,attribute-n|

Nested elements are treated as pseudo-attributes of the primary element. These can be defined by enclosing the element:attribute-list combination within brackets:

|Element|Attribute|
|---|---|
|outer-element|outer-attribute-1,[inner-element:inner-attribute-1,...,inner-attribute-n],...,outer-attribute-n|

#### Hints and Gotchas

##### Element Uniqueness
The Element column must be a unique value, for example, the following definition is not allowed: 

|Element|Attributes|
|----|----|
|div|id|
|div|name|

This is **incorrect**, but the same end goal can be achieved using the following definition:

|Element|Attributes|
|----|----|
|div|id,name|

##### Wildcards
LinkRippr supports wildcards for attributes, denoted by an asterisk (`*`). This will extract the values of all attributes of the given element, or nested element.

|Element|Attribute|Result|
|---|---|---|
|div|*|This will extract the values of all attributes in every `<div>` element|
|div|[a:*]|This will extract the values of all attributes of every `<a>` element that appears within a `<div>` element|

Wildcards are currently not supported for elements, but this may change in the near term (see [Issue #26](https://github.com/sjb-ch1mp/LinkRippr/issues/26)). 

##### Elements Without Attributes
LinkRippr depends upon elements having attributes and is unable to extract elements that have none, e.g. `<br>`. You are therefore unable to define an HTML signature without any attributes.

### Defaults
LinkRippr comes with some default HTML signatures defined in the _HTML_ panel. These are just a number of common tactics that I have come across during phishing investigations that are helpful in detecting malicious activity.

|Element|Attribute|Justification|
|---|---|---|
|base|href|The `<base>` element specifies the base URL to use for all relative URLs in a document (see [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base)). This can be used to hide the true domain of URLs in a HTML file. For example, a HTML file might look like: `<html><base href="http://evil.com/"><!--...lots of other HTML rubbish...--><p>Please <a href="outlook.live.com/owa/">sign into Outlook Live</a> to confirm your identity</p></html>`. If an analyst was to eyeball the href attribute in the `<a>` element of that HTML file, they might be forgiven for thinking that the link leads to a legitimate domain, when in fact the true URL resolves to hxxp://evil.com/outlook.live.com/owa/.|
|a|href|This simply pulls out the URL of every hyperlink in the HTML file. While this can be extremely noisy for legitimate websites due to the high volume of `<a>` elements, there are some viable use cases. For example, it is easier to spot unusual URLs when they are presented in a single list. Additionally, I have come across cases of scam websites masquerading as news outlets that have a very large DOM with what appear to be hundreds of hyperlinks. When run through LinkRippr, however, it becomes apparent that every hyperlink is pointing at a single URL.|
|iframe|href,data-src,src|The `<iframe>` element allows content from another source to be embedded within a website (see [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)). Actors can be quite creative with their use of `<iframe>` elements, so extracting the URL for the source of the iframe content can be useful in determining where to look next as part of an investigation.|
|script|src|The src attribute of `<script>` elements identifies the URL for JavaScript that is being loaded when the website resolves. While malicious actors tend to include their JavaScript within the HTML file itself, identifying unusual sources of JavaScript may be useful.|
|form|method,action,data-bind,[input:name,type]|The `<form>` element frequently appears in credential harvesting sites that are masquerading as legitimate login pages for web services. The method attribute defines how the data will be submitted to the web server when the user presses 'Submit', and is most often set to "POST". The action attribute defines the destination of the data. You will often come across `<form>` elements that have an action attribute pointing to a remote server that is collecting the credentials. It is also useful to extract nested `<input>` elements from forms as they often have names such as 'username' or 'password', which will stand out as potential phishing.|
|meta|http-equiv|This combination can yield a high-number of false positives, however it has one important use case. Some phishers will include a meta Element that causes the browser to automatically refresh to a malicious URL, either taking the user to a malicious web site, or downloading a malicious file. This can be defined in the following way: `<meta http-equiv="Refresh" content="http://evil.com/bad-file.zip">`. While it is useful to also extract the content attribute from '<meta>' elements so that the URL in such an instance will be extracted, the vast majority of uses for the content attribute are legitimate, making it too chatty to be included as a default detection.|

### Examples
The following are some examples of the output generated by HTML signatures. I will be using the HTML document located at the [W3 - Learn HTML](https://www.w3schools.com/html/default.asp) page to generate HTML signatures.

#### Example 1: Detect all `<a>` elements with an `id` or `onclick` attribute
**HTML Signature**

|Element|Attributes|
|---|---|
|a|id,onclick|

**Output**
```
| < A: id,onclick />
|====================================================================================================
| 001 | (id) w3loginbtn
| 001 | (onclick) w3_open_nav("login")
|----------------------------------------------------------------------------------------------------
| 002 | (onclick) open_menu()
|----------------------------------------------------------------------------------------------------
| 003 | (id) topnavbtn_tutorials
| 003 | (onclick) w3_open_nav("tutorials")
|----------------------------------------------------------------------------------------------------
| 004 | (onclick) open_search(this)
|----------------------------------------------------------------------------------------------------
| 005 | (onclick) open_translate(this)
|----------------------------------------------------------------------------------------------------
| 006 | (onclick) changecodetheme(this)
|----------------------------------------------------------------------------------------------------
| 007 | (id) topnavbtn_references
| 007 | (onclick) w3_open_nav("references")
|----------------------------------------------------------------------------------------------------
| 008 | (id) topnavbtn_exercises
| 008 | (onclick) w3_open_nav("exercises")
|----------------------------------------------------------------------------------------------------
| 009 | (onclick) clickFBLike()
|----------------------------------------------------------------------------------------------------
| 010 | (onclick) displayError();return false
|----------------------------------------------------------------------------------------------------
```
#### Example 2: Get the `method` and `action` attributes of all `<form>` elements, as well as all attributes of any nested `<input>` elements
 
**HTML Signature**

|Element|Attributes|
|---|---|
|form|method,action,[input:*]|

**Output**
```
| < FORM: method,action />
| + < INPUT: * />
|====================================================================================================
| 001 | (method) post
| 001 | -> (INPUT 001:type) email
| 001 | -> (INPUT 001:name) n
| 001 | -> (INPUT 001:placeholder) Enter your e-mail address
| 001 | -> (INPUT 001:onfocus) login_inputGetsFocus(this)
| 001 | -> (INPUT 002:type) password
| 001 | -> (INPUT 002:name) p
| 001 | -> (INPUT 002:placeholder) Enter Your Password
| 001 | -> (INPUT 002:onfocus) login_inputGetsFocus(this)
|----------------------------------------------------------------------------------------------------
| 002 | (action) exercise.asp?filename=exercise_html_attributes1
| 002 | (method) post
| 002 | -> (INPUT 001:name) ex1
| 002 | -> (INPUT 001:maxlength) 5
| 002 | -> (INPUT 001:style) width: 54px;
|----------------------------------------------------------------------------------------------------

```

## JavaScript Signatures
LinkRippr will extract the contents of all `<script>` elements in an HTML file, check them for artifacts of interest defined by JavaScript signatures and include all that are detected in the summary.

The JavaScript artifacts that LinkRippr is searching for can be found in the _JAVASCRIPT_ panel, under `< JavaScript Signatures />`. If you accidentally delete a JavaScript signature, you can click the 'RESET DEFAULTS' button to restore the JavaScript signatures to the default list. If you do not want LinkRippr to include any detections of JavaScript signatures in the summary, you can click the 'CLEAR EXTRACTIONS' button to clear the list.  
### Syntax
LinkRippr uses regex to define Javascript signatures. If you are unfamiliar with regex, there are many free resources available on the internet to learn (here's a good one to get you started: [RegexOne](https://regexone.com/)). Each JavaScript signature must have a unique identifier.  

#### Hints and Gotchas
##### Signature Terminators
When LinkRippr detects a JavaScript signature in a `<script>` element, it will extract the portion that consists of the string of **least length** that satisfies the signature. This means that you should be aware of how a signature 'terminates'.

For example, just say you wish to extract URLs from the following `<script>` element... 
```
<script>
//lots of JavaScript nonsense...
let maliciousUrl = "http://evil.com/i-love-passwords/give-me-your-passwords/yummy.php";
//lots more JavaScript nonsense...
</script>
``` 
...and you use the following JavaScript signature...

|Name|Signature|
|---|---|
|urls|http(s)?:\\/\\/.*|

...you will be disappointed with the resulting output: 
```
| < JAVASCRIPT SIGNATURE: urls />
|====================================================================================================
| 001 | http://
```
This is because the string of **least length** that satisfies the regex is the string "http://".

In order to make good signatures, you should pay attention to the way in which the signature you're searching for terminates. In JavaScript, an unobfuscated URL is most likely to be written as a string and strings in JavaScript terminate with either a single or double quote character. A better definition for a JavaScript signature that detects URLs would therefore terminate with a single or double quote character.

For example, in the same `<script>` element, the following JavaScript signature...

|Name|Signature|
|---|---|
|urls|http(s)?:\\/\\/.*"|

...would produce the following output:
```
| < JAVASCRIPT SIGNATURE: urls />
|====================================================================================================
| 001 | http://evil.com/i-love-passwords/give-me-your-passwords/yummy.php"
```
This is because the double quote character at the end of the JavaScript signature ensures that the string of **least length** that satisfies the regex is the entire URL.

### Defaults
LinkRippr comes with some default JavaScript signatures defined in the _JAVASCRIPT_ panel. These are just a number of common tactics that I have come across during phishing investigations that are helpful in detecting malicious activity.

|Name|Signature|Justification|
|---|---|---|
|document.write|document\\.write\\(.*\\)(;&verbar;\\s&verbar;\\n)|Often, malicious HTML files will contain content that is obfuscated in `<script>` using complex algorithms. This enables the content to avoid detection by static analysis and the content of the file will only be revealed once it is rendered by a browser. Fortunately, in order to render, the obfuscated content **must** be written to the document at some point. While there are often legitimate uses for the document.write() method, it is useful to detect upon because its presence may suggest that the file has something to hide.|
|eval|eval\\(.*\\)(;&verbar;\\s&verbar;\\n)|The eval() method |
|atob|atob\\(.*\\)(;&verbar;\\s&verbar;\\n)||
|unescape|unescape\\(.*\\)(;&verbar;\\s&verbar;\\n)||
|url|http(s)?:\\/\\/[a-zA-Z\\-]+\\..*(;&verbar;\\s&verbar;"&verbar;')||
|ip-4|[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}||
|ajax-request|\\$\\.ajax\\(\\{.\*type:\\s?(\\'&verbar;")(POST&verbar;GET)(\\'&verbar;").*\\}\\)||
|xml-http-request|new XMLHttpRequest\\(\\)||
### Examples

## CSS Signatures
### Syntax
### Defaults
### Examples