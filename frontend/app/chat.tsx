import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

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

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  hasImage?: boolean;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'സ്വാഗതം! നിങ്ങളുടെ കൃഷി ചോദ്യങ്ങൾ ചോദിക്കൂ. Welcome! Ask your farming questions.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Mock farmer ID and session ID (in real app, get from authentication)
  const farmerId = 'farmer_demo_001';
  const sessionId = 'session_' + Date.now();

  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const sendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText || 'Shared an image',
      isUser: true,
      timestamp: new Date(),
      hasImage: !!selectedImage,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/chat`, {
        farmer_id: farmerId,
        message: inputText || 'Please analyze this plant image',
        message_type: selectedImage ? 'image' : 'text',
        image_data: selectedImage,
        session_id: sessionId,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setSelectedImage(null);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I couldn\'t process your message. Please try again or contact support.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera roll permission is required to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setSelectedImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setSelectedImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const quickQuestions = [
    'What crops are best for this season?',
    'How to prevent pests organically?',
    'വിത്തുകൾ എപ്പോൾ നടണം?',
    'Soil preparation tips',
    'Irrigation schedule help',
  ];

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            {/* Header */}
            <Surface style={styles.header} elevation={2}>
              <View style={styles.headerContent}>
                <Link href="/" asChild>
                  <IconButton icon="arrow-left" size={24} />
                </Link>
                <View style={styles.headerTitle}>
                  <Text style={styles.headerTitleText}>AI Farming Chat</Text>
                  <Text style={styles.headerSubtitle}>കൃഷി സഹായി</Text>
                </View>
                <IconButton icon="dots-vertical" size={24} />
              </View>
            </Surface>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageWrapper,
                    message.isUser ? styles.userMessageWrapper : styles.botMessageWrapper,
                  ]}
                >
                  <Card
                    style={[
                      styles.messageCard,
                      message.isUser ? styles.userMessage : styles.botMessage,
                    ]}
                  >
                    <Card.Content style={styles.messageContent}>
                      <Text
                        style={[
                          styles.messageText,
                          message.isUser ? styles.userMessageText : styles.botMessageText,
                        ]}
                      >
                        {message.text}
                      </Text>
                      {message.hasImage && (
                        <Chip icon="image" style={styles.imageChip}>
                          Image attached
                        </Chip>
                      )}
                      <Text
                        style={[
                          styles.timestamp,
                          message.isUser ? styles.userTimestamp : styles.botTimestamp,
                        ]}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </Card.Content>
                  </Card>
                </View>
              ))}

              {isLoading && (
                <View style={styles.loadingWrapper}>
                  <Card style={styles.loadingCard}>
                    <Card.Content style={styles.loadingContent}>
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                      <Text style={styles.loadingText}>Thinking...</Text>
                    </Card.Content>
                  </Card>
                </View>
              )}
            </ScrollView>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <ScrollView
                horizontal
                style={styles.quickQuestionsContainer}
                showsHorizontalScrollIndicator={false}
              >
                {quickQuestions.map((question, index) => (
                  <Chip
                    key={index}
                    style={styles.quickQuestionChip}
                    onPress={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Chip>
                ))}
              </ScrollView>
            )}

            {/* Image Preview */}
            {selectedImage && (
              <View style={styles.imagePreview}>
                <Card style={styles.imagePreviewCard}>
                  <Card.Content style={styles.imagePreviewContent}>
                    <Ionicons name="image" size={24} color={theme.colors.primary} />
                    <Text style={styles.imagePreviewText}>Image ready to send</Text>
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => setSelectedImage(null)}
                    />
                  </Card.Content>
                </Card>
              </View>
            )}

            {/* Input Section */}
            <Surface style={styles.inputContainer} elevation={3}>
              <View style={styles.inputRow}>
                <IconButton
                  icon="camera"
                  size={24}
                  onPress={takePhoto}
                  style={styles.inputButton}
                />
                <IconButton
                  icon="image"
                  size={24}
                  onPress={pickImage}
                  style={styles.inputButton}
                />
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type your farming question... / നിങ്ങളുടെ ചോദ്യം ടൈപ്പ് ചെയ്യൂ..."
                  multiline
                  maxLength={500}
                  mode="outlined"
                  disabled={isLoading}
                />
                <IconButton
                  icon="send"
                  size={24}
                  onPress={sendMessage}
                  disabled={isLoading || (!inputText.trim() && !selectedImage)}
                  style={[
                    styles.sendButton,
                    (!inputText.trim() && !selectedImage) && styles.sendButtonDisabled,
                  ]}
                />
              </View>
            </Surface>
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
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  botMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
    minWidth: '30%',
  },
  userMessage: {
    backgroundColor: '#2E7D32',
  },
  botMessage: {
    backgroundColor: '#F1F8E9',
  },
  messageContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#2E7D32',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#FFFFFF',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#2E7D32',
  },
  imageChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  loadingWrapper: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loadingCard: {
    backgroundColor: '#F1F8E9',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#2E7D32',
  },
  quickQuestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickQuestionChip: {
    marginRight: 8,
    backgroundColor: '#E8F5E8',
  },
  imagePreview: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  imagePreviewCard: {
    backgroundColor: '#E8F5E8',
  },
  imagePreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  imagePreviewText: {
    flex: 1,
    marginLeft: 8,
    color: '#2E7D32',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputButton: {
    margin: 0,
  },
  textInput: {
    flex: 1,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  sendButton: {
    margin: 0,
    backgroundColor: '#2E7D32',
  },
  sendButtonDisabled: {
    backgroundColor: '#C8E6C9',
  },
});