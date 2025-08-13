import { Action } from 'shared/ReactTypes';

// update是状态更新的数据结构，描述从一个状态到另一个状态
export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<state> {
	// alternate和current 共享updateQueue
	shared: {
		pending: Update<state> | null;
	};
}

// 创建update实例
export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

// 创建更新队列
export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		}
	} as UpdateQueue<State>;
};

// 在更新队列中添加update
export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
	baseState: State, // 初始状态
	pendingUpdate: Update<State> | null // 待处理的update
): { memorizedStated: State } => {
	// 返回处理后的状态
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memorizedStated: baseState
	};

	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			result.memorizedStated = action(baseState);
		} else {
			// 比如hostroot的update是ReactElementType
			result.memorizedStated = action;
		}
	}
	return result;
};
