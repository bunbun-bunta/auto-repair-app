// src/renderer/components/features/staff/StaffList/index.tsx (修正版)
import React, { useState, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    Chip,
    Alert,
    Fade,
    Grid,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Divider,
    Avatar,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Google,
    AdminPanelSettings,
    Person,
    Refresh,
} from '@mui/icons-material';

// ❌ 修正前: 相対パスで複雑
// import { Staff } from '../../../../shared/types';
// import { useStaff } from '../../../hooks/useStaff';

// ✅ 修正後: パスエイリアスを使用（シンプル）
import { Staff } from '@shared/types';
import { useStaff } from '@renderer/hooks/useStaff';
import { StaffForm } from '../StaffForm';

interface StaffCardProps {
    staff: Staff;
    onEdit: (staff: Staff) => void;
    onDelete: (staff: Staff) => void;
    onAuthStatusUpdate: (staff: Staff) => void;
}

const StaffCard: React.FC<StaffCardProps> = ({
    staff,
    onEdit,
    onDelete,
    onAuthStatusUpdate,
}) => {
    return (
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar
                        sx={{
                            bgcolor: staff.displayColor,
                            color: 'white',
                            width: 48,
                            height: 48,
                        }}
                    >
                        {staff.name.charAt(0)}
                    </Avatar>
                    <Box flex={1}>
                        <Typography variant="h6" component="div">
                            {staff.name}
                        </Typography>
                        {staff.email && (
                            <Typography variant="body2" color="text.secondary">
                                {staff.email}
                            </Typography>
                        )}
                    </Box>
                    <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                        <Tooltip title={staff.permissionLevel === '管理者' ? '管理者' : '一般ユーザー'}>
                            <Chip
                                icon={staff.permissionLevel === '管理者' ? <AdminPanelSettings /> : <Person />}
                                label={staff.permissionLevel}
                                size="small"
                                color={staff.permissionLevel === '管理者' ? 'primary' : 'default'}
                            />
                        </Tooltip>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                        OAuth認証状態
                    </Typography>
                    <Chip
                        label={staff.oauthStatus}
                        size="small"
                        color={
                            staff.oauthStatus === '認証済み' ? 'success' :
                                staff.oauthStatus === 'エラー' ? 'error' :
                                    staff.oauthStatus === '期限切れ' ? 'warning' : 'default'
                        }
                        variant={staff.oauthStatus === '認証済み' ? 'filled' : 'outlined'}
                    />
                </Box>

                <Box display="flex" gap={1} mt={2}>
                    <Tooltip title="編集">
                        <IconButton
                            size="small"
                            onClick={() => onEdit(staff)}
                            color="primary"
                        >
                            <Edit />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Google認証">
                        <IconButton
                            size="small"
                            onClick={() => onAuthStatusUpdate(staff)}
                            color="secondary"
                            disabled={!staff.email}
                        >
                            <Google />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="削除">
                        <IconButton
                            size="small"
                            onClick={() => onDelete(staff)}
                            color="error"
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </Box>
            </CardContent>
        </Card>
    );
};

export const StaffList: React.FC = () => {
    const {
        staffList,
        loading,
        error,
        statistics,
        loadStaffList,
        deleteStaff,
        updateOAuthStatus,
        checkDependencies,
        clearError,
    } = useStaff();

    // UI状態管理
    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteWarning, setDeleteWarning] = useState<string>('');

    // フォーム表示ハンドラー
    const handleShowForm = useCallback((staff?: Staff) => {
        setEditingStaff(staff || null);
        setShowForm(true);
    }, []);

    // フォーム閉じる
    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingStaff(null);
    }, []);

    // 削除確認ダイアログ表示
    const handleShowDeleteDialog = useCallback(async (staff: Staff) => {
        setDeletingStaff(staff);

        // 依存関係をチェック
        const dependencies = await checkDependencies(staff.id!);

        let warningMessage = `「${staff.name}」を削除してもよろしいですか？`;

        if (dependencies?.hasSchedules) {
            warningMessage = `「${staff.name}」には${dependencies.scheduleCount}件の予定が関連付けられているため削除できません。\n\n関連する予定を先に削除または他のスタッフに変更してから再度お試しください。`;
        }

        setDeleteWarning(warningMessage);
        setShowDeleteDialog(true);
    }, [checkDependencies]);

    // 削除実行
    const handleDelete = useCallback(async () => {
        if (!deletingStaff) return;

        const success = await deleteStaff(deletingStaff.id!);

        if (success) {
            setShowDeleteDialog(false);
            setDeletingStaff(null);
            setDeleteWarning('');
        }
    }, [deletingStaff, deleteStaff]);

    // 削除ダイアログを閉じる
    const handleCloseDeleteDialog = useCallback(() => {
        setShowDeleteDialog(false);
        setDeletingStaff(null);
        setDeleteWarning('');
    }, []);

    // OAuth認証状態更新
    const handleAuthStatusUpdate = useCallback(async (staff: Staff) => {
        if (!staff.email) {
            alert('メールアドレスが設定されていません');
            return;
        }

        // 実際のOAuth認証処理は後の実装で行う
        // ここでは状態を「認証済み」に更新
        await updateOAuthStatus(staff.id!, '認証済み');
    }, [updateOAuthStatus]);

    // 一覧更新
    const handleRefresh = useCallback(() => {
        loadStaffList();
        clearError();
    }, [loadStaffList, clearError]);

    // 統計表示コンポーネント
    const StatisticsCards = () => (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="primary">
                            {statistics?.totalCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            総スタッフ数
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="secondary">
                            {statistics?.adminCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            管理者
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="success.main">
                            {statistics?.authenticatedCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            認証済み
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="warning.main">
                            {statistics?.pendingAuthCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            未認証
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* ヘッダー */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    スタッフ管理
                </Typography>
                <Box display="flex" gap={1}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        更新
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleShowForm()}
                    >
                        新規登録
                    </Button>
                </Box>
            </Box>

            {/* エラー表示 */}
            {error && (
                <Fade in={!!error}>
                    <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                        {error}
                    </Alert>
                </Fade>
            )}

            {/* 統計カード */}
            <StatisticsCards />

            {/* スタッフ一覧 */}
            {loading && staffList.length === 0 ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <Typography>読み込み中...</Typography>
                </Box>
            ) : staffList.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="h6" color="text.secondary" mb={2}>
                            スタッフが登録されていません
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleShowForm()}
                        >
                            最初のスタッフを登録
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {staffList.map((staff: Staff) => (
                        <Grid item xs={12} sm={6} md={4} key={staff.id}>
                            <StaffCard
                                staff={staff}
                                onEdit={handleShowForm}
                                onDelete={handleShowDeleteDialog}
                                onAuthStatusUpdate={handleAuthStatusUpdate}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* スタッフフォームダイアログ */}
            <StaffForm
                open={showForm}
                onClose={handleCloseForm}
                editingStaff={editingStaff}
                onSuccess={handleCloseForm}
            />

            {/* 削除確認ダイアログ */}
            <Dialog
                open={showDeleteDialog}
                onClose={handleCloseDeleteDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    スタッフ削除確認
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ whiteSpace: 'pre-line' }}>
                        {deleteWarning}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>
                        キャンセル
                    </Button>
                    {deletingStaff && deleteWarning.includes('削除できません') ? null : (
                        <Button
                            onClick={handleDelete}
                            color="error"
                            variant="contained"
                            disabled={loading}
                        >
                            削除
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};