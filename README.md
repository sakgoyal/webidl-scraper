# webidl-scraper

Scrape IDL definitions from Web standard specs

## Installation

```sh
deno install -g @sakgoyal/webidl-scraper
```

## Usage

```
  webidl-scraper [options] <inputs: URL ...>

  Scrape IDL definitions from Web standard specs.

  Options:

    -h, --help                output usage information
    -V, --version             output the version number
    -o, --output-file <file>  output the scraped IDL to <file> (use - for stdout, the default)
    --with-class-extract      do not ignore <pre class="idl extract" />
    --with-data-no-idl        do not ignore <pre data-no-idl />
    --with-idl-index          do not ignore IDL after id="idl-index"

```

## Examples
Scrape a Web page for IDL fragments:
```sh
webidl-scraper https://html.spec.whatwg.org/
# Output to stdout

webidl-scraper http://dev.w3.org/csswg/cssom/ -o cssom.idl
# Save to cssom.idl

curl -sL http://dev.w3.org/csswg/cssom/ | webidl-scraper - > cssom.idl 
# Use curl for HTTP and redirect stdout to cssom.idl
```
Scrape an HTML file for IDL fragments:
```sh
webidl-scraper html5-spec.html -o html5-spec.idl
```
## Scraping algorithm
These steps are derived experimentally and may change. I have tried to include links to sources and/or motivating examples for all the rules.

1. Get the contents of `<pre class="idl" />`, tags, excluding `class="idl extract"` ([reference #1](http://stackoverflow.com/a/7644380), [#2](https://github.com/tabatkins/bikeshed/blob/master/docs/idl.md#idl-processing)).
2. If the document has an _IDL Index_ section ([example](http://dev.w3.org/csswg/cssom/#idl-index)) - marked by an element with `id="idl-index"` - ignore IDL fragments that follow, on the assumption that they will contain no new IDL.
3. Also ignore tags that have the `data-no-idl` attribute (following [Bikeshed](https://github.com/tabatkins/bikeshed/blob/master/docs/idl.md#turning-off-processing)).

## Tests

```sh
npm install
npm test
```
```sh
  Scraper CLI
    fixtures/html/*.html
      cssom-with-class-extract.html [--with-class-extract]
        √ should match cssom-with-class-extract.idl (111ms)
      cssom-with-idl-index.html [--with-idl-index]
        √ should match cssom-with-idl-index.idl
      cssom.html
        √ should match cssom.idl
      dom-with-data-no-idl.html [--with-data-no-idl]
        √ should match dom-with-data-no-idl.idl
      dom.html
        √ should match dom.idl
      html5.html
        √ should match html5.idl (553ms)
      noidl.html
        √ should match noidl.idl
    with input type
      URL
        √ should complete without errors
      glob pattern (test/**/cs*.html)
        √ should complete without errors
      file name (test/fixtures/html/cssom.html)
        √ should complete without errors
      stdin (-)
        √ should complete without errors
    with -o <file>
      √ should create the file
  scraper-core
    fixtures/html/*.html
      cssom-with-class-extract.html + options/cssom-with-class-extract.json
        √ should match cssom-with-class-extract.idl
      cssom-with-idl-index.html + options/cssom-with-idl-index.json
        √ should match cssom-with-idl-index.idl
      cssom.html
        √ should match cssom.idl
      dom-with-data-no-idl.html + options/dom-with-data-no-idl.json
        √ should match dom-with-data-no-idl.idl
      dom.html
        √ should match dom.idl
      html5.html
        √ should match html5.idl (566ms)
      noidl.html
        √ should match noidl.idl
  19 passing (2s)
```
