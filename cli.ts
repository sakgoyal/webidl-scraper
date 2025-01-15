import { parseArgs } from "jsr:@podhmo/with-help@0.5.3";
import { IdlScraper, type Options } from "./lib/scraper.ts";

/**
 * Extract IDL text from given HTML Text
 * @param text raw HTML text from the w3c spec URL
 * @returns extracted idl index/text from input URL
 */
export function runExtractFromHTML(text : string, options : Options) : string {
	const scraper = new IdlScraper(options);
	scraper.write(text);
	scraper.end();
	return scraper.buffer;
}

/** @internal */
async function getTextFromURL(url : string) {
	return await (await fetch(url)).text();
}

/**
 * Function to parse CLI arguments and then execute the parser and output to `stdout`.
 * Will switch to using Commander package soon
 */
export async function scraperCli(): Promise<void> {
	const module = (await import("./deno.json", { with: { type: "json" } })).default;
	const flags = parseArgs(Deno.args, {
		string: ["item", "output"],
		boolean: ["version", "with-class-extract", "with-data-no-idl", "with-idl-index"],
		description: module.description,
		alias: {
			"output": "o",
			"version": "v",
		},
		flagDescription: {
			"with-class-extract": 'do not ignore <pre class="idl extract" />',
			"with-data-no-idl": "do not ignore <pre data-no-idl />",
			"with-idl-index": 'do not ignore IDL after id="idl-index"',
			output: "Output to a file instead of stdout",
			item: "The URL of the IDL spec",
			version: "Print the version of the package",
		},
	});
	if (flags.version)
		return console.log("WebIDL Scraper:", module.version)
	const text = await getTextFromURL(flags._[0]);
	const idl = runExtractFromHTML(text, {withClassExtract : true})
	console.log(idl);
}
