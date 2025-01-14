// import { Command } from "npm:commander";
import { IdlScraper } from "./lib/scraper.ts";
// import version from "./package.json" with { type: "json" };
export async function scraperCli() {
	// let options = {
	//     argv: process.argv,
	//     stdout: process.stdout,
	//     stdin: process.stdin
	// };

	// let inputs : string[] = [];
	// const program = new Command("webidl-scraper")
	// 	.version(version.version)
	// 	.description("Scrape IDL definitions from Web standard specs.")
	// 	.usage("[options] <inputs: URL ...> (use - for stdin)")
	// 	.arguments("<inputs...>")
	// 	.option(
	// 		"-o, --output-file <file>",
	// 		"output the scraped IDL to <file> (use - for stdout, the default)",
	// 		"-",
	// 	)
	// 	.option("--with-class-extract", 'do not ignore <pre class="idl extract" />')
	// 	.option("--with-data-no-idl", "do not ignore <pre data-no-idl />")
	// 	.option("--with-idl-index", 'do not ignore IDL after id="idl-index"')
	// 	.parse(Deno.args).opts();

	let buff = "";
	const scraper = new IdlScraper({ withClassExtract: true }, (err, text) => {
		if (err) throw err;
		buff += text;
	});

	const InputText = await (await fetch(Deno.args[0])).text();
	scraper.write(InputText);
	scraper.end();
	console.log(buff);
}

scraperCli();
