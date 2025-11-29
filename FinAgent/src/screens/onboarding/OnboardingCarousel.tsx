import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Track Your Expenses',
    subtitle: 'Automatically categorize and track all your transactions in one place',
    icon: 'wallet' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: '2',
    title: 'AI-Powered Insights',
    subtitle: 'Get personalized financial advice from our AI advisor',
    icon: 'bulb' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: '3',
    title: 'Budget & Save',
    subtitle: 'Set budgets, track spending, and achieve your financial goals',
    icon: 'trending-up' as keyof typeof Ionicons.glyphMap,
  },
];

export default function OnboardingCarousel({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate('Income');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Income');
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
            }}
            renderItem={({ item }) => (
            <View style={styles.slide}>
            <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={80} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
            )}
            keyExtractor={(item) => item.id}
            />
            <View style={styles.footer}>
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index === currentIndex && styles.activeDot]}
        />
      ))}
    </View>

    <View style={styles.buttons}>
      {currentIndex < slides.length - 1 && (
        <Button title="Skip" onPress={handleSkip} variant="outline" style={styles.skipButton} />
      )}
      <Button
        title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        onPress={handleNext}
        style={styles.nextButton}
      />
    </View>
  </View>
</View>
);
}
const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: theme.colors.background,
},
slide: {
width,
flex: 1,
justifyContent: 'center',
alignItems: 'center',
padding: theme.spacing.xl,
},
iconContainer: {
width: 160,
height: 160,
borderRadius: 80,
backgroundColor: theme.colors.surface,
justifyContent: 'center',
alignItems: 'center',
marginBottom: theme.spacing.xl,
},
title: {
fontSize: theme.typography.h1.fontSize,
fontWeight: theme.typography.h1.fontWeight,
color: theme.colors.textPrimary,
textAlign: 'center',
marginBottom: theme.spacing.md,
},
subtitle: {
fontSize: theme.typography.body.fontSize,
color: theme.colors.textSecondary,
textAlign: 'center',
paddingHorizontal: theme.spacing.lg,
},
footer: {
padding: theme.spacing.lg,
},
pagination: {
flexDirection: 'row',
justifyContent: 'center',
marginBottom: theme.spacing.lg,
},
dot: {
width: 8,
height: 8,
borderRadius: 4,
backgroundColor: theme.colors.border,
marginHorizontal: 4,
},
activeDot: {
backgroundColor: theme.colors.primary,
width: 24,
},
buttons: {
flexDirection: 'row',
gap: theme.spacing.md,
},
skipButton: {
flex: 1,
},
nextButton: {
flex: 2,
},
});