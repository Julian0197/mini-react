// createRoot(document.getElementById('root') as HTMLElement).render(<App />)

import { createContainer } from 'react-reconciler/src/fiberReconciler';
import { Container } from './hostConfig';
import { updateContainer } from 'react-reconciler/src/fiberReconciler';
import { ReactElementType } from 'shared/ReactTypes';

export function createRoot(container: Container) {
	const root = createContainer(container);
	return {
		render(element: ReactElementType) {
			return updateContainer(element, root);
		}
	};
}
