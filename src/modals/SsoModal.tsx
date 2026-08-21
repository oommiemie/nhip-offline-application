import React, { useState } from 'react';
import { View } from 'react-native';

import { AppModal, AppText, Button, StatusDot, TextField } from '../components';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';
import { useT } from '../i18n';

/** Modal ยืนยันตัวตน MOPH SSO (เรียกจากหน้า Sync เมื่อ session หมดอายุ) */
export const SsoModal: React.FC = () => {
  const t = useTheme();
  const c = t.colors;
  const { state, actions } = useApp();
  const tt = useT();
  const [user, setUser] = useState('somsri.j@moph.go.th');
  const [pass, setPass] = useState('123456789');
  const [touched, setTouched] = useState<{ user?: boolean; pass?: boolean }>({});
  const busy = state.sso === 'busy';
  const ready = !!user.trim() && !!pass.trim();

  return (
    <AppModal
      visible={state.ssoModalOpen}
      onClose={actions.ssoClose}
      title={tt('ยืนยันตัวตนด้วย MOPH SSO')}
      titleBadge={
        <AppText size="xs" muted mono>
          sso-uat.moph.go.th
        </AppText>
      }
      maxWidth={460}
      dismissable={!busy}
    >
      <View style={{ gap: 12 }}>
        <TextField
          label={tt('ชื่อผู้ใช้ MOPH')}
          icon="person-circle-outline"
          value={user}
          onChangeText={setUser}
          onBlur={() => setTouched((s) => ({ ...s, user: true }))}
          errorText={touched.user && !user.trim() ? tt('กรุณากรอกชื่อผู้ใช้ MOPH') : undefined}
          placeholder={tt('กรอกชื่อผู้ใช้งาน')}
          mono
          autoCapitalize="none"
        />
        <TextField
          label={tt('รหัสผ่าน')}
          icon="lock-closed-outline"
          value={pass}
          onChangeText={setPass}
          onBlur={() => setTouched((s) => ({ ...s, pass: true }))}
          errorText={touched.pass && !pass.trim() ? tt('กรุณากรอกรหัสผ่าน') : undefined}
          placeholder={tt('กรอกรหัสผ่าน')}
          secureTextEntry
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 11,
            borderRadius: t.radius.md,
            backgroundColor: c.surface2,
          }}
        >
          <StatusDot color={busy ? c.warning : c.info} size={7} />
          <AppText size="sm" muted style={{ flex: 1 }}>
            {busy ? tt('กำลังเชื่อมต่อ sso-uat.moph.go.th …') : tt('เชื่อมต่อผ่าน OAuth 2.0 · ระบบไม่เก็บรหัสผ่านไว้บนเครื่อง')}
          </AppText>
        </View>
        <Button
          label={busy ? tt('กำลังยืนยันตัวตน…') : state.syncAfterAuth ? tt('เข้าสู่ระบบและเริ่มซิงค์') : tt('เข้าสู่ระบบ')}
          variant="strong"
          rounded="md"
          full
          loading={busy}
          disabled={!ready}
          onPress={actions.ssoLogin}
          style={{ marginBottom: 12 }}
        />
      </View>
    </AppModal>
  );
};
