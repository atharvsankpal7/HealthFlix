import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import useTimerStore from '@/store/timerStore';
import { format } from 'date-fns';

export default function HistoryScreen() {
  const colors = Colors;
  const { completedTimers, clearHistory } = useTimerStore();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0)
      parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Timer History',
          headerLargeTitle: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerRight: () => (
            <Pressable
              onPress={clearHistory}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
              ]}
            >
              <Ionicons name="trash-outline" size={22} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      {completedTimers.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={colors.text} />
          <Text style={[styles.emptyStateText, { color: colors.text }]}>
            No completed timers yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={completedTimers}
          keyExtractor={(item) => item.id + item.completedAt}
          renderItem={({ item }) => (
            <View
              style={[
                styles.historyItem,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <View style={styles.historyItemHeader}>
                <Text style={[styles.timerName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.completionTime, { color: item.color }]}>
                  {format(item.completedAt!, 'MMM d, h:mm a')}
                </Text>
              </View>
              {item.description && (
                <Text
                  style={[styles.description, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              )}
              <Text style={[styles.duration, { color: colors.text }]}>
                Duration: {formatDuration(item.duration)}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  historyItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  completionTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  duration: {
    fontSize: 14,
    opacity: 0.7,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
});
