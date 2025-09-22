import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Provider as PaperProvider,
  MD3LightTheme,
  Surface,
  IconButton,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const { width } = Dimensions.get('window');

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

export default function DiseaseDetectionScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost';
  const farmerId = 'farmer_demo_001'; // Mock farmer ID

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Camera roll permission is required to select images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].base64 || null);
        setImageUri(result.assets[0].uri);
        setAnalysisResult(null);
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
        Alert.alert(
          'Permission needed',
          'Camera permission is required to take photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].base64 || null);
        setImageUri(result.assets[0].uri);
        setAnalysisResult(null);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select or take a photo first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await axios.post(`${backendUrl}/api/detect-disease`, {
        farmer_id: farmerId,
        image_data: selectedImage,
        description: description,
      });

      setAnalysisResult(response.data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        'Sorry, could not analyze the image. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImageUri(null);
    setDescription('');
    setAnalysisResult(null);
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <Surface style={styles.header} elevation={2}>
            <View style={styles.headerContent}>
              <Link href="/" asChild>
                <IconButton icon="arrow-left" size={24} />
              </Link>
              <View style={styles.headerTitle}>
                <Text style={styles.headerTitleText}>Disease Detection</Text>
                <Text style={styles.headerSubtitle}>രോഗ കണ്ടെത്തൽ</Text>
              </View>
              <IconButton icon="refresh" size={24} onPress={resetAnalysis} />
            </View>
          </Surface>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Instructions */}
            <Card style={styles.instructionsCard} mode="outlined">
              <Card.Content>
                <View style={styles.instructionRow}>
                  <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
                  <View style={styles.instructionText}>
                    <Text style={styles.instructionTitle}>How to use</Text>
                    <Text style={styles.instructionDescription}>
                      1. Take a clear photo of your plant{'\n'}
                      2. Add a description (optional){'\n'}
                      3. Tap Analyze to get diagnosis{'\n'}
                      4. Follow the treatment advice
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Image Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Step 1: Select Plant Image</Text>
              
              {imageUri ? (
                <Card style={styles.imageCard} mode="outlined">
                  <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                  <Card.Actions style={styles.imageActions}>
                    <Button icon="camera" onPress={takePhoto} style={styles.actionButton}>
                      Retake
                    </Button>
                    <Button icon="image" onPress={pickImage} style={styles.actionButton}>
                      Choose Another
                    </Button>
                  </Card.Actions>
                </Card>
              ) : (
                <View style={styles.imageSelectionContainer}>
                  <Card style={styles.imageSelectionCard} mode="outlined">
                    <Card.Content style={styles.imageSelectionContent}>
                      <Ionicons name="camera-outline" size={64} color={theme.colors.primary} />
                      <Text style={styles.imageSelectionText}>
                        No image selected
                      </Text>
                      <Text style={styles.imageSelectionSubtext}>
                        ചെടിയുടെ ഫോട്ടോ എടുക്കൂ അല്ലെങ്കിൽ തിരഞ്ഞെടുക്കൂ
                      </Text>
                    </Card.Content>
                    <Card.Actions style={styles.imageSelectionActions}>
                      <Button icon="camera" mode="contained" onPress={takePhoto} style={styles.primaryButton}>
                        Take Photo
                      </Button>
                      <Button icon="image" mode="outlined" onPress={pickImage}>
                        Choose from Gallery
                      </Button>
                    </Card.Actions>
                  </Card>
                </View>
              )}
            </View>

            {/* Description Input */}
            {selectedImage && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Step 2: Add Description (Optional)</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe what you see... (e.g., yellow spots, wilting leaves)"
                  multiline
                  numberOfLines={3}
                  mode="outlined"
                />
              </View>
            )}

            {/* Analysis Button */}
            {selectedImage && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Step 3: Get Analysis</Text>
                <Button
                  mode="contained"
                  onPress={analyzeImage}
                  disabled={isAnalyzing}
                  loading={isAnalyzing}
                  style={styles.analyzeButton}
                  contentStyle={styles.analyzeButtonContent}
                >
                  {isAnalyzing ? 'Analyzing Plant...' : 'Analyze Plant Disease'}
                </Button>
              </View>
            )}

            {/* Analysis Result */}
            {analysisResult && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Analysis Result</Text>
                <Card style={styles.resultCard} mode="outlined">
                  <Card.Content>
                    <View style={styles.resultHeader}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      <Text style={styles.resultTitle}>Diagnosis Complete</Text>
                    </View>
                    <Text style={styles.resultText}>{analysisResult}</Text>
                  </Card.Content>
                  <Card.Actions>
                    <Link href="/chat" asChild>
                      <Button icon="chat" mode="outlined">
                        Ask Follow-up Questions
                      </Button>
                    </Link>
                  </Card.Actions>
                </Card>
              </View>
            )}

            {/* Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tips for Better Results</Text>
              <Card style={styles.tipsCard} mode="outlined">
                <Card.Content>
                  <View style={styles.tipItem}>
                    <Ionicons name="sunny" size={20} color={theme.colors.primary} />
                    <Text style={styles.tipText}>Take photos in good lighting</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="camera" size={20} color={theme.colors.primary} />
                    <Text style={styles.tipText}>Focus on affected areas</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="hand-left" size={20} color={theme.colors.primary} />
                    <Text style={styles.tipText}>Keep the camera steady</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="leaf" size={20} color={theme.colors.primary} />
                    <Text style={styles.tipText}>Include healthy parts for comparison</Text>
                  </View>
                </Card.Content>
              </Card>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
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
  instructionsCard: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionText: {
    marginLeft: 12,
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  instructionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  imageSelectionContainer: {
    alignItems: 'center',
  },
  imageSelectionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  imageSelectionContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  imageSelectionText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  imageSelectionSubtext: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
    textAlign: 'center',
  },
  imageSelectionActions: {
    justifyContent: 'space-around',
    paddingBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
  },
  selectedImage: {
    width: '100%',
    height: width * 0.6,
    resizeMode: 'cover',
  },
  imageActions: {
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  descriptionInput: {
    backgroundColor: '#FFFFFF',
  },
  analyzeButton: {
    backgroundColor: '#2E7D32',
  },
  analyzeButtonContent: {
    paddingVertical: 8,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  bottomSpacing: {
    height: 32,
  },
});