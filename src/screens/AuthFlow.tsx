import React from 'react';

import { SplitAuthLayout } from './BrandPanel';
import { LoginCard } from './LoginScreen';

/**
 * หน้าเข้าสู่ระบบ — แผงแบรนด์ซ้าย (โลโก้ + particle) + การ์ดฟอร์มขวา
 * ส่วนยืนยันตัวตน MOPH SSO ย้ายไปอยู่ในหน้าตั้งค่า (SetupScreen) แล้ว
 */
export const AuthFlow: React.FC = () => <SplitAuthLayout><LoginCard /></SplitAuthLayout>;
