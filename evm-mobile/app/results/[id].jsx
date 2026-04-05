import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar as RNStatusBar, Modal, Platform, BackHandler, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trophy, BarChart3, Users, Dices, Share2, CheckCircle2, Clock } from 'lucide-react-native';
import { getElectionById, updateElection } from '../../src/utils/db';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { SettingsContext } from '../../src/context/SettingsContext';

export default function Results() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const resultViewRef = useRef();
  const { isDarkMode, t } = useContext(SettingsContext);

  const [election, setElection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [isDrawingLot, setIsDrawingLot] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [isWaitingForResult, setIsWaitingForResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const onBackPress = () => { router.navigate('/dashboard'); return true; };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, []);

  useEffect(() => { loadData(); }, [id]);

  useEffect(() => {
    let interval;
    if (election && election.resultTime && election.status !== 'completed') {
      const resultDate = new Date(election.resultTime).getTime();
      const updateTimer = () => {
        const now = new Date().getTime();
        const distance = resultDate - now;
        if (distance <= 0) { setIsWaitingForResult(false); clearInterval(interval); }
        else { setIsWaitingForResult(true); setTimeLeft({ d: Math.floor(distance / (1000 * 60 * 60 * 24)), h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)), s: Math.floor((distance % (1000 * 60)) / 1000) }); }
      };
      updateTimer(); interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [election]);

  const loadData = async () => {
    const data = await getElectionById(id);
    if (data) {
      setElection(data);
      if (data.status === 'completed') { setIsHistoryView(true); setTimeout(() => setIsLoading(false), 1000); }
      else { setIsHistoryView(false); setTimeout(() => setIsLoading(false), 2500); }
    } else { router.navigate('/dashboard'); }
  };

  const shareResultImage = async () => {
    try {
      const uri = await captureRef(resultViewRef, { format: 'png', quality: 1 });
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri; link.download = `EVM_Result_${election.name}.png`; link.click();
        setModalMessage("ചിത്രം ഡൗൺലോഡ് ചെയ്തു!"); setModalVisible(true);
      } else {
        await Sharing.shareAsync(uri, { dialogTitle: 'Share Result', mimeType: 'image/png' });
      }
    } catch (e) { console.error(e); }
  };

  const handleDrawLot = async (tiedCandidates) => {
    setIsDrawingLot(true);
    setTimeout(async () => {
      const luckyWinner = tiedCandidates[Math.floor(Math.random() * tiedCandidates.length)];
      const updatedVotes = { ...election.votes };
      updatedVotes[luckyWinner.id] = (updatedVotes[luckyWinner.id] || 0) + 1;
      await updateElection(id, { votes: updatedVotes });
      await loadData();
      setIsDrawingLot(false);
      setModalMessage(`നറുക്കെടുപ്പിലൂടെ ${luckyWinner.name} വിജയിച്ചു!`); setModalVisible(true);
    }, 2000);
  };

  const currentTheme = isDarkMode ? darkStyles : lightStyles;

  if (!election) return null;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <RNStatusBar barStyle="light-content" backgroundColor="#2563eb" />
        <View style={[styles.mainContent, currentTheme.containerBg, { alignItems: 'center', justifyContent: 'center' }]}>
          {isHistoryView ? <><ActivityIndicator size="large" color="#2563eb" /><Text style={styles.historyLoadingTitle}>Loading...</Text></> : <><BarChart3 size={60} color="#2563eb" /><Text style={[styles.loadingTitle, currentTheme.textMain]}>എണ്ണുന്നു...</Text><ActivityIndicator size="large" color="#2563eb" /></>}
        </View>
      </SafeAreaView>
    );
  }

  if (isWaitingForResult) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <RNStatusBar barStyle="light-content" backgroundColor="#2563eb" />
        <View style={[styles.mainContent, currentTheme.containerBg]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.navigate('/dashboard')} style={styles.backButton}><ArrowLeft size={24} color="#ffffff" /></TouchableOpacity>
            <Text style={styles.headerTitle}>{election.name}</Text>
          </View>
          <View style={styles.countdownContainer}>
            <Clock size={80} color="#2563eb" style={{ marginBottom: 20 }} />
            <Text style={[styles.countdownTitle, currentTheme.textMain]}>{t('resultCountdown')}</Text>
            <Text style={[styles.countdownSub, currentTheme.textMuted]}>{t('waitResult')}</Text>
            <View style={styles.timerRow}>
              <View style={[styles.timeBox, currentTheme.cardBg]}><Text style={styles.timeNum}>{timeLeft.d}</Text><Text style={[styles.timeLabel, currentTheme.textMuted]}>{t('days')}</Text></View>
              <Text style={styles.timeCol}>:</Text>
              <View style={[styles.timeBox, currentTheme.cardBg]}><Text style={styles.timeNum}>{timeLeft.h.toString().padStart(2, '0')}</Text><Text style={[styles.timeLabel, currentTheme.textMuted]}>{t('hours')}</Text></View>
              <Text style={styles.timeCol}>:</Text>
              <View style={[styles.timeBox, currentTheme.cardBg]}><Text style={styles.timeNum}>{timeLeft.m.toString().padStart(2, '0')}</Text><Text style={[styles.timeLabel, currentTheme.textMuted]}>{t('mins')}</Text></View>
              <Text style={styles.timeCol}>:</Text>
              <View style={[styles.timeBox, currentTheme.cardBg]}><Text style={styles.timeNum}>{timeLeft.s.toString().padStart(2, '0')}</Text><Text style={[styles.timeLabel, currentTheme.textMuted]}>{t('secs')}</Text></View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const allCandidates = [...election.candidates, { id: 'nota', name: 'NOTA', logo: null }];
  const results = allCandidates.map(c => ({ ...c, votes: election.votes?.[c.id] || 0 })).sort((a, b) => b.votes - a.votes);
  const totalVotes = results.reduce((sum, c) => sum + c.votes, 0);
  const maxVotes = results[0]?.votes || 0;
  const tiedCandidates = results.filter(c => c.votes === maxVotes && maxVotes > 0);
  const isTie = tiedCandidates.length > 1;
  const winner = results[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <RNStatusBar barStyle="light-content" backgroundColor="#2563eb" />
      <View style={[styles.mainContent, currentTheme.containerBg]}>
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={[styles.modalCard, currentTheme.cardBg]}>
              <CheckCircle2 size={50} color="#22c55e" style={{ marginBottom: 15 }} />
              <Text style={[styles.modalTitle, currentTheme.textMain]}>അറിയിപ്പ്</Text>
              <Text style={[styles.modalMessage, currentTheme.textMuted]}>{modalMessage}</Text>
              <TouchableOpacity style={styles.modalOkBtn} onPress={() => setModalVisible(false)}><Text style={styles.modalOkText}>OK</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.navigate('/dashboard')} style={styles.backButton}><ArrowLeft size={24} color="#ffffff" /></TouchableOpacity>
          <Text style={styles.headerTitle}>{t('electionResult')}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ഈ വ്യൂ ആണ് ക്യാപ്‌ചർ ചെയ്യുന്നത്. ഇതിന് position: 'relative' നൽകി */}
          <View style={[styles.content, currentTheme.containerBg, { position: 'relative' }]} collapsable={false} ref={resultViewRef}>
            
            {/* ബാക്ക്ഗ്രൗണ്ടിൽ കാണാനുള്ള ലോഗോ (Watermark) */}
            <View style={styles.watermarkContainer} pointerEvents="none">
              <Image source={require('../../assets/images/icon.png')} style={styles.watermarkImage} />
            </View>

            <View style={[styles.infoCard, currentTheme.cardBg]}>
              <Text style={[styles.electionName, currentTheme.textMain]}>{election.name}</Text>
              <View style={[styles.totalBadge, currentTheme.badgeBg]}><Users size={16} color={isDarkMode ? '#94a3b8' : '#64748b'} /><Text style={[styles.totalText, currentTheme.textMuted]}>{t('totalVotersOpt').replace(' (Optional)','').replace(' (നിർബന്ധമല്ല)','')}: {totalVotes}</Text></View>
            </View>

            {totalVotes > 0 ? (
              <>
                {isTie ? (
                  <View style={[styles.winnerCard, { borderColor: '#fca5a5', backgroundColor: isDarkMode ? '#450a0a' : '#fef2f2' }]}>
                    <Users size={50} color="#ef4444" style={{ marginBottom: 10 }} />
                    <Text style={[styles.winnerLabel, { color: '#ef4444' }]}>{t('tie')}</Text>
                    <Text style={[styles.tieNames, currentTheme.textMain]}>{tiedCandidates.map(c => c.name).join(' & ')}</Text>
                    <Text style={[styles.winnerVotes, { color: '#ef4444' }]}>{maxVotes} Votes Each</Text>
                    <TouchableOpacity style={styles.drawLotBtn} onPress={() => handleDrawLot(tiedCandidates)} disabled={isDrawingLot}>
                      {isDrawingLot ? <ActivityIndicator color="#ffffff" /> : <><Dices size={20} color="#ffffff" /><Text style={styles.drawLotBtnText}>Draw Lot</Text></>}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.winnerCard, { borderColor: '#fef3c7', backgroundColor: isDarkMode ? '#422006' : '#fffbeb' }]}>
                    <Trophy size={50} color="#f59e0b" style={{ marginBottom: 10 }} />
                    <Text style={[styles.winnerLabel, { color: '#f59e0b' }]}>{t('winner')}</Text>
                    <Text style={[styles.winnerName, currentTheme.textMain]}>{winner.name}</Text>
                    <Text style={[styles.winnerVotes, { color: '#f59e0b' }]}>{winner.votes} Votes</Text>
                  </View>
                )}
                <View style={[styles.resultsSection, currentTheme.cardBg]}>
                  <Text style={styles.sectionTitle}>RESULTS</Text>
                  {results.map((c, index) => {
                    const percentage = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
                    return (
                      <View key={c.id} style={styles.resultItem}>
                        <View style={styles.resultHeader}><Text style={[styles.candidateName, currentTheme.textMain]}>{c.name}</Text><Text style={[styles.voteCount, currentTheme.textMuted]}>{c.votes} ({percentage}%)</Text></View>
                        <View style={[styles.progressBg, currentTheme.badgeBg]}><View style={[styles.progressFill, { width: `${percentage}%` }, index === 0 && !isTie && c.votes > 0 ? { backgroundColor: '#22c55e' } : { backgroundColor: '#3b82f6' }]} /></View>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : <View style={[styles.emptyCard, currentTheme.cardBg]}><Text style={[styles.emptyText, currentTheme.textMuted]}>No votes cast!</Text></View>}
          </View>
          
          {totalVotes > 0 && <TouchableOpacity style={styles.shareBtn} onPress={shareResultImage}><Share2 size={20} color="#ffffff" /><Text style={styles.shareBtnText}>{t('shareResult')}</Text></TouchableOpacity>}
          <View style={{height: 30}} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({ containerBg: { backgroundColor: '#f8fafc' }, cardBg: { backgroundColor: '#ffffff', borderColor: '#e2e8f0' }, textMain: { color: '#1e293b' }, textMuted: { color: '#64748b' }, badgeBg: { backgroundColor: '#f1f5f9' } });
const darkStyles = StyleSheet.create({ containerBg: { backgroundColor: '#0f172a' }, cardBg: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 }, textMain: { color: '#f1f5f9' }, textMuted: { color: '#94a3b8' }, badgeBg: { backgroundColor: '#334155' } });

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2563eb', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  mainContent: { flex: 1 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }, modalCard: { width: '100%', maxWidth: 320, borderRadius: 20, padding: 30, alignItems: 'center', elevation: 10 }, modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }, modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 25 }, modalOkBtn: { width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#2563eb', alignItems: 'center' }, modalOkText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  loadingTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 }, historyLoadingTitle: { color: '#60a5fa', fontSize: 18, fontWeight: '600', marginTop: 15 }, 
  header: { backgroundColor: '#2563eb', padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15, elevation: 4 }, headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' }, content: { padding: 16 }, infoCard: { padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 16, elevation: 2 }, electionName: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }, totalBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }, totalText: { fontSize: 13, fontWeight: '600' }, winnerCard: { padding: 30, borderRadius: 24, alignItems: 'center', marginBottom: 16, borderWidth: 2 }, winnerLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 }, winnerName: { fontSize: 26, fontWeight: '900', textAlign: 'center' }, tieNames: { fontSize: 20, fontWeight: '900', textAlign: 'center', marginTop: 5 }, winnerVotes: { fontSize: 16, fontWeight: 'bold', marginTop: 10 }, drawLotBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ef4444', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 20 }, drawLotBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }, resultsSection: { padding: 20, borderRadius: 16, marginBottom: 10 }, sectionTitle: { fontSize: 12, fontWeight: '900', color: '#60a5fa', letterSpacing: 1, marginBottom: 20 }, resultItem: { marginBottom: 18 }, resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }, candidateName: { fontSize: 14, fontWeight: 'bold' }, voteCount: { fontSize: 13, fontWeight: 'bold' }, progressBg: { height: 10, borderRadius: 5, overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 5 }, emptyCard: { padding: 40, borderRadius: 16, alignItems: 'center' }, emptyText: { fontSize: 16 }, shareBtn: { backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 12, marginHorizontal: 16 }, shareBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  countdownContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }, countdownTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 }, countdownSub: { fontSize: 14, marginBottom: 30, textAlign: 'center' }, timerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, timeBox: { width: 70, height: 80, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#cbd5e1', elevation: 2 }, timeNum: { fontSize: 28, fontWeight: 'bold', color: '#2563eb' }, timeLabel: { fontSize: 12, fontWeight: '600', marginTop: 4 }, timeCol: { fontSize: 24, fontWeight: 'bold', color: '#94a3b8', paddingBottom: 20 },
  
  // Watermark Styles
  watermarkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1, // Sits behind everything
  },
  watermarkImage: {
    width: 250,
    height: 250,
    opacity: 0.05, // Extra faint watermark
    resizeMode: 'contain',
  }
});
