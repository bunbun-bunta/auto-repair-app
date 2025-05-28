// src/renderer/pages/StaffPage/index.tsx
import React from 'react';
import { Box, Container } from '@mui/material';
import { StaffList } from '../../components/features/staff/StaffList';

export const StaffPage: React.FC = () => {
    return (
        <Container maxWidth="xl" sx={{ py: 2 }}>
            <StaffList />
        </Container>
    );
};