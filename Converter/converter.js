//	Arduboy Video Converter
//	Version 1.0, December 6, 2023
//	By Jonathan Holmes (crait)
//
//	Website: http://www.crait.net/
//	Twitter: @crait (http://www.twitter.com/crait)
//	Bluesky: @crait.bsky.social
//
//	The Arduboy Video Converter is used to create the a .bin file that contains the video data and metadata
//	for a given video file, along with a video.h file that is used in the compilation of the Arduboy Video
//	Player program with the Arduino IDE.
//
//	Installation:
//		1. Download and install the Arduino IDE and required Arduboy libraries. For a guide on this, check
//		out: https://community.arduboy.com/t/make-your-own-arduboy-game-part-1-setting-up-your-computer/7924/1
//		You must also install the Arduboy FX library, too! https://github.com/MrBlinky/ArduboyFX
//		2. Download and install FFmpeg onto your computer (https://ffmpeg.org/download.html)
//		3. Download and install Node.js (https://nodejs.org/en/download)
//		4. Using Command Prompt (or Terminal), navigate to the Converter/ directory
//		5. Use npm to install the Arduboy Video Converter dependencies with `npm install`

//	Converting Your Video:
//		1. Place your video file in the Converter/ directory
//		2. Using Command Prompt (or Terminal), navigate to the Converter/ directory
//		3. Run the Arduboy Video Converter by using `npm start`
//		4. You must provide several pieces of information for the video to be converted, such as the video
//		filename, the height, width, FPS, etc.
//		To skip these questions, you can use: `npm start [file] [title] [fps] [width] [height]`.
//		5. This process will create a .bin and video.h file in the Converter/ directory
//		6. Move the video.h file to the Player/ directory
//		7. Open the Player.ino sketch with the Arduino IDE
//		8. Connect your Arduboy FX to your computer and compile/upload your sketch to your device
//		9. You must also upload the .bin that you generated in the Converter/ directory. To do this, I use
//		Mr.Blinky's tools, but there are alernatives that you could try.
//		(https://github.com/MrBlinky/Arduboy-Python-Utilities)
//
//	License:
//		Code is supplied for 2 purposes: 1) Ease of loading onto an Arduboy device for personal
//		play, and 2) Educational value in the case of studying the code and modifying for personal,
//		educational use. Even though the source code is available to the public, this software is
//		not 'open-source'. Re-releasing my code/game, re-distributing my code/game, or publicly
//		sharing a modified variation or derivative of my code/game is not allowed. The code has no
//		guarantee of support in the future. The code is also free of charge. This code must never
//		be sold. This game must never be sold. Distribution of my game/code for commercial or
//		financial gain is explicitly NOT allowed. Finally, someone creating any derivative of this
//		software for a different platform must have explicit permission from me if it is intended
//		to be released or distributed to others. Please don't steal my code!

const application = require('./package.json')
const fs = require('fs')
const path = require('path')
const readline = require('readline-sync')
const ffmpeg = require('fluent-ffmpeg')
const jimp = require('jimp')
const util = require('util')
const ffmpeg_p = util.promisify(ffmpeg)

const readable_duration = (seconds) => {
	var h = Math.floor(seconds / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 3600 % 60);

	var hours = h > 0 ? h + 'h' : '';
	if(h > 0 && (m > 0 || s > 0)) {
		h += ', '
	}
	var minutes = m > 0 || h > 0 ? m + 'm' : '';
	if(m > 0 && s > 0) {
		minutes += ', '
	}
	var seconds = s > 0 ? s + 's' : '';
	return hours + minutes + seconds; 
}

const splash = `\t${application.name}\n\tBy ${application.author}\n\tVersion ${application.version}\n\n`
console.log(splash)

const exit = (reason) => {
	console.warn(`Error:\t`, reason)
	process.exit(1)
}

var video = {
	source: '',
	output: '',
	title: '',
	fps: 0,
	width: 0,
	height: 0,
	frames: 0,
	duration: ''
}

video.source = process.argv[2] || readline.question('Video file path: ')

if(video.source == '') {
	exit(`You must provide a video file.`)
}

if(!fs.existsSync(video.source)) {
	if(fs.existsSync(path.join(__dirname, video.source))) {
		video.source = path.join(__dirname, video.source)
	} else {
		exit(`The file could not be found at: ${video.source}`)
	}
}

video.title = process.argv[3] || readline.question(`Video title: `)
video.title = video.title.substring(0, 19)
while(video.fps <= 0) {
	video.fps = process.argv[4] || readline.questionInt(`Frames Per Second: (Somewhere between 15 and 20 is usually good) `)
	if(video.fps <= 0) {
		console.warn('The frames per second must be a positive number.')
	}
}

var validate_width = (given) => {
	if(given > 128) {
		console.warn(`The width cannot be greater than 128 pixels.`)
		given = 0
	} else if(given <= 0) {
		console.warn(`The width cannot be 0 or less.`)
		given = 0
	} else if(given % 2 != 0) {
		console.warn(`The width must be even!`)
		given = 0
	}

	return given
}

var validate_height = (given) => {
	if(given > 64) {
		console.warn(`The height cannot be greater than 64 pixels.`)
		given = 0
	} else if(given <= 0) {
		console.warn(`The height cannot be 0 or less.`)
		given = 0
	} else if(given % 8 != 0) {
		console.warn(`The height must be a multiple of 8, such as: 8, 16, 24, 32, 40, 48, 56, or 64`)
		given = 0
	}

	return given
}

video.width = process.argv[5] || 0
video.height = process.argv[6] || 0

if(validate_width(video.width) == 0 || validate_height(video.height) == 0) {
	console.log(`To continue, please provide a width and height for the video file.`)
	console.log(`- If you want your video to fit the entire screen, provide a width of 128 and a height of 64.`)
	console.log(`- If you want your video to have a 16:9 aspect ratio, provide a width of 114 and a height of 64.`)
	console.log(`- If you want your video to have a 4:3 aspect ratio, provide a width of 86 and a height of 64.`)
}

while(validate_width(video.width) == 0) {
	video.width = readline.questionInt(`Width: `)
}

while(validate_height(video.height) == 0) {
	video.height = readline.questionInt(`Height: `)
}

var base = path.parse(video.source).name
video.output = base + '.bin'
const temp_path = __dirname + '/temp/' + base + '/'

if(!fs.existsSync(__dirname + '/temp/')) {
	fs.mkdirSync(__dirname + '/temp/')
}

if(!fs.existsSync(temp_path)) {
	fs.mkdirSync(temp_path)
}

console.log(``)
console.log(`Video Title:\t${video.title}`)
console.log(`Video FPS:\t${video.fps}`)
console.log(`Width:\t\t${video.width}`)
console.log(`Height:\t\t${video.height}`)
console.log(``)
console.log(`Converting ${video.source} into frames...`)
console.log(``)

ffmpeg(video.source)
	.videoFilters(`eq=brightness=-0.12:contrast=1.5,format=pal8,format=monob`)
	.size(`${video.width}x${video.height}`)
	.outputOptions([`-r ${video.fps}`])
	.save(temp_path + `%05d.png`)
	.on(`error`, exit)
	.on(`end`, () => {
		console.log(`Creating video file ${video.output}...`)

		var frames = fs.readdirSync(temp_path)
		video.frames = frames.length

		video.duration = readable_duration(video.frames / video.fps)

		const meta_data = [
			0,	//This value could be changed to allow different versions of encoding
			video.width,
			video.height,
			video.frames,
			video.fps,
			video.title.length + 1,
			video.duration.length + 1
		]
		const meta_buffer = Buffer.alloc(meta_data.length * 2)
		meta_data.forEach((v, i) => {
			meta_buffer.writeUInt16BE(v, i * 2)
		})

		fs.writeFileSync(video.output, meta_buffer, 'binary', exit)

		fs.appendFileSync(video.output, (video.title).substring(0, 17) + '\0', 'ascii', exit)
		fs.appendFileSync(video.output, (video.duration).substring(0, 17) + '\0', 'ascii', exit)

		frames.forEach(file => {
			const image_buffer = fs.readFileSync(temp_path + file)
			const image_raw = jimp.decoders['image/png'](image_buffer)
			const image = new jimp(image_raw)
			
			var image_data = [ [ ] ]
			var x = 0
			var y = 0
			for(var i = 0; i < image.bitmap.width * image.bitmap.height * 4; i += 4) {
				var v = image.bitmap.data[i] + image.bitmap.data[i + 1] + image.bitmap.data[i + 2] + image.bitmap.data[i + 3]
				if((v) < 380) {
					image_data[y][x] = 0
				} else {
					image_data[y][x] = 1
				}
				x += 1
				if(x >= image.bitmap.width) {
					y++
					x = 0
					image_data[y] = [ ]
				}
			}

			var compact_row = [ ]

			for(var y = 0; y < image.bitmap.height; y += 8) {
				for(var x = 0; x < image.bitmap.width; x++) {
					var a = 0
					a = a << 1
					a |= image_data[y + 7][x]
					a = a << 1
					a |= image_data[y + 6][x]
					a = a << 1
					a |= image_data[y + 5][x]
					a = a << 1
					a |= image_data[y + 4][x]
					a = a << 1
					a |= image_data[y + 3][x]
					a = a << 1
					a |= image_data[y + 2][x]
					a = a << 1
					a |= image_data[y + 1][x]
					a = a << 1
					a |= image_data[y + 0][x]
					
					compact_row.push(a)
				}
			}

			fs.appendFileSync(video.output, new Uint8Array(compact_row), 'binary', exit)
		})

		var binary_size = fs.statSync(video.output).size

		console.log(``)
		console.log(`Creating video.h file!`)
		var bundle = `//Generated with converter.js\n`
		bundle += `//\n`
		bundle += `//\n`
		bundle += `//		Put this file with your Player.ino and\n`
		bundle += `//		compile to play on your Arduboy!!\n`
		bundle += `//\n`
		bundle += `//\n`
		bundle += `#define VIDEO_TITLE				"${video.title}"\n`
		bundle += `#define VIDEO_DURATION			"${video.duration}"\n`
		bundle += `#define VIDEO_FRAMES			"${video.frames}"\n`
		bundle += `#define VIDEO_FPS				"${video.fps}"\n`
		bundle += `#define VIDEO_FRAMERATE			${video.fps}\n`
		bundle += `#define VIDEO_WIDTH				"${video.width}"\n`
		bundle += `#define VIDEO_HEIGHT			"${video.height}"\n`
		bundle += `#define FX_DATA_BYTES			(${binary_size})\n`
		bundle += `#define FX_DATA_PAGE			(0xffffff - (FX_DATA_BYTES / 256))\n`
		fs.writeFileSync('video.h', bundle, 'ascii', exit)


		console.log(`Cleaning up...`)
		fs.rmSync(temp_path, { recursive: true, force: true })

		console.log(``)
		console.log(`DONE!`)
		console.log(``)
		console.log(`Put the video.h file in the Player/ directory, then compile the Player.ino file! After, upload it to the Arduboy with the ${base}.bin file. Also, follow me on Twitter! @crait`)
	})