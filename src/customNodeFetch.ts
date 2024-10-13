import axios, { AxiosRequestConfig } from "axios";
import { HeadersInit, RequestInfo, RequestInit } from "undici";

import { ResponseLike } from "./shared";

const normalizeHeaders = (headers: Record<string, any>): HeadersInit => {
	if (!headers) return new Headers();
	const result: [string, string][] = [];
	for (const [key, value] of Object.entries(headers)) {
		// Check if key is a non-empty string and value is defined
		if (key && typeof key === 'string' && value !== undefined) {
			if (Array.isArray(value)) {
				value.forEach((v) => {
					if (v !== undefined && v !== null) {
						result.push([key, String(v)]);
					}
				});
			} else {
				result.push([key, String(value)]);
			}
		}
	}
	return new Headers(result);
};

class CustomResponse extends Response {
	private _body: unknown;

	constructor(body: any, options: { status: number; statusText: string; headers: HeadersInit }) {
		super(body, options);
		this._body = body;
	}

	// @ts-expect-error Class 'Response' defines instance member property 'json', but extended class 'CustomResponse' defines it as instance member function.ts(2425)
	override async json(): Promise<any> {
		if (typeof this._body === 'string') return JSON.parse(this._body);
		return this._body;
	}

	// @ts-expect-error Class 'Response' defines instance member property 'json', but extended class 'CustomResponse' defines it as instance member function.ts(2425)
	override async text(): Promise<string> {
		return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
	}

	// @ts-expect-error Class 'Response' defines instance member property 'json', but extended class 'CustomResponse' defines it as instance member function.ts(2425)
	override async blob(): Promise<Blob> {
		const buffer = Buffer.from(await this.text());
		return new Blob([new Uint8Array(buffer)]);
	}

	// @ts-expect-error Class 'Response' defines instance member property 'json', but extended class 'CustomResponse' defines it as instance member function.ts(2425)
	override async arrayBuffer(): Promise<ArrayBuffer> {
		const buffer = Buffer.from(await this.text());
		return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
	}
}

export const customFetch = async (input: RequestInfo | URL, options: RequestInit = {}): Promise<ResponseLike> => {
	const url = typeof input === 'string' ? new URL(input) : input instanceof URL ? input : new URL(input.url);
	return axios({
		...options,
		url: url.toString(),
		method: options?.method ?? 'GET',
		headers: options?.headers ?? {},
		data: options?.body ?? undefined,
        validateStatus: () => true,
	} as AxiosRequestConfig).then(
		(r) =>
			new CustomResponse(r.status === 204 ? null : r.data, {
				status: r.status,
				statusText: r.statusText,
				headers: normalizeHeaders(r.headers),
			}) as unknown as ResponseLike,
	);
};
