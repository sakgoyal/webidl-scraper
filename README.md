# webidl-scraper

Scrape IDL definitions from Web standard specs

## Installation

```sh
deno add jsr:@sakgoyal/webidl-scraper
```

## Usage

```sh
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
# Output to stdout
webidl-scraper https://html.spec.whatwg.org/

# Save to cssom.idl
webidl-scraper http://dev.w3.org/csswg/cssom/ -o cssom.idl
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
