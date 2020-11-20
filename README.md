<img src="https://github.com/sjb-ch1mp/LinkRippr/blob/master/img/banner.png">

Author:

sjb-ch1mp

Description:
LinkRippr is a static analysis tool for HTML documents for infosec professionals. It has two main
features:

    1. Extracting elements and attributes of interest from HTML.
    2. Detecting signatures of interest in JavaScript blocks.

DOM Extractions:

Element and attribute extractions can be defined in the 'DOM Extractions' panel by typing the element
name in the TAG column and any attributes of interest in the ATTRIBUTES column. If you wish to extract
all attributes when LinkRippr finds a named element, you can use '*' in the ATTRIBUTES column.

LinkRippr can also extract 'nested' elements, for example, <input> elements inside a <form> element such as:

    <form method="POST" action="hxxp://evildomain[.]com/badscript.php">
        <input type="text" name="username">
        <input type="text" name="password">
    </form>

In such a case, you can use LinkRippr's simple syntax to define 'nested' element extractions in the DOM Extraction
panel. To extract the 'nested' <input> elements from the <form> element above, you would type:

    "method,action,[input:type,name]"

This would extract the "method" and "action" attributes for any <form> element found, AS WELL AS any <input>
elements within that <form> and the "type" and "name" attributes for the nested <input> elements.

Script Signatures:

Signatures are defined using regular expressions. LinkRippr splits script blocks into clean statements and then
searches each statement for matches against each signature defined in the Script Signatures panel. If found, the
matching text will be extracted from the script block and added to the summary output.