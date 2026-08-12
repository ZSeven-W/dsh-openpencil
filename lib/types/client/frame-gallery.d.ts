/** Browser capability for one exact top-level OpenPencil frame. */
export interface GalleryFrame {
    path: string;
    previewUrl: string;
    downloadUrl: string;
    width?: number;
    height?: number;
    id?: string;
    name?: string;
    index?: number;
}
export type GalleryLocale = 'zh' | 'en';
export declare function frameGalleryCopy(locale: GalleryLocale): {
    readonly frame: "Frame";
    readonly carousel: "carousel";
    readonly gallery: "OpenPencil frames";
    readonly toolbar: "Preview zoom and card size controls";
    readonly zoomOut: "Zoom out preview";
    readonly zoomOutTitle: "Zoom out by 25% (Ctrl/Cmd −)";
    readonly zoomIn: "Zoom in preview";
    readonly zoomInTitle: "Zoom in by 25% (Ctrl/Cmd +)";
    readonly previewZoom: "Preview zoom";
    readonly reset: "Reset";
    readonly resetAria: "Reset preview zoom to 100%";
    readonly resetTitle: "Reset zoom to 100% (Ctrl/Cmd 0)";
    readonly fitFrame: "Fit frame";
    readonly fitFrameAria: "Fit entire frame inside the current card";
    readonly fitFrameTitle: "Fit the entire frame without changing the card size";
    readonly fitContent: "Fit content";
    readonly fitContentAria: "Fit card height to the entire frame";
    readonly fitContentTitle: "Expand the card to show the entire frame";
    readonly restoreCard: "Restore card";
    readonly restoreCardAria: "Restore compact card height";
    readonly previous: "Previous frame";
    readonly next: "Next frame";
    readonly failed: "This frame preview could not be loaded. Choose another frame or use the download action.";
    readonly rendered: "Rendered OpenPencil frame";
    readonly thumbnails: "Frame thumbnails";
    readonly showFrame: "Show frame";
} | {
    readonly frame: "页面";
    readonly carousel: "轮播";
    readonly gallery: "OpenPencil 页面";
    readonly toolbar: "预览缩放与卡片尺寸控制";
    readonly zoomOut: "缩小预览";
    readonly zoomOutTitle: "缩小 25%（Ctrl/Cmd −）";
    readonly zoomIn: "放大预览";
    readonly zoomInTitle: "放大 25%（Ctrl/Cmd +）";
    readonly previewZoom: "预览缩放";
    readonly reset: "重置";
    readonly resetAria: "将预览缩放重置为 100%";
    readonly resetTitle: "重置为 100%（Ctrl/Cmd 0）";
    readonly fitFrame: "适应画面";
    readonly fitFrameAria: "将整个页面缩放到当前卡片内";
    readonly fitFrameTitle: "不改变卡片大小，完整显示当前页面";
    readonly fitContent: "适应内容";
    readonly fitContentAria: "让卡片高度适应完整页面";
    readonly fitContentTitle: "展开卡片以显示完整页面";
    readonly restoreCard: "还原卡片";
    readonly restoreCardAria: "还原紧凑卡片高度";
    readonly previous: "上一页";
    readonly next: "下一页";
    readonly failed: "当前页面预览加载失败，请选择其他页面或使用下载操作。";
    readonly rendered: "OpenPencil 页面渲染图";
    readonly thumbnails: "页面缩略图";
    readonly showFrame: "显示页面";
};
export declare function normalizeFrameIndex(index: number, length: number): number;
export declare function frameLabel(frame: GalleryFrame, index: number, locale?: GalleryLocale): string;
/** Preview zoom limits are intentionally broad enough for detail inspection. */
export declare const GALLERY_ZOOM_MIN = 0.25;
export declare const GALLERY_ZOOM_MAX = 4;
export declare const GALLERY_ZOOM_STEP = 0.25;
export declare function clampGalleryZoom(zoom: number): number;
/** Move one predictable 25% stop in either direction. */
export declare function nextGalleryZoom(zoom: number, direction: -1 | 1): number;
export declare function galleryZoomPercent(zoom: number): string;
/** Contain the entire frame inside the current viewport without resizing the card. */
export declare function calculateGalleryFitViewZoom(viewportWidth: number, viewportHeight: number, contentWidth: number, contentHeight: number): number;
export type GalleryZoomCommand = 'in' | 'out' | 'reset';
/** Resolve a keyboard zoom command without reversing direction at either limit. */
export declare function galleryZoomCommandTarget(zoom: number, command: GalleryZoomCommand): number | undefined;
export declare function galleryZoomShortcut(key: string, modifier: boolean): GalleryZoomCommand | undefined;
export declare const GALLERY_COMPACT_MAX_HEIGHT = 560;
/** Shared geometry keeps labels and glyphs on one visual center line. */
export declare const GALLERY_TOOLBAR_CONTROL_HEIGHT = 28;
export declare const GALLERY_TOOLBAR_CONTROL_LAYOUT: Readonly<React.CSSProperties>;
/** Optical correction for CJK labels and +/- glyphs inside the centered control box. */
export declare const GALLERY_TOOLBAR_CONTROL_CONTENT_LAYOUT: Readonly<React.CSSProperties>;
export declare function galleryViewportMaxHeight(fitContent: boolean): number | undefined;
export interface FrameGalleryProps {
    frames: readonly GalleryFrame[];
    selectedIndex: number;
    onSelect(index: number): void;
    locale: GalleryLocale;
}
/** Large selected preview plus a horizontally-scrollable thumbnail rail. */
export declare function FrameGallery({ frames, selectedIndex, onSelect, locale }: FrameGalleryProps): import("react").JSX.Element | null;
