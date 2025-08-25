import { Props } from 'shared/ReactTypes';

// 宿主环境的container（dom、canvas等）
export type Container = Element;
export type Instance = Element;

export const createInstance = (type: string, props: Props) => {
	// TODO: props处理
	const element = document.createElement(type);
	return element;
};

export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

export const appendInitialChild = (parent: Instance, child: Instance) => {
	parent.appendChild(child);
};

export const appendChildToContainer = appendInitialChild;
