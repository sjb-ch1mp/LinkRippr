[![LinkRippr](https://github.com/sjb-ch1mp/LinkRippr/blob/master/img/readme-banner.png)](https://github.com/sjb-ch1mp/LinkRippr/blob/master/README.md)
> **`CTRL+F` with a scalpel.**

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

**[ATTRIBUTION](#attribution)**

**[CHANGE LOG](#change-log)**  

# Summary
LinkRippr is a static analysis tool for HTML files. It was made for cyber security analysts to use during investigations that involve HTML files, such as credential harvesting websites or phishing email attachments. 

LinkRippr searches an HTML file for artifacts of interest, as defined by the analyst, such as elements and attribute names, and uses regex to search for javaScriptSignatures in `<script>` and `<style>` blocks. LinkRippr will then output a simple summary of any artifacts of interest that were detected in the file.

While LinkRippr is limited in many respects when compared with more robust dynamic analysis solutions, it can serve as a first step in the analysis process by quickly identifying those files that require closer examination due to the presence of suspicious artifacts.  As the analyst becomes aware of new methods used by malicious actors, they can create javaScriptSignatures that detect them specifically.

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
|Attempt Simple Deobfuscation|LinkRippr will attempt to deobfuscate simple JavaScript methods that are commonly used to hide malicious content in a HTML file. This is a very limited feature and is not able to evaluate complex JavaScript obfuscation techniques. An example of a successful deobfuscation is shown below.|ON|
|Extract Conditional HTML|LinkRippr will check comments, denoted in HTML by the marker `<!`, for [conditional comments](https://en.wikipedia.org/wiki/Conditional_comment), and include any that are detected (and are not empty) in the summary. An example is shown below, as detected in the [W3 - Learn HTML](https://www.w3schools.com/html/default.asp) page.|ON|
|Debug Mode|This mode will dump all the tokens generated by the [DOM Parser](https://github.com/sjb-ch1mp/LinkRippr/blob/master/js/dom_parser.js) to the summary panel. This option is used to debug the tokenizer and parser.|OFF|

**Example of Successful Simple Deobfuscation:**
```
| < DEOBFUSCATION: document-write-unescape />
|====================================================================================================
| 001 | (FORM : method) POST
| 001 | (FORM : action) https://evilserver.net/evilscript.php
| 001 | (FORM -> INPUT : type) text
| 001 | (FORM -> INPUT : name) email
| 001 | (FORM -> INPUT : type) text
| 001 | (FORM -> INPUT : name) password
|----------------------------------------------------------------------------------------------------
| 002 | (SIGNATURE : eval) eval("alert('test successful')");
|----------------------------------------------------------------------------------------------------
```

**Example of Conditional HTML detection:**
```
| < CONDITIONAL HTML : hidden />
|====================================================================================================
| 001 | [if lt IE 9]
| 001 | <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script><script s...
|----------------------------------------------------------------------------------------------------
```

### Saving and Loading Settings
You can save your current settings, including all HTML, JavaScript and CSS javaScriptSignatures into a text file. This can then be loaded the next time the you launch LinkRippr so that you don't need to manually enter each signature. This feature is located in the _SETTINGS_ panel under `< Save />`.

## HTML Signatures
LinkRippr will search an HTML file for element:attribute combinations and return the associated values, i.e. `<element attribute='values'>`. The simple syntax defined below also allows LinkRippr to be aware of element nesting, to a maximum depth of 1, e.g. `<outer-element><inner-element></inner-element></outer-element>`.

The HTML artifacts that LinkRippr is searching for can be found in the _HTML_ panel, under `< HTML javaScriptSignatures />`. If you accidentally delete an HTML signature, you can click the 'RESET DEFAULTS' button to restore the HTML javaScriptSignatures to the default list. If you do not want LinkRippr to include any detections of HTML javaScriptSignatures in the summary, you can click the 'CLEAR EXTRACTIONS' button to clear the list.
### Syntax
HTML javaScriptSignatures are defined in two parts, the **ELEMENT** and the **ATTRIBUTES**. The **ELEMENT** is the name of the element you wish to search for, and the **ATTRIBUTES** are the attributes within that element that you wish to search for.

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
LinkRippr comes with some default HTML javaScriptSignatures defined in the _HTML_ panel. These are just a number of common tactics that I have come across during phishing investigations that are helpful in detecting malicious activity.

|Element|Attribute|Justification|
|---|---|---|
|base|href|The `<base>` element specifies the base URL to use for all relative URLs in a document (see [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base)). This can be used to hide the true domain of URLs in a HTML file. For example, a HTML file might look like: `<html><base href="http://evil.com/"><!--...lots of other HTML rubbish...--><p>Please <a href="outlook.live.com/owa/">sign into Outlook Live</a> to confirm your identity</p></html>`. If an analyst was to eyeball the href attribute in the `<a>` element of that HTML file, they might be forgiven for thinking that the link leads to a legitimate domain, when in fact the true URL resolves to hxxp://evil.com/outlook.live.com/owa/.|
|a|href|This simply pulls out the URL of every hyperlink in the HTML file. While this can be extremely noisy for legitimate websites due to the high volume of `<a>` elements, there are some viable use cases. For example, it is easier to spot unusual URLs when they are presented in a single list. Additionally, I have come across cases of scam websites masquerading as news outlets that have a very large DOM with what appear to be hundreds of hyperlinks. When run through LinkRippr, however, it becomes apparent that every hyperlink is pointing at a single URL.|
|iframe|href,data-src,src|The `<iframe>` element allows content from another source to be embedded within a website (see [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)). Actors can be quite creative with their use of `<iframe>` elements, so extracting the URL for the source of the iframe content can be useful in determining where to look next as part of an investigation.|
|script|src|The src attribute of `<script>` elements identifies the URL for JavaScript that is being loaded when the website resolves. While malicious actors tend to include their JavaScript within the HTML file itself, identifying unusual sources of JavaScript may be useful.|
|form|method,action,data-bind,[input:name,type]|The `<form>` element frequently appears in credential harvesting sites that are masquerading as legitimate login pages for web services. The method attribute defines how the data will be submitted to the web server when the user presses 'Submit', and is most often set to "POST". The action attribute defines the destination of the data. You will often come across `<form>` elements that have an action attribute pointing to a remote server that is collecting the credentials. It is also useful to extract nested `<input>` elements from forms as they often have names such as 'username' or 'password', which will stand out as potential phishing.|
|meta|http-equiv|This combination can yield a high-number of false positives, however it has one important use case. Some phishers will include a meta Element that causes the browser to automatically refresh to a malicious URL, either taking the user to a malicious web site, or downloading a malicious file. This can be defined in the following way: `<meta http-equiv="Refresh" content="http://evil.com/bad-file.zip">`. While it is useful to also extract the content attribute from '<meta>' elements so that the URL in such an instance will be extracted, the vast majority of uses for the content attribute are legitimate, making it too chatty to be included as a default detection.|

### Examples
The following are some examples of the output generated by HTML javaScriptSignatures. I will be using the HTML document located at the [W3 - Learn HTML](https://www.w3schools.com/html/default.asp) page to generate HTML detections.

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
LinkRippr will extract the contents of all `<script>` elements in an HTML file, break them into statements, check them for artifacts of interest defined by JavaScript javaScriptSignatures and include all that are detected in the summary.

The JavaScript artifacts that LinkRippr is searching for can be found in the _JAVASCRIPT_ panel, under `< JavaScript Signatures />`. If you accidentally delete a JavaScript signature, you can click the 'RESET DEFAULTS' button to restore the JavaScript javaScriptSignatures to the default list. If you do not want LinkRippr to include any detections of JavaScript javaScriptSignatures in the summary, you can click the 'CLEAR EXTRACTIONS' button to clear the list.  
### Syntax
LinkRippr uses regex to define Javascript javaScriptSignatures. If you are unfamiliar with regex, there are many free resources available on the internet to learn (here's a good one to get you started: [RegexOne](https://regexone.com/)). Each JavaScript signature must have a unique identifier.  

#### Hints and Gotchas
##### Signature and Name Uniqueness
Any given JavaScript signature name must be unique. Additionally, any given JavaScript signature (i.e. the Signature regex) must be unique as well.

##### Signature Terminators
When LinkRippr detects a JavaScript signature in a `<script>` element, it will extract the portion of the script block in one of the following two ways: 

* If the statement in which the detection occurs is less than or equal to 100 characters long, the whole statement will be added to the summary. 
* Otherwise, LinkRippr will extract the portion of the statement that consists of the string of **least length** that satisfies the signature. 

In short, this means that you should be aware of how a signature 'terminates'. For example, just say you wish to extract URLs from the following `<script>` element... 
```
<script>
//lots of JavaScript nonsense...
let veryVeryVeryLongMaliciousURL = "http://evil.com/i-love-passwords/give-me-your-passwords/all-your-passwords-are-belong-to-me/yummy.php";
let maliciousURL = "http://more-evil.com/i-love-passwords/yummy.php";
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
| 002 | let maliciousURL = "http://more-evil.com/i-love-passwords/yummy.php";
```
This is because the first URL is longer than 100 characters, so the string of **least length** that satisfies the regex is extracted (which in this case is "http://").

In order to make good javaScriptSignatures, you should pay attention to the way in which the signature you're searching for terminates. In JavaScript, an unobfuscated URL is most likely to be written as a string and strings in JavaScript terminate with either a single or double quote character. A better definition for a JavaScript signature that detects URLs would therefore terminate with a single or double quote character.

For example, in the same `<script>` element, the following JavaScript signature...

|Name|Signature|
|---|---|
|urls|http(s)?:\\/\\/.*"|

...would produce the following output:
```
| < JAVASCRIPT SIGNATURE: urls />
|====================================================================================================
| 001 | http://evil.com/i-love-passwords/give-me-your-passwords/all-your-passwords-are-belong-to-...
| 002 | let maliciousURL = "http://more-evil.com/i-love-passwords/yummy.php";
```
This is because the double quote character at the end of the JavaScript signature ensures that the string of **least length** that satisfies the regex is the entire URL.

### Defaults
LinkRippr comes with some default JavaScript javaScriptSignatures defined in the _JAVASCRIPT_ panel. These are just a number of common tactics that I have come across during phishing investigations that are helpful in detecting malicious activity.

|Name|Signature|Justification|
|---|---|---|
|document.write|document\\.write\\(.*\\)\[;\\s]|Often, malicious HTML files will contain content that is obfuscated in `<script>` using complex algorithms. This enables the content to avoid detection by static analysis and the content of the file will only be revealed once it is rendered by a browser. Fortunately, in order to render, the obfuscated content **must** be written to the document at some point. While there are often legitimate uses for the document.write() method, it is useful to detect upon because its presence may suggest that the file has something to hide.|
|eval|eval\\(.*\\)\[;\\s]|The [eval()](https://www.w3schools.com/jsref/jsref_eval.asp) method can be used to evaluate or execute expressions that are passed as a string. This method is commonly used in malicious HTML files to obfuscate the purpose of JavaScript inside a `<script>` element.|
|atob|atob\\(.*\\)\[;\\s]|The [atob()](https://www.w3schools.com/jsref/met_win_atob.asp) method decodes a base64 string and is often used in obfuscation of malicious JavaScript. |
|unescape|unescape\\(.*\\)\[;\\s]|The [unescape()](https://www.w3schools.com/jsref/jsref_unescape.asp) method decodes a URL encoded string and is often used in obfuscation of malicious JavaScript.|
|url|http(s)?:\\/\\/\[a-zA-Z\\-]+\\..*\[;\\s"']|Any URLs in `<script>` elements may be of interest to a cyber security analyst; possibly revealing the source or destination of data.|
|ip-4|(25\[0-5]&verbar;2\[0-4]\[0-9]&verbar;\[01]?\[0-9]\[0-9]?)\\.(25\[0-5]&verbar;2\[0-4]\[0-9]&verbar;\[01]?\[0-9]\[0-9]?)\\.(25\[0-5]&verbar;2\[0-4]\[0-9]&verbar;\[01]?\[0-9]\[0-9]?)\\.(25\[0-5]&verbar;2\[0-4]\[0-9]&verbar;\[01]?\[0-9]\[0-9]?)\['";\\s]|Any IPs in `<script>` elements may be of interest to a cyber security analyst in a similar way to URLs. Regex adapted from [w3resource](https://www.w3resource.com/javascript/form/ip-address-validation.php).|
|ajax-request|\\$\\.ajax\\(\\{.*type:\\s?\['"](POST&verbar;GET)\['"].\*\\}\\)|Some credential harvesting frameworks utilise Ajax methods to post harvested credentials to the collecting server, and the destination URL will not appear in the `action` attribute of the `<form>` element, or else a fake one will be used. It is therefore useful to detect data being posted using an Ajax request, as this may reveal the destination of the data.|
|jquery-request|\\$\\.(post&verbar;get)\\(.\*\\);|This is a variant of the ajax-request signature.|
|xml-http-request|new XMLHttpRequest\\(\\)|The [XMLHttpRequest](https://www.w3schools.com/js/js_ajax_http.asp) object can be used to send and receive data with a web server. It could prove useful to know when a web page is doing so.|
### Examples
The following are some examples of the output generated by JavaScript javaScriptSignatures. I will be using the HTML document located at the [W3 - Learn HTML](https://www.w3schools.com/html/default.asp) page to generate JavaScript detections.

#### Example 1: Detect any variable declarations
**JavaScript Signature**

|Name|Signature|
|---|---|
|decl-variable|(var&verbar;let)\\s\[a-zA-Z0-9_]+\\s?=.\*;|

**Output**
```
| < JAVASCRIPT SIGNATURE: decl-variable />
|====================================================================================================
| 001 | var k42 = false;
| 002 | var folder = location.pathname;
| 003 | var snhb = snhb {};
| 004 | var stickyadstatus = "";
| 005 | var elem = document.getElementById("stickyadcontainer");
| 006 | var skyWidth = Number(w3_getStyleValue(document.getElementById("skyscraper"), "width").re...
| 007 | var skyWidth = Number(w3_getStyleValue(document.getElementById("right"), "width").replace...
| 008 | var stickypos = document.getElementById("stickypos").offsetTop;
| 009 | var docTop = window.pageYOffset document.documentElement.scrollTop document.body.scroll...
| 010 | var adHeight = Number(w3_getStyleValue(elem, "height").replace("px", ""));
| 011 | var ingr="Check this page:";
| 012 | var xhttp = new XMLHttpRequest();
| 013 | var a = document.getElementById("mypagediv");
| 014 | var b = document.getElementById("w3loginbtn");
| 015 | var mp_pagesread = 0, mp_totalpages = 0;
| 016 | var a = document.getElementById("w3loginbtn");
| 017 | var b = document.getElementById("mypagediv");
| 018 | var c = document.getElementById("mypagediv2");
| 019 | var a = document.getElementById("mypagediv2");
| 020 | var rect = x.getBoundingClientRect();
```
#### Example 2: Detect any function declarations
**JavaScript Signature**

|Name|Signature|
|---|---|
|decl-function|function\\s\[a-zA-Z0-9_]+\\s?\\(.\*\\)|

**Output**
```
| < JAVASCRIPT SIGNATURE: decl-function />
|====================================================================================================
| 001 | function fix_stickyad()
| 002 | function w3_getStyleValue(elmnt,style)
| 003 | function loadUser()
| 004 | function finishedPage()
| 005 | function activateElse()
| 006 | function activateMYPAGE(cc, obj)
| 007 | function checkIfMypage2IsInView()
| 008 | function isinviewport(x)
| 009 | function isaboveviewport(x)
| 010 | function registerPoint(cc)
```
## CSS Signatures
LinkRippr will extract the contents of all `<style>` elements in an HTML file, break them into rule sets, check them for artifacts of interest defined by CSS javaScriptSignatures and include all that are detected in the summary.

The CSS artifacts that LinkRippr is searching for can be found in the _CSS_ panel, under `< CSS Signatures />`. If you accidentally delete a CSS signature, you can click the 'RESET DEFAULTS' button to restore the CSS javaScriptSignatures to the default list. If you do not want LinkRippr to include any detections of CSS javaScriptSignatures in the summary, you can click the 'CLEAR EXTRACTIONS' button to clear the list. 
### Syntax
CSS javaScriptSignatures are defined by the three components that make up CSS rule sets: **SELECTOR**, **PROPERTY**, and **VALUE**, i.e. `selector{property:value;}` Each component of the CSS signature gets its own regex, and each component of the CSS signature must match each component of the CSS rule set in order to be extracted. That is to say, that the regex in the **SELECTOR** field must match the `selector` in the CSS rule set, that in the  **PROPERTY** field must match the `property` in the CSS rule set, and that in the **VALUE** field must match the `value` in the rule set. Only then will the rule set be included in the summary. 

For example, if you were to search the following `<style>` element...

```
<style>
...Lots of CSS rubbish...
.sneaky{
	src:url('https://totally-legitimate-server.cc/nothing-to-see-here.png')
}
...Lots more CSS rubbish...
</style>
```

...with the following CSS Signature...

|Name|Selector|Property|Value|
|---|---|---|---|
|url-functions|\\.dodgy|.\*|url\\(.*\\)|

...LinkRippr would not find anything. If you are interested in any rule set that is utilising the url() function, you should put 'anything' regex in the Selector and Property fields, e.g.

|Name|Selector|Property|Value|
|---|---|---|---|
|url-functions|.\*|.\*|url\\(.*\\)|

The results would then look something like: 
```
| < CSS SIGNATURE: url-function />
|====================================================================================================
| 001 | .sneaky { src : url('https://totally-legitimate-server.cc/nothing-to-see-here.png'); }
```

#### Hints and Gotchas
##### Signature and Name Uniqueness
Any given name of a CSS signature must be unique. Additionally, any given CSS signature (i.e. Selector, Property and Value regex combination) must be unique as well.

##### Conditional Rules Not Searchable
[Conditional Rules](https://www.w3.org/TR/css3-conditional/) such as media queries (`@media`) are not searchable. LinkRippr will simply detect the presence of a conditional rule, 'unwrap' all rule sets from within it and prepend them with the applicable condition.

##### Automatic Wild Cards
If you leave a field blank when creating a new CSS signature (except the name field, of course) - all other fields will be automatically filled in with the regex value `.*`.

##### Style Attributes
LinkRippr will also search for CSS javaScriptSignatures in `style` attributes of all HTML elements in the HTML file. When extracting rule sets from an HTML element, the element name is considered to be the selector. 

For example, if you were to search the HTML file at [W3 - Learn HTML](https://www.w3schools.com/html/default.asp) using the following signature...

|Name|Selector|Property|Value|
|---|---|---|---|
|img|img|.\*|.\*|

...you would get the following results: 

```
| < CSS SIGNATURE: img />
|====================================================================================================
| 001 | #google_translate_element img { margin-bottom : -1px; }
| 002 | @media (max-width:600px) { .top img { display : block; } }
| 003 | @media (max-width:600px) { .top img { margin : auto; } }
| 004 | < img /> { width : 150px; }
| 005 | < img /> { height : 28px; }
| 006 | < img /> { border : 0; }
```
Note that when a CSS signature is detected in an HTML element, the selector in the summary is enclosed in pseudo-element brackets, i.e. `< selector />`.  

### Defaults
I have not come across any malicious uses of `<style>` elements myself, but I have heard of very clever uses of CSS for malicious purposes (see this [Security Boulevard article](https://securityboulevard.com/2020/11/css-js-steganography-in-fake-flash-player-update-malware/)). Nonetheless, I figured, what-the-hell, better to have a little extra capability in case the threat landscape changes. As such, LinkRippr only has a single default CSS signature.

|Name|Selector|Property|Value|Justification|
|---|---|---|---|---|
|external-resource|.\*|.\*|url\\(\['"]http.\*\\)|I don't really have a strong justification for this one, except to say that I'd like to be informed of all the sources of data being used to render a HTML file in browser.|

### Examples
The following are some examples of the output generated by CSS javaScriptSignatures. I will be using the HTML document located at the [W3 - Learn HTML](https://www.w3schools.com/html/default.asp) page to generate CSS detections.

#### Example 1: Find all uses of CSS functions

**CSS Signature**
|Name|Selector|Property|Value|
|---|---|---|---|
|all-functions|.\*|.\*|\[a-zA-Z]+\\(.*\\)|

**Output**
```
| < CSS SIGNATURE: all-functions />
|====================================================================================================
| 001 | @keyframes example { 0% { transform : rotate(0deg); } }
| 002 | @keyframes example { 100% { transform : rotate(360deg); } }
| 003 | @keyframes tutpoint { 1% { background-color : rgba(76, 175, 80, 1); } }
| 004 | @keyframes tutpoint { 29% { background-color : rgba(76, 175, 80, 1); } }
| 005 | @keyframes quizpoint { 1% { background-color : rgba(44, 156, 202, 1); } }
| 006 | @keyframes quizpoint { 29% { background-color : rgba(44, 156, 202, 1); } }
| 007 | .w3-example { box-shadow : 0 2px 4px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)!imp...
| 008 | .w3-example a:focus,.nextprev a:focus { box-shadow : 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px ...
| 009 | @media (max-width:992px) { #sidenav { box-shadow : 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px ...
| 010 | @font-face { src : url('../lib/fonts/fontawesome.eot?14663396#iefix') format('embedded-op...
| 011 | .fa { transform : translate(0, 0); }
| 012 | .darktheme .w3-example.w3-light-grey { background-color : rgb(40,44,52)!important; }
| 013 | a.btnplayit:hover { box-shadow : 0 4px 8px 0 rgba(0,0,0,0.2); }
| 014 | a.btnsmall:hover { box-shadow : 0 4px 8px 0 rgba(0,0,0,0.2); }
| 015 | .darktheme .w3-code { background-color : rgb(40,44,52); }
| 016 | .darktheme .w3-code { border-left-color : rgb(40,44,52); }
| 017 | .darktheme .w3-codeline { background-color : rgb(40,44,52); }
| 018 | .darktheme .w3-codeline { border-left-color : rgb(40,44,52); }
| 019 | .darktheme .w3-example pre { background-color : rgb(40,44,52)!important; }
| 020 | .darktheme .w3-example pre { border-left-color : rgb(40,44,52); }
```

#### Example 2: Find all `!important` property values in selectors that contain `w3`

**CSS Signature**
|Name|Selector|Property|Value|
|---|---|---|---|
|important-w3-values|w3|.\*|!important|

**Output**
```
| < CSS SIGNATURE: important-w3-values />
|====================================================================================================
| 001 | .topnav .w3-bar a:hover,.topnav .w3-bar a:focus { background-color : #000000 !important; }
| 002 | .topnav .w3-bar a:hover,.topnav .w3-bar a:focus { color : #ffffff !important; }
| 003 | .w3-example { box-shadow : 0 2px 4px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)!imp...
| 004 | .w3-theme { color : #fff !important; }
| 005 | .w3-theme { background-color : #4CAF50 !important; }
| 006 | .w3-theme-border { border-color : #4CAF50 !important; }
| 007 | .darktheme .w3-example.w3-light-grey { background-color : rgb(40,44,52)!important; }
| 008 | .darktheme .w3-example pre { background-color : rgb(40,44,52)!important; }
| 009 | .sidesection .w3-left-align { text-align : center!important; }
| 010 | .w3-example { box-shadow : none!important; }
| 011 | .w3-btn:hover,.w3-btn:active,.w3-example a:focus,.nextprev a:focus { background-color : #...
| 012 | .w3-btn:hover.w3-blue,.w3-btn:active.w3-blue,.w3-button:hover.w3-blue,.w3-button:active.w...
| 013 | .w3-btn:hover.w3-blue,.w3-btn:active.w3-blue,.w3-button:hover.w3-blue,.w3-button:active.w...
| 014 | .w3-btn:hover.w3-white,.w3-btn:active.w3-white,.w3-button:hover.w3-white,.w3-button:activ...
| 015 | .nextprev .w3-btn:not(.w3-left):not(.w3-right):hover,.nextprev .w3-btn:not(.w3-left):not(...
| 016 | .w3-third .bigbtn { text-decoration : none !important; }
```
# Attribution
The banner for LinkRippr was adapted from an image posted at [wallup.net](https://wallup.net/jack-the-ripper-artwork-fantasy-art-digital-art-dark-top-hat-suits-alleyway/), on 29/05/2017, called "_Jack the Ripper, Artwork, Fantasy art, Digital art, Dark, Top hat, Suits, Alleyway HD Wallpaper_". I am grateful for the artist making the image available, and would like to attribute it to them. Unfortunately, no artist was attributed in the post and I have been unable to track down their name or tag using a reverse image using [TinEye](https://tineye.com).

# Change Log
|Date|Change Type|Applicable to Version|Description|
|---|---|---|---|
|2020-11-24 | BUG | 1.0.1 |Added try-catch clause to StyleBlock.processRuleSets() to catch exceptions caused by malformed CSS rule sets ([#Issue 30](https://github.com/sjb-ch1mp/LinkRippr/issues/30)).|
|2020-11-24 | FEATURE | 1.0.1 | LinkRippr is now checking style attributes of all elements for CSS javaScriptSignatures ([#Issue 23](https://github.com/sjb-ch1mp/LinkRippr/issues/23)).|