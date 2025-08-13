import { FiberNode } from './fiber';
import { MutationMask, NoFlags, Placement } from './fiberFlags';

let nextEffect: FiberNode | null = null;

// 对含变更子树的后序 DFS
export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;

	// 向下遍历
	while (nextEffect !== null) {
		const child: FiberNode | null = nextEffect.child;
		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect = child;
			continue;
		} else {
			// 叶子节点 or 子节点没有flag
			up: while (nextEffect !== null) {
				// 确保子树都处理完了，再执行当前节点的变更
				commmitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;
				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				nextEffect = nextEffect.return;
			}
		}
	}
};

const commmitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;

	if ((flags & Placement) !== NoFlags) {
		commmitPlacement(finishedWork);
		// ~：二进制取反， &： 二进制按位与（两个都为1才取1）
		finishedWork.flags &= ~Placement; // 剔除Placement Flag
	}
};

const commmitPlacement = (finishedWork: FiberNode) => {
	// 找到节点 插入到 parent DOM
	if (__DEV__) {
		console.warn('执行Placement', finishedWork);
	}
};

function getHostParent(fiber: FiberNode) {}
