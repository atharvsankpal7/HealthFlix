import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Timer, CreateTimerInput, CompletedTimer } from '@/types/timer';
import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

interface TimerStore {
  timers: Timer[];
  completedTimers: CompletedTimer[];
  isLoading: boolean;
  sortBy: 'name' | 'duration' | 'status';
  searchQuery: string;
  addTimer: (input: CreateTimerInput) => Promise<void>;
  removeTimer: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteAllTimers: () => Promise<void>;
  toggleTimer: (id: string) => Promise<void>;
  toggleTimers: (ids: string[]) => Promise<void>;
  resetTimer: (id: string) => Promise<void>;
  setSortBy: (sortBy: 'name' | 'duration' | 'status') => void;
  setSearchQuery: (query: string) => void;
  loadTimers: () => Promise<void>;
}

const STORAGE_KEY = '@timers';
const HISTORY_KEY = '@timer_history';
let intervalId: NodeJS.Timeout | undefined;

const useTimerStore = create<TimerStore>((set, get) => ({
  timers: [],
  completedTimers: [],
  isLoading: true,
  sortBy: 'status',
  searchQuery: '',

  loadTimers: async () => {
    try {
      const [storedTimers, storedHistory] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
      ]);

      const timers = storedTimers ? JSON.parse(storedTimers) : [];
      const completedTimers = storedHistory ? JSON.parse(storedHistory) : [];

      set({ timers, completedTimers, isLoading: false });
    } catch (error) {
      console.error('Failed to load timers:', error);
      set({ isLoading: false });
    }
  },

  addTimer: async (input: CreateTimerInput) => {
    try {
      const totalSeconds = input.hours * 3600 + input.minutes * 60 + input.seconds;
      const newTimer: Timer = {
        id: Date.now().toString(),
        name: input.name,
        duration: totalSeconds,
        description: input.description,
        color: input.color,
        isRunning: false,
        isPaused: false,
        remainingTime: totalSeconds,
        createdAt: Date.now(),
      };

      const timers = [...get().timers, newTimer];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
      set({ timers });
    } catch (error) {
      console.error('Failed to add timer:', error);
    }
  },

  removeTimer: async (id: string) => {
    try {
      const timers = get().timers.filter(timer => timer.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
      set({ timers });
    } catch (error) {
      console.error('Failed to remove timer:', error);
    }
  },

  clearCompleted: async () => {
    try {
      const timers = get().timers.filter(timer => timer.remainingTime > 0);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
      set({ timers });
    } catch (error) {
      console.error('Failed to clear completed timers:', error);
    }
  },

  clearHistory: async () => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([]));
      set({ completedTimers: [] });
    } catch (error) {
      console.error('Failed to clear timer history:', error);
    }
  },

  deleteAllTimers: async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      set({ timers: [] });
    } catch (error) {
      console.error('Failed to delete all timers:', error);
    }
  },

  toggleTimer: async (id: string) => {
    try {
      const { timers } = get();
      const updatedTimers = timers.map(timer => {
        if (timer.id === id) {
          return {
            ...timer,
            isRunning: !timer.isRunning,
            isPaused: timer.isRunning ? true : timer.isPaused,
          };
        }
        return timer;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTimers));
      set({ timers: updatedTimers });

      if (!intervalId) {
        intervalId = setInterval(async () => {
          const { timers, completedTimers } = get();
          let updated = false;
          let newCompletedTimers = [...completedTimers];

          const newTimers = timers.map(timer => {
            if (timer.isRunning && timer.remainingTime > 0) {
              updated = true;
              const newRemainingTime = timer.remainingTime - 1;

              // Calculate alert based on percentage completed
              if (timer.alertPercentage && timer.alertPercentage > 0) {
                const percentageCompleted = Math.floor(
                  ((timer.duration - newRemainingTime) / timer.duration) * 100
                );

                console.log(`Timer ${timer.name}:`);
                console.log(`- Total duration: ${timer.duration}s`);
                console.log(`- Alert at: ${timer.alertPercentage}%`);
                console.log(`- Current completion: ${percentageCompleted}%`);
                console.log(`- Remaining time: ${newRemainingTime}s`);

                // Check if we just hit the alert percentage
                if (percentageCompleted === timer.alertPercentage) {
                  console.log(`Alert triggered for ${timer.name} at ${percentageCompleted}%`);
                  if (Platform.OS !== 'web') {
                    Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Warning
                    );
                    Alert.alert(
                      'Timer Progress Alert',
                      `${timer.name} has completed ${timer.alertPercentage}% of its duration!`
                    );
                  }
                }
              }

              // Check if timer just completed
              if (newRemainingTime === 0) {
                newCompletedTimers.unshift({
                  id: timer.id,
                  name: timer.name,
                  description: timer.description,
                  duration: timer.duration,
                  color: timer.color,
                  completedAt: Date.now(),
                });
              }

              return {
                ...timer,
                remainingTime: newRemainingTime,
                completedAt: newRemainingTime === 0 ? Date.now() : undefined,
              };
            }
            return timer;
          });

          if (updated) {
            await Promise.all([
              AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTimers)),
              AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newCompletedTimers)),
            ]);

            set({ timers: newTimers, completedTimers: newCompletedTimers });

            // Check for completed timers
            newTimers.forEach(timer => {
              if (timer.remainingTime === 0 && timer.isRunning) {
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Audio.Sound.createAsync(
                    require('@/assets/sounds/timer-complete.mp3'),
                    { shouldPlay: true }
                  );
                }
              }
            });
          }

          if (!newTimers.some(timer => timer.isRunning)) {
            clearInterval(intervalId);
            intervalId = undefined;
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to toggle timer:', error);
    }
  },

  toggleTimers: async (ids: string[]) => {
    try {
      const { timers } = get();
      const updatedTimers = timers.map(timer => {
        if (ids.includes(timer.id)) {
          return {
            ...timer,
            isRunning: !timer.isRunning,
            isPaused: timer.isRunning ? true : timer.isPaused,
          };
        }
        return timer;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTimers));
      set({ timers: updatedTimers });
    } catch (error) {
      console.error('Failed to toggle timers in bulk:', error);
    }
  },

  resetTimer: async (id: string) => {
    try {
      const timers = get().timers.map(timer => {
        if (timer.id === id) {
          return {
            ...timer,
            isRunning: false,
            isPaused: false,
            remainingTime: timer.duration,
            completedAt: undefined,
          };
        }
        return timer;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
      set({ timers });
    } catch (error) {
      console.error('Failed to reset timer:', error);
    }
  },

  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

export default useTimerStore;