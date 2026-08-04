import { gptImage2Adapter } from './gpt-image-2';
const adapters = {
    [gptImage2Adapter.id]: gptImage2Adapter,
};
export function getAdapter(id) {
    return adapters[id];
}
export function getAllAdapters() {
    return Object.values(adapters);
}
export function getDefaultAdapter() {
    return gptImage2Adapter;
}
//# sourceMappingURL=registry.js.map