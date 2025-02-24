import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  Pressable,
  Text,
  SectionList,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TimerCard from '@/components/TimerCard';
import useTimerStore from '@/store/timerStore';
import Colors from '@/constants/Colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Timer, TimerGroup } from '@/types/timer';
import { router } from 'expo-router';

export default function TimersScreen() {
  const colors = Colors;
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['running'])
  );

  const {
    timers,
    isLoading,
    sortBy,
    searchQuery,
    loadTimers,
    toggleTimer,
    resetTimer,
    removeTimer,
    setSortBy,
    setSearchQuery,
  } = useTimerStore();

  useEffect(() => {
    loadTimers();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Timer', 'Are you sure you want to delete this timer?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeTimer(id),
      },
    ]);
  };

  const handleEdit = (timer: Timer) => {
    router.push({
      pathname: '/edit',
      params: { id: timer.id },
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      const normalizedSection = section.toLowerCase().trim();
      if (next.has(normalizedSection)) {
        next.delete(normalizedSection);
      } else {
        next.add(normalizedSection);
      }
      return next;
    });
  };

  const handleBulkAction = (
    action: 'start' | 'pause' | 'reset',
    timerIds: string[]
  ) => {
    switch (action) {
      case 'start':
        // Start all non-running timers in the section
        console.log('Starting timersaaaaaaaaa:', timerIds); // Debug log

        timerIds.forEach(async (id) => {
          const timer = timers.find((t) => t.id === id);
          console.log('Timer:', timer);

          if (timer && !timer.isRunning && timer.remainingTime > 0) {
            console.log('Starting timer:wwwwww', timer); // Debug log
            await toggleTimer(id);
          }
        });
        break;
      case 'pause':
        // Pause all running timers in the section
        timerIds.forEach((id) => {
          const timer = timers.find((t) => t.id === id);
          if (timer && timer.isRunning) {
            toggleTimer(id);
          }
        });
        break;
      case 'reset':
        // Reset all timers in the section
        timerIds.forEach((id) => resetTimer(id));
        break;
    }
  };

  const groupedTimers = React.useMemo(() => {
    const filtered = timers.filter(
      (timer) =>
        timer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        timer.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: TimerGroup[] = [
      {
        title: 'Running',
        data: filtered.filter(
          (timer) => timer.isRunning && timer.remainingTime > 0
        ),
      },
      {
        title: 'Paused',
        data: filtered.filter(
          (timer) => timer.isPaused && timer.remainingTime > 0
        ),
      },
      {
        title: 'Not Started',
        data: filtered.filter(
          (timer) =>
            !timer.isRunning &&
            !timer.isPaused &&
            timer.remainingTime === timer.duration
        ),
      },
      {
        title: 'In Progress',
        data: filtered.filter(
          (timer) =>
            !timer.isRunning &&
            !timer.isPaused &&
            timer.remainingTime < timer.duration &&
            timer.remainingTime > 0
        ),
      },
      {
        title: 'Completed',
        data: filtered.filter((timer) => timer.remainingTime === 0),
      },
    ];

    groups.forEach((group) => {
      group.data.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'duration':
            return b.duration - a.duration;
          default:
            return b.remainingTime - a.remainingTime;
        }
      });
    });

    return groups.filter((group) => group.data.length > 0);
  }, [timers, searchQuery, sortBy]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Timers',
          headerLargeTitle: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerRight: () => (
            <Pressable
              onPress={() => setShowSortMenu(!showSortMenu)}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
              ]}
            >
              <Ionicons name="funnel-outline" size={22} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      {showSortMenu && (
        <View
          style={[styles.sortMenu, { backgroundColor: colors.cardBackground }]}
        >
          <Pressable
            style={[
              styles.sortOption,
              sortBy === 'status' && styles.selectedSort,
            ]}
            onPress={() => {
              setSortBy('status');
              setShowSortMenu(false);
            }}
          >
            <Ionicons
              name="time-outline"
              size={20}
              color={sortBy === 'status' ? colors.tint : colors.text}
            />
            <Text
              style={[
                styles.sortText,
                { color: sortBy === 'status' ? colors.tint : colors.text },
              ]}
            >
              Status
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.sortOption,
              sortBy === 'name' && styles.selectedSort,
            ]}
            onPress={() => {
              setSortBy('name');
              setShowSortMenu(false);
            }}
          >
            <Ionicons
              name="text-outline"
              size={20}
              color={sortBy === 'name' ? colors.tint : colors.text}
            />
            <Text
              style={[
                styles.sortText,
                { color: sortBy === 'name' ? colors.tint : colors.text },
              ]}
            >
              Name
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.sortOption,
              sortBy === 'duration' && styles.selectedSort,
            ]}
            onPress={() => {
              setSortBy('duration');
              setShowSortMenu(false);
            }}
          >
            <Ionicons
              name="hourglass-outline"
              size={20}
              color={sortBy === 'duration' ? colors.tint : colors.text}
            />
            <Text
              style={[
                styles.sortText,
                { color: sortBy === 'duration' ? colors.tint : colors.text },
              ]}
            >
              Duration
            </Text>
          </Pressable>
        </View>
      )}

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.text}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search timers..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <SectionList
        sections={groupedTimers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, section }) => {
          const normalizedTitle = section.title.toLowerCase().trim();
          return expandedSections.has(normalizedTitle) ? (
            <TimerCard
              timer={item}
              onToggle={() => toggleTimer(item.id)}
              onReset={() => resetTimer(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          ) : null;
        }}
        renderSectionHeader={({ section }) => (
          <View>
            <Pressable
              style={[
                styles.sectionHeader,
                { backgroundColor: colors.cardBackground },
              ]}
              onPress={() => toggleSection(section.title)}
            >
              <View style={styles.sectionTitleContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {section.title}
                </Text>
                <Text style={[styles.sectionCount, { color: colors.text }]}>
                  {section.data.length}
                </Text>
              </View>
              <View style={styles.bulkActions}>
                <Pressable
                  onPress={() => {
                    // Get all non-running timer IDs with remaining time
                    const startableTimers = section.data
                      .filter(
                        (timer) => !timer.isRunning && timer.remainingTime > 0
                      )
                      .map((timer) => timer.id);

                    console.log('Startable timers:', startableTimers); // Debug log
                    if (startableTimers.length > 0) {
                      handleBulkAction('start', startableTimers);
                    }
                  }}
                  style={styles.bulkActionButton}
                >
                  <Ionicons name="play" size={22} color={colors.tint} />
                </Pressable>

                <Pressable
                  onPress={() => {
                    // Get all running timer IDs
                    const runningTimers = section.data
                      .filter((timer) => timer.isRunning)
                      .map((timer) => timer.id);

                    console.log('Running timers:', runningTimers); // Debug log
                    if (runningTimers.length > 0) {
                      handleBulkAction('pause', runningTimers);
                    }
                  }}
                  style={styles.bulkActionButton}
                >
                  <Ionicons name="pause" size={22} color={colors.tint} />
                </Pressable>

                <Pressable
                  onPress={() => {
                    // Get all timer IDs in the section
                    const allTimers = section.data.map((timer) => timer.id);
                    console.log('All timers:', allTimers); // Debug log
                    handleBulkAction('reset', allTimers);
                  }}
                  style={styles.bulkActionButton}
                >
                  <Ionicons name="refresh" size={22} color={colors.tint} />
                </Pressable>

                <Ionicons
                  name={
                    expandedSections.has(section.title.toLowerCase().trim())
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={22}
                  color={colors.text}
                  style={{ marginLeft: 8 }}
                />
              </View>
            </Pressable>
          </View>
        )}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  sortMenu: {
    position: 'absolute',
    top: 5,
    right: 16,
    borderRadius: 12,
    padding: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  selectedSort: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  sortText: {
    fontSize: 16,
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.7,
  },
  bulkActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulkActionButton: {
    marginHorizontal: 4,
  },
});
