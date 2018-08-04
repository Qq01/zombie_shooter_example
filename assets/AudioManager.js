export class AudioManager {
    constructor(baseUrl = '/') {
        this.context = new AudioContext();
        this.baseUrl = baseUrl;
        this.sounds = {};
        this.global = {};
        this.global.gainNode = this.context.createGain();
        this.global.gainNode.gain.value = 0.2;
    }


    async loadTrack(name, src) {
        const response = await fetch(this.baseUrl + src);
        const soundData = await response.json();
        if (!this.sounds[name]) {
            this.sounds[name] = {};
        }
        this.sounds[name].tracks = soundData.tracks;
        this.sounds[name].currentTrack = 0;
        return await this.loadSound(name, soundData.files[0]);
    }

    async loadSound(name, src) {
        if (this.sounds[name] && this.sounds[name].buffer) {
            return this.sounds[name];
        }
        const response = await fetch(this.baseUrl + src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
        if (!this.sounds[name]) {
            this.sounds[name] = {};
        }
        this.sounds[name].buffer = audioBuffer;
        return this.sounds[name];
    }

    playSoundNextTrack(name) {
        if (this.sounds[name]) {
            this.playSound(name, this.sounds[name].tracks[this.sounds[name].currentTrack]);
            this.sounds[name].currentTrack++;
            if (this.sounds[name].currentTrack >= this.sounds[name].tracks.length) {
                this.sounds[name].currentTrack = 0;
            }
        }
    }

    playSound(name, track) {
        if (this.sounds[name] && this.sounds[name].buffer) {
            if (this.context.state == 'suspended') {
                this.context.resume();
            }
            const source = this.context.createBufferSource();
            source.buffer = this.sounds[name].buffer;
            source.connect(this.global.gainNode);
            this.global.gainNode.connect(this.context.destination);
            // source.connect(this.context.destination);
            if (track) {
                source.start(0, track[0], track[1] - track[0]);
            } else {
                source.start(0);
            }
        } else {
            console.warn('sound not found');
        }
    }
}