import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
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

interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  location: string;
  crops: string[];
  farm_size: string;
  created_at: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost';
  const farmerId = 'farmer_demo_001'; // Mock farmer ID

  const availableCrops = [
    'Rice', 'Coconut', 'Rubber', 'Pepper', 'Cardamom', 'Coffee',
    'Tea', 'Banana', 'Vegetables', 'Spices', 'Fruits', 'Flowers'
  ];

  const locationOptions = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
    'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
  ];

  const farmSizeOptions = [
    'Less than 1 acre', '1-2 acres', '2-5 acres', '5-10 acres', 'More than 10 acres'
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/farmers/${farmerId}`);
      const profileData = response.data;
      setProfile(profileData);
      
      // Set form values
      setName(profileData.name);
      setPhone(profileData.phone);
      setLocation(profileData.location);
      setFarmSize(profileData.farm_size || '');
      setSelectedCrops(profileData.crops || []);
    } catch (error) {
      console.error('Profile load error:', error);
      // Set default values for demo
      const demoProfile = {
        id: farmerId,
        name: 'Demo Farmer',
        phone: '+91 9876543210',
        location: 'Kochi',
        crops: ['Rice', 'Vegetables'],
        farm_size: '2-5 acres',
        created_at: new Date().toISOString(),
      };
      setProfile(demoProfile);
      setName(demoProfile.name);
      setPhone(demoProfile.phone);
      setLocation(demoProfile.location);
      setFarmSize(demoProfile.farm_size);
      setSelectedCrops(demoProfile.crops);
    }
  };

  const saveProfile = async () => {
    if (!name.trim() || !phone.trim() || !location.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const profileData = {
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        crops: selectedCrops,
        farm_size: farmSize,
      };

      if (profile) {
        // Update existing profile
        await axios.put(`${backendUrl}/api/farmers/${farmerId}`, profileData);
      } else {
        // Create new profile
        const response = await axios.post(`${backendUrl}/api/farmers`, profileData);
        setProfile(response.data);
      }

      Alert.alert('Success', 'Profile saved successfully');
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Profile save error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) 
        ? prev.filter(c => c !== crop)
        : [...prev, crop]
    );
  };

  const resetForm = () => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setLocation(profile.location);
      setFarmSize(profile.farm_size);
      setSelectedCrops(profile.crops);
    }
    setIsEditing(false);
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
                <Text style={styles.headerTitleText}>Profile</Text>
                <Text style={styles.headerSubtitle}>പ്രൊഫൈൽ</Text>
              </View>
              <IconButton 
                icon={isEditing ? "close" : "pencil"} 
                size={24} 
                onPress={isEditing ? resetForm : () => setIsEditing(true)}
              />
            </View>
          </Surface>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profile Info */}
            <Card style={styles.profileCard} mode="outlined">
              <Card.Content>
                <View style={styles.profileHeader}>
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={64} color={theme.colors.primary} />
                  </View>
                  <View style={styles.profileInfo}>
                    {!isEditing ? (
                      <>
                        <Text style={styles.profileName}>{profile?.name || 'No Name'}</Text>
                        <Text style={styles.profilePhone}>{profile?.phone || 'No Phone'}</Text>
                        <Text style={styles.profileLocation}>{profile?.location || 'No Location'}</Text>
                      </>
                    ) : (
                      <View style={styles.editingInfo}>
                        <Text style={styles.editingText}>Editing Profile</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <Card style={styles.infoCard} mode="outlined">
                <Card.Content>
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Full Name *"
                      value={name}
                      onChangeText={setName}
                      mode="outlined"
                      disabled={!isEditing}
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Phone Number *"
                      value={phone}
                      onChangeText={setPhone}
                      mode="outlined"
                      disabled={!isEditing}
                      keyboardType="phone-pad"
                      style={styles.input}
                    />
                  </View>

                  {isEditing ? (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Location *</Text>
                      <ScrollView 
                        horizontal 
                        style={styles.optionsContainer}
                        showsHorizontalScrollIndicator={false}
                      >
                        {locationOptions.map((loc) => (
                          <Chip
                            key={loc}
                            style={[
                              styles.optionChip,
                              location === loc && styles.selectedChip,
                            ]}
                            selected={location === loc}
                            onPress={() => setLocation(loc)}
                          >
                            {loc}
                          </Chip>
                        ))}
                      </ScrollView>
                    </View>
                  ) : (
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Location"
                        value={location}
                        mode="outlined"
                        disabled={true}
                        style={styles.input}
                      />
                    </View>
                  )}
                </Card.Content>
              </Card>
            </View>

            {/* Farm Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Farm Information</Text>
              <Card style={styles.infoCard} mode="outlined">
                <Card.Content>
                  {isEditing ? (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Farm Size</Text>
                      <ScrollView 
                        horizontal 
                        style={styles.optionsContainer}
                        showsHorizontalScrollIndicator={false}
                      >
                        {farmSizeOptions.map((size) => (
                          <Chip
                            key={size}
                            style={[
                              styles.optionChip,
                              farmSize === size && styles.selectedChip,
                            ]}
                            selected={farmSize === size}
                            onPress={() => setFarmSize(size)}
                          >
                            {size}
                          </Chip>
                        ))}
                      </ScrollView>
                    </View>
                  ) : (
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Farm Size"
                        value={farmSize}
                        mode="outlined"
                        disabled={true}
                        style={styles.input}
                      />
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Crops Grown</Text>
                    <View style={styles.cropsContainer}>
                      {availableCrops.map((crop) => (
                        <Chip
                          key={crop}
                          style={[
                            styles.cropChip,
                            selectedCrops.includes(crop) && styles.selectedCropChip,
                          ]}
                          selected={selectedCrops.includes(crop)}
                          onPress={isEditing ? () => toggleCrop(crop) : undefined}
                          disabled={!isEditing}
                        >
                          {crop}
                        </Chip>
                      ))}
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </View>

            {/* Actions */}
            {isEditing && (
              <View style={styles.section}>
                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={resetForm}
                    style={styles.cancelButton}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={saveProfile}
                    style={styles.saveButton}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Save Profile
                  </Button>
                </View>
              </View>
            )}

            {/* Statistics */}
            {!isEditing && profile && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Statistics</Text>
                <Card style={styles.statsCard} mode="outlined">
                  <Card.Content>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>15</Text>
                        <Text style={styles.statLabel}>Questions Asked</Text>
                      </View>
                      <Divider style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>3</Text>
                        <Text style={styles.statLabel}>Disease Checks</Text>
                      </View>
                      <Divider style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                          {Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                        </Text>
                        <Text style={styles.statLabel}>Days Active</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </View>
            )}

            {/* Quick Actions */}
            {!isEditing && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                  <Link href="/chat" asChild>
                    <Card style={styles.quickActionCard} mode="outlined">
                      <Card.Content style={styles.quickActionContent}>
                        <Ionicons name="chatbubbles" size={24} color={theme.colors.primary} />
                        <Text style={styles.quickActionText}>Chat History</Text>
                      </Card.Content>
                    </Card>
                  </Link>

                  <Card style={styles.quickActionCard} mode="outlined">
                    <Card.Content style={styles.quickActionContent}>
                      <Ionicons name="notifications" size={24} color={theme.colors.primary} />
                      <Text style={styles.quickActionText}>Notifications</Text>
                    </Card.Content>
                  </Card>

                  <Card style={styles.quickActionCard} mode="outlined">
                    <Card.Content style={styles.quickActionContent}>
                      <Ionicons name="help-circle" size={24} color={theme.colors.primary} />
                      <Text style={styles.quickActionText}>Help & Support</Text>
                    </Card.Content>
                  </Card>
                </View>
              </View>
            )}

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
  profileCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profileLocation: {
    fontSize: 14,
    color: '#4CAF50',
  },
  editingInfo: {
    flex: 1,
  },
  editingText: {
    fontSize: 16,
    color: '#2E7D32',
    fontStyle: 'italic',
  },
  section: {
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 8,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionChip: {
    marginRight: 8,
    backgroundColor: '#E8F5E8',
  },
  selectedChip: {
    backgroundColor: '#2E7D32',
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropChip: {
    marginBottom: 8,
    backgroundColor: '#E8F5E8',
  },
  selectedCropChip: {
    backgroundColor: '#4CAF50',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    height: 40,
    width: 1,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '30%',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  quickActionContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  quickActionText: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 32,
  },
});