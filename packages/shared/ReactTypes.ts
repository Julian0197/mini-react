export type ElementType = any;
export type Key = string | number | null;
export type Ref = any;
export type Props = any;

export type ReactElementType = {
	$$typeof: symbol | number;
	type: ElementType;
	key: Key;
	ref: Ref;
	props: Props;
};

export type Action<State> = State | ((prevState: State) => State);
