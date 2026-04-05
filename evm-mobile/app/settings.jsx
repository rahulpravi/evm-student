import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, StatusBar as RNStatusBar, Platform, Modal, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Globe, Trash2, Info, Smartphone, AlertTriangle, CheckCircle2, Mail, User } from 'lucide-react-native';
import { SettingsContext } from '../src/context/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, language, changeLanguage, t } = useContext(SettingsContext);
  
  const [clearModal, setClearModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const currentTheme = isDarkMode ? darkStyles : lightStyles;

  const handleClearData = async () => {
    setClearModal(false);
    try {
      await AsyncStorage.removeItem('elections');
      setSuccessModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  // ഡെവലപ്പർക്ക് മെയിൽ അയക്കാനുള്ള ഫംഗ്ഷൻ
  const handleMailToDeveloper = () => {
    // ഇവിടെ നിങ്ങളുടെ ശരിയായ ഇമെയിൽ നൽകാം. തൽക്കാലം ബ്ലാങ്ക് ആയി ഇട്ടിരിക്കുന്നു.
    Linking.openURL('mailto:rahulpravi14@gmail.com?subject=EVM Simulator App Feedback');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <RNStatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* ഡാറ്റ ക്ലിയർ വാണിംഗ് മോഡൽ */}
      <Modal visible={clearModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, currentTheme.cardBg]}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 15 }} />
            <Text style={[styles.modalTitle, currentTheme.textMain]}>{t('warningText')}</Text>
            <Text style={[styles.modalMessage, currentTheme.textMuted]}>{language === 'ml' ? 'എല്ലാ ഇലക്ഷൻ ഡാറ്റയും പൂർണ്ണമായും ഡിലീറ്റ് ആകും. തുടരണോ?' : 'All election data will be deleted permanently. Continue?'}</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalCancelBtn, isDarkMode && {backgroundColor: '#334155'}]} onPress={() => setClearModal(false)}>
                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOkBtn} onPress={handleClearData}>
                <Text style={styles.modalOkText}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* വിജയകരമായി ഡിലീറ്റ് ചെയ്തു എന്ന മോഡൽ */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, currentTheme.cardBg]}>
            <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 15 }} />
            <Text style={[styles.modalTitle, currentTheme.textMain]}>{t('successText')}</Text>
            <Text style={[styles.modalMessage, currentTheme.textMuted]}>{language === 'ml' ? 'എല്ലാ ഡാറ്റയും ഡിലീറ്റ് ചെയ്തു.' : 'All data cleared successfully.'}</Text>
            <TouchableOpacity style={[styles.modalOkBtn, {backgroundColor: '#22c55e', width: '100%'}]} onPress={() => setSuccessModal(false)}>
              <Text style={styles.modalOkText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ടോപ്പ് ബാർ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      </View>

      <View style={[styles.mainContent, currentTheme.containerBg]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Appearance Section */}
          <Text style={[styles.sectionTitle, currentTheme.textMuted]}>{t('appearance')}</Text>
          <View style={[styles.sectionCard, currentTheme.cardBg]}>
            <View style={[styles.settingRow, styles.borderBottom, currentTheme.borderLine]}>
              <View style={styles.settingLeft}>
                {isDarkMode ? <Moon size={22} color="#8b5cf6" /> : <Sun size={22} color="#f59e0b" />}
                <Text style={[styles.settingText, currentTheme.textMain]}>{t('darkMode')}</Text>
              </View>
              <Switch 
                value={isDarkMode} 
                onValueChange={toggleTheme} 
                trackColor={{ false: '#cbd5e1', true: '#93c5fd' }} 
                thumbColor={isDarkMode ? '#2563eb' : '#f8fafc'} 
              />
            </View>

            <TouchableOpacity style={styles.settingRow} onPress={() => changeLanguage(language === 'en' ? 'ml' : 'en')} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Globe size={22} color="#10b981" />
                <Text style={[styles.settingText, currentTheme.textMain]}>{t('language')}</Text>
              </View>
              {/* പുതിയ ഭാഷാ ഡിസൈൻ (രണ്ടും ഒരുമിച്ച് കാണിക്കുന്നു) */}
              <View style={[styles.langToggleContainer, currentTheme.langToggleBg]}>
                <View style={[styles.langOption, language === 'en' && styles.langActive]}>
                  <Text style={[styles.langText, language === 'en' ? styles.langTextActive : currentTheme.langTextInactive]}>English</Text>
                </View>
                <View style={[styles.langOption, language === 'ml' && styles.langActive]}>
                  <Text style={[styles.langText, language === 'ml' ? styles.langTextActive : currentTheme.langTextInactive]}>മലയാളം</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Data Management Section */}
          <Text style={[styles.sectionTitle, currentTheme.textMuted]}>{t('dataManagement')}</Text>
          <View style={[styles.sectionCard, currentTheme.cardBg]}>
            <TouchableOpacity style={styles.settingRow} onPress={() => setClearModal(true)} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Trash2 size={22} color="#ef4444" />
                <Text style={[styles.settingText, { color: '#ef4444' }]}>{t('clearData')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Contact & Help Section */}
          <Text style={[styles.sectionTitle, currentTheme.textMuted]}>{language === 'ml' ? 'ബന്ധപ്പെടുക & സഹായം' : 'CONTACT & HELP'}</Text>
          <View style={[styles.sectionCard, currentTheme.cardBg]}>
            <TouchableOpacity style={styles.settingRow} onPress={handleMailToDeveloper} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Mail size={22} color="#8b5cf6" />
                <Text style={[styles.settingText, currentTheme.textMain]}>{language === 'ml' ? 'ഡെവലപ്പർക്ക് മെയിൽ അയക്കുക' : 'Mail to Developer'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <Text style={[styles.sectionTitle, currentTheme.textMuted]}>{t('aboutDev')}</Text>
          <View style={[styles.sectionCard, currentTheme.cardBg]}>
            <View style={[styles.settingRow, styles.borderBottom, currentTheme.borderLine]}>
              <View style={styles.settingLeft}>
                <User size={22} color="#f59e0b" />
                <Text style={[styles.settingText, currentTheme.textMain]}>Developer</Text>
              </View>
              <Text style={[styles.versionText, currentTheme.textMuted]}>Rahul PR</Text>
            </View>
            <View style={[styles.settingRow, styles.borderBottom, currentTheme.borderLine]}>
              <View style={styles.settingLeft}>
                <Smartphone size={22} color="#64748b" />
                <Text style={[styles.settingText, currentTheme.textMain]}>{t('appVersion')}</Text>
              </View>
              <Text style={[styles.versionText, currentTheme.textMuted]}>1.0.0</Text>
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Info size={22} color="#3b82f6" />
                <Text style={[styles.settingText, currentTheme.textMain]}>{t('appName')}</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({ containerBg: { backgroundColor: '#f8fafc' }, cardBg: { backgroundColor: '#ffffff', borderColor: '#e2e8f0' }, textMain: { color: '#1e293b' }, textMuted: { color: '#64748b' }, borderLine: { borderBottomColor: '#f1f5f9' }, langToggleBg: { backgroundColor: '#f1f5f9' }, langTextInactive: { color: '#64748b' } });
const darkStyles = StyleSheet.create({ containerBg: { backgroundColor: '#0f172a' }, cardBg: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 }, textMain: { color: '#f1f5f9' }, textMuted: { color: '#94a3b8' }, borderLine: { borderBottomColor: '#334155' }, langToggleBg: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }, langTextInactive: { color: '#94a3b8' } });

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2563eb', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  mainContent: { flex: 1 },
  header: { backgroundColor: '#2563eb', padding: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', includeFontPadding: false, textAlignVertical: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 10, marginTop: 10, letterSpacing: 0.5, includeFontPadding: false, textTransform: 'uppercase' },
  sectionCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 20, elevation: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  borderBottom: { borderBottomWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  settingText: { fontSize: 16, fontWeight: '600', includeFontPadding: false },
  
  // പുതിയ ഭാഷാ ടോഗിൾ ഡിസൈൻ
  langToggleContainer: { flexDirection: 'row', borderRadius: 20, overflow: 'hidden' },
  langOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  langActive: { backgroundColor: '#2563eb' },
  langText: { fontSize: 12, fontWeight: 'bold', includeFontPadding: false },
  langTextActive: { color: '#ffffff' },
  
  versionText: { fontSize: 14, fontWeight: 'bold', includeFontPadding: false },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }, 
  modalCard: { width: '100%', maxWidth: 320, borderRadius: 20, padding: 25, alignItems: 'center', elevation: 10 }, 
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }, 
  modalMessage: { fontSize: 14, textAlign: 'center', marginBottom: 25, lineHeight: 20 }, 
  modalBtnRow: { flexDirection: 'row', gap: 12, width: '100%' }, 
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center' }, 
  modalCancelText: { fontWeight: 'bold', fontSize: 16, textAlign: 'center' }, 
  modalOkBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#ef4444', alignItems: 'center' }, 
  modalOkText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }
});
