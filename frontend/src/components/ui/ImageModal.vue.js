import { computed } from 'vue';
const props = defineProps();
const __VLS_emit = defineEmits();
const imageUrl = computed(() => props.image.url);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('close');
        } },
    ...{ class: "fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: () => { } },
    ...{ class: "relative max-w-[90vw] max-h-[90vh]" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: (__VLS_ctx.imageUrl),
    alt: "预览",
    ...{ class: "max-w-full max-h-[90vh] object-contain rounded-lg" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('close');
        } },
    ...{ class: "absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70" },
});
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-[100]']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[90vw]']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[90vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[90vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-2']} */ ;
/** @type {__VLS_StyleScopedClasses['right-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black/50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-black/70']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            imageUrl: imageUrl,
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
//# sourceMappingURL=ImageModal.vue.js.map