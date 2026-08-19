import React from 'react';

import { AlertDialog } from '../components';
import { useApp } from '../state/AppContext';

/**
 * ตัวรับคำสั่งเปิดกล่องแจ้งสถานะจาก state (ข้อกำหนด 4.8)
 * mount ไว้ท้ายสุดของ tree เพื่อให้ซ้อนอยู่เหนือ modal อื่น ๆ
 */
export const AlertHost: React.FC = () => {
  const { state, actions } = useApp();
  const a = state.alert;
  if (!a) return null;
  return (
    <AlertDialog
      visible
      kind={a.kind}
      title={a.title}
      message={a.message}
      detail={a.detail}
      confirmLabel={a.confirmLabel}
      cancelLabel={a.cancelLabel}
      autoCloseMs={a.autoCloseMs}
      onConfirm={a.onConfirm}
      onClose={actions.closeAlert}
    />
  );
};
