"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Tabs,
  Tab,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  IconButton,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  useSearchUsers,
  useAddParticipantsByPhone,
  useAddParticipantsByNationalId,
  useAddSelectedParticipants,
  useAddGroupsToExam,
  useRemoveGroupFromExam,
} from '@/hooks/useExams';
import { useGroups, useCreateGroup } from '@/hooks/useGroups';
import { useDebounce } from '@/hooks/useDebounce';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface ParticipantManagementProps {
  examId: number;
  participants: Array<{
    id: number;
    user?: {
      id: number;
      name: string;
      phone_number: string | null;
      email?: string;
      national_id?: string | null;
    } | null;
    group?: {
      id: number;
      name: string;
    } | null;
    score: number | null;
    total_points: number | null;
    passed: boolean;
    status?: string;
    started_at: string | null;
    completed_at: string | null;
  }>;
  groups?: Array<{
    id: number;
    name: string;
    description?: string;
    users_count?: number;
    users?: Array<{
      id: number;
      name: string;
      phone_number: string | null;
      email?: string | null;
      participant?: {
        id: number;
        score: number | null;
        total_points: number | null;
        passed: boolean;
        status: string;
        started_at: string | null;
        completed_at: string | null;
      } | null;
    }>;
  }>;
  registrationLink?: string | null;
  examLink?: string | null;
  onSuccess?: () => void;
}

export default function ParticipantManagement({
  examId,
  participants,
  groups = [],
  registrationLink,
  examLink,
  onSuccess,
}: ParticipantManagementProps) {
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'all' | 'grouped'>('all');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [nationalIds, setNationalIds] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupUserIds, setNewGroupUserIds] = useState<number[]>([]);
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(
    examId,
    { query: debouncedSearchQuery, type: 'both' },
    !!debouncedSearchQuery && debouncedSearchQuery.length >= 3
  );

  const { data: groupsData, refetch: refetchGroups } = useGroups();
  const availableGroups = groupsData || [];

  const addByPhoneMutation = useAddParticipantsByPhone();
  const addByNationalIdMutation = useAddParticipantsByNationalId();
  const addSelectedMutation = useAddSelectedParticipants();
  const addGroupsMutation = useAddGroupsToExam();
  const removeGroupMutation = useRemoveGroupFromExam();
  const createGroupMutation = useCreateGroup();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPhoneNumbers('');
    setNationalIds('');
    setSearchQuery('');
    setSelectedUsers([]);
    setSelectedGroups([]);
  };

  const handleAddByPhone = async () => {
    const phoneList = phoneNumbers
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (phoneList.length === 0) {
      setAlert({
        open: true,
        message: 'لطفاً حداقل یک شماره تلفن وارد کنید',
        severity: 'error',
      });
      return;
    }

    try {
      const result = await addByPhoneMutation.mutateAsync({
        examId,
        data: { phone_numbers: phoneList },
      });
      setAlert({
        open: true,
        message: `${result.added} نفر با موفقیت اضافه شدند. ${result.skipped} نفر قبلاً اضافه شده بودند.`,
        severity: 'success',
      });
      setPhoneNumbers('');
      onSuccess?.();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error.message || 'خطا در افزودن شرکت‌کنندگان',
        severity: 'error',
      });
    }
  };

  const handleAddByNationalId = async () => {
    const idList = nationalIds
      .split('\n')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (idList.length === 0) {
      setAlert({
        open: true,
        message: 'لطفاً حداقل یک کد ملی وارد کنید',
        severity: 'error',
      });
      return;
    }

    try {
      const result = await addByNationalIdMutation.mutateAsync({
        examId,
        data: { national_ids: idList },
      });
      setAlert({
        open: true,
        message: `${result.added} نفر با موفقیت اضافه شدند. ${result.skipped} نفر قبلاً اضافه شده بودند.`,
        severity: 'success',
      });
      setNationalIds('');
      onSuccess?.();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error.message || 'خطا در افزودن شرکت‌کنندگان',
        severity: 'error',
      });
    }
  };

  const handleToggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddSelected = async () => {
    if (selectedUsers.length === 0) {
      setAlert({
        open: true,
        message: 'لطفاً حداقل یک کاربر انتخاب کنید',
        severity: 'error',
      });
      return;
    }

    try {
      const result = await addSelectedMutation.mutateAsync({
        examId,
        data: { user_ids: selectedUsers },
      });
      setAlert({
        open: true,
        message: `${result.added} نفر با موفقیت اضافه شدند. ${result.skipped} نفر قبلاً اضافه شده بودند.`,
        severity: 'success',
      });
      setSelectedUsers([]);
      setSearchQuery('');
      onSuccess?.();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error.message || 'خطا در افزودن شرکت‌کنندگان',
        severity: 'error',
      });
    }
  };

  const handleToggleGroup = (groupId: number) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleAddGroups = async () => {
    if (selectedGroups.length === 0) {
      setAlert({
        open: true,
        message: 'لطفاً حداقل یک گروه انتخاب کنید',
        severity: 'error',
      });
      return;
    }

    try {
      const result = await addGroupsMutation.mutateAsync({
        examId,
        data: { group_ids: selectedGroups },
      });
      setAlert({
        open: true,
        message: `${result.groups_added} گروه با ${result.total_users} کاربر با موفقیت اضافه شدند.`,
        severity: 'success',
      });
      setSelectedGroups([]);
      onSuccess?.();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error.message || 'خطا در افزودن گروه‌ها',
        severity: 'error',
      });
    }
  };

  const handleRemoveGroup = async (groupId: number) => {
    if (!confirm('آیا از حذف این گروه از آزمون اطمینان دارید؟')) return;

    try {
      await removeGroupMutation.mutateAsync({ examId, groupId });
      setAlert({
        open: true,
        message: 'گروه با موفقیت از آزمون حذف شد',
        severity: 'success',
      });
      onSuccess?.();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error.message || 'خطا در حذف گروه',
        severity: 'error',
      });
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setAlert({
        open: true,
        message: 'لطفاً نام گروه را وارد کنید',
        severity: 'error',
      });
      return;
    }

    try {
      await createGroupMutation.mutateAsync({
        name: newGroupName,
        description: newGroupDescription || undefined,
        user_ids: newGroupUserIds.length > 0 ? newGroupUserIds : undefined,
      });
      // Refetch groups list to show the new group
      await refetchGroups();
      setAlert({
        open: true,
        message: 'گروه با موفقیت ایجاد شد',
        severity: 'success',
      });
      setCreateGroupOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupUserIds([]);
      onSuccess?.();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error.message || 'خطا در ایجاد گروه',
        severity: 'error',
      });
    }
  };

  const existingParticipantIds = new Set(participants.map((p) => p.user?.id).filter(Boolean));

  const handleCopyRegistrationLink = () => {
    if (registrationLink) {
      navigator.clipboard.writeText(registrationLink);
      setAlert({
        open: true,
        message: 'لینک ثبت‌نام کپی شد',
        severity: 'success',
      });
    }
  };

  const handleCopyExamLink = () => {
    if (examLink) {
      navigator.clipboard.writeText(examLink);
      setAlert({
        open: true,
        message: 'لینک آزمون کپی شد',
        severity: 'success',
      });
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Add Participants Section */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="لینک‌های آزمون" icon={<LinkIcon />} iconPosition="start" />
              <Tab label="گروه‌ها" icon={<GroupIcon />} iconPosition="start" />
              <Tab label="شماره تلفن" icon={<PhoneIcon />} iconPosition="start" />
              <Tab label="کد ملی" icon={<BadgeIcon />} iconPosition="start" />
              <Tab label="جستجو و انتخاب" icon={<SearchIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Links Tab */}
          <TabPanel value={tabValue} index={0}>
            <CardContent>
              <Stack spacing={3}>
                {/* Registration Link */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    لینک ثبت‌نام آزمون
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    این لینک را برای افرادی که می‌خواهید در آزمون شرکت کنند ارسال کنید. با کلیک روی این لینک، افراد به عنوان شرکت‌کننده ثبت‌نام می‌شوند.
                  </Typography>
                  {registrationLink ? (
                    <TextField
                      value={registrationLink}
                      fullWidth
                      size="small"
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleCopyRegistrationLink} edge="end">
                              <ContentCopyIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  ) : (
                    <Alert severity="info">لینک ثبت‌نام پس از انتشار آزمون ایجاد می‌شود.</Alert>
                  )}
                </Box>
                <Divider />
                {/* Exam Link */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    لینک شرکت در آزمون
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    این لینک را فقط به شرکت‌کنندگانی که قبلاً ثبت‌نام کرده‌اند ارسال کنید. با این لینک مستقیماً وارد آزمون می‌شوند.
                  </Typography>
                  {examLink ? (
                    <TextField
                      value={examLink}
                      fullWidth
                      size="small"
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleCopyExamLink} edge="end">
                              <ContentCopyIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  ) : (
                    <Alert severity="info">
                      لینک شرکت در آزمون از صفحه اطلاعات آزمون با دکمه «تولید لینک آزمون» ایجاد می‌شود.
                    </Alert>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </TabPanel>

          {/* Groups Tab */}
          <TabPanel value={tabValue} index={1}>
            <CardContent>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">گروه‌های موجود</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateGroupOpen(true)}
                  >
                    ایجاد گروه جدید
                  </Button>
                </Box>
                {availableGroups.length > 0 ? (
                  <Paper variant="outlined">
                    <List>
                      {availableGroups.map((group: { id: number; name: string; description?: string; users_count?: number }) => {
                        const isSelected = selectedGroups.includes(group.id);
                        const isInExam = groups.some((g) => g.id === group.id);
                        return (
                          <ListItem
                            key={group.id}
                            secondaryAction={
                              <Stack direction="row" spacing={1}>
                                {isInExam ? (
                                  <Chip label="در آزمون" size="small" color="success" />
                                ) : (
                                  <Checkbox
                                    edge="end"
                                    checked={isSelected}
                                    onChange={() => handleToggleGroup(group.id)}
                                  />
                                )}
                              </Stack>
                            }
                          >
                            <ListItemText
                              primary={group.name}
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {group.description || 'بدون توضیحات'} • {group.users_count || 0} کاربر
                                </Typography>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Paper>
                ) : (
                  <Alert severity="info">هیچ گروهی وجود ندارد. ابتدا یک گروه ایجاد کنید.</Alert>
                )}
                {selectedGroups.length > 0 && (
                  <Button
                    variant="contained"
                    onClick={handleAddGroups}
                    disabled={addGroupsMutation.isPending}
                    startIcon={addGroupsMutation.isPending ? <CircularProgress size={20} /> : <AddIcon />}
                    fullWidth
                  >
                    {addGroupsMutation.isPending ? 'در حال افزودن...' : `افزودن ${selectedGroups.length} گروه`}
                  </Button>
                )}
              </Stack>
            </CardContent>
          </TabPanel>

          {/* Phone Numbers Tab */}
          <TabPanel value={tabValue} index={2}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  شماره تلفن‌ها را در هر خط وارد کنید
                </Typography>
                <TextField
                  multiline
                  rows={6}
                  value={phoneNumbers}
                  onChange={(e) => setPhoneNumbers(e.target.value)}
                  placeholder="09123456789&#10;09187654321&#10;..."
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleAddByPhone}
                  disabled={addByPhoneMutation.isPending || !phoneNumbers.trim()}
                  startIcon={addByPhoneMutation.isPending ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  {addByPhoneMutation.isPending ? 'در حال افزودن...' : 'افزودن شرکت‌کنندگان'}
                </Button>
              </Stack>
            </CardContent>
          </TabPanel>

          {/* National ID Tab */}
          <TabPanel value={tabValue} index={3}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  کد ملی‌ها را در هر خط وارد کنید
                </Typography>
                <TextField
                  multiline
                  rows={6}
                  value={nationalIds}
                  onChange={(e) => setNationalIds(e.target.value)}
                  placeholder="1234567890&#10;0987654321&#10;..."
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleAddByNationalId}
                  disabled={addByNationalIdMutation.isPending || !nationalIds.trim()}
                  startIcon={addByNationalIdMutation.isPending ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  {addByNationalIdMutation.isPending ? 'در حال افزودن...' : 'افزودن شرکت‌کنندگان'}
                </Button>
              </Stack>
            </CardContent>
          </TabPanel>

          {/* Search and Select Tab */}
          <TabPanel value={tabValue} index={4}>
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو بر اساس شماره تلفن یا کد ملی..."
                  fullWidth
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                {isSearching && (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={24} />
                  </Box>
                )}
                {searchResults?.data && searchResults.data.length > 0 && (
                  <Paper variant="outlined">
                    <List>
                      {searchResults.data.map((user) => {
                        const isSelected = selectedUsers.includes(user.id);
                        const isAlreadyAdded = existingParticipantIds.has(user.id);
                        return (
                          <ListItem
                            key={user.id}
                            secondaryAction={
                              <Checkbox
                                edge="end"
                                checked={isSelected}
                                onChange={() => handleToggleUser(user.id)}
                                disabled={isAlreadyAdded}
                              />
                            }
                            disablePadding
                          >
                            <ListItemButton
                              onClick={() => !isAlreadyAdded && handleToggleUser(user.id)}
                              disabled={isAlreadyAdded}
                            >
                              <ListItemText
                                primary={user.name}
                                secondary={
                                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {user.phone_number}
                                    </Typography>
                                    {user.national_id && (
                                      <>
                                        <Typography variant="caption">•</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {user.national_id}
                                        </Typography>
                                      </>
                                    )}
                                  </Stack>
                                }
                              />
                              {isAlreadyAdded && (
                                <Chip label="قبلاً اضافه شده" size="small" color="success" sx={{ ml: 1 }} />
                              )}
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Paper>
                )}
                {searchQuery.length >= 3 && !isSearching && searchResults?.data && searchResults.data.length === 0 && (
                  <Alert severity="info">نتیجه‌ای یافت نشد</Alert>
                )}
                {selectedUsers.length > 0 && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      {selectedUsers.length} کاربر انتخاب شده
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleAddSelected}
                      disabled={addSelectedMutation.isPending}
                      startIcon={addSelectedMutation.isPending ? <CircularProgress size={20} /> : <AddIcon />}
                      fullWidth
                    >
                      {addSelectedMutation.isPending ? 'در حال افزودن...' : 'افزودن انتخاب شده‌ها'}
                    </Button>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </TabPanel>
        </Card>

        {/* Participants List */}
          <Card>
            <CardContent>
              <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">لیست شرکت‌کنندگان ({participants.length})</Typography>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => {
                    if (newMode !== null) setViewMode(newMode);
                  }}
                  size="small"
                >
                  <ToggleButton value="all" aria-label="نمایش همه">
                    <ViewListIcon sx={{ mr: 1 }} />
                    همه
                  </ToggleButton>
                  <ToggleButton value="grouped" aria-label="نمایش بر اساس گروه">
                    <ViewModuleIcon sx={{ mr: 1 }} />
                    بر اساس گروه
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              {participants.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    هنوز کسی در این آزمون شرکت نکرده است
                  </Typography>
                </Box>
              ) : viewMode === 'all' ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>نام</TableCell>
                        <TableCell>شماره تماس</TableCell>
                        <TableCell>کد ملی</TableCell>
                        <TableCell>ایمیل</TableCell>
                        <TableCell>گروه</TableCell>
                        <TableCell align="center">نمره</TableCell>
                        <TableCell align="center">وضعیت</TableCell>
                        <TableCell>تاریخ شروع</TableCell>
                        <TableCell>تاریخ تکمیل</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {participants.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell>{participant.user?.name || '-'}</TableCell>
                          <TableCell>{participant.user?.phone_number || '-'}</TableCell>
                          <TableCell>{participant.user?.national_id || '-'}</TableCell>
                          <TableCell>{participant.user?.email || '-'}</TableCell>
                          <TableCell>
                            {participant.group ? (
                              <Chip label={participant.group.name} size="small" color="primary" />
                            ) : (
                              <Chip label="بدون گروه" size="small" variant="outlined" />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {participant.score !== null && participant.total_points !== null
                              ? `${participant.score} / ${participant.total_points}`
                              : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {participant.completed_at ? (
                              <Chip
                                icon={participant.passed ? <CheckCircleIcon /> : <CancelIcon />}
                                label={participant.passed ? 'قبول' : 'رد'}
                                color={participant.passed ? 'success' : 'error'}
                              size="small"
                              />
                            ) : participant.status === 'absent' ? (
                              <Chip label="غیبت در امتحان" color="error" size="small" />
                            ) : participant.started_at ? (
                              <Chip label="در حال انجام" color="warning" size="small" />
                            ) : (
                              <Chip label="ثبت‌نام شده" color="info" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            {participant.started_at
                              ? new Date(participant.started_at).toLocaleDateString('fa-IR')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {participant.completed_at
                              ? new Date(participant.completed_at).toLocaleDateString('fa-IR')
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Stack spacing={3}>
                  {/* Group participants by their group */}
                  {(() => {
                    // Group participants by group_id
                    const groupedByGroup = new Map<number, typeof participants>();
                    const participantsWithoutGroup: typeof participants = [];
                    
                    participants.forEach((participant) => {
                      if (participant.group?.id) {
                        const groupId = participant.group.id;
                        if (!groupedByGroup.has(groupId)) {
                          groupedByGroup.set(groupId, []);
                        }
                        groupedByGroup.get(groupId)!.push(participant);
                      } else {
                        participantsWithoutGroup.push(participant);
                      }
                    });
                    
                    const groupEntries = Array.from(groupedByGroup.entries());
                    
                    return (
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        {/* Display each group */}
                        {groupEntries.map(([groupId, groupParticipants], index) => {
                          const groupName = groupParticipants[0]?.group?.name || `گروه ${groupId}`;
                          const isLastGroup = index === groupEntries.length - 1 && participantsWithoutGroup.length === 0;
                          return (
                            <Accordion 
                              key={groupId}
                              sx={{
                                boxShadow: 'none',
                                border: 'none',
                                '&:before': {
                                  display: 'none',
                                },
                                '&.Mui-expanded': {
                                  margin: 0,
                                },
                                borderBottom: isLastGroup ? 'none' : '1px solid',
                                borderBottomColor: 'divider',
                              }}
                            >
                              <AccordionSummary 
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'action.hover',
                                  },
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                                  <GroupIcon color="primary" />
                                  <Typography variant="subtitle1" fontWeight="medium">
                                    {groupName} ({groupParticipants.length} نفر)
                                  </Typography>
              </Stack>
                              </AccordionSummary>
                              <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                                <TableContainer component={Paper} variant="outlined">
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>نام</TableCell>
                                        <TableCell>شماره تماس</TableCell>
                                        <TableCell>کد ملی</TableCell>
                                        <TableCell>ایمیل</TableCell>
                                        <TableCell align="center">نمره</TableCell>
                                        <TableCell align="center">وضعیت</TableCell>
                                        <TableCell>تاریخ شروع</TableCell>
                                        <TableCell>تاریخ تکمیل</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {groupParticipants.map((participant) => (
                                        <TableRow key={participant.id}>
                                          <TableCell>{participant.user?.name || '-'}</TableCell>
                                          <TableCell>{participant.user?.phone_number || '-'}</TableCell>
                                          <TableCell>{participant.user?.national_id || '-'}</TableCell>
                                          <TableCell>{participant.user?.email || '-'}</TableCell>
                                          <TableCell align="center">
                                            {participant.score !== null && participant.total_points !== null
                                              ? `${participant.score} / ${participant.total_points}`
                                              : '-'}
                                          </TableCell>
                                          <TableCell align="center">
                                            {participant.completed_at ? (
                                              <Chip
                                                icon={participant.passed ? <CheckCircleIcon /> : <CancelIcon />}
                                                label={participant.passed ? 'قبول' : 'رد'}
                                                color={participant.passed ? 'success' : 'error'}
                                                size="small"
                                              />
                                            ) : participant.status === 'absent' ? (
                                              <Chip label="غیبت در امتحان" color="error" size="small" />
                                            ) : participant.started_at ? (
                                              <Chip label="در حال انجام" color="warning" size="small" />
                                            ) : (
                                              <Chip label="ثبت‌نام شده" color="info" size="small" />
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {participant.started_at
                                              ? new Date(participant.started_at).toLocaleDateString('fa-IR')
                                              : '-'}
                                          </TableCell>
                                          <TableCell>
                                            {participant.completed_at
                                              ? new Date(participant.completed_at).toLocaleDateString('fa-IR')
                                              : '-'}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </AccordionDetails>
                            </Accordion>
                          );
                        })}
                        
                        {/* Participants without group */}
                        {participantsWithoutGroup.length > 0 && (
                          <Accordion
                            sx={{
                              boxShadow: 'none',
                              border: 'none',
                              '&:before': {
                                display: 'none',
                              },
                              '&.Mui-expanded': {
                                margin: 0,
                              },
                            }}
                          >
                            <AccordionSummary 
                              expandIcon={<ExpandMoreIcon />}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                },
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                                <PeopleIcon color="action" />
                                <Typography variant="subtitle1" fontWeight="medium">
                                  بدون گروه ({participantsWithoutGroup.length} نفر)
                  </Typography>
                              </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                              <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>نام</TableCell>
                        <TableCell>شماره تماس</TableCell>
                                      <TableCell>کد ملی</TableCell>
                        <TableCell>ایمیل</TableCell>
                        <TableCell align="center">نمره</TableCell>
                        <TableCell align="center">وضعیت</TableCell>
                        <TableCell>تاریخ شروع</TableCell>
                        <TableCell>تاریخ تکمیل</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                                    {participantsWithoutGroup.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell>{participant.user?.name || '-'}</TableCell>
                          <TableCell>{participant.user?.phone_number || '-'}</TableCell>
                                        <TableCell>{participant.user?.national_id || '-'}</TableCell>
                          <TableCell>{participant.user?.email || '-'}</TableCell>
                          <TableCell align="center">
                                          {participant.score !== null && participant.total_points !== null
                                            ? `${participant.score} / ${participant.total_points}`
                              : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {participant.completed_at ? (
                              <Chip
                                icon={participant.passed ? <CheckCircleIcon /> : <CancelIcon />}
                                label={participant.passed ? 'قبول' : 'رد'}
                                color={participant.passed ? 'success' : 'error'}
                                size="small"
                              />
                                          ) : participant.status === 'absent' ? (
                              <Chip label="غیبت در امتحان" color="error" size="small" />
                                          ) : participant.started_at ? (
                              <Chip label="در حال انجام" color="warning" size="small" />
                                          ) : (
                                            <Chip label="ثبت‌نام شده" color="info" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            {participant.started_at
                              ? new Date(participant.started_at).toLocaleDateString('fa-IR')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {participant.completed_at
                              ? new Date(participant.completed_at).toLocaleDateString('fa-IR')
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                            </AccordionDetails>
                          </Accordion>
                        )}
                      </Paper>
                    );
                  })()}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Create Group Dialog */}
      <Dialog open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ایجاد گروه جدید</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="نام گروه"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="توضیحات (اختیاری)"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <Alert severity="info">
              می‌توانید بعداً کاربران را به این گروه اضافه کنید
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateGroupOpen(false)}>انصراف</Button>
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            disabled={createGroupMutation.isPending || !newGroupName.trim()}
          >
            {createGroupMutation.isPending ? 'در حال ایجاد...' : 'ایجاد'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      {alert.open && (
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 9999 }}
        >
          {alert.message}
        </Alert>
      )}
    </Box>
  );
}
