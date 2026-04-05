import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, StatusBar as RNStatusBar, Modal, Platform, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Settings, ChevronRight, Trash2, BarChart3, AlertTriangle } from 'lucide-react-native';
import { getElections, deleteElection } from '../src/utils/db';
import { SettingsContext } from '../src/context/SettingsContext';

export default function Dashboard() {
  const router = useRouter();
  const { isDarkMode, t } = useContext(SettingsContext);
  const [elections, setElections] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useFocusEffect(useCallback(() => { loadElections(); }, []));

  const loadElections = async () => {
    const data = await getElections();
    setElections(data.reverse());
  };

  const confirmDelete = (id) => { setDeleteId(id); setModalVisible(true); };

  const handleDelete = async () => {
    setModalVisible(false);
    if (deleteId) { await deleteElection(deleteId); loadElections(); }
  };

  const currentTheme = isDarkMode ? darkStyles : lightStyles;

  const renderItem = ({ item }) => (
    <View style={[styles.electionCard, currentTheme.cardBg]}>
      <TouchableOpacity style={styles.cardInfo} onPress={() => router.push(item.status === 'completed' ? `/results/${item.id}` : `/control-unit/${item.id}`)} activeOpacity={0.7}>
        <View style={[styles.iconBg, currentTheme.iconBg]}><BarChart3 size={20} color="#2563eb" /></View>
        <View style={styles.cardTexts}>
          <Text style={[styles.cardTitle, currentTheme.textMain]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.statusText, { color: item.status === 'completed' ? '#16a34a' : '#ea580c' }]} numberOfLines={1}>
            {item.status === 'completed' ? t('completed') : t('active')} • {item.candidates?.length || 0} {t('candidates')}
          </Text>
        </View>
        <ChevronRight size={18} color={isDarkMode ? '#475569' : '#cbd5e1'} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.deleteBtn, currentTheme.deleteBtn]} onPress={() => confirmDelete(item.id)}>
        <Trash2 size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <RNStatusBar barStyle="light-content" backgroundColor="#2563eb" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../assets/images/icon.png')} style={styles.headerLogo} />
          <Text style={styles.headerTitle}>{t('appName')}</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}><Settings size={22} color="#ffffff" /></TouchableOpacity>
      </View>

      <View style={[styles.mainContent, currentTheme.containerBg]}>
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={[styles.modalCard, currentTheme.modalCardBg]}>
              <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: 12 }} />
              <Text style={[styles.modalTitle, currentTheme.textMain]}>ഡിലീറ്റ്</Text>
              <Text style={[styles.modalMessage, currentTheme.textMuted]}>ഈ ഇലക്ഷൻ ഡിലീറ്റ് ആകും. തുടരണോ?</Text>
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalCancelBtn, currentTheme.cancelBtnBg]} onPress={() => setModalVisible(false)}><Text style={[styles.modalCancelText, currentTheme.textMuted]}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalOkBtn} onPress={handleDelete}><Text style={styles.modalOkText}>Delete</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.content}>
          <Text style={[styles.sectionTitle, currentTheme.textMuted]}>{t('recentElections')}</Text>
          {elections.length === 0 ? (
            <View style={styles.emptyState}><Text style={[styles.emptyText, currentTheme.textMuted]}>{t('noElections')}</Text></View>
          ) : (
            <FlatList 
              data={elections} 
              keyExtractor={item => item.id} 
              renderItem={renderItem} 
              showsVerticalScrollIndicator={false} 
              // flexGrow: 1 ഉം paddingBottom ഉം മാത്രം മതിയാകും, വെറുതെ വലിയ ഗ്യാപ്പ് വരില്ല
              contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }} 
            />
          )}
        </View>

        <TouchableOpacity style={styles.fab} onPress={() => router.push('/setup')} activeOpacity={0.8}>
          <Plus size={22} color="#ffffff" />
          <Text style={styles.fabText}>{t('newElection')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({ containerBg: { backgroundColor: '#f8fafc' }, cardBg: { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1 }, textMain: { color: '#1e293b' }, textMuted: { color: '#64748b' }, iconBg: { backgroundColor: '#eff6ff' }, deleteBtn: { backgroundColor: '#fef2f2', borderLeftWidth: 1, borderLeftColor: '#f1f5f9' }, modalCardBg: { backgroundColor: '#ffffff' }, cancelBtnBg: { backgroundColor: '#f1f5f9' } });
const darkStyles = StyleSheet.create({ containerBg: { backgroundColor: '#0f172a' }, cardBg: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 }, textMain: { color: '#f1f5f9' }, textMuted: { color: '#94a3b8' }, iconBg: { backgroundColor: '#0f172a' }, deleteBtn: { backgroundColor: '#450a0a', borderLeftWidth: 1, borderLeftColor: '#334155' }, modalCardBg: { backgroundColor: '#1e293b' }, cancelBtnBg: { backgroundColor: '#334155' } });

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2563eb', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  mainContent: { flex: 1 },
  header: { backgroundColor: '#2563eb', padding: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 4 }, 
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogo: { width: 30, height: 30, borderRadius: 6, backgroundColor: '#ffffff', resizeMode: 'contain' },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', includeFontPadding: false, textAlignVertical: 'center' }, 
  settingsBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }, 
  content: { flex: 1, padding: 14 }, 
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10, includeFontPadding: false }, 
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' }, 
  emptyText: { fontSize: 15, textAlign: 'center' }, 
  
  // കാർഡുകളുടെ അലൈൻമെന്റ് ശരിയാക്കി
  electionCard: { borderRadius: 12, marginBottom: 12, elevation: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }, 
  cardInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, paddingVertical: 14, gap: 12 }, 
  iconBg: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, 
  cardTexts: { flex: 1, justifyContent: 'center' }, 
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, includeFontPadding: false }, 
  statusText: { fontSize: 12, fontWeight: '600', includeFontPadding: false }, 
  
  // height: '100%' മാറ്റി പകരം alignSelf: 'stretch' കൊടുത്തു
  deleteBtn: { paddingHorizontal: 16, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }, 
  
  fab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 30, elevation: 5, gap: 8 }, 
  fabText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', includeFontPadding: false, textAlignVertical: 'center' },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }, 
  modalCard: { width: '100%', maxWidth: 300, borderRadius: 16, padding: 20, alignItems: 'center', elevation: 10 }, 
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }, 
  modalMessage: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 }, 
  modalBtnRow: { flexDirection: 'row', gap: 10, width: '100%' }, 
  modalCancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }, 
  modalCancelText: { fontWeight: 'bold', fontSize: 15 }, 
  modalOkBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#ef4444', alignItems: 'center' }, 
  modalOkText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 }
});
