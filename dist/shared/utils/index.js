"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = exports.ColorUtils = exports.ValidationUtils = void 0;
// src/shared/utils/index.ts
__exportStar(require("./validation"), exports);
__exportStar(require("./color"), exports);
__exportStar(require("./date"), exports);
__exportStar(require("./format"), exports);
// 統合されたValidationUtils（validateDateRange追加）
const constants_1 = require("../constants");
exports.ValidationUtils = {
    validateRequired: (value) => {
        const isValid = value !== undefined && value !== null && value !== '';
        return {
            isValid,
            errors: isValid ? [] : [constants_1.ERROR_MESSAGES.REQUIRED],
        };
    },
    validateEmail: (email) => {
        if (!email)
            return { isValid: true, errors: [] }; // Optional field
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        return {
            isValid,
            errors: isValid ? [] : [constants_1.ERROR_MESSAGES.INVALID_EMAIL],
        };
    },
    validateDateRange: (startDate, endDate) => {
        if (!startDate || !endDate)
            return { isValid: true, errors: [] };
        const start = new Date(startDate);
        const end = new Date(endDate);
        const isValid = start <= end;
        return {
            isValid,
            errors: isValid ? [] : [constants_1.ERROR_MESSAGES.DATE_RANGE_ERROR],
        };
    },
    combineValidationResults: (results) => {
        const allErrors = results.flatMap(result => result.errors);
        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
        };
    },
};
// ColorUtils
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
// DateUtils
exports.DateUtils = {
    // 日付をフォーマット
    format: (date, format = 'YYYY-MM-DD') => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const map = {
            'YYYY': d.getFullYear().toString(),
            'MM': (d.getMonth() + 1).toString().padStart(2, '0'),
            'DD': d.getDate().toString().padStart(2, '0'),
            'HH': d.getHours().toString().padStart(2, '0'),
            'mm': d.getMinutes().toString().padStart(2, '0'),
        };
        return Object.entries(map).reduce((result, [key, value]) => result.replace(key, value), format);
    },
    // 日付が有効かチェック
    isValid: (date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d instanceof Date && !isNaN(d.getTime());
    },
    // 日数を追加
    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    // 同じ日かチェック
    isSameDay: (date1, date2) => {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    },
};
//# sourceMappingURL=index.js.map