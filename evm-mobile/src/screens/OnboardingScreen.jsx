import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Vote, CheckCircle2, ChevronRight } from 'lucide-react-native';

const OnboardingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        
        {/* Icon Section */}
        <View style={styles.iconContainer}>
          <Vote size={60} color="#2563eb" strokeWidth={2.5} />
        </View>

        {/* Text Section */}
        <Text style={styles.title}>EVM Simulator</Text>
        <Text style={styles.description}>
          ഇന്ത്യൻ തിരഞ്ഞെടുപ്പ് പ്രക്രിയയും വോട്ടിംഗ് മെഷീനും എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്ന് മനസ്സിലാക്കാൻ ഈ ആപ്പ് സഹായിക്കും.
        </Text>

        {/* Features List */}
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <CheckCircle2 size={22} color="#10b981" />
            <Text style={styles.featureText}>സ്വന്തമായി തിരഞ്ഞെടുപ്പ് നടത്താം.</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle2 size={22} color="#10b981" />
            <Text style={styles.featureText}>CU, BU എന്നിവയുടെ പ്രവർത്തനം പഠിക്കാം.</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle2 size={22} color="#10b981" />
            <Text style={styles.featureText}>100% Offline. ഇന്റർനെറ്റ് ആവശ്യമില്ല.</Text>
          </View>
        </View>

        {/* Bottom Button */}
        <TouchableOpacity 
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => alert('Dashboard coming soon!')}
        >
          <Text style={styles.buttonText}>തുടങ്ങാം</Text>
          <ChevronRight size={20} color="#ffffff" />
        </TouchableOpacity>
        
        <Text style={styles.footerText}>Made with ❤️ for Election Learning</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#dbeafe',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  featureList: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    marginLeft: 12,
    color: '#334155',
    fontSize: 15,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  footerText: {
    marginTop: 30,
    fontSize: 12,
    color: '#94a3b8',
    letterSpacing: 0.5,
  }
});

export default OnboardingScreen;
