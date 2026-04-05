import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Image, Platform, Modal, StatusBar as RNStatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Trash2, Save, ImagePlus, CalendarClock, AlertTriangle, CheckCircle2, X, Settings, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveElection } from '../src/utils/db';
import { SettingsContext } from '../src/context/SettingsContext';

export default function Setup() {
  const router = useRouter();
  const { isDarkMode, t } = useContext(SettingsContext);
  
  const [electionName, setElectionName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [candidates, setCandidates] = useState([{ id: '1', name: '', logo: null }, { id: '2', name: '', logo: null }]);
  
  // Advanced Options Toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [totalVoters, setTotalVoters] = useState('');

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [resultTime, setResultTime] = useState(new Date());

  const [isStartSet, setIsStartSet] = useState(false);
  const [isEndSet, setIsEndSet] = useState(false);
  const [isResultSet, setIsResultSet] = useState(false);

  const [pickerTarget, setPickerTarget] = useState(null);
  const [pickerMode, setPickerMode] = useState('date');
  const [tempDate, setTempDate] = useState(new Date());

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'error', onConfirm: null });

  const showNotification = (title, message, type = 'error', onConfirm = null) => {
    setModalConfig({ title, message, type, onConfirm });
    setModalVisible(true);
  };

  const pickImage = async (id) => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) setCandidates(candidates.map(c => c.id === id ? { ...c, logo: result.assets[0].uri } : c));
  };

  const addCandidate = () => setCandidates([...candidates, { id: Date.now().toString(), name: '', logo: null }]);
  const removeCandidate = (id) => candidates.length > 2 ? setCandidates(candidates.filter(c => c.id !== id)) : showNotification(t('warningText'), t('min2Cand'), "warning");
  
  const formatDate = (date) => date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

  const openPicker = (target) => {
    setPickerTarget(target);
    setPickerMode('date');
    setTempDate(new Date());
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setPickerTarget(null);
      return;
    }
    const currentDate = selectedDate || tempDate;
    setTempDate(currentDate);

    if (Platform.OS === 'android') {
      if (pickerMode === 'date') setPickerMode('time');
      else savePickedTime(currentDate);
    } else savePickedTime(currentDate);
  };

  const savePickedTime = (dateToSave) => {
    if (pickerTarget === 'start') { setStartTime(dateToSave); setIsStartSet(true); }
    if (pickerTarget === 'end') { setEndTime(dateToSave); setIsEndSet(true); }
    if (pickerTarget === 'result') { setResultTime(dateToSave); setIsResultSet(true); }
    setPickerTarget(null);
  };

  const handleSave = async () => {
    if (!electionName || !pin) return showNotification(t('errorText'), t('namePinReq'), "error");
    if (pin !== confirmPin) return showNotification(t('errorText'), t('pinMismatch'), "error");

    const electionData = {
      id: Date.now().toString(), name: electionName, pin, candidates, totalVoters: totalVoters || '0',
      startTime: isStartSet ? startTime.toISOString() : null,
      endTime: isEndSet ? endTime.toISOString() : null,
      resultTime: isResultSet ? resultTime.toISOString() : null,
      status: 'active', votes: {}
    };

    const success = await saveElection(electionData);
    if (success) showNotification(t('successText'), t('savedSuccess'), "success", () => router.replace('/dashboard'));
    else showNotification(t('errorText'), t('saveFailed'), "error");
  };

  const currentTheme = isDarkMode ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={styles.safeArea}>
      <RNStatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      <View style={[styles.mainContent, currentTheme.containerBg]}>
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={[styles.modalCard, currentTheme.cardBg]}>
              {modalConfig.type === 'success' ? <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 15 }} /> : <AlertTriangle size={48} color={modalConfig.type === 'warning' ? '#f59e0b' : '#ef4444'} style={{ marginBottom: 15 }} />}
              <Text style={[styles.modalTitle, currentTheme.textMain]}>{modalConfig.title}</Text>
              <Text style={[styles.modalMessage, currentTheme.textMuted]}>{modalConfig.message}</Text>
              <TouchableOpacity style={[styles.modalOkBtn, { backgroundColor: modalConfig.type === 'success' ? '#22c55e' : '#2563eb' }]} onPress={() => { setModalVisible(false); if(modalConfig.onConfirm) modalConfig.onConfirm(); }}><Text style={styles.modalOkText}>OK</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/dashboard')} style={styles.backButton}><ArrowLeft size={24} color="#ffffff" /></TouchableOpacity>
          <Text style={styles.headerTitle}>{t('newElection')}</Text>
        </View>
        
        <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={[styles.section, currentTheme.cardBg]}>
            <Text style={[styles.label, currentTheme.textMuted]}>{t('electionName')}</Text>
            <TextInput style={[styles.input, currentTheme.inputBg]} placeholder={t('exSchoolElec')} placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'} value={electionName} onChangeText={setElectionName} />
            
            <View style={styles.pinRow}>
              <View style={{ flex: 1 }}><Text style={[styles.label, currentTheme.textMuted]}>4-Digit PIN</Text><TextInput style={[styles.input, currentTheme.inputBg, styles.pinInput]} keyboardType="numeric" maxLength={4} secureTextEntry value={pin} onChangeText={setPin} /></View>
              <View style={{ flex: 1, marginLeft: 15 }}><Text style={[styles.label, currentTheme.textMuted]}>Confirm PIN</Text><TextInput style={[styles.input, currentTheme.inputBg, styles.pinInput]} keyboardType="numeric" maxLength={4} secureTextEntry value={confirmPin} onChangeText={setConfirmPin} /></View>
            </View>
          </View>

          <View style={[styles.section, currentTheme.cardBg]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, currentTheme.textMain, {marginBottom:0}]}>{t('addCandidate')}</Text>
              <TouchableOpacity onPress={addCandidate} style={styles.addButton}><Plus size={16} color="#2563eb" /><Text style={styles.addButtonText}>Add</Text></TouchableOpacity>
            </View>
            {candidates.map((c, index) => (
              <View key={c.id} style={styles.candidateRow}>
                <TouchableOpacity onPress={() => pickImage(c.id)} style={[styles.logoPicker, currentTheme.inputBg]}>{c.logo ? <Image source={{ uri: c.logo }} style={styles.logoImage} /> : <ImagePlus size={20} color="#94a3b8" />}</TouchableOpacity>
                <TextInput style={[styles.candidateInput, currentTheme.inputBg]} placeholder={`${t('candidateText')} ${index + 1}`} placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'} value={c.name} onChangeText={(text) => setCandidates(candidates.map(item => item.id === c.id ? { ...item, name: text } : item))} />
                <TouchableOpacity onPress={() => removeCandidate(c.id)} style={styles.removeButton}><Trash2 size={20} color="#ef4444" /></TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Advanced Options (Hidden by default) */}
          <View style={[styles.section, currentTheme.cardBg]}>
            <TouchableOpacity style={styles.advancedToggle} onPress={() => setShowAdvanced(!showAdvanced)} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Settings size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                <Text style={[styles.sectionTitle, currentTheme.textMain, { marginBottom: 0 }]}>{t('advancedOptions')}</Text>
              </View>
              {showAdvanced ? <ChevronUp size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} /> : <ChevronDown size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} />}
            </TouchableOpacity>

            {showAdvanced && (
              <View style={[styles.advancedContent, { borderTopColor: isDarkMode ? '#334155' : '#f1f5f9' }]}>
                
                <Text style={[styles.label, currentTheme.textMuted, {marginTop: 5}]}>{t('totalVotersOpt')}</Text>
                <TextInput style={[styles.input, currentTheme.inputBg, {marginBottom: 20}]} placeholder="500" placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'} keyboardType="numeric" value={totalVoters} onChangeText={setTotalVoters} />

                <Text style={[styles.sectionTitle, currentTheme.textMain, { marginBottom: 15 }]}>{t('timeSchedule')}</Text>
                
                <View style={styles.timeLabelRow}>
                  <Text style={[styles.label, currentTheme.textMuted]}>{t('voteStartTime')}</Text>
                  {isStartSet && <TouchableOpacity onPress={() => setIsStartSet(false)}><X size={16} color="#ef4444" /></TouchableOpacity>}
                </View>
                <TouchableOpacity style={[styles.datePickerButton, currentTheme.inputBg]} onPress={() => openPicker('start')}>
                  <Text style={{ color: isStartSet ? (isDarkMode?'#f1f5f9':'#1e293b') : '#94a3b8', flex: 1 }}>{isStartSet ? formatDate(startTime) : t('noTimeLimit')}</Text>
                  <CalendarClock size={20} color={isDarkMode ? '#64748b' : '#94a3b8'} />
                </TouchableOpacity>

                <View style={styles.timeLabelRow}>
                  <Text style={[styles.label, currentTheme.textMuted]}>{t('voteEndTime')}</Text>
                  {isEndSet && <TouchableOpacity onPress={() => setIsEndSet(false)}><X size={16} color="#ef4444" /></TouchableOpacity>}
                </View>
                <TouchableOpacity style={[styles.datePickerButton, currentTheme.inputBg]} onPress={() => openPicker('end')}>
                  <Text style={{ color: isEndSet ? (isDarkMode?'#f1f5f9':'#1e293b') : '#94a3b8', flex: 1 }}>{isEndSet ? formatDate(endTime) : t('noTimeLimit')}</Text>
                  <CalendarClock size={20} color={isDarkMode ? '#64748b' : '#94a3b8'} />
                </TouchableOpacity>

                <View style={styles.timeLabelRow}>
                  <Text style={[styles.label, currentTheme.textMuted]}>{t('resultTimeText')}</Text>
                  {isResultSet && <TouchableOpacity onPress={() => setIsResultSet(false)}><X size={16} color="#ef4444" /></TouchableOpacity>}
                </View>
                <TouchableOpacity style={[styles.datePickerButton, currentTheme.inputBg, {marginBottom: 0}]} onPress={() => openPicker('result')}>
                  <Text style={{ color: isResultSet ? (isDarkMode?'#f1f5f9':'#1e293b') : '#94a3b8', flex: 1 }}>{isResultSet ? formatDate(resultTime) : t('viewInstantly')}</Text>
                  <CalendarClock size={20} color={isDarkMode ? '#64748b' : '#94a3b8'} />
                </TouchableOpacity>

              </View>
            )}
          </View>

          {pickerTarget && <DateTimePicker value={tempDate} mode={pickerMode} display="default" onChange={handleDateChange} />}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Save size={20} color="#ffffff" /><Text style={styles.saveButtonText}>{t('saveElection')}</Text></TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({ containerBg: { backgroundColor: '#f8fafc' }, cardBg: { backgroundColor: '#ffffff', borderColor: '#e2e8f0' }, textMain: { color: '#1e293b' }, textMuted: { color: '#475569' }, inputBg: { backgroundColor: '#ffffff', color: '#1e293b', borderColor: '#e2e8f0' } });
const darkStyles = StyleSheet.create({ containerBg: { backgroundColor: '#0f172a' }, cardBg: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 }, textMain: { color: '#f1f5f9' }, textMuted: { color: '#94a3b8' }, inputBg: { backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155' } });

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2563eb', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  mainContent: { flex: 1 },
  header: { backgroundColor: '#2563eb', padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15, elevation: 4 }, headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' }, form: { flex: 1, padding: 16 }, section: { padding: 16, borderRadius: 16, marginBottom: 20, elevation: 2 }, label: { fontSize: 14, fontWeight: '600', marginBottom: 6 }, input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 }, datePickerButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 15 }, pinRow: { flexDirection: 'row', marginTop: 15 }, pinInput: { textAlign: 'center', letterSpacing: 5, fontWeight: 'bold' }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }, sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }, addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }, addButtonText: { color: '#2563eb', fontWeight: 'bold' }, candidateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }, logoPicker: { width: 50, height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, overflow: 'hidden' }, logoImage: { width: '100%', height: '100%' }, candidateInput: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10 }, removeButton: { padding: 8 }, advancedToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, advancedContent: { marginTop: 15, paddingTop: 15, borderTopWidth: 1 }, saveButton: { backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 12, elevation: 4 }, saveButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }, timeLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }, modalCard: { width: '100%', maxWidth: 320, borderRadius: 20, padding: 25, alignItems: 'center', elevation: 10 }, modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }, modalMessage: { fontSize: 14, textAlign: 'center', marginBottom: 25 }, modalOkBtn: { width: '100%', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }, modalOkText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});
