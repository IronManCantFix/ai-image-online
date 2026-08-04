import { ref } from 'vue';
import { useGenerationStore } from '@/stores/generation';
import { useSettingsStore } from '@/stores/settings';
import { getAdapter } from '@/adapters/registry';
import ParamPanel from './ParamPanel.vue';
import ResultGallery from './ResultGallery.vue';
import { useGalleryStore } from '@/stores/gallery';
const gen = useGenerationStore();
const settings = useSettingsStore();
const gallery = useGalleryStore();
const prompt = ref('');
const params = ref({});
const adapter = getAdapter(settings.activeProfile?.adapterId || 'gpt-image-2');
const schema = adapter.getParamSchema();
const emit = defineEmits();
function onParamsUpdate(values) { params.value = values; }
async function generate() { await gen.generateTextToImage(prompt.value, params.value); }
function onPreview(img) { emit('preview', img); }
async function onSave(img, _index) {
    await gallery.save({
        adapterId: settings.activeProfile.adapterId,
        mode: 'text-to-image',
        prompt: prompt.value,
        params: params.value,
        image: img,
        apiConfig: { endpoint: settings.activeProfile.config.endpoint, model: settings.activeProfile.config.model },
    });
    emit('saved');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "space-y-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "block text-sm font-medium text-gray-700 mb-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.prompt),
    rows: "6",
    placeholder: "描述你想要生成的图片...",
    ...{ class: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-y" },
});
/** @type {[typeof ParamPanel, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(ParamPanel, new ParamPanel({
    ...{ 'onUpdate': {} },
    schema: (__VLS_ctx.schema),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onUpdate': {} },
    schema: (__VLS_ctx.schema),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onUpdate: (__VLS_ctx.onParamsUpdate)
};
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.generate) },
    disabled: (__VLS_ctx.gen.loading || !__VLS_ctx.prompt.trim()),
    ...{ class: "w-full px-4 py-2.5 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50" },
});
(__VLS_ctx.gen.loading ? '生成中...' : '生成图片');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
/** @type {[typeof ResultGallery, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(ResultGallery, new ResultGallery({
    ...{ 'onPreview': {} },
    ...{ 'onSave': {} },
    loading: (__VLS_ctx.gen.loading),
    error: (__VLS_ctx.gen.error),
    results: (__VLS_ctx.gen.results),
}));
const __VLS_8 = __VLS_7({
    ...{ 'onPreview': {} },
    ...{ 'onSave': {} },
    loading: (__VLS_ctx.gen.loading),
    error: (__VLS_ctx.gen.error),
    results: (__VLS_ctx.gen.results),
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
let __VLS_10;
let __VLS_11;
let __VLS_12;
const __VLS_13 = {
    onPreview: (__VLS_ctx.onPreview)
};
const __VLS_14 = {
    onSave: (__VLS_ctx.onSave)
};
var __VLS_9;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-[320px_1fr]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
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
/** @type {__VLS_StyleScopedClasses['resize-y']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-primary-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-primary-700']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ParamPanel: ParamPanel,
            ResultGallery: ResultGallery,
            gen: gen,
            prompt: prompt,
            schema: schema,
            onParamsUpdate: onParamsUpdate,
            generate: generate,
            onPreview: onPreview,
            onSave: onSave,
        };
    },
    __typeEmits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=TextToImage.vue.js.map