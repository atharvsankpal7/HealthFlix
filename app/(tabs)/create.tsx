import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import useTimerStore from '@/store/timerStore';

const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEEAD',
  '#D4A5A5',
  '#9B59B6',
  '#3498DB',
];

export default function CreateScreen() {
  const colors = Colors;
  const addTimer = useTimerStore((state) => state.addTimer);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [halfwayAlert, setHalfwayAlert] = useState(false);
  const [alertPercentage, setAlertPercentage] = useState<string>('0');
  const [showAlert, setShowAlert] = useState(false);

  const clearForm = () => {
    setName('');
    setDescription('');
    setHours('0');
    setMinutes('0');
    setSeconds('0');
    setSelectedColor(COLORS[0]);
    setHalfwayAlert(false);
    setAlertPercentage('50');
    setShowAlert(false);
  };

  const handlePercentageChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    const percentage = parseInt(numericValue);
    if (percentage >= 0 && percentage <= 100) {
      setAlertPercentage(numericValue);
    }
  };

  const handleCreate = async () => {
    if (!name) {
      alert('Please enter a timer name');
      return;
    }

    if (
      parseInt(hours) === 0 &&
      parseInt(minutes) === 0 &&
      parseInt(seconds) === 0
    ) {
      alert('Please set a duration for the timer');
      return;
    }

    await addTimer({
      name,
      description,
      hours: parseInt(hours),
      minutes: parseInt(minutes),
      seconds: parseInt(seconds),
      color: selectedColor,
      alertPercentage: showAlert ? parseInt(alertPercentage) : undefined,
    });

    clearForm();
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Create Timer',
          headerLargeTitle: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Name</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.cardBackground, color: colors.text },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Timer name"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Description (optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.cardBackground, color: colors.text },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description"
            placeholderTextColor="#666"
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Duration</Text>
          <View style={styles.durationContainer}>
            <View style={styles.durationInput}>
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                  },
                ]}
                value={hours}
                onChangeText={setHours}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={[styles.timeLabel, { color: colors.text }]}>
                hours
              </Text>
            </View>

            <View style={styles.durationInput}>
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                  },
                ]}
                value={minutes}
                onChangeText={setMinutes}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={[styles.timeLabel, { color: colors.text }]}>
                min
              </Text>
            </View>

            <View style={styles.durationInput}>
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                  },
                ]}
                value={seconds}
                onChangeText={setSeconds}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={[styles.timeLabel, { color: colors.text }]}>
                sec
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.alertContainer}>
            <View style={styles.alertTextContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Progress Alert
              </Text>
              <Text style={[styles.alertDescription, { color: colors.text }]}>
                Get notified when timer reaches specified percentage
              </Text>
            </View>
            <View style={styles.alertInputContainer}>
              <Pressable
                style={[
                  styles.alertToggle,
                  {
                    backgroundColor: showAlert
                      ? selectedColor
                      : colors.cardBackground,
                  },
                ]}
                onPress={() => setShowAlert(!showAlert)}
              >
                <Ionicons
                  name={showAlert ? 'notifications' : 'notifications-outline'}
                  size={24}
                  color={showAlert ? 'white' : colors.text}
                />
              </Pressable>
              {showAlert && (
                <View style={styles.percentageInputContainer}>
                  <TextInput
                    style={[
                      styles.percentageInput,
                      {
                        backgroundColor: colors.cardBackground,
                        color: colors.text,
                      },
                    ]}
                    value={alertPercentage}
                    onChangeText={handlePercentageChange}
                    keyboardType="number-pad"
                    maxLength={3}
                    placeholder="50"
                    placeholderTextColor="#666"
                  />
                  <Text
                    style={[styles.percentageSymbol, { color: colors.text }]}
                  >
                    %
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Color</Text>
          <View style={styles.colorGrid}>
            {COLORS.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={24} color="white" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.createButton, { backgroundColor: selectedColor }]}
          onPress={handleCreate}
        >
          <Text style={styles.createButtonText}>Create Timer</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  timeLabel: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: 'white',
  },
  createButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  alertContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  alertToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  alertInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  percentageInput: {
    width: 60,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  percentageSymbol: {
    marginLeft: 4,
    fontSize: 16,
  },
});
