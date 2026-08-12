/** Strict loopback JSON-RPC client for one managed OpenPencil editor. */
const MCP_TIMEOUT_MS = 20_000;
const MAX_MCP_RESPONSE_BYTES = 2 * 1024 * 1024;
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function finite(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
function optionalString(value) {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}
function textFromContent(value) {
    if (!Array.isArray(value))
        return '';
    const parts = [];
    for (const item of value) {
        if (isRecord(item) && item.type === 'text' && typeof item.text === 'string')
            parts.push(item.text);
    }
    return parts.join('\n');
}
/** Decode a JSON-RPC tools/call envelope, including MCP's HTTP-200 errors. */
export function parseOpenPencilMcpResponse(tool, value) {
    if (!isRecord(value))
        throw new Error(`OpenPencil MCP ${tool} returned an invalid JSON-RPC response`);
    if (isRecord(value.error)) {
        const message = optionalString(value.error.message) ?? JSON.stringify(value.error);
        throw new Error(`OpenPencil MCP ${tool} failed: ${message}`);
    }
    if (!isRecord(value.result))
        throw new Error(`OpenPencil MCP ${tool} omitted its result`);
    const text = textFromContent(value.result.content);
    if (value.result.isError === true) {
        throw new Error(`OpenPencil MCP ${tool} failed${text === '' ? '' : `: ${text}`}`);
    }
    let decoded = text;
    if (text !== '') {
        try {
            decoded = JSON.parse(text);
        }
        catch {
            // Some first-party tools intentionally return human-readable text.
        }
    }
    if (isRecord(decoded) && decoded.applied === false) {
        const details = Array.isArray(decoded.errors)
            ? decoded.errors.map(error => typeof error === 'string' ? error : JSON.stringify(error)).join('; ')
            : text;
        throw new Error(`OpenPencil MCP ${tool} did not apply${details === '' ? '' : `: ${details}`}`);
    }
    return { tool, value: decoded, text };
}
/** Call a first-party tool on a managed editor without exposing its daemon token. */
export async function callOpenPencilMcp(options) {
    const origin = new URL(options.baseUrl);
    const loopback = origin.hostname === '127.0.0.1' || origin.hostname === 'localhost' || origin.hostname === '::1';
    if (!loopback || (origin.protocol !== 'http:' && origin.protocol !== 'https:')) {
        throw new Error('OpenPencil MCP endpoint must use an HTTP loopback origin');
    }
    if (origin.pathname !== '/' || origin.search !== '' || origin.hash !== '') {
        throw new Error('OpenPencil MCP base URL must be an origin');
    }
    const fetcher = options.fetcher ?? fetch;
    const timeout = AbortSignal.timeout(MCP_TIMEOUT_MS);
    const signal = options.signal === undefined ? timeout : AbortSignal.any([options.signal, timeout]);
    const response = await fetcher(new URL('/mcp', origin).href, {
        method: 'POST',
        headers: {
            authorization: `Bearer ${options.token}`,
            'x-openpencil-token': options.token,
            'content-type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: `dsh-${Date.now().toString(36)}`,
            method: 'tools/call',
            params: { name: options.tool, arguments: options.arguments ?? {} },
        }),
        signal,
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > MAX_MCP_RESPONSE_BYTES)
        throw new Error(`OpenPencil MCP ${options.tool} response is too large`);
    if (!response.ok)
        throw new Error(`OpenPencil MCP ${options.tool} request failed (${response.status})`);
    let value;
    try {
        value = JSON.parse(bytes.toString('utf8'));
    }
    catch {
        throw new Error(`OpenPencil MCP ${options.tool} returned invalid JSON`);
    }
    return parseOpenPencilMcpResponse(options.tool, value);
}
/** Probe the daemon document version before and after a write. */
export async function getOpenPencilMcpVersion(options) {
    const origin = new URL(options.baseUrl);
    const loopback = origin.hostname === '127.0.0.1' || origin.hostname === 'localhost' || origin.hostname === '::1';
    if (!loopback || (origin.protocol !== 'http:' && origin.protocol !== 'https:')) {
        throw new Error('OpenPencil MCP endpoint must use an HTTP loopback origin');
    }
    const response = await (options.fetcher ?? fetch)(new URL('/api/mcp/version', origin).href, {
        headers: { authorization: `Bearer ${options.token}`, 'x-openpencil-token': options.token },
        signal: options.signal,
    });
    if (!response.ok)
        throw new Error(`OpenPencil MCP version probe failed (${response.status})`);
    const value = await response.json();
    if (!isRecord(value) || typeof value.version !== 'number' || !Number.isSafeInteger(value.version) || value.version < 0) {
        throw new Error('OpenPencil MCP version probe returned an invalid result');
    }
    return value.version;
}
function nodeSummary(value) {
    if (!isRecord(value) || typeof value.id !== 'string' || value.id.length === 0)
        return undefined;
    return {
        id: value.id,
        ...(optionalString(value.type) === undefined ? {} : { type: optionalString(value.type) }),
        ...(optionalString(value.name) === undefined ? {} : { name: optionalString(value.name) }),
        ...(finite(value.x) === undefined ? {} : { x: finite(value.x) }),
        ...(finite(value.y) === undefined ? {} : { y: finite(value.y) }),
        ...(finite(value.width) === undefined ? {} : { width: finite(value.width) }),
        ...(finite(value.height) === undefined ? {} : { height: finite(value.height) }),
    };
}
/** Project get_selection into the bounded shape shared with the DSH client. */
export function selectionSnapshotFromMcp(sourcePath, value, updatedAt = Date.now()) {
    if (!isRecord(value))
        throw new Error('OpenPencil get_selection returned an invalid result');
    const selectedIds = Array.isArray(value.selectedIds)
        ? value.selectedIds.filter((id) => typeof id === 'string' && id.length > 0)
        : [];
    const nodes = Array.isArray(value.nodes)
        ? value.nodes.map(nodeSummary).filter((node) => node !== undefined)
        : [];
    return {
        sourcePath,
        activePageId: optionalString(value.activePageId) ?? '',
        selectedIds,
        nodes,
        updatedAt,
    };
}
