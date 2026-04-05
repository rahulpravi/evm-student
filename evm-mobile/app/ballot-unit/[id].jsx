import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, StatusBar, ScrollView, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { User, AlertTriangle } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { getElectionById, updateElection } from '../../src/utils/db';

export default function BallotUnit() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [election, setElection] = useState(null);
  const [votingStatus, setVotingStatus] = useState('idle');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    const data = await getElectionById(id);
    if (data) {
      const now = new Date();
      if (data.startTime && now < new Date(data.startTime)) {
        setErrorModal({ visible: true, message: 'വോട്ടിംഗ് തുടങ്ങിയിട്ടില്ല!' });
      } else if (data.endTime && now > new Date(data.endTime)) {
        setErrorModal({ visible: true, message: 'വോട്ടിംഗ് സമയം അവസാനിച്ചു!' });
      }
      setElection(data);
    } else router.replace('/dashboard');
  };

  const playOriginalBeep = async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false, staysActiveInBackground: false, shouldDuckAndroid: true, playThroughEarpieceAndroid: false });
      const { sound } = await Audio.Sound.createAsync(require('../../assets/images/beep.mp3'));
      await sound.playAsync();
      setTimeout(async () => { await sound.stopAsync(); await sound.unloadAsync(); }, 1500);
    } catch (e) { console.log("Sound Error:", e); }
  };

  const handleVote = async (item) => {
    if (votingStatus !== 'idle' || item.type === 'empty') return;
    setVotingStatus('voting');
    setSelectedCandidate(item);
    await playOriginalBeep();
    const updatedVotes = { ...election.votes };
    updatedVotes[item.id] = (updatedVotes[item.id] || 0) + 1;
    await updateElection(id, { votes: updatedVotes });
    setTimeout(() => { router.back(); }, 1500);
  };

  if (!election) return null;

  const totalSlots = Math.max(8, election.candidates.length + 1); 
  const ballotItems = Array.from({ length: totalSlots }).map((_, index) => {
    const serialNumber = index + 1; 
    if (index < election.candidates.length) return { ...election.candidates[index], type: 'candidate', serialNumber };
    else if (index === totalSlots - 1) return { id: 'nota', name: 'NOTA (NONE OF THE ABOVE)', type: 'nota', serialNumber };
    else return { id: `empty-${index}`, type: 'empty', serialNumber };
  });

  // NOTA ചിഹ്നം ഉണ്ടാക്കുന്നതിനുള്ള ഘടകം (Component)
  const NotaLogo = ({ size = 32 }) => {
    const ringSize = size;
    const crossSize = size * 0.7; // ക്രോസ് മാർക്കിന്റെ വലുപ്പം റിങ്ങിനേക്കാൾ ചെറുതായിരിക്കണം
    const crossThickness = Math.max(2, size * 0.08); // വലുപ്പത്തിനനുസരിച്ച് ക്രോസ്സിന്റെ കനം മാറ്റാം

    return (
      <View style={[styles.notaRing, { width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderWidth: crossThickness + 1 }]}>
        <View style={[styles.notaCrossLine, { width: crossSize, height: crossThickness, backgroundColor: '#ef4444', transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.notaCrossLine, { width: crossSize, height: crossThickness, backgroundColor: '#ef4444', transform: [{ rotate: '-45deg' }] }]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e2e8f0" />
      
      <Modal visible={errorModal.visible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <AlertTriangle size={50} color="#ef4444" style={{ marginBottom: 15 }} />
            <Text style={styles.modalTitle}>ശ്രദ്ധിക്കുക</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <TouchableOpacity style={styles.modalOkBtn} onPress={() => router.replace('/dashboard')}><Text style={styles.modalOkText}>മെയിൻ മെനുവിലേക്ക്</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {votingStatus === 'voting' && selectedCandidate && (
        <View style={styles.vvpatOverlay}>
          <View style={styles.vvpatSlip}>
            <Text style={styles.vvpatHeader}>VVPAT SLIP</Text>
            
            {/* VVPAT സ്ലിപ്പിലും NOTA ചിഹ്നം കാണിക്കുന്നു */}
            {selectedCandidate.id === 'nota' ? (
              <NotaLogo size={70} /> // VVPAT-ൽ കുറച്ചുകൂടി വലുതായി കാണിക്കാം
            ) : selectedCandidate.logo ? (
              <Image source={{ uri: selectedCandidate.logo }} style={styles.vvpatLogo} />
            ) : (
              <User size={60} color="#000" style={styles.vvpatIcon} />
            )}

            <Text style={styles.vvpatName}>{selectedCandidate.name}</Text>
            <Text style={styles.vvpatFooter}>EVM Simulator</Text>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.evmMachine}>
          <View style={styles.evmHeader}>
            <View style={styles.readyIndicator}><View style={styles.readyLight} /><Text style={styles.readyText}>READY</Text></View>
            <Text style={styles.ballotText}>BALLOT UNIT</Text>
          </View>
          <View style={styles.candidatesList}>
            {ballotItems.map((item) => {
              const isVoted = votingStatus === 'voting' && selectedCandidate?.id === item.id;
              const isEmpty = item.type === 'empty';
              const isNota = item.type === 'nota';
              
              return (
                <View key={item.id} style={styles.candidateRow}>
                  <View style={styles.serialBox}><Text style={styles.serialText}>{item.serialNumber}</Text></View>
                  <View style={[styles.nameLogoBox, isEmpty && styles.emptyNameLogoBox]}>
                    {!isEmpty && (
                      <>
                        <Text style={[styles.candidateName, isNota && styles.notaText]} numberOfLines={2}>{item.name}</Text>
                        <View style={styles.logoWrapper}>
                          {isNota ? (
                            <NotaLogo size={32} /> // ബാലറ്റ് യൂണിറ്റിലെ സാധാരണ വലുപ്പം
                          ) : item.logo ? (
                            <Image source={{ uri: item.logo }} style={styles.logoImg} />
                          ) : (
                            <User size={24} color="#94a3b8" />
                          )}
                        </View>
                      </>
                    )}
                  </View>
                  <View style={[styles.ledLight, isVoted && styles.ledLightActive]} />
                  <TouchableOpacity style={[styles.blueButton, isEmpty && styles.blueButtonDisabled]} disabled={votingStatus !== 'idle' || isEmpty} onPress={() => handleVote(item)}></TouchableOpacity>
                </View>
              )
            })}
          </View>
          <Text style={styles.machineFooterText}>ELECTION COMMISSION SIMULATOR</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e2e8f0' }, scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 15, paddingVertical: 40 },
  vvpatOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100, alignItems: 'center', justifyContent: 'center', padding: 20 }, vvpatSlip: { backgroundColor: '#fff', width: 220, padding: 20, borderWidth: 8, borderColor: '#d1d5db', alignItems: 'center' }, vvpatHeader: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', width: '100%', textAlign: 'center' }, vvpatLogo: { width: 80, height: 80, marginBottom: 15, resizeMode: 'contain' }, vvpatName: { fontSize: 20, fontWeight: '900', color: '#000', textTransform: 'uppercase', textAlign: 'center' }, vvpatFooter: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', marginTop: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb', width: '100%', textAlign: 'center' },
  
  evmMachine: { backgroundColor: '#ffffff', width: '100%', maxWidth: 420, borderRadius: 6, padding: 8, borderWidth: 2, borderColor: '#94a3b8', elevation: 5 }, 
  evmHeader: { backgroundColor: '#dcfce7', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 2, borderBottomColor: '#cbd5e1', marginBottom: 6 }, 
  readyIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 }, 
  readyLight: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#22c55e', elevation: 2 }, 
  readyText: { fontSize: 13, fontWeight: '900', color: '#166534', includeFontPadding: false }, 
  ballotText: { fontSize: 14, fontWeight: '900', color: '#334155', includeFontPadding: false }, 
  candidateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 8, paddingHorizontal: 4, gap: 10 }, 
  serialBox: { width: 42, height: 50, borderWidth: 1.5, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }, 
  serialText: { fontSize: 18, fontWeight: 'bold', color: '#334155', includeFontPadding: false }, 
  nameLogoBox: { flex: 1, borderWidth: 1.5, borderColor: '#cbd5e1', flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#ffffff' }, 
  emptyNameLogoBox: { backgroundColor: '#f1f5f9' },
  candidateName: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#0f172a', paddingHorizontal: 10, includeFontPadding: false, textAlignVertical: 'center' }, 
  notaText: { fontSize: 12 }, 
  logoWrapper: { width: 50, height: '100%', borderLeftWidth: 1.5, borderLeftColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', padding: 4 }, 
  logoImg: { width: '100%', height: '100%', resizeMode: 'contain' }, 
  
  // NOTA ചിഹ്നത്തിനുള്ള ശൈലികൾ (Styles)
  notaRing: { borderColor: '#ef4444', // Red ring
    justifyContent: 'center', alignItems: 'center', position: 'relative' }, notaCrossLine: { position: 'absolute', backgroundColor: '#ef4444', // Red cross
    borderRadius: 2 },
  
  ledLight: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#7f1d1d', borderWidth: 2, borderColor: '#475569' }, 
  ledLightActive: { backgroundColor: '#ef4444', borderColor: '#ef4444', elevation: 5 }, 
  blueButton: { width: 55, height: 36, backgroundColor: '#2563eb', borderRadius: 18, elevation: 3 }, 
  blueButtonDisabled: { opacity: 1, backgroundColor: '#cbd5e1', elevation: 0 }, 
  machineFooterText: { textAlign: 'center', fontSize: 11, fontWeight: 'bold', color: '#9ca3af', marginTop: 15 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }, modalCard: { backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center', width: '100%' }, modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 }, modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 25 }, modalOkBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' }, modalOkText: { color: '#fff', fontWeight: 'bold' }
});
