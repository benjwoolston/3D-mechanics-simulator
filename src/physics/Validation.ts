export function assertPositive(value: number, name: string): void {
	if (!Number.isFinite(value) || value <= 0) {
		throw new RangeError(`${name} must be a finite positive number.`);
	}
}

export function assertVector3(value: readonly number[], name: string): void {
	if (!Array.isArray(value) || value.length !== 3) {
		throw new TypeError(`${name} must contain exactly three numbers.`);
	}

	for (let index = 0; index < value.length; index++) {
		if (!Number.isFinite(value[index])) {
			throw new RangeError(`${name}[${index}] must be finite.`);
		}
	}
}