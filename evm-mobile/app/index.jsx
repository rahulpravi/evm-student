import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, ShieldCheck, WifiOff } from 'lucide-react-native';
import { SettingsContext } from '../src/context/SettingsContext';

export default function Index() {
  const router = useRouter();
  const { language, changeLanguage, t, isDarkMode } = useContext(SettingsContext);

  const currentTheme = isDarkMode ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={[styles.container, currentTheme.containerBg]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? '#0f172a' : '#f0f9ff'} />
      
      <View style={styles.langContainer}>
        <TouchableOpacity onPress={() => changeLanguage('en')} style={[styles.langBtn, language === 'en' && styles.langActive, isDarkMode && language !== 'en' && {backgroundColor: '#1e293b', borderColor: '#334155'}]}>
          <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeLanguage('ml')} style={[styles.langBtn, language === 'ml' && styles.langActive, isDarkMode && language !== 'ml' && {backgroundColor: '#1e293b', borderColor: '#334155'}]}>
          <Text style={[styles.langText, language === 'ml' && styles.langTextActive]}>മലയാളം</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, currentTheme.cardBg]}>
        <View style={[styles.iconWrapper, currentTheme.iconWrapper]}>
          <ShieldCheck size={40} color="#2563eb" />
        </View>
        
        <Text style={[styles.title, currentTheme.textMain]}>{t('appName')}</Text>
        <Text style={[styles.description, currentTheme.textMuted]}>
          {t('welcomeDesc')}
        </Text>

        <View style={[styles.featuresContainer, currentTheme.featureBox]}>
          <View style={styles.featureItem}>
            <CheckCircle2 size={20} color="#16a34a" style={{ marginTop: 2 }} />
            <Text style={[styles.featureText, currentTheme.textMain]}>{t('feature1')}</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle2 size={20} color="#16a34a" style={{ marginTop: 2 }} />
            <Text style={[styles.featureText, currentTheme.textMain]}>{t('feature2')}</Text>
          </View>
          <View style={styles.featureItem}>
            <WifiOff size={20} color="#f59e0b" style={{ marginTop: 2 }} />
            <Text style={[styles.featureText, currentTheme.textMain]}>{t('feature3')}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/dashboard')}>
          <Text style={styles.buttonText}>{t('getStarted')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({ 
  containerBg: { backgroundColor: '#f0f9ff' }, 
  cardBg: { backgroundColor: '#ffffff' }, 
  textMain: { color: '#1e293b' }, 
  textMuted: { color: '#64748b' },
  featureBox: { backgroundColor: '#f8fafc' },
  iconWrapper: { backgroundColor: '#eff6ff' }
});

const darkStyles = StyleSheet.create({ 
  containerBg: { backgroundColor: '#0f172a' }, 
  cardBg: { backgroundColor: '#1e293b' }, 
  textMain: { color: '#f1f5f9' }, 
  textMuted: { color: '#94a3b8' },
  featureBox: { backgroundColor: '#0f172a' },
  iconWrapper: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }
});

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  langContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20, gap: 10 },
  langBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#ffffff' },
  langActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  langText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  langTextActive: { color: '#ffffff' },
  card: { borderRadius: 24, padding: 30, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  iconWrapper: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  description: { fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  featuresContainer: { width: '100%', padding: 15, borderRadius: 16, gap: 15, marginBottom: 30 },
  featureItem: { flexDirection: 'row', gap: 10, paddingRight: 20 },
  featureText: { fontSize: 14, lineHeight: 22 },
  button: { backgroundColor: '#2563eb', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
