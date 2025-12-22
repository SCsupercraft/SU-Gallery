export function createBlankResource<T>(
	promise: () => Promise<T>
): BlankResource<T> {
	let status = 'pending';
	let result: T;
	let error: any;
	const suspender = new Lazy<Promise<void>, undefined>(() =>
		promise().then(
			(r) => {
				status = 'success';
				result = r;
			},
			(e) => {
				status = 'error';
				error = e;
			}
		)
	);
	return {
		get() {
			if (status === 'pending') throw suspender.get(undefined);
			if (status === 'error') throw error;
			return result;
		},
	};
}

export function createResource<T, P>(
	promise: (parameter: P) => Promise<T>
): Resource<T, P> {
	let status = 'pending';
	let result: T;
	let error: any;
	const suspender = new Lazy<Promise<void>, P>((parameter) =>
		promise(parameter).then(
			(r) => {
				status = 'success';
				result = r;
			},
			(e) => {
				status = 'error';
				error = e;
			}
		)
	);
	return {
		get(parameter: P) {
			if (status === 'pending') throw suspender.get(parameter);
			if (status === 'error') throw error;
			return result;
		},
	};
}

export type BlankResource<T> = {
	get: () => T;
};

export type Resource<T, P> = {
	get: (parameter: P) => T;
};

class Lazy<T, P> {
	private _value?: T;

	constructor(private readonly supplier: (parameter: P) => T) {}

	get(parameter: P): T {
		if (this._value != undefined) return this._value;
		this._value = this.supplier(parameter);
		return this._value;
	}
}
