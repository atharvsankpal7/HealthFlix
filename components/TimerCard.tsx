import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Timer } from '@/types/timer';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { format } from 'date-fns';

interface TimerCardProps {
  timer: Timer;
  onToggle: () => void;
  onReset: () => void;
  onDelete: () => void;
}

export default function TimerCard({
  timer,
  onToggle,
  onReset,
  onDelete,
}: TimerCardProps) {
  const colors = Colors;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = timer.remainingTime / timer.duration;

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress * 100}%`,
    backgroundColor: timer.color,
    opacity: withSpring(timer.isRunning ? 1 : 0.7),
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(timer.isRunning ? 1.02 : 1),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        cardStyle,
        { backgroundColor: colors.cardBackground },
      ]}
    >
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]}>
            {timer.name}
          </Text>
          {timer.completedAt && (
            <Text style={styles.completed}>
              Completed {format(timer.completedAt, 'HH:mm')}
            </Text>
          )}
        </View>

        {timer.description && (
          <Text style={[styles.description, { color: colors.text }]}>
            {timer.description}
          </Text>
        )}

        <Text style={[styles.time, { color: timer.color }]}>
          {formatTime(timer.remainingTime)}
        </Text>

        <View style={styles.controls}>
          <Pressable
            onPress={onToggle}
            style={[styles.button, styles.buttonContainer]}
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          >
            <Ionicons
              name={timer.isRunning ? 'pause' : 'play'}
              size={24}
              color={timer.color}
            />
          </Pressable>

          <Pressable
            onPress={onReset}
            style={[styles.button, styles.buttonContainer]}
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          >
            <Ionicons name="refresh" size={24} color={timer.color} />
          </Pressable>

          <Pressable
            onPress={onDelete}
            style={[styles.button, styles.buttonContainer]}
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          >
            <Ionicons name="trash" size={24} color={timer.color} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#e1e1e1',
  },
  progressBar: {
    height: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  completed: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  time: {
    fontSize: 32,
    fontWeight: '700',
    marginVertical: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    padding: 8,
  },
  buttonContainer: {
    borderRadius: 20,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    padding: 12,
  },
});
