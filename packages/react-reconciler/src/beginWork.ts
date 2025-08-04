// DFS 递归

import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { HostComponent, HostRoot, HostText } from './wortTags';
import { processUpdateQueue, UpdateQueue } from './updateQueue';

// react element和fibernode比较，返回子fiberNode
export const beginWork = (wip: FiberNode) => {
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return null;
		case HostText:
			return null;
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型', wip.tag);
			}
			break;
	}
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
	// 对比子 current FiberNode和子 element，生成workinprogress fibernode
	reconcileChildren(wip, nextChildren);
	return wip.child;
}
