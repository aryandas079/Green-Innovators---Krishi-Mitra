import React from 'react';
import { StyleSheet, ScrollView, View, StatusBar, Platform } from 'react-native';
import { Text, Card, Button, FAB, Provider as PaperProvider, MD3LightTheme, Surface, Chip } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

// Custom theme with green colors for farming
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2E7D32', // Dark green
    secondary: '#4CAF50', // Light green
    tertiary: '#81C784', // Lighter green
    surface: '#F1F8E9', // Very light green
    background: '#FFFFFF',
    outline: '#C8E6C9',
  },
};

export default function FarmingAssistantHome() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} backgroundColor={theme.colors.primary} />
        <SafeAreaView style={styles.container}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Surface style={styles.header} elevation={2}>
              <View style={styles.headerContent}>
                <View style={styles.headerTop}>
                  <Ionicons name="leaf" size={32} color={theme.colors.primary} />
                  <Text style={styles.appTitle}>കൃഷി സഹായി</Text>
                  <Text style={styles.appSubtitle}>AI Farming Assistant</Text>
                </View>
                <Text style={styles.welcomeText}>
                  സ്വാഗതം! നിങ്ങളുടെ കൃഷി ചോദ്യങ്ങൾക്ക് ഉത്തരം ലഭിക്കാൻ ഇവിടെ ചോദിക്കൂ
                </Text>
                <Text style={styles.welcomeSubtext}>
                  Welcome! Ask your farming questions here in Malayalam or English
                </Text>
              </View>
            </Surface>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                <Link href="/chat" asChild>
                  <Card style={styles.actionCard} mode="outlined">
                    <Card.Content style={styles.cardContent}>
                      <Ionicons name="chatbubbles" size={32} color={theme.colors.primary} />
                      <Text style={styles.cardTitle}>Start Chat</Text>
                      <Text style={styles.cardSubtitle}>ചാറ്റ് ആരംഭിക്കൂ</Text>
                    </Card.Content>
                  </Card>
                </Link>

                <Link href="/disease-detection" asChild>
                  <Card style={styles.actionCard} mode="outlined">
                    <Card.Content style={styles.cardContent}>
                      <Ionicons name="camera" size={32} color={theme.colors.primary} />
                      <Text style={styles.cardTitle}>Disease Check</Text>
                      <Text style={styles.cardSubtitle}>രോഗം പരിശോധിക്കൂ</Text>
                    </Card.Content>
                  </Card>
                </Link>

                <Link href="/weather" asChild>
                  <Card style={styles.actionCard} mode="outlined">
                    <Card.Content style={styles.cardContent}>
                      <Ionicons name="partly-sunny" size={32} color={theme.colors.primary} />
                      <Text style={styles.cardTitle}>Weather</Text>
                      <Text style={styles.cardSubtitle}>കാലാവസ്ഥ</Text>
                    </Card.Content>
                  </Card>
                </Link>

                <Link href="/profile" asChild>
                  <Card style={styles.actionCard} mode="outlined">
                    <Card.Content style={styles.cardContent}>
                      <Ionicons name="person" size={32} color={theme.colors.primary} />
                      <Text style={styles.cardTitle}>Profile</Text>
                      <Text style={styles.cardSubtitle}>പ്രൊഫൈൽ</Text>
                    </Card.Content>
                  </Card>
                </Link>
              </View>
            </View>

            {/* Features Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              <Card style={styles.featureCard} mode="outlined">
                <Card.Content>
                  <View style={styles.featureRow}>
                    <Ionicons name="language" size={24} color={theme.colors.primary} />
                    <View style={styles.featureText}>
                      <Text style={styles.featureTitle}>Malayalam Support</Text>
                      <Text style={styles.featureDescription}>
                        മലയാളത്തിൽ ചോദ്യങ്ങൾ ചോദിക്കാം
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.featureCard} mode="outlined">
                <Card.Content>
                  <View style={styles.featureRow}>
                    <Ionicons name="search" size={24} color={theme.colors.primary} />
                    <View style={styles.featureText}>
                      <Text style={styles.featureTitle}>Plant Disease Detection</Text>
                      <Text style={styles.featureDescription}>
                        ചെടിയുടെ ഫോട്ടോ എടുത്ത് രോഗം കണ്ടെത്താം
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.featureCard} mode="outlined">
                <Card.Content>
                  <View style={styles.featureRow}>
                    <Ionicons name="cloud" size={24} color={theme.colors.primary} />
                    <View style={styles.featureText}>
                      <Text style={styles.featureTitle}>Weather Updates</Text>
                      <Text style={styles.featureDescription}>
                        കാലാവസ്ഥാ വിവരങ്ങളും കൃഷി ഉപദേശങ്ങളും
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.featureCard} mode="outlined">
                <Card.Content>
                  <View style={styles.featureRow}>
                    <Ionicons name="people" size={24} color={theme.colors.primary} />
                    <View style={styles.featureText}>
                      <Text style={styles.featureTitle}>Expert Support</Text>
                      <Text style={styles.featureDescription}>
                        വിദഗ്ധരുടെ സഹായം ആവശ്യമെങ്കിൽ ബന്ധപ്പെടാം
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </View>

            {/* Popular Topics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Topics</Text>
              <View style={styles.topicsContainer}>
                <Chip icon="grain" style={styles.topicChip}>Rice Cultivation</Chip>
                <Chip icon="tree" style={styles.topicChip}>Coconut Trees</Chip>
                <Chip icon="flower" style={styles.topicChip}>Vegetable Garden</Chip>
                <Chip icon="water" style={styles.topicChip}>Irrigation</Chip>
                <Chip icon="bug" style={styles.topicChip}>Pest Control</Chip>
                <Chip icon="leaf" style={styles.topicChip}>Organic Farming</Chip>
              </View>
            </View>

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Floating Action Button */}
          <Link href="/chat" asChild>
            <FAB
              icon="chat"
              style={styles.fab}
              color={theme.colors.background}
              label="Ask Question"
            />
          </Link>
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
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    padding: 20,
  },
  headerTop: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 4,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#2E7D32',
    marginBottom: 8,
    lineHeight: 24,
  },
  welcomeSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    textAlign: 'center',
  },
  featureCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    marginBottom: 8,
    backgroundColor: '#E8F5E8',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2E7D32',
  },
  bottomSpacing: {
    height: 100,
  },
});