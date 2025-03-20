import ReactReconciler from "react-reconciler"

const rootHostContext = {}
const childHostContext = {}

let elementID = 0

function shallowDiff(oldObj, newObj) {
	// Return a diff between the new and the old object
	const uniqueProps = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
	const changedProps = Array.from(uniqueProps).filter(
		(propName) => oldObj[propName] !== newObj[propName]
	)

	return changedProps.length === 0 ? null : changedProps
}

function makeHostConfig(
	api
): ReactReconciler.HostConfig<string, {}, any, any, any, any, any, any, any, any, any, any, any> {
	function applyProps(element, props2) {
		const props = { ...props2 }
		if (typeof props.children !== "string" && typeof props.children !== "number") {
			delete props.children
		}

		for (let [propName, propValue] of Object.entries(props)) {
			if (propName.startsWith("on")) {
				api.addEventListener(element, propName.slice(2).toLowerCase(), (event) => {
					event.preventDefault = () => api.preventDefault(event.id)
					propValue(event)
					api.clearEvent(event.id)
				})

				delete props[propName]
			}
		}

		if (Object.keys(props).length > 0) api.applyProps(element, props)
	}

	return {
		now: Date.now,
		getRootHostContext: () => {
			return rootHostContext
		},
		prepareForCommit: () => {},
		resetAfterCommit: () => {},
		getChildHostContext: () => {
			return childHostContext
		},
		shouldSetTextContent: (type, props) => {
			return typeof props.children === "string" || typeof props.children === "number"
		},
		/**
	   This is where react-reconciler wants to create an instance of UI element in terms of the target. Since our target here is the DOM, we will create document.createElement and type is the argument that contains the type string like div or img or h1 etc. The initial values of domElement attributes can be set in this function from the newProps argument
	   */
		createInstance: (
			type,
			newProps,
			rootContainerInstance,
			_currentHostContext,
			workInProgress
		) => {
			const id = elementID++
			// console.log("createInstance", id, type)
			api.createInstance(id, type)
			applyProps(id, newProps)
			return id
		},
		createTextInstance: (text) => {
			const id = elementID++
			// console.log("createTextInstance", id, text)
			api.createTextInstance(id, text)
			return id
		},
		appendInitialChild: (parent, child) => {
			api.appendChild(parent, child)
		},
		appendChild(parent, child) {
			api.appendChild(parent, child)
		},
		insertBefore(parentInstance, child, beforeChild) {
			api.insertBefore(parentInstance, child, beforeChild)
		},
		insertInContainerBefore(parentInstance, child, beforeChild) {
			api.insertBefore(parentInstance, child, beforeChild)
		},
		finalizeInitialChildren: (domElement, type, props) => false,
		supportsMutation: true,
		appendChildToContainer: (parent, child) => {
			api.appendChild(parent, child)
		},
		prepareUpdate(domElement, type, oldProps, newProps) {
			// Return a diff between the new and the old props
			return shallowDiff(oldProps, newProps)
		},
		commitUpdate(domElement, updatePayload, type, oldProps, newProps) {
			const serialized = {}
			for (const prop of updatePayload) {
				if (prop === "style") {
					for (const key of shallowDiff(oldProps.style, newProps.style) ?? []) {
						serialized.style ??= {}
						serialized.style[key] = newProps.style[key]
					}
					continue
				}

				serialized[prop] = newProps[prop]
			}

			applyProps(domElement, serialized)
		},
		commitTextUpdate(textInstance, oldText, newText) {
			textInstance.nodeValue = newText
		},
		resetTextContent(domElement) {
			api.setText(domElement, "")
		},
		removeChild(parentInstance, child) {
			api.removeChild(parentInstance, child)
		},
		supportsPersistence: false,
		getPublicInstance() {},
		preparePortalMount() {},
		scheduleTimeout: setTimeout,
		isPrimaryRenderer: true,
		getCurrentEventPriority() {},
		getInstanceFromNode() {},
		beforeActiveInstanceBlur() {},
		afterActiveInstanceBlur() {},
		prepareScopeUpdate() {},
		getInstanceFromScope() {},
		detachDeletedInstance() {},
		supportsHydration: false,
		cancelTimeout: clearTimeout,
		noTimeout: -1,
		clearContainer(container) {}
	}
}
export default {
	render: (reactElement, api, callback = undefined) => {
		const hostConfig = makeHostConfig(api)
		const ReactReconcilerInst = ReactReconciler(hostConfig)
		const root = ReactReconcilerInst.createContainer(-1, false)

		// update the root Container
		return ReactReconcilerInst.updateContainer(reactElement, root, null, callback)
	}
}
