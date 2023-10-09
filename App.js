import React, { Component } from 'react';
import { View, Text, Button, ImageBackground, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome';
import Slider from 'react-native-slider';

Icon.loadFont();

class MusicPlayerApp extends Component {
  constructor() {
    super();
    this.state = {
      isPlaying: false,
      currentSong: 'Blackpink - Shut Down',
      songs: {
        'Blackpink - Shut Down': require('./assets/Blackpink-ShutDown.mp3'),
        'Lalisa - Money': require('./assets/Lalisa-Money.mp3'),
        'New Jeans - OMG': require('./assets/NewJeans-OMG.mp3'),
      },
      songOrder: ['Blackpink - Shut Down', 'Lalisa - Money', 'New Jeans - OMG'],
      currentSongIndex: 0,
      isSongLoaded: false,
      duration: 0,
      position: 0,
    };
    this.sound = new Audio.Sound();
  }

  async componentDidMount() {
    try {
      await this.sound.loadAsync(this.state.songs[this.state.currentSong]);
      this.setState({ isSongLoaded: true });
      const status = await this.sound.getStatusAsync();
      this.setState({ duration: status.durationMillis });
    } catch (error) {
      console.error('Error al cargar la música:', error);
    }
  }

  togglePlayPause = async () => {
    if (!this.state.isSongLoaded) {
      return;
    }

    if (this.state.isPlaying) {
      await this.sound.pauseAsync();
    } else {
      await this.sound.playAsync();
    }
    this.setState((prevState) => ({ isPlaying: !prevState.isPlaying }));
  };

  changeSong = async (next) => {
    if (!this.state.isSongLoaded) {
      return;
    }

    await this.sound.stopAsync();
    this.setState((prevState) => {
      let newIndex = prevState.currentSongIndex;
      if (next) {
        newIndex = (newIndex + 1) % prevState.songOrder.length;
      } else {
        newIndex = (newIndex - 1 + prevState.songOrder.length) % prevState.songOrder.length;
      }
      return {
        isPlaying: false,
        currentSong: prevState.songOrder[newIndex],
        currentSongIndex: newIndex,
        position: 0,
      };
    });
    await this.sound.unloadAsync();
    try {
      await this.sound.loadAsync(this.state.songs[this.state.currentSong]);
      this.setState({ isSongLoaded: true });
      const status = await this.sound.getStatusAsync();
      this.setState({ duration: status.durationMillis });
    } catch (error) {
      console.error('Error al cargar la música:', error);
    }
  };

  updatePosition = async (value) => {
    try {
      await this.sound.setPositionAsync(value);
      this.setState({ position: value });
    } catch (error) {
    }
  };
  

  componentWillUnmount() {
    this.sound.unloadAsync();
  }

  render() {
    return (
      <ImageBackground
        source={require('./assets/fondo.jpg')}
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={{ fontSize: 25, fontWeight: 'bold', color: "white", marginBottom: 20 }}>
            {this.state.currentSong}
          </Text>
          <Slider
            style={styles.slider}
            value={this.state.position}
            minimumValue={0}
            maximumValue={this.state.duration}
            onValueChange={this.updatePosition}
            thumbTintColor="white"
            minimumTrackTintColor="white"
            maximumTrackTintColor="gray"
          />
          <View style={styles.controlsContainer}>
            <Button
              title="<<"
              onPress={() => this.changeSong(false)}
              style={styles.button}
            />
            <Icon
              name={this.state.isPlaying ? 'pause' : 'play'}
              size={35}
              color="white"
              onPress={this.togglePlayPause}
            />
            <Button
              title=">>"
              onPress={() => this.changeSong(true)}
              style={styles.button}
            />
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    width: 35,
    height: 35,
  },
  slider: {
    width: '80%',
    marginTop: 20,
  },
});

export default MusicPlayerApp;
