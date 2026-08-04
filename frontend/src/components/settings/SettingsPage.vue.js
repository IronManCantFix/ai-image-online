import { ref, computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { getAllAdapters, getAdapter } from '@/adapters/registry';
import { useConnectionTest } from '@/composables/useConnectionTest';
const store = useSettingsStore();
const adapters = getAllAdapters();
const { testing, testResult, test } = useConnectionTest();
const showAddProfile = ref(false);
const newProfileName = ref('');
const activeProfile = computed(() => store.activeProfile);
function save() {
    if (activeProfile.value) {
        store.updateProfile(activeProfile.value.id, { config: { ...activeProfile.value.config } });
    }
}
function onAdapterChange() {
    const adapter = getAdapter(activeProfile.value.adapterId);
    if (adapter?.defaultConfig) {
        activeProfile.value.config.model = adapter.defaultConfig.model || '';
        if (!activeProfile.value.config.endpoint && adapter.defaultConfig.endpoint) {
            activeProfile.value.config.endpoint = adapter.defaultConfig.endpoint;
        }
    }
    save();
}
function addProfile() {
    if (!newProfileName.value.trim())
        return;
    const adapter = getAdapter('gpt-image-2');
    store.addProfile(newProfileName.value, adapter.id, {
        endpoint: adapter.defaultConfig.endpoint || '',
        apiKey: '',
        model: adapter.defaultConfig.model || '',
    });
    newProfileName.value = '';
    showAddProfile.value = false;
}
function runTest() {
    if (activeProfile.value) {
        test(activeProfile.value.config.endpoint, activeProfile.value.config.apiKey, activeProfile.value.config.model);
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "max-w-2xl mx-auto" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "text-2xl font-bold mb-6" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mb-6" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "block text-sm font-medium text-gray-700 mb-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex gap-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    ...{ onChange: (...[$event]) => {
            __VLS_ctx.store.setActiveProfile(__VLS_ctx.store.activeProfileId);
        } },
    value: (__VLS_ctx.store.activeProfileId),
    ...{ class: "flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" },
});
for (const [p] of __VLS_getVForSourceType((__VLS_ctx.store.profiles))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (p.id),
        value: (p.id),
    });
    (p.name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showAddProfile = !__VLS_ctx.showAddProfile;
        } },
    ...{ class: "px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50" },
});
if (__VLS_ctx.store.profiles.length > 1) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.store.profiles.length > 1))
                    return;
                __VLS_ctx.store.deleteProfile(__VLS_ctx.activeProfile.id);
            } },
        ...{ class: "px-3 py-2 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50" },
    });
}
if (__VLS_ctx.showAddProfile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mt-2 flex gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "配置名称",
        ...{ class: "flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" },
    });
    (__VLS_ctx.newProfileName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.addProfile) },
        ...{ class: "px-3 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700" },
    });
}
if (__VLS_ctx.activeProfile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "space-y-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "block text-sm font-medium text-gray-700 mb-1" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ...{ onChange: (__VLS_ctx.onAdapterChange) },
        value: (__VLS_ctx.activeProfile.adapterId),
        ...{ class: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm" },
    });
    for (const [a] of __VLS_getVForSourceType((__VLS_ctx.adapters))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: (a.id),
            value: (a.id),
        });
        (a.name);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "block text-sm font-medium text-gray-700 mb-1" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onInput: (__VLS_ctx.save) },
        placeholder: "https://www.dreamfield.top/v1",
        ...{ class: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm" },
    });
    (__VLS_ctx.activeProfile.config.endpoint);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "mt-1 text-xs text-gray-500" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "block text-sm font-medium text-gray-700 mb-1" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onInput: (__VLS_ctx.save) },
        type: "password",
        placeholder: "sk-...",
        ...{ class: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm" },
    });
    (__VLS_ctx.activeProfile.config.apiKey);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "block text-sm font-medium text-gray-700 mb-1" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onInput: (__VLS_ctx.save) },
        placeholder: "gpt-image-2",
        ...{ class: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm" },
    });
    (__VLS_ctx.activeProfile.config.model);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pt-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.runTest) },
        disabled: (__VLS_ctx.testing),
        ...{ class: "px-4 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50" },
    });
    (__VLS_ctx.testing ? '测试中...' : '测试连接');
    if (__VLS_ctx.testResult) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: (__VLS_ctx.testResult.ok ? 'text-green-600' : 'text-red-600') },
            ...{ class: "mt-2 text-sm" },
        });
        (__VLS_ctx.testResult.message);
    }
}
/** @type {__VLS_StyleScopedClasses['max-w-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-red-50']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-primary-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-primary-700']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-primary-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-primary-700']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            store: store,
            adapters: adapters,
            testing: testing,
            testResult: testResult,
            showAddProfile: showAddProfile,
            newProfileName: newProfileName,
            activeProfile: activeProfile,
            save: save,
            onAdapterChange: onAdapterChange,
            addProfile: addProfile,
            runTest: runTest,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=SettingsPage.vue.js.map