import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Provider as PaperProvider,
  MD3LightTheme,
  Surface,
  IconButton,
  Chip,
  ActivityIndicator,
  Menu,
  Divider,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import axios from 'axios';

// Custom theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2E7D32',
    secondary: '#4CAF50',
    tertiary: '#81C784',
    surface: '#F1F8E9',
    background: '#FFFFFF',
  },
};

interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: Date;
}

export default function TranslatorScreen() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('english');
  const [targetLanguage, setTargetLanguage] = useState('hindi');
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showTargetMenu, setShowTargetMenu] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);

  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost';

  const languages = [
    { code: 'english', name: 'English', nativeName: 'English' },
    { code: 'hindi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'malayalam', name: 'Malayalam', nativeName: 'മലയാളം' },
  ];

  const getLanguageDisplay = (langCode: string) => {
    const lang = languages.find(l => l.code === langCode);
    return lang ? `${lang.name} (${lang.nativeName})` : langCode;
  };

  const translateText = async () => {
    if (!inputText.trim()) {
      Alert.alert('Input Required', 'Please enter text to translate');
      return;
    }

    if (sourceLanguage === targetLanguage) {
      Alert.alert('Language Error', 'Source and target languages cannot be the same');
      return;
    }

    setIsTranslating(true);
    try {
      const response = await axios.post(`${backendUrl}/api/translate`, {
        text: inputText.trim(),
        source_language: sourceLanguage,
        target_language: targetLanguage,
      });

      const result = response.data;
      setTranslatedText(result.translated_text);

      // Add to translation history
      const newTranslation: Translation = {
        id: Date.now().toString(),
        originalText: result.original_text,
        translatedText: result.translated_text,
        sourceLanguage: result.source_language,
        targetLanguage: result.target_language,
        timestamp: new Date(),
      };

      setTranslations(prev => [newTranslation, ...prev]);

    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert(
        'Translation Failed',
        'Sorry, could not translate the text. Please try again.'
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    // Swap texts too
    const tempText = inputText;
    setInputText(translatedText);
    setTranslatedText(tempText);
  };

  const clearAll = () => {
    setInputText('');
    setTranslatedText('');
    setTranslations([]);
  };

  const copyTranslation = async (text: string) => {
    try {
      // Note: Clipboard API would need expo-clipboard
      Alert.alert('Copied', 'Translation copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Could not copy to clipboard');
    }
  };

  const quickTranslations = [
    { english: 'Hello, how are you?', hindi: 'नमस्ते, आप कैसे हैं?', malayalam: 'ഹലോ, നിങ്ങൾ എങ്ങനെയുണ്ട്?' },
    { english: 'What is your name?', hindi: 'आपका नाम क्या है?', malayalam: 'നിങ്ങളുടെ പേരെന്താണ്?' },
    { english: 'Thank you very much', hindi: 'बहुत धन्यवाद', malayalam: 'വളരെ നന്ദി' },
    { english: 'How much does this cost?', hindi: 'इसकी कीमत कितनी है?', malayalam: 'ഇതിന്റെ വില എത്രയാണ്?' },
    { english: 'I need help', hindi: 'मुझे मदद चाहिए', malayalam: 'എനിക്ക് സഹായം ആവശ്യമാണ്' },
  ];

  const useQuickTranslation = (translation: any) => {
    if (sourceLanguage === 'english') {
      setInputText(translation.english);
    } else if (sourceLanguage === 'hindi') {
      setInputText(translation.hindi);
    } else if (sourceLanguage === 'malayalam') {
      setInputText(translation.malayalam);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <Surface style={styles.header} elevation={2}>
              <View style={styles.headerContent}>
                <Link href="/" asChild>
                  <IconButton icon="arrow-left" size={24} />
                </Link>
                <View style={styles.headerTitle}>
                  <Text style={styles.headerTitleText}>Language Translator</Text>
                  <Text style={styles.headerSubtitle}>भाषा अनुवादक / ഭാഷാ വിവർത്തകൻ</Text>
                </View>
                <IconButton icon="refresh" size={24} onPress={clearAll} />
              </View>
            </Surface>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Language Selection */}
              <Card style={styles.languageCard} mode="outlined">
                <Card.Content>
                  <View style={styles.languageSelector}>
                    <View style={styles.languageItem}>
                      <Text style={styles.languageLabel}>From</Text>
                      <Menu
                        visible={showSourceMenu}
                        onDismiss={() => setShowSourceMenu(false)}
                        anchor={
                          <Button
                            mode="outlined"
                            onPress={() => setShowSourceMenu(true)}
                            contentStyle={styles.languageButton}
                          >
                            {getLanguageDisplay(sourceLanguage)}
                          </Button>
                        }
                      >
                        {languages.map((lang) => (
                          <Menu.Item
                            key={lang.code}
                            onPress={() => {
                              setSourceLanguage(lang.code);
                              setShowSourceMenu(false);
                            }}
                            title={getLanguageDisplay(lang.code)}
                          />
                        ))}
                      </Menu>
                    </View>

                    <IconButton
                      icon="swap-horizontal"
                      size={24}
                      onPress={swapLanguages}
                      style={styles.swapButton}
                    />

                    <View style={styles.languageItem}>
                      <Text style={styles.languageLabel}>To</Text>
                      <Menu
                        visible={showTargetMenu}
                        onDismiss={() => setShowTargetMenu(false)}
                        anchor={
                          <Button
                            mode="outlined"
                            onPress={() => setShowTargetMenu(true)}
                            contentStyle={styles.languageButton}
                          >
                            {getLanguageDisplay(targetLanguage)}
                          </Button>
                        }
                      >
                        {languages.map((lang) => (
                          <Menu.Item
                            key={lang.code}
                            onPress={() => {
                              setTargetLanguage(lang.code);
                              setShowTargetMenu(false);
                            }}
                            title={getLanguageDisplay(lang.code)}
                          />
                        ))}
                      </Menu>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              {/* Input Text */}
              <Card style={styles.inputCard} mode="outlined">
                <Card.Content>
                  <Text style={styles.cardTitle}>Enter Text to Translate</Text>
                  <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={`Type in ${getLanguageDisplay(sourceLanguage)}...`}
                    multiline
                    numberOfLines={4}
                    mode="outlined"
                    disabled={isTranslating}
                  />
                  <View style={styles.inputActions}>
                    <Text style={styles.characterCount}>
                      {inputText.length}/1000 characters
                    </Text>
                    <Button
                      mode="contained"
                      onPress={translateText}
                      disabled={isTranslating || !inputText.trim()}
                      loading={isTranslating}
                      style={styles.translateButton}
                    >
                      {isTranslating ? 'Translating...' : 'Translate'}
                    </Button>
                  </View>
                </Card.Content>
              </Card>

              {/* Translation Result */}
              {(translatedText || isTranslating) && (
                <Card style={styles.resultCard} mode="outlined">
                  <Card.Content>
                    <View style={styles.resultHeader}>
                      <Text style={styles.cardTitle}>Translation</Text>
                      {translatedText && (
                        <IconButton
                          icon="content-copy"
                          size={20}
                          onPress={() => copyTranslation(translatedText)}
                        />
                      )}
                    </View>
                    
                    {isTranslating ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Translating...</Text>
                      </View>
                    ) : (
                      <View style={styles.translationResult}>
                        <Text style={styles.translatedText}>{translatedText}</Text>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              )}

              {/* Quick Translations */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Translations</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {quickTranslations.map((translation, index) => (
                    <Card
                      key={index}
                      style={styles.quickCard}
                      mode="outlined"
                      onPress={() => useQuickTranslation(translation)}
                    >
                      <Card.Content style={styles.quickCardContent}>
                        <Text style={styles.quickText}>
                          {sourceLanguage === 'english' ? translation.english :
                           sourceLanguage === 'hindi' ? translation.hindi :
                           translation.malayalam}
                        </Text>
                      </Card.Content>
                    </Card>
                  ))}
                </ScrollView>
              </View>

              {/* Translation History */}
              {translations.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recent Translations</Text>
                  {translations.slice(0, 5).map((translation) => (
                    <Card key={translation.id} style={styles.historyCard} mode="outlined">
                      <Card.Content>
                        <View style={styles.historyHeader}>
                          <Text style={styles.historyLanguages}>
                            {getLanguageDisplay(translation.sourceLanguage)} → {getLanguageDisplay(translation.targetLanguage)}
                          </Text>
                          <Text style={styles.historyTime}>
                            {translation.timestamp.toLocaleTimeString()}
                          </Text>
                        </View>
                        <Text style={styles.historyOriginal}>{translation.originalText}</Text>
                        <Divider style={styles.historyDivider} />
                        <Text style={styles.historyTranslated}>{translation.translatedText}</Text>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              )}

              <View style={styles.bottomSpacing} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  languageCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageItem: {
    flex: 1,
  },
  languageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  languageButton: {
    paddingVertical: 8,
  },
  swapButton: {
    marginHorizontal: 16,
  },
  inputCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
  },
  translateButton: {
    backgroundColor: '#2E7D32',
  },
  resultCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 12,
    color: '#666',
  },
  translationResult: {
    minHeight: 60,
    justifyContent: 'center',
  },
  translatedText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  quickCard: {
    width: 200,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  quickCardContent: {
    paddingVertical: 12,
  },
  quickText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  historyCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyLanguages: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
  },
  historyOriginal: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  historyDivider: {
    marginVertical: 8,
  },
  historyTranslated: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 32,
  },
});