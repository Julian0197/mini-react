import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './wortTags';

let workInProgress: FiberNode | null = null; // 正在处理的节点

// 将传入的fiber设置为workInProgress
function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

// fiber中调度update
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

// 从发生更新的fiber节点开始，找到根节点
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode; // 指向fiberRootNode
	}
	return null;
}

function renderRoot(root: FiberRootNode) {
	// init
	prepareFreshStack(root);
	// work loop
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.error('Error in work loop:', e);
			workInProgress = null;
		}
	} while (true);
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

// 处理每个工作单元
function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber); // 返回子节点fiberNode，如果没有子节点，返回null
	fiber.memoizedProps = fiber.pendingProps; // beginWork结束，当前fiberNode的props确定

	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next; // 继续下一个fiberNode
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		completeWork(node);
		const sibling = node.sibling; // 获取兄弟节点
		// 如果有兄弟节点，继续遍历兄弟节点
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		// 如果没有兄弟节点，继续遍历父节点
		node = node.return;
		workInProgress = node;
	} while (node !== null); // 递归完成工作单元，直到没有父fiberNode为止
}
