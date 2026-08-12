window.__ModuleLoader__.load({ id: "@dsh-external/dsh-openpencil", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");
//#region src/client/editor-bridge.ts
function isRecord$3(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function safeInteger(value) {
	return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
function string(value) {
	return typeof value === "string";
}
/** Parse only the editor/host messages DSH implements. Unknown traffic is ignored. */
function parseEditorInbound(raw) {
	if (typeof raw !== "string") return void 0;
	let value;
	try {
		value = JSON.parse(raw);
	} catch {
		return;
	}
	if (!isRecord$3(value) || typeof value.type !== "string") return void 0;
	switch (value.type) {
		case "op-bridge/ready": return safeInteger(value.generation) && safeInteger(value.revision) ? {
			type: value.type,
			generation: value.generation,
			revision: value.revision
		} : void 0;
		case "op-bridge/opened": return safeInteger(value.generation) ? {
			type: value.type,
			generation: value.generation
		} : void 0;
		case "op-bridge/dirty-changed": return safeInteger(value.generation) && safeInteger(value.revision) && typeof value.dirty === "boolean" ? {
			type: value.type,
			generation: value.generation,
			revision: value.revision,
			dirty: value.dirty
		} : void 0;
		case "op-bridge/snapshot-result": return string(value.requestId) && string(value.docJson) && safeInteger(value.generation) && safeInteger(value.revision) ? {
			type: value.type,
			requestId: value.requestId,
			docJson: value.docJson,
			generation: value.generation,
			revision: value.revision
		} : void 0;
		case "op-bridge/snapshot-conflict": return string(value.requestId) && safeInteger(value.serverVersion) ? {
			type: value.type,
			requestId: value.requestId,
			serverVersion: value.serverVersion
		} : void 0;
		case "op-bridge/sync-conflict": return safeInteger(value.generation) && safeInteger(value.revision) && safeInteger(value.serverVersion) ? {
			type: value.type,
			generation: value.generation,
			revision: value.revision,
			serverVersion: value.serverVersion
		} : void 0;
		case "op-bridge/conflict-resolved": return string(value.requestId) ? {
			type: value.type,
			requestId: value.requestId
		} : void 0;
		case "op-shell/save": return { type: value.type };
		case "op-shell/copy": return string(value.text) ? {
			type: value.type,
			text: value.text
		} : void 0;
		default: return;
	}
}
function encodeEditorOutbound(message) {
	return JSON.stringify(message);
}
/** Require an absolute loopback editor URL and derive its exact target origin. */
function editorOrigin(iframeUrl) {
	const url = new URL(iframeUrl);
	if (!(url.hostname === "127.0.0.1" || url.hostname === "localhost" || url.hostname === "::1") || url.protocol !== "http:" && url.protocol !== "https:") throw new Error("OpenPencil editor URL must use an HTTP loopback origin");
	return url.origin;
}
/** Pin the host's resolved theme into the editor's first navigation. */
function editorIframeUrlWithTheme(iframeUrl, colorScheme) {
	const url = new URL(iframeUrl);
	url.searchParams.set("theme", colorScheme);
	return url.href;
}
/** Pin the host's resolved locale into the editor's first navigation. */
function editorIframeUrlWithLocale(iframeUrl, locale) {
	const url = new URL(iframeUrl);
	url.searchParams.set("locale", locale);
	return url.href;
}
/** Translate DSH's compact locale id to the editor's BCP 47 contract. */
function editorLocaleFromDsh(locale) {
	return locale === "zh" ? "zh-CN" : "en-US";
}
/** Resolve a launch/save/close capability and reject cross-origin control routes. */
function editorControlUrl(raw, base = window.location.href) {
	const page = new URL(base);
	const url = new URL(raw, page);
	if (url.origin !== page.origin) throw new Error("OpenPencil editor control URL must be same-origin");
	return url.href;
}
/** Validate source and exact origin before parsing any iframe message. */
function editorMessageFrom(event, frameWindow, origin) {
	if (frameWindow === null || event.source !== frameWindow || event.origin !== origin) return void 0;
	return parseEditorInbound(event.data);
}
let activeEditor;
/** Page-wide single-editor coordinator. Opening a new document closes the old daemon. */
function claimEditor(token, close) {
	const previous = activeEditor;
	activeEditor = {
		token,
		close
	};
	if (previous !== void 0 && previous.token !== token) previous.close();
	return () => {
		if (activeEditor?.token === token) activeEditor = void 0;
	};
}
/** Confirm before a user-driven panel close would discard unsaved canvas edits. */
function confirmEditorClose(dirty, confirm = window.confirm) {
	return !dirty || confirm("OpenPencil has unsaved changes. Close the editor and discard them?");
}
//#endregion
//#region src/client/editor-successor.ts
/** Session-scoped successor capabilities for reopening a saved editor card. */
const STORAGE_PREFIX = "dsh-openpencil:editor-successor:v1:";
function isRecord$2(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function browserStorage() {
	try {
		return window.sessionStorage;
	} catch {
		return;
	}
}
function storageOf(options) {
	return options.storage === void 0 ? browserStorage() : options.storage ?? void 0;
}
function baseUrlOf(options) {
	return options.baseUrl ?? window.location.href;
}
/** The original Tool grant scopes one successor chain for the life of this tab. */
function editorSuccessorStorageKey(originalLaunchUrl, baseUrl = window.location.href) {
	return `${STORAGE_PREFIX}${editorControlUrl(originalLaunchUrl, baseUrl)}`;
}
function persistedSuccessorOf(value, baseUrl) {
	if (!isRecord$2(value)) return void 0;
	const launchUrl = value.launchUrl;
	const refreshUrl = value.refreshUrl;
	if (typeof launchUrl !== "string" || launchUrl.length === 0 || typeof refreshUrl !== "string" || refreshUrl.length === 0) return void 0;
	try {
		return {
			launchUrl: editorControlUrl(launchUrl, baseUrl),
			refreshUrl: editorControlUrl(refreshUrl, baseUrl)
		};
	} catch {
		return;
	}
}
/** Parse only the successor grant from a successful save response. */
function editorSuccessorFromSave(value, baseUrl = window.location.href) {
	if (!isRecord$2(value) || !isRecord$2(value.editor) || value.editor.enabled !== true) return void 0;
	const persisted = persistedSuccessorOf(value.editor, baseUrl);
	return persisted === void 0 ? void 0 : {
		enabled: true,
		...persisted
	};
}
/**
* Persist the newest save successor under the immutable Tool grant. Invalid or
* absent successors clear an older value so a later reopen cannot use a stale
* source capability. Storage denial is intentionally non-fatal to saving.
*/
function rememberEditorSuccessor(originalLaunchUrl, saveResponse, options = {}) {
	const baseUrl = baseUrlOf(options);
	const successor = editorSuccessorFromSave(saveResponse, baseUrl);
	const storage = storageOf(options);
	if (storage === void 0) return successor;
	try {
		const key = editorSuccessorStorageKey(originalLaunchUrl, baseUrl);
		if (successor === void 0 || successor.refreshUrl === void 0) {
			storage.removeItem(key);
			return;
		}
		storage.setItem(key, JSON.stringify({
			launchUrl: successor.launchUrl,
			refreshUrl: successor.refreshUrl
		}));
	} catch {}
	return successor;
}
/** Resolve a saved successor, falling back to the original Tool grant safely. */
function editorGrantForBoot(original, options = {}) {
	const storage = storageOf(options);
	if (storage === void 0) return original;
	const baseUrl = baseUrlOf(options);
	let key;
	try {
		key = editorSuccessorStorageKey(original.launchUrl, baseUrl);
	} catch {
		return original;
	}
	try {
		const raw = storage.getItem(key);
		if (raw === null) return original;
		const successor = persistedSuccessorOf(JSON.parse(raw), baseUrl);
		if (successor !== void 0) return {
			enabled: true,
			...successor
		};
	} catch {}
	try {
		storage.removeItem(key);
	} catch {}
	return original;
}
//#endregion
//#region src/client/editor-panel.tsx
/** Full OpenPencil editor hosted in DSH's Tool details side panel. */
const DEFAULT_REFRESH_URL = "/_dsh/dsh-openpencil/editor/refresh";
function isRecord$1(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function launchResponseOf(value) {
	if (!isRecord$1(value)) throw new Error("OpenPencil editor launch returned an invalid response");
	for (const field of [
		"sessionId",
		"iframeUrl",
		"token",
		"saveUrl",
		"closeUrl"
	]) if (typeof value[field] !== "string" || value[field].length === 0) throw new Error(`OpenPencil editor launch omitted ${field}`);
	return {
		sessionId: value.sessionId,
		iframeUrl: value.iframeUrl,
		token: value.token,
		saveUrl: editorControlUrl(value.saveUrl),
		closeUrl: editorControlUrl(value.closeUrl),
		...typeof value.docJson === "string" ? { docJson: value.docJson } : {}
	};
}
async function responseJson(response, action) {
	if (!response.ok) throw new Error(`${action} failed (${response.status})`);
	return response.json();
}
function refreshedLaunchUrlOf(value) {
	if (!isRecord$1(value) || typeof value.launchUrl !== "string" || value.launchUrl.length === 0) throw new Error("OpenPencil editor refresh omitted launchUrl");
	return editorControlUrl(value.launchUrl);
}
const EDITOR_PANEL_COPY = {
	"zh-CN": {
		save: "保存",
		saving: "保存中…",
		unsaved: "未保存",
		saved: "已保存",
		unavailable: "当前结果无法使用可编辑的 OpenPencil 画布。",
		loading: "正在加载可编辑的 OpenPencil 画布…",
		errorTitle: "OpenPencil 编辑器不可用",
		pngFallback: "打开 PNG 预览",
		editorTitle: (title) => `OpenPencil 编辑器：${title}`,
		editorTimeout: "OpenPencil 编辑器未能及时就绪",
		saveConflict: (serverVersion) => `OpenPencil 保存冲突（服务器版本 ${serverVersion}）`,
		syncConflict: (serverVersion) => `源文件已在编辑器外部更改（服务器版本 ${serverVersion}），已停止保存。`
	},
	"en-US": {
		save: "Save",
		saving: "Saving…",
		unsaved: "Unsaved",
		saved: "Saved",
		unavailable: "Editable OpenPencil canvas is not available for this result.",
		loading: "Loading editable OpenPencil canvas…",
		errorTitle: "OpenPencil editor unavailable",
		pngFallback: "Open PNG fallback",
		editorTitle: (title) => `OpenPencil editor: ${title}`,
		editorTimeout: "OpenPencil editor did not become ready",
		saveConflict: (serverVersion) => `OpenPencil save conflict (server v${serverVersion})`,
		syncConflict: (serverVersion) => `The source changed outside this editor (server v${serverVersion}). Save was stopped.`
	}
};
/** Chrome copy for the locale already resolved by the DSH host. */
function editorPanelCopy(locale) {
	return EDITOR_PANEL_COPY[locale];
}
function launchRequest(fetcher, url, signal) {
	return fetcher(editorControlUrl(url), {
		method: "POST",
		credentials: "same-origin",
		...signal === void 0 ? {} : { signal }
	});
}
/**
* Launch one editor, renewing exactly once when a replayed launch capability
* has expired. A refreshed capability is never persisted back into the Tool
* block, and only same-origin control routes can receive document metadata.
*/
async function launchManagedEditor(editor, document, options = {}) {
	const fetcher = options.fetcher ?? fetch;
	let launchUrl = editor.launchUrl;
	let renewed = false;
	let response = await launchRequest(fetcher, launchUrl, options.signal);
	if (response.status === 410) {
		if (document.path === void 0) throw new Error("OpenPencil editor launch expired and cannot be refreshed without a source path");
		launchUrl = refreshedLaunchUrlOf(await responseJson(await fetcher(editorControlUrl(editor.refreshUrl ?? DEFAULT_REFRESH_URL), {
			method: "POST",
			credentials: "same-origin",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				launchUrl: editor.launchUrl,
				sourcePath: document.path,
				documentUrl: document.url
			}),
			...options.signal === void 0 ? {} : { signal: options.signal }
		}), "OpenPencil editor refresh"));
		renewed = true;
		response = await launchRequest(fetcher, launchUrl, options.signal);
	}
	const launch = launchResponseOf(await responseJson(response, "OpenPencil editor launch"));
	return renewed ? {
		...launch,
		renewed: true
	} : launch;
}
/** Prefer the daemon's current source; fetch the immutable snapshot only for old hosts. */
async function prepareManagedEditor(editor, document, options = {}) {
	const fetcher = options.fetcher ?? fetch;
	const launch = await launchManagedEditor(editor, document, {
		...options,
		fetcher
	});
	if (launch.docJson !== void 0) return {
		launch,
		documentJson: launch.docJson
	};
	if (editor.refreshUrl !== void 0 || launch.renewed === true) throw new Error("OpenPencil editor launch omitted current docJson");
	const documentResponse = await fetcher(editorControlUrl(document.url), {
		credentials: "same-origin",
		...options.signal === void 0 ? {} : { signal: options.signal }
	});
	if (!documentResponse.ok) throw new Error(`OpenPencil document request failed (${documentResponse.status})`);
	return {
		launch,
		documentJson: await documentResponse.text()
	};
}
const panelStyles = {
	root: {
		height: "100%",
		minHeight: 0,
		display: "flex",
		flexDirection: "column",
		color: "var(--dsw-alias-label-primary)",
		background: "var(--dsw-alias-bg-base)"
	},
	toolbar: {
		minHeight: 42,
		display: "flex",
		alignItems: "center",
		gap: 8,
		padding: "6px 10px",
		borderBottom: "1px solid var(--dsw-alias-border-l2)"
	},
	title: {
		minWidth: 0,
		marginRight: "auto",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		fontSize: 13
	},
	status: {
		fontSize: 11,
		color: "var(--dsw-alias-label-secondary)",
		whiteSpace: "nowrap"
	},
	button: {
		border: "1px solid var(--dsw-alias-border-l2)",
		borderRadius: 6,
		color: "var(--dsw-alias-label-primary)",
		background: "var(--dsw-alias-bg-layer-1)",
		padding: "4px 8px",
		cursor: "pointer",
		font: "inherit",
		fontSize: 12
	},
	stage: {
		position: "relative",
		flex: 1,
		minHeight: 0,
		overflow: "hidden",
		background: "var(--dsw-alias-bg-base)"
	},
	iframe: {
		display: "block",
		width: "100%",
		height: "100%",
		border: 0,
		background: "var(--dsw-alias-bg-base)"
	},
	overlay: {
		position: "absolute",
		inset: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "column",
		gap: 10,
		padding: 24,
		textAlign: "center",
		color: "var(--dsw-alias-label-primary)",
		background: "var(--dsw-alias-bg-base)",
		fontSize: 12
	},
	error: {
		color: "var(--dsw-alias-state-error-primary)",
		maxWidth: 420,
		overflowWrap: "anywhere"
	}
};
/** Editable panel. The daemon is created lazily only while this component is mounted. */
function ManagedOpenPencilEditor({ grant, colorScheme, locale }) {
	const iframeRef = (0, react.useRef)(null);
	const launchRef = (0, react.useRef)();
	const iframeSrcRef = (0, react.useRef)("");
	const originRef = (0, react.useRef)("");
	const docJsonRef = (0, react.useRef)("");
	const colorSchemeRef = (0, react.useRef)(colorScheme);
	colorSchemeRef.current = colorScheme;
	const localeRef = (0, react.useRef)(locale);
	localeRef.current = locale;
	const initTimerRef = (0, react.useRef)();
	const requestCounterRef = (0, react.useRef)(0);
	const saveWaitersRef = (0, react.useRef)(/* @__PURE__ */ new Map());
	const [phase, setPhase] = (0, react.useState)("launching");
	const [failure, setFailure] = (0, react.useState)("");
	const [dirty, setDirty] = (0, react.useState)(false);
	const dirtyRef = (0, react.useRef)(false);
	const documentGrant = grant.document;
	const editorGrant = grant.editor;
	const post = (0, react.useCallback)((message) => {
		const frame = iframeRef.current?.contentWindow;
		if (frame === null || frame === void 0 || originRef.current === "") return;
		frame.postMessage(encodeEditorOutbound(message), originRef.current);
	}, []);
	const save = (0, react.useCallback)(async () => {
		const launch = launchRef.current;
		if (launch === void 0 || phase === "launching" || phase === "loading" || phase === "saving") return;
		setPhase("saving");
		setFailure("");
		const requestId = `dsh-save-${++requestCounterRef.current}`;
		try {
			const snapshot = await new Promise((resolve, reject) => {
				saveWaitersRef.current.set(requestId, {
					resolve,
					reject
				});
				post({
					type: "op-bridge/snapshot",
					purpose: "save",
					requestId
				});
			});
			const saveResponse = await responseJson(await fetch(launch.saveUrl, {
				method: "POST",
				credentials: "same-origin",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					sessionId: launch.sessionId,
					docJson: snapshot.docJson,
					generation: snapshot.generation,
					revision: snapshot.revision
				})
			}), "OpenPencil save");
			rememberEditorSuccessor(editorGrant.launchUrl, saveResponse);
			post({
				type: "op-bridge/save-committed",
				generation: snapshot.generation,
				revision: snapshot.revision
			});
			setDirty(false);
			dirtyRef.current = false;
			setPhase("ready");
		} catch (error) {
			setFailure(error instanceof Error ? error.message : String(error));
			setPhase("error");
		} finally {
			saveWaitersRef.current.delete(requestId);
		}
	}, [
		editorGrant.launchUrl,
		phase,
		post
	]);
	(0, react.useEffect)(() => {
		let cancelled = false;
		const abort = new AbortController();
		const coordinatorToken = Symbol("openpencil-editor");
		const closeDaemon = async (dirtyAtClose = dirtyRef.current) => {
			const launch = launchRef.current;
			if (launch === void 0) return;
			launchRef.current = void 0;
			await fetch(launch.closeUrl, {
				method: "DELETE",
				credentials: "same-origin",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					sessionId: launch.sessionId,
					dirty: dirtyAtClose
				}),
				keepalive: true
			}).catch(() => {});
		};
		const releaseEditor = claimEditor(coordinatorToken, () => {
			abort.abort();
			closeDaemon(false);
		});
		const boot = async () => {
			try {
				const { launch, documentJson } = await prepareManagedEditor(editorGrantForBoot(editorGrant), documentGrant, { signal: abort.signal });
				const origin = editorOrigin(launch.iframeUrl);
				if (cancelled) return;
				launchRef.current = launch;
				iframeSrcRef.current = editorIframeUrlWithLocale(editorIframeUrlWithTheme(launch.iframeUrl, colorSchemeRef.current), localeRef.current);
				docJsonRef.current = documentJson;
				originRef.current = origin;
				setPhase("loading");
			} catch (error) {
				if (cancelled || abort.signal.aborted) return;
				setFailure(error instanceof Error ? error.message : String(error));
				setPhase("error");
			}
		};
		boot();
		return () => {
			cancelled = true;
			abort.abort();
			releaseEditor();
			if (initTimerRef.current !== void 0) clearInterval(initTimerRef.current);
			const disposed = /* @__PURE__ */ new Error("OpenPencil editor closed");
			for (const waiter of saveWaitersRef.current.values()) waiter.reject(disposed);
			saveWaitersRef.current.clear();
			closeDaemon();
		};
	}, [
		documentGrant.path,
		documentGrant.url,
		editorGrant.launchUrl,
		editorGrant.refreshUrl
	]);
	(0, react.useEffect)(() => {
		const listener = (event) => {
			const message = editorMessageFrom(event, iframeRef.current?.contentWindow ?? null, originRef.current);
			if (message === void 0) return;
			switch (message.type) {
				case "op-bridge/ready":
					if (initTimerRef.current !== void 0) clearInterval(initTimerRef.current);
					initTimerRef.current = void 0;
					post({
						type: "op-bridge/theme",
						colorScheme: colorSchemeRef.current
					});
					post({
						type: "op-bridge/locale",
						locale: localeRef.current
					});
					post({
						type: "op-bridge/open-document",
						json: docJsonRef.current
					});
					break;
				case "op-bridge/opened":
					setPhase("ready");
					break;
				case "op-bridge/dirty-changed":
					setDirty(message.dirty);
					dirtyRef.current = message.dirty;
					break;
				case "op-bridge/snapshot-result":
					saveWaitersRef.current.get(message.requestId)?.resolve(message);
					break;
				case "op-bridge/snapshot-conflict":
					saveWaitersRef.current.get(message.requestId)?.reject(new Error(editorPanelCopy(localeRef.current).saveConflict(message.serverVersion)));
					break;
				case "op-bridge/sync-conflict":
					setFailure(editorPanelCopy(localeRef.current).syncConflict(message.serverVersion));
					setPhase("error");
					break;
				case "op-shell/save":
					save();
					break;
				case "op-shell/copy":
					navigator.clipboard?.writeText(message.text).catch(() => {});
					break;
				case "op-bridge/conflict-resolved": break;
			}
		};
		window.addEventListener("message", listener);
		return () => {
			window.removeEventListener("message", listener);
		};
	}, [post, save]);
	(0, react.useEffect)(() => {
		post({
			type: "op-bridge/theme",
			colorScheme
		});
	}, [colorScheme, post]);
	(0, react.useEffect)(() => {
		post({
			type: "op-bridge/locale",
			locale
		});
	}, [locale, post]);
	(0, react.useEffect)(() => {
		const beforeUnload = (event) => {
			if (!dirtyRef.current) return;
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", beforeUnload);
		return () => {
			window.removeEventListener("beforeunload", beforeUnload);
		};
	}, []);
	const startInitLoop = () => {
		const launch = launchRef.current;
		if (launch === void 0) return;
		if (initTimerRef.current !== void 0) clearInterval(initTimerRef.current);
		let attempts = 0;
		const sendInit = () => {
			attempts += 1;
			post({
				type: "op-bridge/init",
				token: launch.token
			});
			post({
				type: "op-bridge/theme",
				colorScheme: colorSchemeRef.current
			});
			post({
				type: "op-bridge/locale",
				locale: localeRef.current
			});
			if (attempts >= 20 && initTimerRef.current !== void 0) {
				clearInterval(initTimerRef.current);
				initTimerRef.current = void 0;
				setFailure(editorPanelCopy(localeRef.current).editorTimeout);
				setPhase("error");
			}
		};
		sendInit();
		initTimerRef.current = setInterval(sendInit, 500);
	};
	const title = documentGrant.path?.replaceAll("\\", "/").split("/").at(-1) ?? "OpenPencil";
	const copy = editorPanelCopy(locale);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		style: panelStyles.root,
		"data-tool-details-fill": "true",
		"data-tool-details-dirty": dirty || void 0,
		"data-openpencil-editor-panel": "true",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: panelStyles.toolbar,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
					style: panelStyles.title,
					title: documentGrant.path,
					children: title
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: panelStyles.status,
					children: phase === "saving" ? copy.saving : dirty ? copy.unsaved : phase === "ready" ? copy.saved : ""
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					style: panelStyles.button,
					disabled: !dirty || phase === "saving",
					onClick: () => {
						save();
					},
					children: copy.save
				})
			]
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: panelStyles.stage,
			children: [
				launchRef.current !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("iframe", {
					ref: iframeRef,
					style: panelStyles.iframe,
					src: iframeSrcRef.current,
					title: copy.editorTitle(title),
					allow: "clipboard-read; clipboard-write",
					onLoad: startInitLoop
				}) : null,
				phase === "launching" || phase === "loading" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: panelStyles.overlay,
					role: "status",
					children: copy.loading
				}) : null,
				phase === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: panelStyles.overlay,
					role: "alert",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: copy.errorTitle }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: panelStyles.error,
							children: failure
						}),
						grant.image !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
							href: grant.image.previewUrl,
							target: "_blank",
							rel: "noreferrer",
							children: copy.pngFallback
						}) : null
					]
				}) : null
			]
		})]
	});
}
//#endregion
//#region src/client/frame-gallery.tsx
const FRAME_GALLERY_COPY = {
	en: {
		frame: "Frame",
		carousel: "carousel",
		gallery: "OpenPencil frames",
		toolbar: "Preview zoom and card size controls",
		zoomOut: "Zoom out preview",
		zoomOutTitle: "Zoom out by 25% (Ctrl/Cmd −)",
		zoomIn: "Zoom in preview",
		zoomInTitle: "Zoom in by 25% (Ctrl/Cmd +)",
		previewZoom: "Preview zoom",
		reset: "Reset",
		resetAria: "Reset preview zoom to 100%",
		resetTitle: "Reset zoom to 100% (Ctrl/Cmd 0)",
		fitFrame: "Fit frame",
		fitFrameAria: "Fit entire frame inside the current card",
		fitFrameTitle: "Fit the entire frame without changing the card size",
		fitContent: "Fit content",
		fitContentAria: "Fit card height to the entire frame",
		fitContentTitle: "Expand the card to show the entire frame",
		restoreCard: "Restore card",
		restoreCardAria: "Restore compact card height",
		previous: "Previous frame",
		next: "Next frame",
		failed: "This frame preview could not be loaded. Choose another frame or use the download action.",
		rendered: "Rendered OpenPencil frame",
		thumbnails: "Frame thumbnails",
		showFrame: "Show frame"
	},
	zh: {
		frame: "页面",
		carousel: "轮播",
		gallery: "OpenPencil 页面",
		toolbar: "预览缩放与卡片尺寸控制",
		zoomOut: "缩小预览",
		zoomOutTitle: "缩小 25%（Ctrl/Cmd −）",
		zoomIn: "放大预览",
		zoomInTitle: "放大 25%（Ctrl/Cmd +）",
		previewZoom: "预览缩放",
		reset: "重置",
		resetAria: "将预览缩放重置为 100%",
		resetTitle: "重置为 100%（Ctrl/Cmd 0）",
		fitFrame: "适应画面",
		fitFrameAria: "将整个页面缩放到当前卡片内",
		fitFrameTitle: "不改变卡片大小，完整显示当前页面",
		fitContent: "适应内容",
		fitContentAria: "让卡片高度适应完整页面",
		fitContentTitle: "展开卡片以显示完整页面",
		restoreCard: "还原卡片",
		restoreCardAria: "还原紧凑卡片高度",
		previous: "上一页",
		next: "下一页",
		failed: "当前页面预览加载失败，请选择其他页面或使用下载操作。",
		rendered: "OpenPencil 页面渲染图",
		thumbnails: "页面缩略图",
		showFrame: "显示页面"
	}
};
function frameGalleryCopy(locale) {
	return FRAME_GALLERY_COPY[locale];
}
function normalizeFrameIndex(index, length) {
	if (length <= 0) return 0;
	return Math.min(length - 1, Math.max(0, Math.trunc(index)));
}
function frameLabel(frame, index, locale = "en") {
	return frame.name ?? frame.id ?? `${frameGalleryCopy(locale).frame} ${index + 1}`;
}
/** Preview zoom limits are intentionally broad enough for detail inspection. */
const GALLERY_ZOOM_MIN = .25;
const GALLERY_ZOOM_MAX = 4;
const GALLERY_ZOOM_STEP = .25;
function clampGalleryZoom(zoom) {
	if (!Number.isFinite(zoom)) return 1;
	return Math.min(4, Math.max(GALLERY_ZOOM_MIN, zoom));
}
/** Move one predictable 25% stop in either direction. */
function nextGalleryZoom(zoom, direction) {
	if (Number.isFinite(zoom) && zoom < .25) return GALLERY_ZOOM_MIN;
	if (Number.isFinite(zoom) && zoom > 4) return 4;
	const stops = clampGalleryZoom(zoom) / GALLERY_ZOOM_STEP;
	return clampGalleryZoom((direction > 0 ? Math.floor(stops + 1e-8) + 1 : Math.ceil(stops - 1e-8) - 1) * GALLERY_ZOOM_STEP);
}
function galleryZoomPercent(zoom) {
	const percent = (Number.isFinite(zoom) && zoom > 0 ? zoom : 1) * 100;
	return `${percent < 1 ? Math.max(.1, Math.round(percent * 10) / 10) : Math.round(percent)}%`;
}
/** Contain the entire frame inside the current viewport without resizing the card. */
function calculateGalleryFitViewZoom(viewportWidth, viewportHeight, contentWidth, contentHeight) {
	if (!Number.isFinite(viewportWidth) || viewportWidth <= 0 || !Number.isFinite(viewportHeight) || viewportHeight <= 0 || !Number.isFinite(contentWidth) || contentWidth <= 0 || !Number.isFinite(contentHeight) || contentHeight <= 0) return 1;
	return Math.min(4, viewportWidth / contentWidth, viewportHeight / contentHeight);
}
/** Resolve a keyboard zoom command without reversing direction at either limit. */
function galleryZoomCommandTarget(zoom, command) {
	if (command === "reset") return 1;
	if (command === "in") {
		if (zoom >= 3.99999999) return void 0;
		return nextGalleryZoom(zoom, 1);
	}
	if (zoom <= .25000001) return void 0;
	return nextGalleryZoom(zoom, -1);
}
function galleryZoomShortcut(key, modifier) {
	if (!modifier) return void 0;
	if (key === "+" || key === "=") return "in";
	if (key === "-" || key === "_") return "out";
	if (key === "0") return "reset";
}
const GALLERY_COMPACT_MAX_HEIGHT = 560;
/** Shared geometry keeps labels and glyphs on one visual center line. */
const GALLERY_TOOLBAR_CONTROL_HEIGHT = 28;
const GALLERY_TOOLBAR_CONTROL_LAYOUT = Object.freeze({
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	boxSizing: "border-box",
	height: 28,
	lineHeight: 1,
	verticalAlign: "middle"
});
function galleryViewportMaxHeight(fitContent) {
	return fitContent ? void 0 : 560;
}
const styles$1 = {
	gallery: {
		display: "flex",
		flexDirection: "column",
		gap: 8
	},
	mainShell: {
		display: "flex",
		flexDirection: "column",
		gap: 8,
		minWidth: 0
	},
	previewShell: {
		position: "relative",
		minWidth: 0
	},
	mainViewport: {
		maxHeight: 560,
		overflow: "auto",
		overscrollBehavior: "contain",
		borderRadius: 6,
		border: "1px solid rgba(128,128,128,0.25)",
		background: "rgba(128,128,128,0.06)"
	},
	mainImage: {
		display: "block",
		maxWidth: "none",
		height: "auto",
		margin: "0 auto"
	},
	zoomToolbar: {
		display: "flex",
		alignItems: "center",
		flexWrap: "wrap",
		gap: 4,
		marginLeft: "auto",
		minWidth: 0
	},
	zoomButton: {
		...GALLERY_TOOLBAR_CONTROL_LAYOUT,
		minWidth: 28,
		padding: "0 8px",
		borderRadius: 5,
		border: "1px solid var(--ui-border, rgba(128,128,128,0.35))",
		color: "var(--ui-text, inherit)",
		background: "var(--ui-card-bg, rgba(128,128,128,0.08))",
		cursor: "pointer",
		font: "inherit",
		fontSize: 12,
		lineHeight: 1,
		whiteSpace: "nowrap"
	},
	zoomPercent: {
		...GALLERY_TOOLBAR_CONTROL_LAYOUT,
		minWidth: 42,
		padding: "0 3px",
		textAlign: "center",
		fontSize: 11,
		fontVariantNumeric: "tabular-nums",
		lineHeight: 1
	},
	counter: {
		position: "absolute",
		right: 9,
		top: 9,
		padding: "3px 7px",
		borderRadius: 99,
		color: "#fff",
		background: "rgba(15,15,18,0.72)",
		fontSize: 11,
		lineHeight: 1.3,
		pointerEvents: "none",
		backdropFilter: "blur(4px)"
	},
	controls: {
		display: "flex",
		alignItems: "center",
		flexWrap: "wrap",
		minWidth: 0,
		gap: 7,
		fontSize: 12,
		color: "var(--ui-text-muted, #888)"
	},
	currentName: {
		flex: "1 1 120px",
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap"
	},
	arrow: {
		...GALLERY_TOOLBAR_CONTROL_LAYOUT,
		width: 28,
		minWidth: 28,
		padding: 0,
		borderRadius: 99,
		border: "1px solid var(--ui-border, rgba(128,128,128,0.35))",
		color: "var(--ui-text, inherit)",
		background: "var(--ui-card-bg, rgba(128,128,128,0.08))",
		cursor: "pointer",
		font: "inherit",
		fontSize: 20,
		lineHeight: 1
	},
	strip: {
		display: "flex",
		gap: 8,
		minWidth: 0,
		overflowX: "auto",
		overflowY: "hidden",
		padding: "1px 1px 7px",
		scrollSnapType: "x proximity",
		scrollbarWidth: "thin",
		overscrollBehaviorX: "contain"
	},
	thumbnail: {
		flex: "0 0 112px",
		width: 112,
		height: 84,
		padding: 3,
		overflow: "hidden",
		scrollSnapAlign: "start",
		borderRadius: 7,
		border: "1px solid rgba(128,128,128,0.3)",
		background: "rgba(128,128,128,0.06)",
		cursor: "pointer"
	},
	thumbnailSelected: {
		border: "2px solid var(--ui-accent, #0ea5e9)",
		padding: 2,
		boxShadow: "0 0 0 1px color-mix(in srgb, var(--ui-accent, #0ea5e9) 28%, transparent)"
	},
	thumbnailImage: {
		display: "block",
		width: "100%",
		height: "100%",
		objectFit: "contain",
		borderRadius: 4
	},
	failure: {
		minHeight: 128,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: 18,
		color: "var(--ui-text-muted, #888)",
		fontSize: 12,
		textAlign: "center"
	}
};
/** Large selected preview plus a horizontally-scrollable thumbnail rail. */
function FrameGallery({ frames, selectedIndex, onSelect, locale }) {
	const stripRef = (0, react.useRef)(null);
	const viewportRef = (0, react.useRef)(null);
	const thumbnailRefs = (0, react.useRef)([]);
	const [failedUrls, setFailedUrls] = (0, react.useState)(() => /* @__PURE__ */ new Set());
	const [manualZoom, setManualZoom] = (0, react.useState)(1);
	const [zoomMode, setZoomMode] = (0, react.useState)("manual");
	const [fitContent, setFitContent] = (0, react.useState)(false);
	const [viewportSize, setViewportSize] = (0, react.useState)({
		width: 0,
		height: 0
	});
	const [loadedDimensions, setLoadedDimensions] = (0, react.useState)({});
	const currentIndex = normalizeFrameIndex(selectedIndex, frames.length);
	const current = frames[currentIndex];
	(0, react.useEffect)(() => {
		setFailedUrls(/* @__PURE__ */ new Set());
	}, [frames.map((frame) => frame.previewUrl).join("\n")]);
	(0, react.useEffect)(() => {
		const viewport = viewportRef.current;
		if (viewport === null) return;
		const measure = () => {
			const next = {
				width: viewport.clientWidth,
				height: viewport.clientHeight
			};
			setViewportSize((previous) => previous.width === next.width && previous.height === next.height ? previous : next);
		};
		measure();
		if (typeof ResizeObserver === "undefined") {
			window.addEventListener("resize", measure);
			return () => {
				window.removeEventListener("resize", measure);
			};
		}
		const observer = new ResizeObserver(measure);
		observer.observe(viewport);
		return () => {
			observer.disconnect();
		};
	}, []);
	const select = (0, react.useCallback)((index) => {
		const next = normalizeFrameIndex(index, frames.length);
		onSelect(next);
		requestAnimationFrame(() => {
			const strip = stripRef.current;
			const item = thumbnailRefs.current[next];
			if (strip === null || item === null || item === void 0) return;
			const left = item.offsetLeft - (strip.clientWidth - item.offsetWidth) / 2;
			strip.scrollTo({
				left: Math.max(0, left),
				behavior: "smooth"
			});
		});
	}, [frames.length, onSelect]);
	(0, react.useEffect)(() => {
		viewportRef.current?.scrollTo({
			left: 0,
			top: 0
		});
	}, [current?.previewUrl]);
	if (current === void 0) return null;
	const copy = frameGalleryCopy(locale);
	const failed = failedUrls.has(current.previewUrl);
	const name = frameLabel(current, currentIndex, locale);
	const loaded = loadedDimensions[current.previewUrl];
	const contentWidth = current.width ?? loaded?.width ?? 0;
	const contentHeight = current.height ?? loaded?.height ?? 0;
	const fitViewZoom = calculateGalleryFitViewZoom(viewportSize.width, zoomMode === "fit-view" ? 560 : viewportSize.height, contentWidth, contentHeight);
	const zoom = zoomMode === "fit-view" ? fitViewZoom : manualZoom;
	const zoomLabel = galleryZoomPercent(zoom);
	const canZoomOut = zoom > .25000001;
	const canZoomIn = zoom < 3.99999999;
	const setZoom = (nextZoom) => {
		setManualZoom(clampGalleryZoom(nextZoom));
		setZoomMode("manual");
	};
	const resetZoom = () => {
		setZoom(1);
		viewportRef.current?.scrollTo({
			left: 0,
			top: 0
		});
	};
	const onKeyDown = (event) => {
		const command = galleryZoomShortcut(event.key, event.metaKey || event.ctrlKey);
		if (command !== void 0) {
			event.preventDefault();
			if (command === "reset") resetZoom();
			else {
				const target = galleryZoomCommandTarget(zoom, command);
				if (target !== void 0) setZoom(target);
			}
			return;
		}
		if (event.key === "ArrowLeft" && currentIndex > 0) {
			event.preventDefault();
			select(currentIndex - 1);
		} else if (event.key === "ArrowRight" && currentIndex < frames.length - 1) {
			event.preventDefault();
			select(currentIndex + 1);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		style: styles$1.gallery,
		role: "region",
		"aria-roledescription": copy.carousel,
		"aria-label": `${copy.gallery}: ${frames.length}`,
		"data-openpencil-frame-gallery": "true",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: styles$1.mainShell,
			tabIndex: 0,
			onKeyDown,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: styles$1.controls,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						style: styles$1.currentName,
						title: name,
						children: [frames.length > 1 ? `${currentIndex + 1} / ${frames.length} · ` : "", name]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: styles$1.zoomToolbar,
						role: "toolbar",
						"aria-label": copy.toolbar,
						"data-openpencil-zoom-toolbar": "true",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: {
									...styles$1.zoomButton,
									opacity: canZoomOut ? 1 : .42
								},
								disabled: !canZoomOut,
								"aria-label": copy.zoomOut,
								title: copy.zoomOutTitle,
								onClick: () => {
									setZoom(nextGalleryZoom(zoom, -1));
								},
								children: "−"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("output", {
								style: styles$1.zoomPercent,
								"aria-label": `${copy.previewZoom} ${zoomLabel}`,
								"aria-live": "polite",
								children: zoomLabel
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: {
									...styles$1.zoomButton,
									opacity: canZoomIn ? 1 : .42
								},
								disabled: !canZoomIn,
								"aria-label": copy.zoomIn,
								title: copy.zoomInTitle,
								onClick: () => {
									setZoom(nextGalleryZoom(zoom, 1));
								},
								children: "+"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: {
									...styles$1.zoomButton,
									opacity: zoomMode === "manual" && manualZoom === 1 ? .42 : 1
								},
								disabled: zoomMode === "manual" && manualZoom === 1,
								"aria-label": copy.resetAria,
								title: copy.resetTitle,
								onClick: resetZoom,
								children: copy.reset
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: {
									...styles$1.zoomButton,
									background: zoomMode === "fit-view" ? "color-mix(in srgb, var(--ui-accent, #0ea5e9) 18%, transparent)" : styles$1.zoomButton.background
								},
								"aria-label": copy.fitFrameAria,
								"aria-pressed": zoomMode === "fit-view",
								title: copy.fitFrameTitle,
								onClick: () => {
									const viewport = viewportRef.current;
									if (viewport !== null) setViewportSize({
										width: viewport.clientWidth,
										height: 560
									});
									setFitContent(false);
									setZoomMode("fit-view");
									viewport?.scrollTo({
										left: 0,
										top: 0
									});
								},
								"data-openpencil-fit-view": "true",
								children: copy.fitFrame
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: {
									...styles$1.zoomButton,
									background: fitContent ? "color-mix(in srgb, var(--ui-accent, #0ea5e9) 18%, transparent)" : styles$1.zoomButton.background
								},
								"aria-label": fitContent ? copy.restoreCardAria : copy.fitContentAria,
								"aria-pressed": fitContent,
								title: fitContent ? locale === "zh" ? `${copy.restoreCardAria}（560px）` : `${copy.restoreCardAria} (560px)` : copy.fitContentTitle,
								onClick: () => {
									setZoomMode("manual");
									setFitContent((previous) => !previous);
									viewportRef.current?.scrollTo({
										left: 0,
										top: 0
									});
								},
								"data-openpencil-card-height-toggle": "true",
								children: fitContent ? copy.restoreCard : copy.fitContent
							})
						]
					}),
					frames.length > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						style: {
							...styles$1.arrow,
							opacity: currentIndex === 0 ? .42 : 1
						},
						disabled: currentIndex === 0,
						"aria-label": copy.previous,
						title: copy.previous,
						onClick: () => {
							select(currentIndex - 1);
						},
						children: "‹"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						style: {
							...styles$1.arrow,
							opacity: currentIndex === frames.length - 1 ? .42 : 1
						},
						disabled: currentIndex === frames.length - 1,
						"aria-label": copy.next,
						title: copy.next,
						onClick: () => {
							select(currentIndex + 1);
						},
						children: "›"
					})] }) : null
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: styles$1.previewShell,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					ref: viewportRef,
					style: {
						...styles$1.mainViewport,
						display: zoomMode === "fit-view" ? "flex" : void 0,
						alignItems: zoomMode === "fit-view" ? "center" : void 0,
						justifyContent: zoomMode === "fit-view" ? "center" : void 0,
						height: zoomMode === "fit-view" ? 560 : void 0,
						maxHeight: galleryViewportMaxHeight(fitContent),
						overflow: zoomMode === "fit-view" ? "hidden" : styles$1.mainViewport.overflow
					},
					"data-openpencil-image-viewport": "true",
					"data-card-height-mode": fitContent ? "content" : "compact",
					"data-preview-zoom-mode": zoomMode,
					children: failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: styles$1.failure,
						role: "status",
						children: copy.failed
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						style: {
							...styles$1.mainImage,
							width: contentWidth > 0 ? contentWidth * zoom : "auto"
						},
						src: current.previewUrl,
						alt: `${copy.rendered}: ${name}`,
						loading: "lazy",
						"data-openpencil-preview-zoom": zoomLabel,
						onLoad: (event) => {
							if (current.width !== void 0 && current.height !== void 0) return;
							const image = event.currentTarget;
							if (image.naturalWidth <= 0 || image.naturalHeight <= 0) return;
							setLoadedDimensions((previous) => ({
								...previous,
								[current.previewUrl]: {
									width: image.naturalWidth,
									height: image.naturalHeight
								}
							}));
						},
						onError: () => {
							setFailedUrls((previous) => new Set([...previous, current.previewUrl]));
						}
					})
				}), frames.length > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					style: styles$1.counter,
					children: [
						currentIndex + 1,
						" / ",
						frames.length
					]
				}) : null]
			})]
		}), frames.length > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			ref: stripRef,
			style: styles$1.strip,
			"aria-label": copy.thumbnails,
			"data-openpencil-frame-strip": "true",
			children: frames.map((frame, index) => {
				const selected = index === currentIndex;
				const label = frameLabel(frame, index, locale);
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					ref: (element) => {
						thumbnailRefs.current[index] = element;
					},
					type: "button",
					style: {
						...styles$1.thumbnail,
						...selected ? styles$1.thumbnailSelected : {}
					},
					"aria-label": `${copy.showFrame} ${index + 1}: ${label}`,
					"aria-current": selected ? "true" : void 0,
					title: label,
					onClick: () => {
						select(index);
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						style: styles$1.thumbnailImage,
						src: frame.previewUrl,
						alt: "",
						loading: "lazy"
					})
				}, `${frame.previewUrl}:${index}`);
			})
		}) : null]
	});
}
//#endregion
//#region src/client/index.tsx
/**
* Browser presentation for `design_render`.
*
* PNG remains the replay-safe default. When the host also grants access to
* the source `.op`, the user can opt into one shared, read-only Web SDK
* canvas. The SDK and document are fetched only after that explicit action.
*/
/** Presentation metadata key the host half projects into `block.meta`. */
const PRESENTATION_META_KEY = "$dshOpenPencil";
const DESIGN_RENDER_COPY = {
	en: {
		designRender: "Design render",
		error: "error",
		rendering: "rendering…",
		done: "done",
		renderingDocument: "Rendering the design document…",
		renderFailed: "The render failed.",
		frames: "frames",
		openInteractiveCanvas: "Open interactive canvas",
		editInSidebar: "Edit in sidebar",
		openRenderedPng: "Open rendered PNG",
		downloadPng: "Download PNG",
		editSource: "Edit source .op",
		downloadSource: "Download source .op",
		inspectToolCall: "Inspect tool call",
		noPreview: "No preview channel available in this host.",
		canvas: "OpenPencil canvas",
		zoomOut: "Zoom out",
		zoomIn: "Zoom in",
		fit: "Fit",
		close: "Close",
		readonlyCanvas: "Read-only OpenPencil design canvas",
		loadingCanvas: "Loading interactive canvas…",
		pngRemains: "PNG preview remains available underneath the dialog.",
		canvasUnavailable: "Interactive canvas unavailable",
		openPngFallback: "Open PNG fallback",
		panHint: "Drag to pan · scroll to pan · Ctrl/⌘ + scroll to zoom",
		snapshot: "snapshot",
		editorUnavailable: "Editable OpenPencil canvas is not available for this result."
	},
	zh: {
		designRender: "设计渲染",
		error: "错误",
		rendering: "渲染中…",
		done: "完成",
		renderingDocument: "正在渲染设计文档…",
		renderFailed: "渲染失败。",
		frames: "页",
		openInteractiveCanvas: "打开交互画布",
		editInSidebar: "在侧边栏编辑",
		openRenderedPng: "打开渲染 PNG",
		downloadPng: "下载 PNG",
		editSource: "编辑源文件 .op",
		downloadSource: "下载源文件 .op",
		inspectToolCall: "检查工具调用",
		noPreview: "当前宿主没有可用的预览通道。",
		canvas: "OpenPencil 画布",
		zoomOut: "缩小",
		zoomIn: "放大",
		fit: "适应窗口",
		close: "关闭",
		readonlyCanvas: "只读 OpenPencil 设计画布",
		loadingCanvas: "正在加载交互画布…",
		pngRemains: "对话框下方仍保留 PNG 预览。",
		canvasUnavailable: "交互画布不可用",
		openPngFallback: "打开 PNG 预览",
		panHint: "拖动平移 · 滚动平移 · Ctrl/⌘ + 滚动缩放",
		snapshot: "快照",
		editorUnavailable: "此渲染结果没有可用的 OpenPencil 编辑画布。"
	}
};
function designRenderCopy(locale) {
	return DESIGN_RENDER_COPY[locale];
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function optionalString(record, key) {
	const value = record[key];
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
function optionalFiniteNumber(record, key) {
	const value = record[key];
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function optionalStrings(record, key) {
	const value = record[key];
	if (!Array.isArray(value)) return void 0;
	const strings = value.filter((item) => typeof item === "string" && item.length > 0);
	return strings.length === 0 ? void 0 : strings;
}
function imageGrantOf(value) {
	if (!isRecord(value)) return void 0;
	const path = optionalString(value, "path");
	const previewUrl = optionalString(value, "previewUrl");
	const downloadUrl = optionalString(value, "downloadUrl");
	if (path === void 0 || previewUrl === void 0 || downloadUrl === void 0) return void 0;
	const id = optionalString(value, "id");
	const name = optionalString(value, "name");
	const index = optionalFiniteNumber(value, "index");
	return {
		path,
		previewUrl,
		downloadUrl,
		width: optionalFiniteNumber(value, "width"),
		height: optionalFiniteNumber(value, "height"),
		...id === void 0 ? {} : { id },
		...name === void 0 ? {} : { name },
		...index === void 0 || !Number.isSafeInteger(index) || index < 0 ? {} : { index }
	};
}
function imageGrantsOf(value) {
	if (!Array.isArray(value)) return void 0;
	const frames = value.map(imageGrantOf).filter((frame) => frame !== void 0);
	return frames.length === 0 ? void 0 : frames;
}
function documentGrantOf(envelope, image) {
	const raw = isRecord(envelope.document) ? envelope.document : void 0;
	const legacyImage = isRecord(image) ? image : void 0;
	const url = raw === void 0 ? optionalString(envelope, "documentUrl") ?? optionalString(envelope, "sourceUrl") ?? (legacyImage === void 0 ? void 0 : optionalString(legacyImage, "documentUrl") ?? optionalString(legacyImage, "sourceUrl") ?? optionalString(legacyImage, "opUrl")) : optionalString(raw, "url") ?? optionalString(raw, "documentUrl");
	if (url === void 0) return void 0;
	return {
		url,
		path: raw === void 0 ? optionalString(envelope, "sourcePath") : optionalString(raw, "path"),
		downloadUrl: raw === void 0 ? optionalString(envelope, "documentDownloadUrl") : optionalString(raw, "downloadUrl"),
		bytes: raw === void 0 ? void 0 : optionalFiniteNumber(raw, "bytes"),
		sha256: raw === void 0 ? void 0 : optionalString(raw, "sha256"),
		mimeType: raw === void 0 ? void 0 : optionalString(raw, "mimeType")
	};
}
function viewerGrantOf(value) {
	if (!isRecord(value)) return void 0;
	const sdkUrl = optionalString(value, "sdkUrl");
	const wasmUrl = optionalString(value, "wasmUrl");
	const canvasKitBaseUrl = optionalString(value, "canvasKitBaseUrl") ?? optionalString(value, "assetBaseUrl");
	if (sdkUrl === void 0 || wasmUrl === void 0 || canvasKitBaseUrl === void 0) return void 0;
	return {
		sdkUrl,
		wasmUrl,
		canvasKitBaseUrl
	};
}
function editorGrantOf(value) {
	if (!isRecord(value) || value.enabled !== true) return void 0;
	const launchUrl = optionalString(value, "launchUrl");
	if (launchUrl === void 0) return void 0;
	const refreshUrl = optionalString(value, "refreshUrl");
	return {
		enabled: true,
		launchUrl,
		...refreshUrl === void 0 ? {} : { refreshUrl }
	};
}
/** Parse both the established v1 envelope and the additive v2 shape. */
function grantOf(block) {
	if (!("kind" in block) || block.isError) return void 0;
	const envelope = (isRecord(block.meta) ? block.meta : void 0)?.[PRESENTATION_META_KEY];
	if (!isRecord(envelope) || envelope.schemaVersion !== 1 && envelope.schemaVersion !== 2) return void 0;
	const frames = imageGrantsOf(envelope.frames);
	const image = imageGrantOf(envelope.image) ?? frames?.[0];
	const document = documentGrantOf(envelope, envelope.image);
	if (image === void 0 && document === void 0) return void 0;
	return {
		schemaVersion: envelope.schemaVersion,
		image,
		frames: frames ?? (image === void 0 ? void 0 : [image]),
		document,
		viewer: viewerGrantOf(envelope.viewer),
		editor: editorGrantOf(envelope.editor),
		renderer: optionalString(envelope, "renderer"),
		rendererBinary: optionalString(envelope, "rendererBinary"),
		fidelity: optionalString(envelope, "fidelity"),
		warnings: optionalStrings(envelope, "warnings")
	};
}
/** Flatten the durable result text for the fallback disclosure. */
function resultText(block) {
	if (!("kind" in block)) return null;
	const parts = [];
	for (const item of block.content) parts.push(item.type === "text" ? item.text : JSON.stringify(item, null, 2));
	if (parts.length === 0 && block.error !== void 0) parts.push(`${block.error.name}: ${block.error.code}`);
	return parts.join("\n") || null;
}
const sdkLoads = /* @__PURE__ */ new Map();
/** Load the host-served ESM core SDK without coupling the client bundle to React 19. */
function loadOpenPencilSdk(url) {
	const absoluteUrl = new URL(url, window.location.href).href;
	let pending = sdkLoads.get(absoluteUrl);
	if (pending === void 0) {
		pending = import(
			/* @vite-ignore */
			absoluteUrl
).then((module) => {
			if (!isRecord(module) || typeof module.createViewer !== "function") throw new Error("OpenPencil viewer SDK did not export createViewer");
			return module;
		});
		sdkLoads.set(absoluteUrl, pending);
		pending.catch(() => {
			sdkLoads.delete(absoluteUrl);
		});
	}
	return pending;
}
let activeCanvas;
/** @internal Claim the page-wide SDK singleton; opening another canvas closes this one. */
function claimCanvas(token, close) {
	const previous = activeCanvas;
	activeCanvas = {
		token,
		close
	};
	if (previous !== void 0 && previous.token !== token) previous.close();
	return () => {
		if (activeCanvas?.token === token) activeCanvas = void 0;
	};
}
const styles = {
	card: {
		border: "1px solid var(--ui-border, rgba(128,128,128,0.35))",
		borderRadius: 8,
		overflow: "hidden",
		background: "var(--ui-card-bg, transparent)",
		fontFamily: "inherit"
	},
	head: {
		display: "flex",
		alignItems: "center",
		gap: 8,
		padding: "8px 12px",
		fontSize: 13,
		fontWeight: 600,
		borderBottom: "1px solid var(--ui-border, rgba(128,128,128,0.2))"
	},
	badge: {
		fontSize: 11,
		padding: "1px 8px",
		borderRadius: 99,
		textTransform: "uppercase",
		letterSpacing: .4
	},
	badgeOk: {
		background: "rgba(34,197,94,0.15)",
		color: "#16a34a"
	},
	badgeError: {
		background: "rgba(239,68,68,0.15)",
		color: "#dc2626"
	},
	badgeRunning: {
		background: "rgba(100,116,139,0.15)",
		color: "#64748b"
	},
	body: { padding: 12 },
	imageViewport: {
		maxHeight: 560,
		overflow: "auto",
		overscrollBehavior: "contain",
		borderRadius: 4,
		border: "1px solid rgba(128,128,128,0.25)",
		background: "rgba(128,128,128,0.06)"
	},
	img: {
		display: "block",
		width: "auto",
		maxWidth: "100%",
		height: "auto",
		margin: "0 auto"
	},
	meta: {
		display: "flex",
		alignItems: "center",
		flexWrap: "wrap",
		gap: 10,
		marginTop: 10,
		fontSize: 12,
		color: "var(--ui-text-muted, #888)"
	},
	link: {
		color: "var(--ui-accent, #0ea5e9)",
		textDecoration: "none"
	},
	button: {
		color: "var(--ui-accent, #0ea5e9)",
		background: "none",
		border: "none",
		cursor: "pointer",
		padding: 0,
		font: "inherit",
		fontSize: 12
	},
	primaryButton: {
		border: "1px solid var(--ui-accent, #0ea5e9)",
		borderRadius: 6,
		color: "var(--ui-accent, #0ea5e9)",
		background: "transparent",
		padding: "4px 9px",
		cursor: "pointer",
		font: "inherit",
		fontSize: 12
	},
	pre: {
		whiteSpace: "pre-wrap",
		wordBreak: "break-all",
		fontSize: 12,
		margin: 0,
		maxHeight: "24em",
		overflow: "auto"
	},
	muted: {
		fontSize: 12,
		color: "var(--ui-text-muted, #888)"
	},
	warning: {
		margin: "10px 0 0",
		padding: "7px 9px",
		borderRadius: 6,
		color: "#b45309",
		background: "rgba(245,158,11,0.13)",
		fontSize: 12
	},
	backdrop: {
		position: "fixed",
		inset: 0,
		zIndex: 2147483e3,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
		background: "rgba(0,0,0,0.72)"
	},
	dialog: {
		width: "min(1120px, 94vw)",
		height: "min(820px, 92vh)",
		display: "flex",
		flexDirection: "column",
		overflow: "hidden",
		border: "1px solid var(--ui-border, rgba(128,128,128,0.5))",
		borderRadius: 10,
		background: "var(--ui-card-bg, #17171a)",
		color: "var(--ui-text, #eee)",
		boxShadow: "0 24px 80px rgba(0,0,0,0.45)"
	},
	toolbar: {
		display: "flex",
		alignItems: "center",
		flexWrap: "wrap",
		gap: 8,
		minHeight: 44,
		padding: "7px 10px",
		borderBottom: "1px solid var(--ui-border, rgba(128,128,128,0.3))"
	},
	canvasWrap: {
		position: "relative",
		flex: 1,
		minHeight: 0,
		overflow: "hidden",
		background: "#202124"
	},
	canvas: {
		display: "block",
		width: "100%",
		height: "100%",
		cursor: "grab",
		touchAction: "none"
	},
	overlay: {
		position: "absolute",
		inset: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "column",
		gap: 10,
		padding: 24,
		textAlign: "center",
		background: "rgba(25,25,28,0.92)"
	}
};
function baseName(path) {
	const normalized = path.replaceAll("\\", "/");
	return normalized.slice(normalized.lastIndexOf("/") + 1) || path;
}
/** Size the canvas backing store to its CSS box before CanvasKit attaches. */
function sizeCanvasForDisplay(canvas, devicePixelRatio = window.devicePixelRatio) {
	const cssWidth = Math.max(1, Math.round(canvas.clientWidth));
	const cssHeight = Math.max(1, Math.round(canvas.clientHeight));
	const dpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
	canvas.width = Math.max(1, Math.round(cssWidth * dpr));
	canvas.height = Math.max(1, Math.round(cssHeight * dpr));
	return {
		cssWidth,
		cssHeight,
		dpr
	};
}
function CanvasModal({ grant, onClose, locale }) {
	const canvasRef = (0, react.useRef)(null);
	const viewerRef = (0, react.useRef)();
	const dragRef = (0, react.useRef)();
	const [phase, setPhase] = (0, react.useState)("loading");
	const [failure, setFailure] = (0, react.useState)("");
	const [viewport, setViewport] = (0, react.useState)({
		panX: 0,
		panY: 0,
		zoom: 1
	});
	const documentGrant = grant.document;
	const viewerGrant = grant.viewer;
	const copy = designRenderCopy(locale);
	const fit = (0, react.useCallback)(() => {
		const viewer = viewerRef.current;
		const canvas = canvasRef.current;
		if (viewer === void 0 || canvas === null) return;
		viewer.zoomToFit(Math.max(1, canvas.clientWidth), Math.max(1, canvas.clientHeight));
		setViewport(viewer.viewport);
	}, []);
	const zoomBy = (0, react.useCallback)((factor) => {
		const viewer = viewerRef.current;
		if (viewer === void 0) return;
		viewer.setZoom(Math.min(16, Math.max(.05, viewer.viewport.zoom * factor)));
		setViewport(viewer.viewport);
	}, []);
	(0, react.useEffect)(() => {
		const onKeyDown = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [onClose]);
	(0, react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (canvas === null || documentGrant === void 0 || viewerGrant === void 0) return;
		sizeCanvasForDisplay(canvas);
		const abort = new AbortController();
		let cancelled = false;
		let created;
		setPhase("loading");
		setFailure("");
		const load = async () => {
			try {
				const [sdk, response] = await Promise.all([loadOpenPencilSdk(viewerGrant.sdkUrl), fetch(documentGrant.url, {
					signal: abort.signal,
					credentials: "same-origin"
				})]);
				if (!response.ok) throw new Error(`OpenPencil document request failed (${response.status})`);
				const source = await response.text();
				if (cancelled) return;
				created = await sdk.createViewer({
					canvas,
					doc: source,
					wasmUrl: viewerGrant.wasmUrl,
					canvasKitBaseUrl: viewerGrant.canvasKitBaseUrl
				});
				if (cancelled) {
					created.destroy();
					return;
				}
				viewerRef.current = created;
				const syncViewport = () => {
					if (!cancelled && created !== void 0) setViewport(created.viewport);
				};
				created.on("viewportchange", syncViewport);
				setPhase("ready");
				requestAnimationFrame(() => {
					if (!cancelled) fit();
				});
			} catch (error) {
				if (cancelled || abort.signal.aborted) return;
				setFailure(error instanceof Error ? error.message : String(error));
				setPhase("error");
			}
		};
		load();
		return () => {
			cancelled = true;
			abort.abort();
			viewerRef.current = void 0;
			created?.destroy();
		};
	}, [
		documentGrant?.url,
		fit,
		viewerGrant?.canvasKitBaseUrl,
		viewerGrant?.sdkUrl,
		viewerGrant?.wasmUrl
	]);
	const pointerDown = (event) => {
		const viewer = viewerRef.current;
		if (viewer === void 0) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		const current = viewer.viewport;
		dragRef.current = {
			id: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			panX: current.panX,
			panY: current.panY
		};
	};
	const pointerMove = (event) => {
		const drag = dragRef.current;
		const viewer = viewerRef.current;
		if (drag === void 0 || drag.id !== event.pointerId || viewer === void 0) return;
		viewer.panTo(drag.panX + event.clientX - drag.x, drag.panY + event.clientY - drag.y);
		setViewport(viewer.viewport);
	};
	const pointerUp = (event) => {
		if (dragRef.current?.id === event.pointerId) dragRef.current = void 0;
	};
	const title = documentGrant?.path === void 0 ? copy.canvas : baseName(documentGrant.path);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		style: styles.backdrop,
		role: "presentation",
		"data-openpencil-canvas-modal": "true",
		onMouseDown: (event) => {
			if (event.target === event.currentTarget) onClose();
		},
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: styles.dialog,
			role: "dialog",
			"aria-modal": "true",
			"aria-label": `${copy.canvas}: ${title}`,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: styles.toolbar,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
							style: {
								marginRight: "auto",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap"
							},
							children: title
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							style: styles.primaryButton,
							disabled: phase !== "ready",
							onClick: () => {
								zoomBy(.8);
							},
							"aria-label": copy.zoomOut,
							children: "−"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							style: styles.muted,
							children: [Math.round(viewport.zoom * 100), "%"]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							style: styles.primaryButton,
							disabled: phase !== "ready",
							onClick: () => {
								zoomBy(1.25);
							},
							"aria-label": copy.zoomIn,
							children: "+"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							style: styles.primaryButton,
							disabled: phase !== "ready",
							onClick: fit,
							children: copy.fit
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							style: styles.primaryButton,
							onClick: onClose,
							children: copy.close
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: styles.canvasWrap,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("canvas", {
							ref: canvasRef,
							style: styles.canvas,
							onPointerDown: pointerDown,
							onPointerMove: pointerMove,
							onPointerUp: pointerUp,
							onPointerCancel: pointerUp,
							"aria-label": copy.readonlyCanvas
						}),
						phase === "loading" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: styles.overlay,
							role: "status",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: copy.loadingCanvas }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: styles.muted,
								children: copy.pngRemains
							})]
						}) : null,
						phase === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: styles.overlay,
							role: "alert",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: copy.canvasUnavailable }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: styles.muted,
									children: failure
								}),
								grant.image !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
									style: styles.link,
									href: grant.image.previewUrl,
									target: "_blank",
									rel: "noreferrer",
									children: copy.openPngFallback
								}) : null
							]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						...styles.meta,
						margin: 0,
						padding: "7px 10px"
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: copy.panHint }), documentGrant?.sha256 !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						title: documentGrant.sha256,
						children: [
							copy.snapshot,
							" ",
							documentGrant.sha256.slice(0, 10)
						]
					}) : null]
				})
			]
		})
	});
}
/** Render one `design_render` tool call as a PNG-first card. */
function DesignRenderView({ block, openDetails, openFile, inspect, locale = "en" }) {
	const settled = "kind" in block;
	const error = settled && block.isError;
	const running = !settled;
	const grant = grantOf(block);
	const copy = designRenderCopy(locale);
	const text = resultText(block);
	const frames = grant?.frames ?? [];
	const [selectedFrameIndex, setSelectedFrameIndex] = (0, react.useState)(0);
	const currentFrameIndex = normalizeFrameIndex(selectedFrameIndex, frames.length);
	const selectedFrame = frames[currentFrameIndex] ?? grant?.image;
	const [modalToken, setModalToken] = (0, react.useState)();
	const releaseRef = (0, react.useRef)();
	const closeCanvas = (0, react.useCallback)(() => {
		releaseRef.current?.();
		releaseRef.current = void 0;
		setModalToken(void 0);
	}, []);
	const openCanvas = (0, react.useCallback)(() => {
		const token = Symbol("openpencil-canvas");
		releaseRef.current?.();
		releaseRef.current = claimCanvas(token, () => {
			setModalToken((current) => current === token ? void 0 : current);
		});
		setModalToken(token);
	}, []);
	(0, react.useEffect)(() => () => {
		releaseRef.current?.();
	}, []);
	(0, react.useEffect)(() => {
		setSelectedFrameIndex(0);
	}, [frames.map((frame) => frame.previewUrl).join("\n")]);
	const badge = error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
		style: {
			...styles.badge,
			...styles.badgeError
		},
		children: copy.error
	}) : running ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
		style: {
			...styles.badge,
			...styles.badgeRunning
		},
		children: copy.rendering
	}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
		style: {
			...styles.badge,
			...styles.badgeOk
		},
		children: copy.done
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		style: styles.card,
		"data-tool": "design_render",
		"data-state": error ? "error" : running ? "running" : "success",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: styles.head,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: copy.designRender }), badge]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: styles.body,
				children: [
					running ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: styles.muted,
						children: copy.renderingDocument
					}) : null,
					error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: styles.muted,
						children: text ?? copy.renderFailed
					}) : null,
					!running && !error && frames.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FrameGallery, {
						frames,
						selectedIndex: currentFrameIndex,
						onSelect: setSelectedFrameIndex,
						locale
					}) : null,
					!running && !error && grant?.warnings !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: styles.warning,
						role: "status",
						children: grant.warnings.join(" ")
					}) : null,
					!running && !error && grant !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: styles.meta,
						children: [
							selectedFrame !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: selectedFrame.name ?? baseName(selectedFrame.path) }) : null,
							frames.length > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								frames.length,
								" ",
								copy.frames
							] }) : null,
							grant.renderer !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								title: grant.rendererBinary,
								children: [grant.renderer, grant.fidelity === void 0 ? "" : ` · ${grant.fidelity}`]
							}) : null,
							grant.document !== void 0 && grant.viewer !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: styles.primaryButton,
								onClick: openCanvas,
								children: copy.openInteractiveCanvas
							}) : null,
							grant.document !== void 0 && grant.editor?.enabled === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: styles.primaryButton,
								onClick: openDetails,
								children: copy.editInSidebar
							}) : null,
							selectedFrame !== void 0 && openFile !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: styles.button,
								onClick: () => {
									openFile(selectedFrame.path);
								},
								children: copy.openRenderedPng
							}) : null,
							selectedFrame !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								style: styles.link,
								href: selectedFrame.downloadUrl,
								download: true,
								children: copy.downloadPng
							}) : null,
							grant.document?.path !== void 0 && openFile !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: styles.button,
								onClick: () => {
									openFile(grant.document?.path ?? "");
								},
								children: copy.editSource
							}) : null,
							grant.document?.downloadUrl !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								style: styles.link,
								href: grant.document.downloadUrl,
								download: true,
								children: copy.downloadSource
							}) : null,
							inspect !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: styles.button,
								onClick: inspect,
								children: copy.inspectToolCall
							}) : null
						]
					}) : null,
					!running && !error && grant === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: styles.muted,
						children: copy.noPreview
					}), text !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
						style: {
							...styles.pre,
							marginTop: 8
						},
						children: text
					}) : null] }) : null
				]
			}),
			modalToken !== void 0 && grant?.document !== void 0 && grant.viewer !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CanvasModal, {
				grant,
				onClose: closeCanvas,
				locale
			}) : null
		]
	});
}
/** Render the selected editable design inside DSH's resident details column. */
function OpenPencilEditorPanel({ block, colorScheme, locale }) {
	const grant = grantOf(block);
	if (grant?.editor === void 0 || grant.document === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		style: styles.overlay,
		children: editorPanelCopy(locale).unavailable
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ManagedOpenPencilEditor, {
		grant,
		colorScheme,
		locale
	});
}
/** Required client services. */
const inject = [
	"slots",
	"theme",
	"locale"
];
/** Register the dedicated toolview for `design_render`. */
function apply(ctx) {
	const subscribeTheme = (notify) => ctx.on("theme/change", notify);
	const getColorScheme = () => ctx.theme.getTheme().active.colorScheme;
	const subscribeLocale = (notify) => ctx.on("locale/change", notify);
	const getLocale = () => ctx.locale.getLocale().active;
	const getEditorLocale = () => editorLocaleFromDsh(getLocale());
	const HostSyncedDesignRenderView = (props) => {
		const locale = (0, react.useSyncExternalStore)(subscribeLocale, getLocale, getLocale);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DesignRenderView, {
			...props,
			locale
		});
	};
	const HostSyncedOpenPencilEditorPanel = (props) => {
		const colorScheme = (0, react.useSyncExternalStore)(subscribeTheme, getColorScheme, getColorScheme);
		const locale = (0, react.useSyncExternalStore)(subscribeLocale, getEditorLocale, getEditorLocale);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OpenPencilEditorPanel, {
			...props,
			colorScheme,
			locale
		});
	};
	ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
		name: "tool.call.toolview",
		key: "design_render"
	}, HostSyncedDesignRenderView));
	ctx.slots.inject("tool.details.toolview", () => ctx.slots.register({
		name: "tool.details.toolview",
		key: "design_render"
	}, HostSyncedOpenPencilEditorPanel));
}
//#endregion
exports.DesignRenderView = DesignRenderView;
exports.GALLERY_COMPACT_MAX_HEIGHT = GALLERY_COMPACT_MAX_HEIGHT;
exports.GALLERY_TOOLBAR_CONTROL_HEIGHT = GALLERY_TOOLBAR_CONTROL_HEIGHT;
exports.GALLERY_TOOLBAR_CONTROL_LAYOUT = GALLERY_TOOLBAR_CONTROL_LAYOUT;
exports.GALLERY_ZOOM_MAX = GALLERY_ZOOM_MAX;
exports.GALLERY_ZOOM_MIN = GALLERY_ZOOM_MIN;
exports.GALLERY_ZOOM_STEP = GALLERY_ZOOM_STEP;
exports.OpenPencilEditorPanel = OpenPencilEditorPanel;
exports.PRESENTATION_META_KEY = PRESENTATION_META_KEY;
exports.apply = apply;
exports.calculateGalleryFitViewZoom = calculateGalleryFitViewZoom;
exports.claimCanvas = claimCanvas;
exports.claimEditor = claimEditor;
exports.clampGalleryZoom = clampGalleryZoom;
exports.confirmEditorClose = confirmEditorClose;
exports.designRenderCopy = designRenderCopy;
exports.editorControlUrl = editorControlUrl;
exports.editorGrantForBoot = editorGrantForBoot;
exports.editorIframeUrlWithLocale = editorIframeUrlWithLocale;
exports.editorIframeUrlWithTheme = editorIframeUrlWithTheme;
exports.editorLocaleFromDsh = editorLocaleFromDsh;
exports.editorMessageFrom = editorMessageFrom;
exports.editorOrigin = editorOrigin;
exports.editorPanelCopy = editorPanelCopy;
exports.editorSuccessorFromSave = editorSuccessorFromSave;
exports.editorSuccessorStorageKey = editorSuccessorStorageKey;
exports.encodeEditorOutbound = encodeEditorOutbound;
exports.frameGalleryCopy = frameGalleryCopy;
exports.frameLabel = frameLabel;
exports.galleryViewportMaxHeight = galleryViewportMaxHeight;
exports.galleryZoomCommandTarget = galleryZoomCommandTarget;
exports.galleryZoomPercent = galleryZoomPercent;
exports.galleryZoomShortcut = galleryZoomShortcut;
exports.grantOf = grantOf;
exports.inject = inject;
exports.launchManagedEditor = launchManagedEditor;
exports.loadOpenPencilSdk = loadOpenPencilSdk;
exports.nextGalleryZoom = nextGalleryZoom;
exports.normalizeFrameIndex = normalizeFrameIndex;
exports.parseEditorInbound = parseEditorInbound;
exports.prepareManagedEditor = prepareManagedEditor;
exports.rememberEditorSuccessor = rememberEditorSuccessor;
exports.sizeCanvasForDisplay = sizeCanvasForDisplay;

return module.exports; } });
