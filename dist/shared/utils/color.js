"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorUtils = void 0;
// src/shared/utils/color.ts （独立ファイル作成）
exports.ColorUtils = {
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    },
    rgbToHex: (r, g, b) => {
        return `#${[r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`;
    },
    lighten: (color, percent) => {
        const rgb = exports.ColorUtils.hexToRgb(color);
        if (!rgb)
            return color;
        const { r, g, b } = rgb;
        const lightR = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
        const lightG = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
        const lightB = Math.min(255, Math.floor(b + (255 - b) * percent / 100));
        return exports.ColorUtils.rgbToHex(lightR, lightG, lightB);
    },
    darken: (color, percent) => {
        const rgb = exports.ColorUtils.hexToRgb(color);
        if (!rgb)
            return color;
        const { r, g, b } = rgb;
        const darkR = Math.max(0, Math.floor(r * (100 - percent) / 100));
        const darkG = Math.max(0, Math.floor(g * (100 - percent) / 100));
        const darkB = Math.max(0, Math.floor(b * (100 - percent) / 100));
        return exports.ColorUtils.rgbToHex(darkR, darkG, darkB);
    },
    getContrastColor: (backgroundColor) => {
        const rgb = exports.ColorUtils.hexToRgb(backgroundColor);
        if (!rgb)
            return '#000000';
        const { r, g, b } = rgb;
        const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    },
    isValidHexColor: (color) => {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    },
};
//# sourceMappingURL=color.js.map