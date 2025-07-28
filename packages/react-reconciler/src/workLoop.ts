import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode } from './fiber';

let workInProgress: FiberNode | null = null; // 正在处理的节点

// 初始化
function prepareFreshStack(fiber: FiberNode) {
	workInProgress = fiber;
}

function renderRoot(root: FiberNode) {
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
