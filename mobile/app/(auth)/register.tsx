import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { register, login } from '../../api/auth';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { onLogin } = useAuth();

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({ firstName, lastName, email, password });
      // Login automatically after registration
      const data = await login(email, password);
      await onLogin(data.token, data.user);
      // AuthContext will handle redirection automatically
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-8 pt-16 pb-10">
          {/* Header */}
          <View className="mb-10">
            <Text className="text-4xl font-bold text-slate-900 mb-2">Create Account</Text>
            <Text className="text-slate-500 text-lg">Join FocusMind AI and start planning your success.</Text>
          </View>

          {/* Form */}
          <View className="space-y-5">
            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Text className="text-slate-700 font-semibold mb-2 ml-1">First Name</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-primary-500"
                  placeholder="John"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-700 font-semibold mb-2 ml-1">Last Name</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-primary-500"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <View>
              <Text className="text-slate-700 font-semibold mb-2 ml-1">Email Address</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-primary-500"
                placeholder="john@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View>
              <Text className="text-slate-700 font-semibold mb-2 ml-1">Password</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-primary-500"
                placeholder="Create a password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {error ? (
              <Text className="text-red-500 text-sm font-medium ml-1">{error}</Text>
            ) : null}

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="bg-primary-600 rounded-2xl py-4 items-center shadow-lg shadow-primary-500/30 mt-4"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-auto pt-10">
            <Text className="text-slate-500">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary-600 font-bold">Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
