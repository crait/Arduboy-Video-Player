<img src="https://github.com/crait/Arduboy-Video-Player/blob/main/Icon.png?raw=true" />

### Created by Jonathan Holmes (crait)

Website: http://www.crait.net/

Twitter: @crait (http://www.twitter.com/crait)

Bluesky: @crait.bsky.social (http://crait.bsky.social)


### Arduboy Video Player
*Version 1.0 - December 6, 2023*

The Arduboy Video Player is a simple video player for the Arduboy FX. It plays uncompressed video files that are created using the Node.js program located in the `Converter/` directory.

**Features:**
- Supports different video sizes and FPS
- Play/pause
- Skip to beginning/end
- Next/previous frame
- Fast-forward/rewind and backwards play
- Looping
- Flip video playback
- Invert video colors
- Display metadata (Title, duration, FPS, dimensions)

### Arduboy Video Converter
*Version 1.0 - December 6, 2023*

The Arduboy Video Converter will create the a `.bin` file that contains the video data and metadata, as well as a `video.h` file that must be added to the `Player/` directory in order to compile the Arduino sketch file (`.ino`).

### Installation
1. Download/clone the contents of this GitHub repository to your computer
2. Download and install the Arduino IDE and required Arduboy libraries. For a guide on this, check out my tutorial: https://community.arduboy.com/t/make-your-own-arduboy-game-part-1-setting-up-your-computer/7924/1 . You must also install the Arduboy FX library, too! https://github.com/MrBlinky/ArduboyFX
3. Download and install FFmpeg onto your computer (https://ffmpeg.org/download.html)
4. Download and install Node.js (https://nodejs.org/en/download)
5. Using Command Prompt (or Terminal), navigate to the `Converter/` directory
6. Use npm to install the Arduboy Video Converter dependencies with `npm install`

### Converting Your Video
1. Place your video file in the `Converter/` directory
2. Using Command Prompt (or Terminal), navigate to the `Converter/` directory
3. Run the Arduboy Video Converter by using `npm start`
4. You must provide several pieces of information for the video to be converted, such as the video filename, the height, width, FPS, etc. To skip these questions, you can use `npm start [file] [title] [fps] [width] [height]`.
5. This process will create a `.bin` and `video.h` file in the `Converter/` directory
6. Move the `video.h` file to the `Player/` directory
7. Open the `Player.ino` sketch with the Arduino IDE
8. Connect your Arduboy FX to your computer and compile/upload your sketch to your device
9. You must also upload the `.bin` that you generated in the `Converter/` directory. To do this, I use Mr.Blinky's tools, but there are alernatives that you could try. (https://github.com/MrBlinky/Arduboy-Python-Utilities)

### License
Code is supplied for 2 purposes: 1) Ease of loading onto an Arduboy device for personal play, and 2) Educational value in the case of studying the code and modifying for personal, educational use. Even though the source code is available to the public, this software is not 'open-source'. Re-releasing my code/game, re-distributing my code/game, or publicly sharing a modified variation or derivative of my code/game is not allowed. The code has no guarantee of support in the future. The code is also free of charge. This code must never be sold. This game must never be sold. Distribution of my game/code for commercial or financial gain is explicitly NOT allowed. Finally, someone creating any derivative of this software for a different platform must have explicit permission from me if it is intended
to be released or distributed to others. Please don't steal my code!
