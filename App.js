import React, { Component } from 'react';
import {View,Text,TouchableOpacity,Image,ImageBackground,StyleSheet,Modal,FlatList,} from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome';
import Slider from 'react-native-slider';

Icon.loadFont();

function formatTime(timeMillis) {
  if (!isNaN(timeMillis)) {
    const totalSeconds = Math.floor(timeMillis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  return '0:00';
}

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
        'Peso Pluma - LADY GAGA': require('./assets/PesoPluma-Ladygaga.mp3'),
      },
      songImages: {
        'Blackpink - Shut Down': require('./assets/shutdown.jpg'),
        'Lalisa - Money': require('./assets/money.jpg'),
        'New Jeans - OMG': require('./assets/omg.jpg'),
        'Peso Pluma - LADY GAGA': require('./assets/ladygaga.jpg'),
      },
      songOrder: ['Blackpink - Shut Down', 'Lalisa - Money', 'New Jeans - OMG', 'Peso Pluma - LADY GAGA' ],
      currentSongIndex: 0,
      isSongLoaded: false,
      duration: 0,
      position: 0,
      isSongListVisible: false,
    };
    this.sound = new Audio.Sound();
  }

  async componentDidMount() {
    try {
      await this.sound.loadAsync(this.state.songs[this.state.currentSong]);
      this.setState({ isSongLoaded: true });
      const status = await this.sound.getStatusAsync();
      this.setState({ duration: status.durationMillis });

      // Inicia un temporizador para actualizar la posición del slider
      this.timer = setInterval(this.updatePositionFromTimer, 1000); // Actualiza cada segundo
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
    } catch (error) {}
  };

  // Método para actualizar la posición desde el temporizador
  updatePositionFromTimer = async () => {
    if (this.state.isPlaying) {
      const status = await this.sound.getStatusAsync();
      this.setState({ position: status.positionMillis });
    }
  };

  toggleSongListModal = () => {
    this.setState((prevState) => ({
      isSongListVisible: !prevState.isSongListVisible,
    }));
  };

  componentWillUnmount() {
    this.sound.unloadAsync();

    // Limpia el temporizador
    clearInterval(this.timer);
  }

  render() {
    return (
      <ImageBackground
        source={require('./assets/negro.jpg')}
        style={styles.background}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={this.toggleSongListModal}
          >
            <Text style={styles.menuButtonText}>:</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 25, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
            {this.state.currentSong}
          </Text>
          <Image
            source={this.state.songImages[this.state.currentSong]}
            style={styles.songImage}
          />
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
          {/* Muestra la duración total y la posición actual */}
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>
              {formatTime(this.state.position)}
            </Text>
            <Text style={styles.durationText}>
              {formatTime(this.state.duration)}
            </Text>
          </View>
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.changeSong(false)}
            >
              <Text style={styles.buttonText}>{"<<"}</Text>
            </TouchableOpacity>
            <Icon
              name={this.state.isPlaying ? 'pause' : 'play'}
              size={35}
              color="white"
              onPress={this.togglePlayPause}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.changeSong(true)}
            >
              <Text style={styles.buttonText}>{">>"}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          visible={this.state.isSongListVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={this.toggleSongListModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.songListModal}>
              <Text style={styles.songListTitle}>Lista de Canciones</Text>
              <FlatList
                data={this.state.songOrder}
                renderItem={({ item }) => (
                  <Text style={styles.songListItem}>{item}</Text>
                )}
                keyExtractor={(item) => item}
              />
              <TouchableOpacity onPress={this.toggleSongListModal}>
                <Text style={styles.closeButton}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  button: {
    width: 80,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 25,
    color: 'white',
  },
  slider: {
    width: '80%',
    marginTop: 20,
  },
  songImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  menuButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    backgroundColor: 'transparent',
    color: 'white',
  },
  menuButtonText: {
    fontSize: 30,
    color: 'white',
    marginTop: 50,
    marginLeft: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo gris transparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  songListModal: {
    width: '80%',
    backgroundColor: '#333', // Fondo gris oscuro del modal
    borderRadius: 10,
    padding: 20,
  },
  songListTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    marginTop: 10,
  },
  songListItem: {
    fontSize: 20,
    color: 'white',
    marginBottom: 10,
  },
  closeButton: {
    fontSize: 20,
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  durationText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  positionText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
});

export default MusicPlayerApp;

