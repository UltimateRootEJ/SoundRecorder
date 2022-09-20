import React from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
   Image
} from 'react-native';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';

export default function App() {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState([]);
  const [sound, setSound] = useState("");

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );

        setRecording(recording);
      } else {
        setSound("Please grant permission for app to access microphone");
      }
    } catch (err) {
      console.error('Failed to record', err);
    }
  }

  async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();

    let updatedRecordings = [...recordings];
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    updatedRecordings.push({
      sound: sound,
      duration: getDurationFormatted(status.durationMillis),
      file: recording.getURI()
    });

    setRecordings(updatedRecordings);
  }

  function getDurationFormatted(millis) {
    const minutes = millis / 1000 / 60;
    const minutesDisplay = Math.floor(minutes);
    const seconds = Math.round((minutes - minutesDisplay) * 60);
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutesDisplay}:${secondsDisplay}`;
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text style={styles.fill}>Recording {index + 1} - {recordingLine.duration}</Text>
          <Button style={styles.button} onPress={() => recordingLine.sound.replayAsync()} title="Play"></Button>
          <Button style={styles.button} onPress={() => Sharing.shareAsync(recordingLine.file)} title="Share"></Button>
        </View>
      );
    });
  }

  return (
    <View style={styles.container}>
      <Text>{sound}</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={recording ? stopRecording : startRecording}
      >
        {recording ? (
          <View style={styles.rec}>
            <Image
              style={styles.img}
              source={require("./assets/stop.png")}
            />
            <Text style={{ marginLeft: "auto", marginRight: "auto",fontWeight:"bold",color:"white" }}>Stop recording</Text>
          </View>

        ) : (
          <View style={styles.rec}>
            <Image
              style={styles.img}
              source={require("./assets/record.png")}
            />
            <Text style={{ marginLeft: "auto", marginRight: "auto",fontWeight:"bold",color:"white" }}>Start recording</Text>
          </View>
        )}
      </TouchableOpacity>
      {recordings.map((recordinglines, index) => {
        return (
          <View style={[styles.row]} key={index}>
            <View>
              <Text style={styles.heading}>Recording 00{index + 1}</Text>
              <Text style={styles.font}>{recordinglines.duration}</Text>
            </View>
            <TouchableOpacity onPress={() => recordinglines.sound.replayAsync()} >
              <Image
                style={{ width: 20, height: 20 }}
                source={require("./assets/play.png")}
              />
              {/* <Text>play</Text> */}
            </TouchableOpacity>
          </View>
        )
      })}
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    width: 150,
    height: 150,
    borderRadius: 100,
    backgroundColor: "red",
    display: "flex",
    alignContent: "center",
    justifyContent: "center",
    marginBottom: 40,
    elevation: 4,
  },
  img:
  {
    width: 50,
    height: 50,
    marginLeft: "auto",
    marginRight: "auto",
  },
  rec: {
    marginLeft: "auto",
    marginRight: "auto",
    width: 100,
    height: 70
  },
  row: {
    display: 'flex',
    width: '90%',
    height: 56,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    elevation: 5,
    borderRadius: 5,
  },

});
