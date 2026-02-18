"use client";

import { useState } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import { Box, Card, Tabs, Tab, Stack, Typography } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import Breadcrumb from '@/components/Breadcrumb';
import { AdminPartnersTab } from '@/components/admin/AdminPartnersTab';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';

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
    <UserLayout requiredPermission="manage users">
      <Stack spacing={3}>
        <Breadcrumb items={[{ label: 'پنل مدیریت' }]} />
        <Box>
          <Typography variant="h4">پنل مدیریت</Typography>
        </Box>

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab icon={<BusinessIcon />} label="شرکا" iconPosition="start" data-cy="admin-tab-partners" />
              <Tab icon={<PeopleIcon />} label="کاربران" iconPosition="start" data-cy="admin-tab-users" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <AdminPartnersTab isActive={tabValue === 0} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <AdminUsersTab isActive={tabValue === 1} />
          </TabPanel>
        </Card>
      </Stack>
    </UserLayout>
  );
}
