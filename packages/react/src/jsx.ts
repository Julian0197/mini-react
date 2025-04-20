import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
	ElementType,
	Key,
	Ref,
	Props,
	ReactElementType
} from 'shared/ReactTypes';

export const reactElement = function (
	type: ElementType,
	key: Key,
	ref: Ref,
	props: Props
): ReactElementType {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props
	};

	return element;
};

export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	const props: any = {};
	let key: Key = null;
	let ref: Ref = null;

	if (config) {
		if (config.ref !== undefined) {
			ref = config.ref;
		}
		if (config.key !== undefined) {
			key = '' + config.key;
		}
		for (const prop in config) {
			if (Object.prototype.hasOwnProperty.call(config, prop)) {
				props[prop] = config[prop];
			}
		}
	}

	const childrenLength = maybeChildren.length;
	if (childrenLength) {
		if (childrenLength === 1) {
			props.children = maybeChildren[0];
		} else {
			props.children = maybeChildren;
		}
	}

	return reactElement(type, key, ref, props);
};

export const jsxDEV = (type: ElementType, config: any) => {
	const props: any = {};
	let key: Key = null;
	let ref: Ref = null;

	if (config) {
		if (config.ref !== undefined) {
			ref = config.ref;
		}
		if (config.key !== undefined) {
			key = '' + config.key;
		}
		for (const prop in config) {
			if (Object.prototype.hasOwnProperty.call(config, prop)) {
				props[prop] = config[prop];
			}
		}
	}

	return reactElement(type, key, ref, props);
};
