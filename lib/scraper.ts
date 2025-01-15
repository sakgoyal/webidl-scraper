import { Parser } from "npm:htmlparser2@10.0.0";
import { Writable } from "node:stream";

/** Options to pass in to scraper */
export type Options = {
	/** do not ignore IDL after `id="idl-index"` */
	withIdlIndex?: boolean;
	/** do not ignore `<pre data-no-idl />` */
	withDataNoIdl?: boolean;
	/** do not ignore `<pre class="idl extract" />` */
	withClassExtract?: boolean;
};

/**
 * IDL Scraper Instance
 * @example
 * const scraper = new IdlScraper({ withClassExtract: true });
 * const InputText = await (await fetch("http://dev.w3.org/csswg/cssom/")).text();
 * scraper.write(InputText);
 * scraper.end();
 * console.log(scraper.buffer);
 */
export class IdlScraper extends Writable {
	#options: Options;
	#inIDL;
	#seenIdlIndex;
	#parser;
	/** Get output IDL from this buffer. ready once `.end()` is called (I think) */
	buffer = "";

	constructor(options: Options = {}) {
		super({ decodeStrings: false });
		this.#options = options;
		this.#inIDL = false;
		this.#seenIdlIndex = false;
		this.#parser = new Parser({
			onopentag: this.#onOpenTag.bind(this),
			ontext: this.#onText.bind(this),
			onclosetag: this.#onCloseTag.bind(this),
		}, { decodeEntities: true });
	}

	/** Handler for opening tags */
	#onOpenTag(tagName: string, attrs : any) {
		if (attrs.id === "idl-index" && !this.#options.withIdlIndex) {
			this.#seenIdlIndex = true;
		}

		if (tagName === "pre" && attrs.class) {
			const classList = attrs.class.split(" ");

			// Check if the <pre> tag meets the criteria for IDL content
			if (
				classList.includes("idl") &&
				(classList.includes("extract") || this.#options.withClassExtract) &&
				(!("data-no-idl" in attrs) || this.#options.withDataNoIdl)
			) {
				this.#inIDL = true;
			}
		}
	}

	// Handler for text content
	#onText(text: string) {
		if (this.#inIDL && !this.#seenIdlIndex) {
			this.buffer += text;
		}
	}

	// Handler for closing tags
	#onCloseTag(tagName: string) {
		if (tagName === "pre") {
			if (this.#inIDL && !this.#seenIdlIndex) {
				this.buffer += "\n\n";
			}
			this.#inIDL = false;
		}
	}
	/**
	 * @internal
	 */
	// deno-lint-ignore no-explicit-any
	override _write(chunk: string, _: any, done: any) {
		try {
			this.#parser.write(chunk);
			done();
		} catch (err) {
			done(err);
		}
	}
}
