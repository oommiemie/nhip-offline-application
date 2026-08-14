import React from 'react';

import { useApp } from '../state/AppContext';
import { AppShell } from './AppShell';
import { AuthFlow } from '../screens/AuthFlow';
import { SetupScreen } from '../screens/SetupScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { OssScreen } from '../screens/OssScreen';
import { SyncScreen } from '../screens/SyncScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { RegisterModal } from '../modals/RegisterModal';
import { EditRecordModal } from '../modals/EditRecordModal';
import { OpdCardModal } from '../modals/OpdCardModal';
import { HistoryPanel } from '../modals/HistoryPanel';
import { SsoModal } from '../modals/SsoModal';

/** สลับหน้าจอหลักตาม state (login → setup → app) — ไม่ใช้ external navigator เพื่อให้พอร์ตง่าย */
export const Root: React.FC = () => {
  const { state } = useApp();

  // login และ setup-ก่อนยืนยันตัวตน แชร์ layout เดียวกัน (AuthFlow) → สลับเฉพาะการ์ดขวา
  if (state.view === 'login' || (state.view === 'setup' && state.sso !== 'in')) return <AuthFlow />;
  if (state.view === 'setup') return <SetupScreen />;

  return (
    <>
      <AppShell>
        {state.screen === 'dashboard' ? <DashboardScreen /> : null}
        {state.screen === 'oss' ? <OssScreen /> : null}
        {state.screen === 'sync' ? <SyncScreen /> : null}
        {state.screen === 'settings' ? <SettingsScreen /> : null}
      </AppShell>
      <RegisterModal />
      <EditRecordModal />
      <OpdCardModal />
      <HistoryPanel />
      <SsoModal />
    </>
  );
};
