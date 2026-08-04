import { onMounted, ref } from 'vue';
import { useGalleryStore } from '@/stores/gallery';
const gallery = useGalleryStore();
const previewing = ref(null);
const urlCache = new Map();
function getURL(item) {
    if (!urlCache.has(item.id))
        urlCache.set(item.id, URL.createObjectURL(item.imageData));
    return urlCache.get(item.id);
}
function previewItem(item) { previewing.value = item; }
function downloadItem(item) {
    const url = getURL(item);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-image-${item.id}.png`;
    a.click();
}
function confirmClear() {
    if (confirm('确定清空所有历史图片吗？此操作不可恢复。'))
        gallery.clear();
}
onMounted(() => gallery.load());
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex items-center justify-between mb-6" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "text-2xl font-bold" },
});
if (__VLS_ctx.gallery.items.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.confirmClear) },
        ...{ class: "px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50" },
    });
}
if (!__VLS_ctx.gallery.loaded) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-center py-20 text-gray-400" },
    });
}
else if (__VLS_ctx.gallery.items.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-center py-20 text-gray-400" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-sm mt-1" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.gallery.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.gallery.loaded))
                        return;
                    if (!!(__VLS_ctx.gallery.items.length === 0))
                        return;
                    __VLS_ctx.previewItem(item);
                } },
            key: (item.id),
            ...{ class: "relative group rounded-lg overflow-hidden border border-gray-200 bg-white cursor-pointer" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.getURL(item)),
            alt: (item.prompt),
            ...{ class: "w-full aspect-square object-cover" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col justify-end p-2" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-white text-xs opacity-0 group-hover:opacity-100 line-clamp-2" },
        });
        (item.prompt);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flex gap-1 mt-1 opacity-0 group-hover:opacity-100" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.gallery.loaded))
                        return;
                    if (!!(__VLS_ctx.gallery.items.length === 0))
                        return;
                    __VLS_ctx.downloadItem(item);
                } },
            ...{ class: "text-white text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.gallery.loaded))
                        return;
                    if (!!(__VLS_ctx.gallery.items.length === 0))
                        return;
                    __VLS_ctx.gallery.remove(item.id);
                } },
            ...{ class: "text-white text-xs px-2 py-1 rounded bg-red-500/50 hover:bg-red-500/70" },
        });
    }
}
if (__VLS_ctx.previewing) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.previewing))
                    return;
                __VLS_ctx.previewing = null;
            } },
        ...{ class: "fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "relative max-w-[90vw] max-h-[90vh]" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.getURL(__VLS_ctx.previewing)),
        alt: "预览",
        ...{ class: "max-w-full max-h-[80vh] rounded-lg" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bg-white rounded-lg mt-3 p-4 max-w-[90vw]" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-sm text-gray-800" },
    });
    (__VLS_ctx.previewing.prompt);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex gap-3 mt-2 text-xs text-gray-500" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.previewing.mode === 'text-to-image' ? '文生图' : '图生图');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.previewing.apiConfig.model);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (new Date(__VLS_ctx.previewing.createdAt).toLocaleString());
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.previewing))
                    return;
                __VLS_ctx.previewing = null;
            } },
        ...{ class: "absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center" },
    });
}
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-red-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-5']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['aspect-square']} */ ;
/** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black/0']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:bg-black/40']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/20']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-white/30']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-500/50']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-red-500/70']} */ ;
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
/** @type {__VLS_StyleScopedClasses['max-h-[80vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[90vw]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
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
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            gallery: gallery,
            previewing: previewing,
            getURL: getURL,
            previewItem: previewItem,
            downloadItem: downloadItem,
            confirmClear: confirmClear,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=GalleryPage.vue.js.map