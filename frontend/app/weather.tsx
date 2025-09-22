import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
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

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  forecast: string;
  updated_at: string;
}

export default function WeatherScreen() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Kochi');

  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost';

  const locations = ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad'];

  const fetchWeatherData = async (location: string) => {
    try {
      const response = await axios.get(`${backendUrl}/api/weather/${location}`);
      setWeatherData(response.data);
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Fallback to mock data
      setWeatherData({
        location,
        temperature: 28.5,
        humidity: 75,
        rainfall: 5.2,
        forecast: 'Partly cloudy with chance of light rain',
        updated_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(selectedLocation);
  }, [selectedLocation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeatherData(selectedLocation);
  };

  const getWeatherIcon = (forecast: string) => {
    if (forecast.toLowerCase().includes('rain')) return 'rainy';
    if (forecast.toLowerCase().includes('cloud')) return 'partly-sunny';
    if (forecast.toLowerCase().includes('sun')) return 'sunny';
    return 'partly-sunny';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp > 35) return '#FF6B6B';
    if (temp > 30) return '#FFA726';
    if (temp > 25) return '#66BB6A';
    return '#42A5F5';
  };

  const getFarmingAdvice = (weather: WeatherData) => {
    const advice = [];
    
    if (weather.temperature > 35) {
      advice.push('🌡️ High temperature - ensure adequate irrigation');
    }
    
    if (weather.humidity > 80) {
      advice.push('💧 High humidity - watch for fungal diseases');
    }
    
    if (weather.rainfall > 10) {
      advice.push('🌧️ Heavy rain expected - protect young plants');
    } else if (weather.rainfall < 2) {
      advice.push('☀️ Low rainfall - increase watering frequency');
    }
    
    if (weather.forecast.toLowerCase().includes('wind')) {
      advice.push('💨 Windy conditions - stake tall plants');
    }
    
    return advice;
  };

  if (isLoading) {
    return (
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.container}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading weather data...</Text>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </PaperProvider>
    );
  }

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
                <Text style={styles.headerTitleText}>Weather</Text>
                <Text style={styles.headerSubtitle}>കാലാവസ്ഥ</Text>
              </View>
              <IconButton icon="refresh" size={24} onPress={onRefresh} />
            </View>
          </Surface>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Location Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Location</Text>
              <ScrollView
                horizontal
                style={styles.locationSelector}
                showsHorizontalScrollIndicator={false}
              >
                {locations.map((location) => (
                  <Chip
                    key={location}
                    style={[
                      styles.locationChip,
                      selectedLocation === location && styles.selectedLocationChip,
                    ]}
                    selected={selectedLocation === location}
                    onPress={() => setSelectedLocation(location)}
                  >
                    {location}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            {/* Current Weather */}
            {weatherData && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Current Weather</Text>
                  <Card style={styles.weatherCard} mode="outlined">
                    <Card.Content>
                      <View style={styles.weatherHeader}>
                        <View style={styles.weatherLocation}>
                          <Text style={styles.locationText}>{weatherData.location}</Text>
                          <Text style={styles.updateTime}>
                            Updated: {new Date(weatherData.updated_at).toLocaleTimeString()}
                          </Text>
                        </View>
                        <Ionicons
                          name={getWeatherIcon(weatherData.forecast)}
                          size={48}
                          color={theme.colors.primary}
                        />
                      </View>

                      <View style={styles.weatherMetrics}>
                        <View style={styles.metricItem}>
                          <View style={styles.metricValue}>
                            <Text
                              style={[
                                styles.temperatureText,
                                { color: getTemperatureColor(weatherData.temperature) },
                              ]}
                            >
                              {weatherData.temperature}°C
                            </Text>
                          </View>
                          <Text style={styles.metricLabel}>Temperature</Text>
                        </View>

                        <View style={styles.metricItem}>
                          <View style={styles.metricValue}>
                            <Text style={styles.metricNumber}>{weatherData.humidity}%</Text>
                          </View>
                          <Text style={styles.metricLabel}>Humidity</Text>
                        </View>

                        <View style={styles.metricItem}>
                          <View style={styles.metricValue}>
                            <Text style={styles.metricNumber}>{weatherData.rainfall}mm</Text>
                          </View>
                          <Text style={styles.metricLabel}>Rainfall</Text>
                        </View>
                      </View>

                      <View style={styles.forecastContainer}>
                        <Text style={styles.forecastTitle}>Forecast</Text>
                        <Text style={styles.forecastText}>{weatherData.forecast}</Text>
                      </View>
                    </Card.Content>
                  </Card>
                </View>

                {/* Farming Advice */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Farming Advice</Text>
                  <Card style={styles.adviceCard} mode="outlined">
                    <Card.Content>
                      <View style={styles.adviceHeader}>
                        <Ionicons name="bulb" size={24} color={theme.colors.primary} />
                        <Text style={styles.adviceTitle}>Weather-based Recommendations</Text>
                      </View>
                      {getFarmingAdvice(weatherData).map((advice, index) => (
                        <View key={index} style={styles.adviceItem}>
                          <Text style={styles.adviceText}>{advice}</Text>
                        </View>
                      ))}
                      {getFarmingAdvice(weatherData).length === 0 && (
                        <Text style={styles.adviceText}>
                          🌱 Current weather conditions are favorable for farming activities.
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                </View>

                {/* Weekly Outlook */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>This Week</Text>
                  <Card style={styles.weeklyCard} mode="outlined">
                    <Card.Content>
                      <View style={styles.weeklyHeader}>
                        <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                        <Text style={styles.weeklyTitle}>7-Day Outlook</Text>
                      </View>
                      
                      {/* Mock weekly data */}
                      {[
                        { day: 'Today', temp: '28°C', condition: 'Partly Cloudy', rain: '5mm' },
                        { day: 'Tomorrow', temp: '30°C', condition: 'Sunny', rain: '0mm' },
                        { day: 'Wed', temp: '27°C', condition: 'Light Rain', rain: '15mm' },
                        { day: 'Thu', temp: '29°C', condition: 'Cloudy', rain: '2mm' },
                        { day: 'Fri', temp: '31°C', condition: 'Sunny', rain: '0mm' },
                      ].map((day, index) => (
                        <View key={index} style={styles.dayItem}>
                          <Text style={styles.dayName}>{day.day}</Text>
                          <View style={styles.dayDetails}>
                            <Text style={styles.dayTemp}>{day.temp}</Text>
                            <Text style={styles.dayCondition}>{day.condition}</Text>
                            <Text style={styles.dayRain}>{day.rain}</Text>
                          </View>
                        </View>
                      ))}
                    </Card.Content>
                  </Card>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                  <View style={styles.actionButtons}>
                    <Link href="/chat" asChild>
                      <Card style={styles.actionCard} mode="outlined">
                        <Card.Content style={styles.actionContent}>
                          <Ionicons name="chatbubbles" size={24} color={theme.colors.primary} />
                          <Text style={styles.actionText}>Ask Weather Question</Text>
                        </Card.Content>
                      </Card>
                    </Link>

                    <Card style={styles.actionCard} mode="outlined">
                      <Card.Content style={styles.actionContent}>
                        <Ionicons name="notifications" size={24} color={theme.colors.primary} />
                        <Text style={styles.actionText}>Weather Alerts</Text>
                      </Card.Content>
                    </Card>
                  </View>
                </View>
              </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  locationSelector: {
    flexDirection: 'row',
  },
  locationChip: {
    marginRight: 8,
    backgroundColor: '#E8F5E8',
  },
  selectedLocationChip: {
    backgroundColor: '#2E7D32',
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherLocation: {
    flex: 1,
  },
  locationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  updateTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  weatherMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    marginBottom: 8,
  },
  temperatureText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  forecastContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  forecastText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  adviceCard: {
    backgroundColor: '#FFFFFF',
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  adviceItem: {
    marginBottom: 8,
  },
  adviceText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  weeklyCard: {
    backgroundColor: '#FFFFFF',
  },
  weeklyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    width: 80,
  },
  dayDetails: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dayCondition: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  dayRain: {
    fontSize: 12,
    color: '#4CAF50',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionText: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 32,
  },
});