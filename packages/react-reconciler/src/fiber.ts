import { Props, Key, ReactElementType } from 'shared/ReactTypes';
import { WorkTag } from './wortTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';
import { UpdateQueue } from './updateQueue';

export class FiberNode {
	type: any; // 节点类型（比如div、span、p； 函数组件； 类组件； Symbol(Fragment)）
	key: Key; // 唯一标识
	stateNode: any; // DOM
	tag: WorkTag; // 具体类型
	pendingProps: Props; // props，渲染过程中会变化
	ref: any; // 可访问DOM或组件实例

	return: FiberNode | null; // 父fiberNode
	sibling: FiberNode | null; // 兄弟fiberNode
	child: FiberNode | null; // 子fiberNode
	index: number; // 子fiberNode的索引

	memoizedProps: Props | null; // 确定后的props,用于比较是否需要更新
	memoizedState: any; // 确定后的state,用于比较是否需要更新
	updateQueue: UpdateQueue<ReactElementType | null> | null; // 更新队列
	alternate: FiberNode | null; // 备份fiberNode，用于切换curren tree 和 workInProgress tree
	flags: Flags; // 标记fiberNode的状态，比如更新、删除等

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		this.tag = tag;
		this.key = key;
		this.stateNode = null;
		this.type = null;

		// tree结构
		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;

		this.ref = null;

		// 工作单元
		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;
		this.updateQueue = null;
		this.alternate = null;
		this.flags = NoFlags;
	}
}

// update会发生在任意节点，需要一个root节点来保存信息
export class FiberRootNode {
	container: Container;
	current: FiberNode;
	finishedWork: FiberNode | null;
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
) => {
	let wip = current.alternate; // 双缓存的fiberNode

	// 首次渲染才为null
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedState = current.memoizedState;
	wip.memoizedProps = current.memoizedProps;

	return wip;
};
