var sfx_list = []
var sfx_volumes = []

const musicPATH = '../public/audio/music/'
const sfxPATH = '../public/audio/sfx/'

var music_volume_mod
var music_intro
var music_loop

var music_volume = 0
var sfx_volume = 0

$(document).ready(function() {
	sfx_default = new Howl({
		src: [sfxPATH + 'click1.ogg'],
		volume: 0
	});
	sfx_list.push(sfx_default)
	sfx_volumes.push(1)

	sfx_beep = new Howl({
		src: [sfxPATH + 'beep.wav'],
		volume: 0
	});
	sfx_list.push(sfx_beep)
	sfx_volumes.push(1)

	sfx_type = new Howl({
		src: [sfxPATH + 'hit.wav'],
		volume: 0
	});
	sfx_list.push(sfx_type)
	sfx_volumes.push(1)

	sfx_hover = new Howl({
		src: [sfxPATH + 'rollover5.ogg'],
		volume: 0
	});
	sfx_list.push(sfx_hover)
	sfx_volumes.push(1)

	sfx_click = new Howl({
		src: [sfxPATH + 'click1.ogg'],
		volume: 0
	});
	sfx_list.push(sfx_click)
	sfx_volumes.push(1)

	sfx_button_click = new Howl({
		src: [sfxPATH + 'click3.ogg'],
		volume: 0
	});
	sfx_list.push(sfx_button_click);
	sfx_volumes.push(1);

	sfx_dialog = new Howl({
		src: [sfxPATH + 'toggle_001.ogg'],
		volume: 0
	});
	sfx_list.push(sfx_dialog)
	sfx_volumes.push(1)

	sfx_dialog_cancel = new Howl({
		src: [sfxPATH + 'close_001.ogg'],
		volume: 0
	});
	sfx_list.push(sfx_dialog_cancel)
	sfx_volumes.push(1);

	sfx_dialog_confirm = new Howl({
		src: [sfxPATH + 'confirmation_001.ogg'],
		volume: 0
	});
	sfx_list.push(sfx_dialog_confirm)
	sfx_volumes.push(1)


	sfx_power_loop = new Howl({
		src: [sfxPATH + 'rollover4.ogg'],
		loop: true,
		volume: 0
	});
	sfx_list.push(sfx_power_loop)
	sfx_volumes.push(0.6)
});

function setSfxVolume(volume) {
	for (var i = 0; i < sfx_list.length; i++) {
		sfx_list[i].volume(sfx_volumes[i] * volume)
	}
}

function setMusicVolume(volume) {
	if (typeof music_intro !== "undefined") {
		music_intro.volume(1 * music_volume_mod * music_volume)
	}
	if (typeof music_loop !== "undefined") {
		music_loop.volume(1 * music_volume_mod * music_volume)
	}
}

function playMusic(volume, name) {
	music_volume_mod = volume
	volume = 1 * volume * music_volume

	
	music_loop = new Howl({
		src: [musicPATH + name + '.mp3'],
		volume: volume,
		loop: true
	});

	music_loop.on("load", function(){
		music_loop.play()
	});
	
}

