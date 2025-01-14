import { Parser } from "npm:htmlparser2@10.0.0";
import { Writable } from "node:stream";

export type Options = {
	withIdlIndex?: boolean;
	withDataNoIdl?: boolean;
	withClassExtract?: boolean;
};

export type CallbackType = (err: unknown, text: string) => void;

export class IdlScraper extends Writable {
	#options: Options;
	#cb;
	#inIDL;
	#seenIdlIndex;
	#parser;

	constructor(options: Options = {}, cb: CallbackType = (_e, _t) => {}) {
		super({ decodeStrings: false });
		this.#options = options;
		this.#cb = cb;
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
			this.#cb(null, text);
		}
	}

	// Handler for closing tags
	#onCloseTag(tagName: string) {
		if (tagName === "pre") {
			if (this.#inIDL && !this.#seenIdlIndex) {
				this.#cb(null, "\n\n");
			}
			this.#inIDL = false;
		}
	}
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
