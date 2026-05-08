import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [metering, setMetering] = useState(-160); // Min level
  const recordingRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.metering !== undefined) {
            setMetering(status.metering);
          }
        },
        100 // Update every 100ms for smooth visualization
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingUri(null);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    setIsRecording(false);
    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    setRecordingUri(uri);
    recordingRef.current = null;
    setMetering(-160);
    return uri;
  }, []);

  return {
    isRecording,
    recordingUri,
    metering,
    startRecording,
    stopRecording,
  };
};
