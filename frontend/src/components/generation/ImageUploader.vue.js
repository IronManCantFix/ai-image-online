import { ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits();
const fileInput = ref(null);
const dragOver = ref(false);
const previewUrls = ref([]);
function addFiles(files) {
    const newImages = [...props.images, ...Array.from(files).filter(f => f.type.startsWith('image/'))];
    emit('update:images', newImages);
}
function onFileSelect(e) {
    const target = e.target;
    if (target.files)
        addFiles(target.files);
}
function onDrop(e) {
    dragOver.value = false;
    if (e.dataTransfer?.files)
        addFiles(e.dataTransfer.files);
}
function removeImage(index) {
    emit('update:images', props.images.filter((_, i) => i !== index));
}
watch(() => props.images, (imgs) => {
    previewUrls.value.forEach(url => URL.revokeObjectURL(url));
    previewUrls.value = imgs.map(f => URL.createObjectURL(f));
}, { immediate: true, deep: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "block text-sm font-medium text-gray-700 mb-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onDragover: (...[$event]) => {
            __VLS_ctx.dragOver = true;
        } },
    ...{ onDragleave: (...[$event]) => {
            __VLS_ctx.dragOver = false;
        } },
    ...{ onDrop: (__VLS_ctx.onDrop) },
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.fileInput?.click();
        } },
    ...{ class: "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer" },
    ...{ class: (__VLS_ctx.dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400') },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.onFileSelect) },
    ref: "fileInput",
    type: "file",
    accept: "image/*",
    multiple: true,
    ...{ class: "hidden" },
});
/** @type {typeof __VLS_ctx.fileInput} */ ;
if (__VLS_ctx.images.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-gray-500 text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-gray-400 text-xs mt-1" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex flex-wrap gap-2 justify-center" },
    });
    for (const [img, i] of __VLS_getVForSourceType((__VLS_ctx.previewUrls))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (i),
            ...{ class: "relative" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (img),
            ...{ class: "w-20 h-20 object-cover rounded-md border border-gray-200" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.images.length === 0))
                        return;
                    __VLS_ctx.removeImage(i);
                } },
            ...{ class: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center" },
        });
    }
}
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['w-20']} */ ;
/** @type {__VLS_StyleScopedClasses['h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['-top-2']} */ ;
/** @type {__VLS_StyleScopedClasses['-right-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            fileInput: fileInput,
            dragOver: dragOver,
            previewUrls: previewUrls,
            onFileSelect: onFileSelect,
            onDrop: onDrop,
            removeImage: removeImage,
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
//# sourceMappingURL=ImageUploader.vue.js.map