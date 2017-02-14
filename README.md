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

./node_modules/.bin/mosca adduser carol carol \
    --credentials ./credentials.json \
    --authorize-publish '*/carol' \
    --authorize-subscribe '*/carol'

./node_modules/.bin/mosca adduser david david \
    --credentials ./credentials.json \
    --authorize-publish '*/david' \
    --authorize-subscribe '*/david'
~~~

## Start the server

~~~bash
npm start
~~~

It's starts a MQTT Broker on port `1883` and a fallback
for WebSocket on port `1884`.

# Gamepad keyboard configuration

Every game has a profile for quick configuration. Look at the folder
`profiles/`.

If you need to change any keyboard combination for SNES Top Gear, for example,
go to `profiles/race/snes--top_gear`. Every player has it's own file.

## For production

Download the [master](https://github.com/comsolid/remote-pad-server/archive/master.zip)
branch to some folder. Unzip and use the `setup` script.

```bash
cd remote-pad-server-master
./scripts/setup.sh
```

This will install all required software for running both server and client.
**Debian/Ubuntu x86_64 only**.

### Monitoring

After run the setup script.

```bash
pm2 monit
```

```bash
pm2 stop remote-pad-server remote-pad
```

```bash
pm2 delete remote-pad-server remote-pad
```

# SNES Emulator

## Higan

~~~bash
sudo apt-get install higan
~~~

### Troubleshooting


> Error: OpenGL 3.2 is not available. Select another video driver on the
    Advanced Configuration tab and restart higan.

~~~bash
MESA_GL_VERSION_OVERRIDE=3.2 MESA_GLSL_VERSION_OVERRIDE=150 higan
~~~

## SNES9x

Download from <http://snes9x.ipherswipsite.com/>

Tested with Ubuntu 14.04 with SNES9x version 1.52.

### Configuration

Replace the file `~/.snes9x/snes9x.xml`
with `./profiles/race/snes--default/snes9x.xml`.

# Nintendo 64 Emulator

[Mupen64plus](https://github.com/mupen64plus/mupen64plus-core/releases)

## Starting the game with predefined configuration

For Mario Kart 64:

```bash
mupen64plus --configdir ./profiles/race/n64--default/
```

You can hack other configurations in
`./profiles/race/n64--default/mupen64plus.cfg`.
