# completeWork 和 appendAllChildren 解析

## 概述

`completeWork` 是 React Fiber 架构中**向上遍历**阶段的核心函数，负责创建 DOM 节点、设置 props 和标记副作用。其中 `appendAllChildren` 是处理子节点追加的关键函数。

## appendAllChildren 递归过程详解

### 1. 函数结构

```typescript
function appendAllChildren(parent: FiberNode, wip: FiberNode) {
	let node = wip.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			// 非DOM元素，继续向下查找子节点
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) return;

		while (node?.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node?.sibling;
	}
}
```

### 2. 组件结构示例

```jsx
<div>
	<MyComponent>
		<span>Hello</span>
	</MyComponent>
	<p>World</p>
</div>
```

### 3. 递归过程 step by step

#### 初始状态

```typescript
let node = wip.child; // node = MyComponent Fiber
```

#### 第一次循环

```typescript
// node = MyComponent
if (node.tag === HostComponent || node.tag === HostText) {
	// false，MyComponent 不是 DOM 元素
} else if (node.child !== null) {
	// true，MyComponent 有子节点
	node.child.return = node; // span.return = MyComponent
	node = node.child; // node = span Fiber
	continue; // 继续循环
}
```

#### 第二次循环（递归到 span）

```typescript
// node = span
if (node.tag === HostComponent || node.tag === HostText) {
	// true，span 是 DOM 元素
	appendInitialChild(parent, node.stateNode); // 追加 span 到 div
}

// 检查是否回到起始节点
if (node === wip) return; // false，span !== div

// span 没有兄弟节点，向上回溯
while (node?.sibling === null) {
	if (node.return === null || node.return === wip) {
		return; // false，span.return = MyComponent
	}
	node = node?.return; // node = MyComponent
}

// MyComponent 有兄弟节点 p
node.sibling.return = node.return; // p.return = div
node = node?.sibling; // node = p Fiber
```

#### 第三次循环（移动到 p）

```typescript
// node = p
if (node.tag === HostComponent || node.tag === HostText) {
	// true，p 是 DOM 元素
	appendInitialChild(parent, node.stateNode); // 追加 p 到 div
}

// 检查是否回到起始节点
if (node === wip) return; // false，p !== div

// p 没有兄弟节点，向上回溯
while (node?.sibling === null) {
	if (node.return === null || node.return === wip) {
		return; // true，p.return = div，div === wip
	}
	node = node?.return; // 不会执行到这里
}
```

### 4. 递归路径图

```
div (wip)
├── MyComponent (第一次循环)
│   └── span (第二次循环，追加到 div)
└── p (第三次循环，追加到 div)
```

### 5. 关键逻辑解释

#### 向下递归

```typescript
else if (node.child !== null) {
	node.child.return = node;  // 设置父子关系
	node = node.child;         // 移动到子节点
	continue;                  // 继续循环（递归）
}
```

#### 向上回溯

```typescript
while (node?.sibling === null) {
	if (node.return === null || node.return === wip) {
		return; // 结束条件
	}
	node = node?.return; // 向上移动
}
```

#### 移动到兄弟节点

```typescript
node.sibling.return = node.return; // 设置兄弟节点的父节点
node = node?.sibling; // 移动到兄弟节点
```

### 6. 递归结束条件

1. **`node === null`**：没有更多节点可遍历
2. **`node === wip`**：回到起始节点，遍历完成
3. **向上回溯保护**：确保不会无限循环

### 7. 递归的关键点

1. **`continue` 实现向下递归**：移动到子节点后继续循环
2. **`while` 实现向上回溯**：没有兄弟节点时向上查找
3. **`sibling` 实现横向移动**：处理兄弟节点
4. **`return` 设置父子关系**：确保节点关系正确

### 8. 总结

这个递归过程：

- **向下**：通过 `continue` 移动到子节点
- **向上**：通过 `while` 回溯到父节点
- **横向**：通过 `sibling` 移动到兄弟节点
- **结束**：回到起始节点或没有更多节点

最终结果是：所有 DOM 元素都被追加到父元素中，跳过组件节点。

## completeWork 的作用

### 1. 主要功能

- 创建 DOM 节点
- 处理子节点
- 设置 props
- 标记副作用

### 2. 在渲染流程中的位置

```
beginWork → 向下遍历 → completeWork → appendAllChildren → 构建 DOM 树
```

### 3. 与 beginWork 的对比

| 阶段     | beginWork  | completeWork         |
| -------- | ---------- | -------------------- |
| **方向** | 向下遍历   | 向上遍历             |
| **处理** | 协调子节点 | 创建 DOM、设置 props |
| **返回** | 子节点     | 兄弟节点或父节点     |
| **时机** | 渲染阶段   | 渲染阶段             |

## bubbleProperties 的作用

### 1. 基本概念

`bubbleProperties` 是 React 中用于**向上冒泡副作用标记**的函数，确保父节点能够收集到所有子节点的副作用信息。

### 2. 核心逻辑

```typescript
function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		// 收集子节点的副作用标记
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;
		child = child.sibling;
	}

	// 将收集到的标记设置到当前节点
	wip.subtreeFlags = subtreeFlags;
}
```

### 3. 主要作用

#### **收集副作用标记**

```typescript
// 遍历所有子节点，收集它们的 flags 和 subtreeFlags
while (child !== null) {
	subtreeFlags |= child.subtreeFlags; // 子树的副作用
	subtreeFlags |= child.flags; // 当前节点的副作用
	child = child.sibling;
}
```

#### **向上冒泡**

```typescript
// 将收集到的标记设置到当前节点
wip.subtreeFlags = subtreeFlags;
```

### 4. 实际示例

#### **组件结构**

```jsx
<div>
	<MyComponent>
		<span>Hello</span>
		<p>World</p>
	</MyComponent>
</div>
```

#### **副作用标记传播**

```typescript
// 假设各个节点的副作用标记
span.flags = Update;           // span 需要更新
p.flags = Placement;           // p 需要插入
MyComponent.flags = NoFlags;   // MyComponent 无副作用
div.flags = NoFlags;           // div 无副作用

// bubbleProperties 处理过程
// 1. 处理 MyComponent
MyComponent.subtreeFlags = span.flags | p.flags = Update | Placement;

// 2. 处理 div
div.subtreeFlags = MyComponent.subtreeFlags = Update | Placement;
```

### 5. 在 completeWork 中的使用

```typescript
function completeWork(wip: FiberNode) {
	switch (wip.tag) {
		case HostComponent:
			// 创建 DOM 节点
			const instance = createInstance(wip.type, wip.pendingProps);
			wip.stateNode = instance;

			// 追加子节点
			appendAllChildren(instance, wip);

			// 冒泡副作用标记
			bubbleProperties(wip);
			break;

		case FunctionComponent:
		case ClassComponent:
			// 组件节点也需要冒泡副作用
			bubbleProperties(wip);
			break;
	}
}
```

### 6. 副作用标记的类型

#### **flags vs subtreeFlags**

```typescript
class FiberNode {
	flags: Flags; // 当前节点的副作用
	subtreeFlags: Flags; // 子树中所有节点的副作用
}
```

#### **标记类型**

```typescript
export const NoFlags = 0b0000001; // 无标记
export const Placement = 0b0000010; // 插入
export const Update = 0b0000100; // 更新
export const ChildDeletion = 0b0001000; // 删除子节点
```

### 7. 性能优化

#### **避免重复遍历**

```typescript
// 通过 subtreeFlags 快速判断子树是否有副作用
if (fiber.subtreeFlags === NoFlags) {
	// 子树没有副作用，可以跳过
	return;
}
```

#### **批量处理**

```typescript
// 在 commit 阶段可以批量处理相同类型的副作用
if (fiber.subtreeFlags & Placement) {
	// 批量处理插入操作
}
```

### 8. 实际应用场景

#### **条件渲染**

```jsx
function MyComponent({ show }) {
	return <div>{show && <span>Hello</span>}</div>;
}
```

当 `show` 从 `true` 变为 `false` 时：

```typescript
// span 被标记为删除
span.flags = ChildDeletion;

// 通过 bubbleProperties 冒泡到 div
div.subtreeFlags = ChildDeletion;
```

#### **列表更新**

```jsx
function List({ items }) {
	return (
		<ul>
			{items.map((item) => (
				<li key={item.id}>{item.name}</li>
			))}
		</ul>
	);
}
```

当列表项变化时：

```typescript
// 每个变化的 li 都有相应的 flags
// 通过 bubbleProperties 冒泡到 ul
ul.subtreeFlags = li1.flags | li2.flags | li3.flags;
```

### 9. 总结

`bubbleProperties` 的作用：

1. **收集副作用**：遍历子节点收集所有副作用标记
2. **向上冒泡**：将子树的副作用信息传播到父节点
3. **性能优化**：通过 subtreeFlags 快速判断子树状态
4. **批量处理**：支持在 commit 阶段批量处理副作用
5. **确保完整性**：保证所有副作用都被正确收集和处理

它是 React 副作用管理系统的重要组成部分，确保副作用能够被正确识别和处理。
