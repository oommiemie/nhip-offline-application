import React from 'react';

import { useApp } from '../state/AppContext';
import { SplitAuthLayout } from './BrandPanel';
import { LoginCard } from './LoginScreen';
import { SsoCard } from './SetupScreen';

/**
 * กลุ่มหน้า auth (Login ↔ ยืนยันตัวตน MOPH SSO)
 * ถือ SplitAuthLayout ไว้ตัวเดียว → แผงแบรนด์ซ้าย (โลโก้ + particle) คงอยู่ต่อเนื่อง
 * สลับเฉพาะการ์ดฝั่งขวา — การ์ดใหม่เล่นทรานซิชัน AuthCardIn ของตัวเอง
 */
export const AuthFlow: React.FC = () => {
  const { state } = useApp();
  const showSso = state.view === 'setup';
  return <SplitAuthLayout>{showSso ? <SsoCard key="sso" /> : <LoginCard key="login" />}</SplitAuthLayout>;
};
