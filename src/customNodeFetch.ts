import axios, { AxiosRequestConfig } from "axios";
import { HeadersInit, RequestInfo, RequestInit } from "undici";

import { AbortError } from "@vladfrangu/async_event_emitter";

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
	const url = typeof input === 'string'
        ? new URL(input)
        : input instanceof URL
            ? input
            : new URL(input.url);
	return axios({
		...options,
		url: url.toString(),
		method: options?.method ?? 'GET',
		headers: options?.headers ?? {},
		data: options?.body ?? undefined,
        validateStatus: () => true,
	} as AxiosRequestConfig).then(
		(r) =>
			new CustomResponse(r.status === 204 ? null : r.data || null, {
				status: r.status,
				statusText: r.statusText,
				headers: normalizeHeaders(r.headers),
			}) as unknown as ResponseLike,
	).catch((error) => {
        if(axios.isAxiosError(error)) {
            // format the error
            if("config" in error && "body" in error.config) error.config.body = tryParse(error.config.body);

            // only keep the data in the error.config if no body
            if("config" in error && "data" in error.config) {
                if("config" in error && "body" in error.config) delete error.config.data;
                else error.config.data = tryParse(error.config.data);
            }

            if(error.response?.data) error.response.data = tryParse(error.response.data);

            if(error.code === "ERR_CANCELED" || error.config?.signal?.aborted) {
                throw new AbortError(error.message, {
                    ...error,
                })
            }

            if(error.response) {
                const { status, statusText, headers, data } = error.response;

                return new CustomResponse(status === 204 ? null : (tryParse(data) || null), {
                    status,
                    statusText,
                    headers: normalizeHeaders(headers),
                }) as unknown as ResponseLike;
            }
        }

        throw error
    });
};

function tryParse(data:unknown) {
    try {
        return typeof data === "string"
            ? JSON.parse(data)
            : data;
    } catch {
        return data;
    }
}
