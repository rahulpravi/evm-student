import React, { useState, useCallback, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar as RNStatusBar, Modal, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, Lock, Unlock, Power, RotateCcw, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { getElectionById, updateElection } from '../../src/utils/db';
import { SettingsContext } from '../../src/context/SettingsContext';

export default function ControlUnit() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode, t } = useContext(SettingsContext);
  
  const [election, setElection] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info', onConfirm: null });

  const [unlockPinVisible, setUnlockPinVisible] = useState(false);
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, [id]));

  const loadData = async () => {
    const data = await getElectionById(id);
    if (data) setElection(data);
    else router.replace('/dashboard');
  };

  const showModal = (title, message, type, onConfirm = null) => {
    setModalConfig({ title, message, type, onConfirm });
    setModalVisible(true);
  };

  const getTotalVotes = () => {
    if (!election || !election.votes) return 0;
    return Object.values(election.votes).reduce((sum, count) => sum + count, 0);
  };

  const handlePinSubmit = () => {
    if (pinInput === election.pin) { setIsAuthenticated(true); setPinError(false); }
    else { setPinError(true); setPinInput(''); }
  };

  const handleUnlockRequest = () => {
    const totalPolled = getTotalVotes();
    
    // വോട്ടർമാരുടെ എണ്ണം കഴിഞ്ഞിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുന്നു
    if (election.totalVoters && election.totalVoters !== '0' && totalPolled >= parseInt(election.totalVoters)) {
      showModal(t('warningText'), t('limitReached'), "warning");
      return; // ഇവിടെ വെച്ച് വോട്ടിംഗ് നിർത്തുന്നു
    }

    setUnlockPin('');
    setUnlockError(false);
    setUnlockPinVisible(true);
  };

  const confirmUnlock = () => {
    if (unlockPin === election.pin) {
      setUnlockPinVisible(false);
      router.push(`/ballot-unit/${id}`);
    } else {
      setUnlockError(true);
      setUnlockPin('');
    }
  };

  const handleClearData = () => {
    showModal(t('warningText'), t('clearWarning'), "warning", async () => {
      setModalVisible(false);
      await updateElection(id, { votes: {} });
      loadData();
      setTimeout(() => showModal(t('successText'), t('votesCleared'), "success"), 500);
    });
  };

  const handleCloseElection = () => {
    showModal(t('closeElection'), t('closeWarning'), "warning", async () => {
      setModalVisible(false);
      await updateElection(id, { status: 'completed' });
      router.replace(`/results/${id}`);
    });
  };

  const currentTheme = isDarkMode ? darkStyles : lightStyles;

  if (!election) return null;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <RNStatusBar barStyle="light-content" backgroundColor="#2563eb" />
        <View style={[styles.mainContent, currentTheme.containerBg, {justifyContent: 'center', alignItems: 'center', padding: 20}]}>
          <View style={[styles.lockedCard, currentTheme.cardBg]}>
            <View style={styles.lockIconWrapper}><Lock size={32} color="#2563eb" /></View>
            <Text style={[styles.lockedTitle, currentTheme.textMain]}>{t('cuLocked')}</Text>
            <Text style={[styles.lockedDesc, currentTheme.textMuted]}>{t('enterPinToUnlock')} ({election.name})</Text>
            <TextInput style={[styles.pinInputMain, currentTheme.inputBg, pinError && styles.pinErrorBorder]} placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'} keyboardType="numeric" maxLength={4} secureTextEntry autoFocus value={pinInput} onChangeText={setPinInput} placeholder="****" />
            {pinError && <Text style={styles.errorText}>{t('wrongPin')}</Text>}
            <TouchableOpacity style={styles.unlockBtn} onPress={handlePinSubmit}><Text style={styles.unlockBtnText}>{t('unlockEvm')}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>{t('cancel')}</Text></TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const totalPolled = getTotalVotes();

  return (
    <SafeAreaView style={styles.safeArea}>
      <RNStatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      <View style={[styles.mainContent, currentTheme.containerBg]}>
        
        {/* Messages Modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={[styles.modalCard, currentTheme.cardBg]}>
              {modalConfig.type === 'warning' ? <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 15 }} /> : <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 15 }} />}
              <Text style={[styles.modalTitle, currentTheme.textMain]}>{modalConfig.title}</Text>
              <Text style={[styles.modalMessage, currentTheme.textMuted]}>{modalConfig.message}</Text>
              <View style={styles.modalBtnRow}>
                {modalConfig.type === 'warning' && <TouchableOpacity style={[styles.modalCancelBtn, isDarkMode && {backgroundColor: '#334155'}]} onPress={() => setModalVisible(false)}><Text style={styles.modalCancelText}>{t('cancel')}</Text></TouchableOpacity>}
                <TouchableOpacity style={[styles.modalOkBtn, { backgroundColor: modalConfig.type === 'success' ? '#22c55e' : '#2563eb' }]} onPress={() => { modalConfig.onConfirm ? modalConfig.onConfirm() : setModalVisible(false) }}><Text style={styles.modalOkText}>OK</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Unlock PIN Modal */}
        <Modal visible={unlockPinVisible} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={[styles.modalCard, currentTheme.cardBg]}>
              <Lock size={40} color="#2563eb" style={{ marginBottom: 15 }} />
              <Text style={[styles.modalTitle, currentTheme.textMain]}>{t('unlockBu')}</Text>
              <Text style={[styles.modalMessage, currentTheme.textMuted]}>{t('enterPinToVote')}</Text>
              <TextInput style={[styles.pinInputMain, currentTheme.inputBg, unlockError && styles.pinErrorBorder, { marginBottom: 15 }]} placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'} keyboardType="numeric" maxLength={4} secureTextEntry autoFocus value={unlockPin} onChangeText={setUnlockPin} placeholder="****" />
              {unlockError && <Text style={styles.errorText}>{t('wrongPin')}</Text>}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalCancelBtn, isDarkMode && {backgroundColor: '#334155'}]} onPress={() => setUnlockPinVisible(false)}><Text style={styles.modalCancelText}>{t('cancel')}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalOkBtn, { backgroundColor: '#2563eb' }]} onPress={confirmUnlock}><Text style={styles.modalOkText}>Unlock</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.replace('/dashboard')} style={styles.backButton}><ArrowLeft size={24} color="#ffffff" /></TouchableOpacity>
            <Text style={styles.headerTitle}>{t('cuTitle')}</Text>
          </View>
          <ShieldCheck size={24} color="#4ade80" />
        </View>

        <View style={styles.content}>
          <View style={[styles.infoCard, currentTheme.cardBg]}>
            <Text style={[styles.electionName, currentTheme.textMain]}>{election.name}</Text>
            <View style={styles.statsRow}>
              <View style={[styles.statBox, currentTheme.statBoxBlue]}>
                <Text style={styles.statLabel}>{t('totalVoters')}</Text>
                <Text style={styles.statValueBlue}>{election.totalVoters !== '0' ? election.totalVoters : 'N/A'}</Text>
              </View>
              <View style={[styles.statBoxGreen, currentTheme.statBoxGreen]}>
                <Text style={styles.statLabel}>{t('votesPolled')}</Text>
                <Text style={styles.statValueGreen}>{totalPolled}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.controlsCard, currentTheme.cardBg]}>
            <TouchableOpacity style={styles.bigUnlockBtn} onPress={handleUnlockRequest} activeOpacity={0.8}>
              <Unlock size={40} color="#ffffff" style={{ marginBottom: 8 }} />
              <Text style={styles.bigUnlockText}>{t('unlockBu')}</Text>
            </TouchableOpacity>

            <View style={styles.bottomControls}>
              <TouchableOpacity style={[styles.clearBtn, currentTheme.btnBg]} onPress={handleClearData}>
                <RotateCcw size={24} color={isDarkMode ? '#94a3b8' : '#475569'} />
                <Text style={[styles.clearBtnText, currentTheme.textMain]}>{t('clearMock')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.closeBtn, currentTheme.dangerBtn]} onPress={handleCloseElection}>
                <Power size={24} color="#dc2626" />
                <Text style={styles.closeBtnText}>{t('closeElection')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({ containerBg: { backgroundColor: '#f8fafc' }, cardBg: { backgroundColor: '#ffffff', borderColor: '#f1f5f9' }, textMain: { color: '#1e293b' }, textMuted: { color: '#64748b' }, inputBg: { backgroundColor: '#ffffff', color: '#1e293b', borderColor: '#cbd5e1' }, statBoxBlue: { backgroundColor: '#eff6ff' }, statBoxGreen: { backgroundColor: '#f0fdf4' }, btnBg: { backgroundColor: '#f1f5f9' }, dangerBtn: { backgroundColor: '#fef2f2' } });
const darkStyles = StyleSheet.create({ containerBg: { backgroundColor: '#0f172a' }, cardBg: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 }, textMain: { color: '#f1f5f9' }, textMuted: { color: '#94a3b8' }, inputBg: { backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155' }, statBoxBlue: { backgroundColor: '#172554' }, statBoxGreen: { backgroundColor: '#052e16' }, btnBg: { backgroundColor: '#334155' }, dangerBtn: { backgroundColor: '#450a0a' } });

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2563eb', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  mainContent: { flex: 1 },
  lockedCard: { padding: 30, borderRadius: 24, width: '100%', maxWidth: 350, alignItems: 'center', elevation: 10 }, lockIconWrapper: { width: 64, height: 64, backgroundColor: '#dbeafe', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }, lockedTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }, lockedDesc: { fontSize: 14, marginBottom: 24, textAlign: 'center', lineHeight: 22 }, pinInputMain: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 24, letterSpacing: 8, textAlign: 'center', width: '100%', marginBottom: 15, fontWeight: 'bold' }, pinErrorBorder: { borderColor: '#ef4444' }, errorText: { color: '#ef4444', fontSize: 12, marginBottom: 15, textAlign: 'center' }, unlockBtn: { backgroundColor: '#2563eb', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, unlockBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }, cancelBtn: { marginTop: 15, padding: 10, width: '100%', alignItems: 'center', justifyContent: 'center' }, cancelBtnText: { color: '#64748b', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  header: { backgroundColor: '#2563eb', padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 4 }, headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 }, headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }, content: { flex: 1, padding: 16, gap: 16 }, infoCard: { padding: 20, borderRadius: 16, alignItems: 'center', elevation: 2, borderWidth: 1 }, electionName: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }, statsRow: { flexDirection: 'row', gap: 16, width: '100%' }, statBox: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, statBoxGreen: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, statLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginBottom: 4, textAlign: 'center', textTransform: 'uppercase' }, statValueBlue: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', textAlign: 'center' }, statValueGreen: { fontSize: 24, fontWeight: 'bold', color: '#22c55e', textAlign: 'center' }, controlsCard: { flex: 1, padding: 20, borderRadius: 16, elevation: 2, borderWidth: 1, justifyContent: 'center', gap: 16 }, bigUnlockBtn: { backgroundColor: '#2563eb', width: '100%', paddingVertical: 30, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 8 }, bigUnlockText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1, textAlign: 'center' }, bottomControls: { flexDirection: 'row', gap: 12 }, clearBtn: { flex: 1, paddingVertical: 20, paddingHorizontal: 5, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 }, clearBtnText: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' }, closeBtn: { flex: 1, paddingVertical: 20, paddingHorizontal: 5, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 }, closeBtnText: { color: '#ef4444', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }, modalCard: { width: '100%', maxWidth: 320, borderRadius: 20, padding: 25, alignItems: 'center', elevation: 10 }, modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }, modalMessage: { fontSize: 14, textAlign: 'center', marginBottom: 25, lineHeight: 20 }, modalBtnRow: { flexDirection: 'row', gap: 12, width: '100%' }, modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center' }, modalCancelText: { fontWeight: 'bold', fontSize: 16, textAlign: 'center' }, modalOkBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }, modalOkText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }
});
