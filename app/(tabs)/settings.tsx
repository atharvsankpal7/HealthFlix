import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import useTimerStore from '@/store/timerStore';

export default function SettingsScreen() {
  const colors = Colors;
  const { sortBy, setSortBy, clearCompleted, deleteAllTimers } =
    useTimerStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Settings',
          headerLargeTitle: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />

      <View
        style={[styles.section, { backgroundColor: colors.cardBackground }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sort Timers By
        </Text>

        <Pressable
          style={[styles.option, sortBy === 'status' && styles.selectedOption]}
          onPress={() => setSortBy('status')}
        >
          <Ionicons
            name="time-outline"
            size={24}
            color={sortBy === 'status' ? colors.tint : colors.text}
          />
          <Text
            style={[
              styles.optionText,
              { color: sortBy === 'status' ? colors.tint : colors.text },
            ]}
          >
            Status
          </Text>
        </Pressable>

        <Pressable
          style={[styles.option, sortBy === 'name' && styles.selectedOption]}
          onPress={() => setSortBy('name')}
        >
          <Ionicons
            name="text-outline"
            size={24}
            color={sortBy === 'name' ? colors.tint : colors.text}
          />
          <Text
            style={[
              styles.optionText,
              { color: sortBy === 'name' ? colors.tint : colors.text },
            ]}
          >
            Name
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.option,
            sortBy === 'duration' && styles.selectedOption,
          ]}
          onPress={() => setSortBy('duration')}
        >
          <Ionicons
            name="hourglass-outline"
            size={24}
            color={sortBy === 'duration' ? colors.tint : colors.text}
          />
          <Text
            style={[
              styles.optionText,
              { color: sortBy === 'duration' ? colors.tint : colors.text },
            ]}
          >
            Duration
          </Text>
        </Pressable>
      </View>

      <View
        style={[styles.section, { backgroundColor: colors.cardBackground }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Actions
        </Text>

        <Pressable
          style={[styles.option, styles.dangerOption]}
          onPress={() => {
            Alert.alert(
              'Clear Completed Timers',
              'Are you sure you want to clear all completed timers? This action cannot be undone.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Clear',
                  style: 'destructive',
                  onPress: () => clearCompleted(),
                },
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          <Text style={[styles.optionText, styles.dangerText]}>
            Clear Completed Timers
          </Text>
        </Pressable>

        <Pressable
          style={[styles.option, styles.dangerOption]}
          onPress={() => {
            Alert.alert(
              'Delete All Timers',
              'Are you sure you want to delete all timers? This action cannot be undone.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deleteAllTimers(),
                },
              ]
            );
          }}
        >
          <Ionicons name="nuclear-outline" size={24} color="#FF3B30" />
          <Text style={[styles.optionText, styles.dangerText]}>
            Delete All Timers
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: colors.text }]}>
          Version 1.0.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    padding: 16,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  optionText: {
    fontSize: 17,
    marginLeft: 12,
  },
  dangerOption: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  dangerText: {
    color: '#FF3B30',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  version: {
    fontSize: 13,
    color: '#666',
  },
});
