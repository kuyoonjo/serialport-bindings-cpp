const { NodeAddon } = require('@smake/node-addon');
const { Fn } = require('@smake/utils');
const { mkdir, rm, copyFile } = require('fs/promises');

const name = 'bindings';

const darwin = ['aarch64-apple-darwin', 'x86_64-apple-darwin'].map(target => {
    const darwin = new NodeAddon(name, target);
    darwin.NODE_VERSION = 'v16.13.1';
    darwin.files = [
        'src/serialport.cpp',
        'src/serialport_unix.cpp',
        'src/poller.cpp',
        'src/darwin_list.cpp'
    ];
    darwin.cxflags = [
        ...darwin.cxflags,
        '-DNAPI_CPP_EXCEPTIONS',
        '-Wno-deprecated',
    ];
    darwin.shflags = [
        ...darwin.shflags,
        '-framework CoreFoundation',
        '-framework IOKit',
    ];
    return darwin
});

const linux = [
  'x86_64-ubuntu14.04-linux-gnu',
  'aarch64-ubuntu14.04-linux-gnu',
  'armv7-ubuntu14.04-linux-gnueabihf',
].map(target => {
    const linux = new NodeAddon(name, target);
    linux.NODE_VERSION = 'v16.13.1';
    linux.files = [
        'src/serialport.cpp',
        'src/serialport_unix.cpp',
        'src/poller.cpp',
        'src/serialport_linux.cpp'
    ];
    linux.cxflags = [
        ...linux.cxflags,
        '-DNAPI_CPP_EXCEPTIONS',
        '-Wno-deprecated',
    ];
    return linux
});

const cp = new Fn('CopyFiles', async () => {
    await rm('build', { recursive: true, force: true});
    await mkdir('build/darwin/arm64', {recursive: true});
    await copyFile('.smake/bindings/release/aarch64-apple-darwin/bindings.node', 'build/darwin/arm64/bindings.node');
    await mkdir('build/darwin/x64', {recursive: true});
    await copyFile('.smake/bindings/release/x86_64-apple-darwin/bindings.node', 'build/darwin/x64/bindings.node');

    await mkdir('build/win32/x64', {recursive: true});
    await copyFile('win32_x64.napi.node', 'build/win32/x64/bindings.node');

    await mkdir('build/linux/x64', {recursive: true});
    await copyFile('.smake/bindings/release/x86_64-ubuntu14.04-linux-gnu/bindings.node', 'build/linux/x64/bindings.node');
    await mkdir('build/linux/arm64', {recursive: true});
    await copyFile('.smake/bindings/release/aarch64-ubuntu14.04-linux-gnu/bindings.node', 'build/linux/arm64/bindings.node');
    await mkdir('build/linux/arm', {recursive: true});
    await copyFile('.smake/bindings/release/armv7-ubuntu14.04-linux-gnueabihf/bindings.node', 'build/linux/arm/bindings.node');
});

module.exports = [
    ...darwin,
    ...linux,
    cp
];