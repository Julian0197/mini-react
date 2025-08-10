// DFS 递归

import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { HostComponent, HostRoot, HostText } from './wortTags';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import { reconcileChildFibers, mountChildFibers } from './childFibers';

// react element和fibernode比较，返回子fiberNode
export const beginWork = (wip: FiberNode) => {
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return updateHostComponent(wip);
		case HostText:
			return null;
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型', wip.tag);
			}
			break;
	}
	return null;
};

// 根节点的更新处理
function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<ReactElementType | null>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	const { memorizedStated } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memorizedStated;

	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	// pendingProps.children是jsx编译后的 react element tree
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

// 对比子 current FiberNode和子 element，生成workinprogress fibernode
function reconcileChildren(wip: FiberNode, children?: ReactElementType | null) {
	const current = wip.alternate;

	if (current !== null) {
		// update
		wip.child = reconcileChildFibers(wip, current.child, children);
	} else {
		// mount
		wip.child = mountChildFibers(wip, null, children);
	}
}
