# Remote Pad Server

MQTT Broker responsible to execute commands sent by
[remote-pad](https://github.com/comsolid/remote-pad).

The idea is receive data from a mobile simulating for
example a Steering wheel for a race game (Top Gear),
and act as if the keyboard is sending commands
to the emulator.

# Getting Started

## Install dependencies

~~~bash
npm install # or yarn
~~~

## Add user credentials

~~~bash
./node_modules/.bin/mosca adduser alice alice \
    --credentials ./credentials.json \
    --authorize-publish '*/alice' \
    --authorize-subscribe '*/alice'

./node_modules/.bin/mosca adduser bob bob \
    --credentials ./credentials.json \
    --authorize-publish '*/bob' \
    --authorize-subscribe '*/bob'
~~~

## Start the server

~~~bash
npm start
~~~

It's starts a MQTT Broker on port `1883` and a fallback
for WebSocket on port `1884`.

# SNES Emulator

Higan

~~~bash
sudo apt-get install higan
~~~

## Troubleshooting


> Error: OpenGL 3.2 is not available. Select another video driver on the
    Advanced Configuration tab and restart higan.

~~~
MESA_GL_VERSION_OVERRIDE=3.2 MESA_GLSL_VERSION_OVERRIDE=150 higan
~~~
