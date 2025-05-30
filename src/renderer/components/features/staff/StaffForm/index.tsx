// src/renderer/components/features/staff/StaffForm/index.tsx (修正版)
import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Alert,
    CircularProgress,
    Grid,
    IconButton,
    Tooltip,
} from '@mui/material';
import { ColorLens, Close } from '@mui/icons-material';

// ❌ 修正前: 相対パスで複雑
// import { Staff, StaffFormData } from '../../../../shared/types';
// import { EVENT_COLORS, PERMISSION_LEVELS } from '../../../../shared/constants';
// import { useStaff } from '../../../hooks/useStaff';

// ✅ 修正後: パスエイリアスを使用（シンプル）
import { Staff, StaffFormData } from '@shared/types';
import { EVENT_COLORS, PERMISSION_LEVELS } from '@shared/constants';
import { useStaff } from '@renderer/hooks/useStaff';

export interface StaffFormProps {
    open: boolean;
    onClose: () => void;
    editingStaff?: Staff | null;
    onSuccess?: (staff: Staff) => void;
}

interface FormErrors {
    name?: string;
    email?: string;
    displayColor?: string;
}

export const StaffForm: React.FC<StaffFormProps> = ({
    open,
    onClose,
    editingStaff,
    onSuccess,
}) => {
    const { createStaff, updateStaff, checkColorUsage, loading, error, clearError } = useStaff();

    // フォームデータ
    const [formData, setFormData] = useState<StaffFormData>({
        name: '',
        displayColor: EVENT_COLORS[0],
        email: '',
        oauthStatus: '未認証',
        permissionLevel: '一般',
    });

    // バリデーションエラー
    const [errors, setErrors] = useState<FormErrors>({});

    // 色選択ダイアログの表示状態
    const [showColorPicker, setShowColorPicker] = useState(false);

    // フォームデータの初期化
    useEffect(() => {
        if (open) {
            if (editingStaff) {
                // 編集モード
                setFormData({
                    name: editingStaff.name,
                    displayColor: editingStaff.displayColor,
                    email: editingStaff.email || '',
                    oauthStatus: editingStaff.oauthStatus,
                    permissionLevel: editingStaff.permissionLevel,
                });
            } else {
                // 新規作成モード
                setFormData({
                    name: '',
                    displayColor: EVENT_COLORS[0],
                    email: '',
                    oauthStatus: '未認証',
                    permissionLevel: '一般',
                });
            }
            setErrors({});
            clearError();
        }
    }, [open, editingStaff, clearError]);

    // 入力値変更ハンドラー
    const handleChange = useCallback((field: keyof StaffFormData, value: any) => {
        setFormData((prev: StaffFormData) => ({ ...prev, [field]: value }));

        // エラーをクリア
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    // バリデーション
    const validateForm = useCallback(async (): Promise<boolean> => {
        const newErrors: FormErrors = {};

        // 名前の必須チェック
        if (!formData.name.trim()) {
            newErrors.name = 'スタッフ名は必須です';
        }

        // メールアドレスの形式チェック
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'メールアドレスの形式が正しくありません';
        }

        // 表示色の重複チェック
        if (formData.displayColor) {
            const colorUsage = await checkColorUsage(
                formData.displayColor,
                editingStaff?.id
            );

            if (colorUsage?.isUsed) {
                newErrors.displayColor = 'この色は既に他のスタッフが使用しています';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, editingStaff?.id, checkColorUsage]);

    // フォーム送信
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!(await validateForm())) {
            return;
        }

        try {
            let success = false;

            if (editingStaff) {
                // 更新
                success = await updateStaff(editingStaff.id!, formData);
            } else {
                // 新規作成
                success = await createStaff(formData);
            }

            if (success) {
                if (onSuccess) {
                    onSuccess(editingStaff || {} as Staff);
                }
                onClose();
            }
        } catch (error) {
            console.error('Form submission error:', error);
        }
    }, [formData, editingStaff, validateForm, updateStaff, createStaff, onSuccess, onClose]);

    // カラーピッカーハンドラー
    const handleColorSelect = useCallback((color: string) => {
        handleChange('displayColor', color);
        setShowColorPicker(false);
    }, [handleChange]);

    // フォームリセット
    const handleClose = useCallback(() => {
        setFormData({
            name: '',
            displayColor: EVENT_COLORS[0],
            email: '',
            oauthStatus: '未認証',
            permissionLevel: '一般',
        });
        setErrors({});
        clearError();
        onClose();
    }, [onClose, clearError]);

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            {editingStaff ? 'スタッフ編集' : '新規スタッフ登録'}
                            <IconButton onClick={handleClose} size="small">
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <DialogContent dividers>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Grid container spacing={2}>
                            {/* スタッフ名 */}
                            <Grid item xs={12}>
                                <TextField
                                    label="スタッフ名"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    fullWidth
                                    required
                                    autoFocus
                                />
                            </Grid>

                            {/* メールアドレス */}
                            <Grid item xs={12}>
                                <TextField
                                    label="メールアドレス"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    error={!!errors.email}
                                    helperText={errors.email || 'Googleカレンダー連携に使用されます'}
                                    fullWidth
                                />
                            </Grid>

                            {/* 表示色 */}
                            <Grid item xs={12}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <TextField
                                        label="表示色"
                                        value={formData.displayColor}
                                        onChange={(e) => handleChange('displayColor', e.target.value)}
                                        error={!!errors.displayColor}
                                        helperText={errors.displayColor}
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <Box
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                        backgroundColor: formData.displayColor,
                                                        borderRadius: 1,
                                                        mr: 1,
                                                        border: '1px solid #ccc',
                                                    }}
                                                />
                                            ),
                                        }}
                                    />
                                    <Tooltip title="色を選択">
                                        <IconButton
                                            onClick={() => setShowColorPicker(true)}
                                            size="large"
                                        >
                                            <ColorLens />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Grid>

                            {/* 権限レベル */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>権限レベル</InputLabel>
                                    <Select
                                        value={formData.permissionLevel}
                                        onChange={(e) => handleChange('permissionLevel', e.target.value)}
                                        label="権限レベル"
                                    >
                                        <MenuItem value="一般">一般</MenuItem>
                                        <MenuItem value="管理者">管理者</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* OAuth認証状態（編集時のみ表示） */}
                            {editingStaff && (
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>OAuth認証状態</InputLabel>
                                        <Select
                                            value={formData.oauthStatus}
                                            onChange={(e) => handleChange('oauthStatus', e.target.value)}
                                            label="OAuth認証状態"
                                        >
                                            <MenuItem value="未認証">未認証</MenuItem>
                                            <MenuItem value="認証済み">認証済み</MenuItem>
                                            <MenuItem value="期限切れ">期限切れ</MenuItem>
                                            <MenuItem value="エラー">エラー</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleClose} disabled={loading}>
                            キャンセル
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                            {editingStaff ? '更新' : '登録'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* カラーピッカーダイアログ */}
            <Dialog
                open={showColorPicker}
                onClose={() => setShowColorPicker(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>表示色を選択</DialogTitle>
                <DialogContent>
                    <Grid container spacing={1}>
                        {EVENT_COLORS.map((color: string) => (
                            <Grid item xs={3} key={color}>
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 48,
                                        backgroundColor: color,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        border: formData.displayColor === color ? '3px solid #1976d2' : '1px solid #ccc',
                                        '&:hover': {
                                            opacity: 0.8,
                                        },
                                    }}
                                    onClick={() => handleColorSelect(color)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowColorPicker(false)}>
                        キャンセル
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};