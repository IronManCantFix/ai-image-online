import { ref, computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import TextToImage from './TextToImage.vue';
import ImageToImage from './ImageToImage.vue';
import ImageModal from '@/components/ui/ImageModal.vue';
const settings = useSettingsStore();
const mode = ref('text');
const previewImage = ref(null);
const tabs = [
    { id: 'text', label: '文生图' },
    { id: 'image', label: '图生图' },
];
const hasApiKey = computed(() => !!settings.activeProfile?.config.apiKey);
function onPreview(img) { previewImage.value = img; }
function onSaved() { }
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex gap-2 mb-6 border-b border-gray-200" },
});
for (const [tab] of __VLS_getVForSourceType((__VLS_ctx.tabs))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.mode = tab.id;
            } },
        key: (tab.id),
        ...{ class: "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px" },
        ...{ class: (__VLS_ctx.mode === tab.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700') },
    });
    (tab.label);
}
if (!__VLS_ctx.hasApiKey) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-amber-800 text-sm" },
    });
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: "/settings",
        ...{ class: "underline font-medium" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/settings",
        ...{ class: "underline font-medium" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    var __VLS_3;
}
if (__VLS_ctx.mode === 'text') {
    /** @type {[typeof TextToImage, ]} */ ;
    // @ts-ignore
    const __VLS_4 = __VLS_asFunctionalComponent(TextToImage, new TextToImage({
        ...{ 'onPreview': {} },
        ...{ 'onSaved': {} },
    }));
    const __VLS_5 = __VLS_4({
        ...{ 'onPreview': {} },
        ...{ 'onSaved': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_4));
    let __VLS_7;
    let __VLS_8;
    let __VLS_9;
    const __VLS_10 = {
        onPreview: (__VLS_ctx.onPreview)
    };
    const __VLS_11 = {
        onSaved: (__VLS_ctx.onSaved)
    };
    var __VLS_6;
}
else {
    /** @type {[typeof ImageToImage, ]} */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(ImageToImage, new ImageToImage({
        ...{ 'onPreview': {} },
        ...{ 'onSaved': {} },
    }));
    const __VLS_13 = __VLS_12({
        ...{ 'onPreview': {} },
        ...{ 'onSaved': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    let __VLS_15;
    let __VLS_16;
    let __VLS_17;
    const __VLS_18 = {
        onPreview: (__VLS_ctx.onPreview)
    };
    const __VLS_19 = {
        onSaved: (__VLS_ctx.onSaved)
    };
    var __VLS_14;
}
if (__VLS_ctx.previewImage) {
    /** @type {[typeof ImageModal, ]} */ ;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(ImageModal, new ImageModal({
        ...{ 'onClose': {} },
        image: (__VLS_ctx.previewImage),
    }));
    const __VLS_21 = __VLS_20({
        ...{ 'onClose': {} },
        image: (__VLS_ctx.previewImage),
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    let __VLS_23;
    let __VLS_24;
    let __VLS_25;
    const __VLS_26 = {
        onClose: (...[$event]) => {
            if (!(__VLS_ctx.previewImage))
                return;
            __VLS_ctx.previewImage = null;
        }
    };
    var __VLS_22;
}
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['-mb-px']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-amber-200']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-800']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            TextToImage: TextToImage,
            ImageToImage: ImageToImage,
            ImageModal: ImageModal,
            mode: mode,
            previewImage: previewImage,
            tabs: tabs,
            hasApiKey: hasApiKey,
            onPreview: onPreview,
            onSaved: onSaved,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=GeneratePage.vue.js.map