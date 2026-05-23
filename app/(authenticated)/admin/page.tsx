"use client";

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Box, Card, Tabs, Tab, Stack, Typography } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import HistoryIcon from '@mui/icons-material/History';
import Breadcrumb from '@/components/Breadcrumb';
import { AdminPartnersTab } from '@/components/admin/AdminPartnersTab';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminQuestionCategoriesTab } from '@/components/admin/AdminQuestionCategoriesTab';
import { AdminAuditLogsTab } from '@/components/admin/AdminAuditLogsTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ProtectedRoute requiredPermission="manage users">
      <Stack spacing={3}>
        <Breadcrumb items={[{ label: 'پنل مدیریت' }]} />
        <Box>
          <Typography variant="h4">پنل مدیریت</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            کاربران، شرکا و لاگ تغییرات
          </Typography>
        </Box>

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab icon={<PeopleIcon />} label="کاربران" iconPosition="start" data-cy="admin-tab-users" />
              <Tab icon={<HistoryIcon />} label="لاگ‌ها" iconPosition="start" />
              <Tab icon={<BusinessIcon />} label="شرکا" iconPosition="start" data-cy="admin-tab-partners" />
              <Tab icon={<CategoryIcon />} label="دسته‌بندی سوالات" iconPosition="start" data-cy="admin-tab-question-categories" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <AdminUsersTab isActive={tabValue === 0} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <AdminAuditLogsTab isActive={tabValue === 1} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <AdminPartnersTab isActive={tabValue === 2} />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <AdminQuestionCategoriesTab isActive={tabValue === 3} />
          </TabPanel>
        </Card>
      </Stack>
    </ProtectedRoute>
  );
}
