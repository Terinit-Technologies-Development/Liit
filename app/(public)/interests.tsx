import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/ui/Screen';
import { AppText } from '../../src/components/ui/AppText';
import { AppHeader } from '../../src/components/navigation/AppHeader';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { Icon, SemanticIconName } from '../../src/design-system/icons/Icon';
import { useSessionStore } from '../../src/state/useSessionStore';
import { ROUTES } from '../../src/navigation/routes';
import { theme } from '../../src/design-system/theme';

const INTEREST_CATEGORIES: { id: string; label: string; icon: SemanticIconName }[] = [
  { id: 'Music', label: 'Music & Live DJs', icon: 'music' },
  { id: 'Nightlife', label: 'Nightlife & Clubs', icon: 'sparkles' },
  { id: 'Art', label: 'Art & Exhibitions', icon: 'heart' },
  { id: 'Food', label: 'Food & Pop-ups', icon: 'heart' },
  { id: 'Sport', label: 'Sport & Fitness', icon: 'calendar' },
  { id: 'Networking', label: 'Networking & Tech', icon: 'profile' },
  { id: 'Pop-ups', label: 'Rooftops & Secret Gigs', icon: 'location' },
];

export default function InterestsScreen() {
  const router = useRouter();
  const { selectedInterests, toggleInterest } = useSessionStore();

  const handleNext = () => {
    router.push(ROUTES.public.signIn);
  };

  return (
    <Screen safeAreaEdges={['top', 'bottom']} style={styles.container}>
      <AppHeader title="Personalise Feed" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppText variant="display" style={styles.title}>
          What experiences move you?
        </AppText>
        <AppText variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
          Select your interest tags to tailor event recommendations and host invitations.
        </AppText>

        <View style={styles.chipGrid}>
          {INTEREST_CATEGORIES.map((cat) => {
            const isSelected = selectedInterests.includes(cat.id);

            return (
              <Pressable
                key={cat.id}
                onPress={() => toggleInterest(cat.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`Interest: ${cat.label}`}
                style={({ pressed }) => [
                  styles.interestChip,
                  isSelected && styles.interestChipSelected,
                  pressed && styles.interestChipPressed,
                ]}
              >
                <Icon
                  name={cat.icon}
                  size="sm"
                  color={isSelected ? theme.colors.textInverse : theme.colors.accentStart}
                />
                <AppText
                  variant="button"
                  color={isSelected ? theme.colors.textInverse : theme.colors.textPrimary}
                >
                  {cat.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label={`Continue (${selectedInterests.length} Selected)`}
          onPress={handleNext}
          disabled={selectedInterests.length === 0}
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.gutter,
  },
  scrollContent: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.colors.ghostBorder,
  },
  interestChipSelected: {
    backgroundColor: theme.colors.accentStart,
    borderColor: theme.colors.accentStart,
  },
  interestChipPressed: {
    opacity: 0.85,
  },
  footer: {
    paddingBottom: theme.spacing.md,
  },
});
