import { ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits();
const values = ref({});
watch(() => props.schema, (schema) => {
    const defaults = {};
    for (const field of schema.fields)
        defaults[field.key] = field.default;
    values.value = defaults;
    emit('update', values.value);
}, { immediate: true });
watch(values, () => emit('update', values.value), { deep: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "space-y-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "text-sm font-semibold text-gray-700" },
});
for (const [field] of __VLS_getVForSourceType((__VLS_ctx.schema.fields))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (field.key),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "block text-sm font-medium text-gray-600 mb-1" },
    });
    (field.label);
    if (field.type === 'select') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: (__VLS_ctx.values[field.key]),
            ...{ class: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm" },
        });
        for (const [opt] of __VLS_getVForSourceType((field.options))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: (opt.value),
                value: (opt.value),
            });
            (opt.label);
        }
    }
    else if (field.type === 'number') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            type: "number",
            min: (field.min),
            max: (field.max),
            ...{ class: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm" },
        });
        (__VLS_ctx.values[field.key]);
    }
    else if (field.type === 'text') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            type: "text",
            value: (__VLS_ctx.values[field.key]),
            ...{ class: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm" },
        });
    }
    else if (field.type === 'toggle') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(field.type === 'select'))
                        return;
                    if (!!(field.type === 'number'))
                        return;
                    if (!!(field.type === 'text'))
                        return;
                    if (!(field.type === 'toggle'))
                        return;
                    __VLS_ctx.values[field.key] = !__VLS_ctx.values[field.key];
                } },
            ...{ class: "relative inline-flex h-6 w-11 items-center rounded-full transition-colors" },
            ...{ class: (__VLS_ctx.values[field.key] ? 'bg-primary-600' : 'bg-gray-300') },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
            ...{ class: "inline-block h-4 w-4 transform rounded-full bg-white transition-transform" },
            ...{ class: (__VLS_ctx.values[field.key] ? 'translate-x-6' : 'translate-x-1') },
        });
    }
    if (field.description) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "mt-1 text-xs text-gray-400" },
        });
        (field.description);
    }
}
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-11']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            values: values,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ParamPanel.vue.js.map