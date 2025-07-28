import { FiberNode, FiberRootNode } from './fiber';
import { Container } from 'hostConfig';
import { HostRoot } from './wortTags';
import { createUpdate, createUpdateQueue, equeueUpdate } from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';

export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}

export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	const update = createUpdate<ReactElementType | null>(element);
	equeueUpdate(hostRootFiber.updateQueue, update);
	return element;
}
