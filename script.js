const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 vTexCoord;
    void main() {
        gl_Position = vec4(a_position, 0, 1);
        vTexCoord = a_texCoord;
    }
`;

const fragmentShaderSource = `
    precision highp float;
    uniform sampler2D tex;
    varying vec2 vTexCoord;

    void main(void) {
        vec4 color = texture2D(tex, vTexCoord);
        vec3 borderColor = vec3(0.0);

        float sectionWidth = 1.0 / 3.0;
        float xCoord = vTexCoord.x;

        mat4 matrix;
        if (xCoord < sectionWidth) {
            matrix = mat4(
                0.567, 0.433, 0.000, 0.000,
                0.558, 0.442, 0.000, 0.000,
                0.000, 0.242, 0.758, 0.000,
                0.000, 0.000, 0.000, 1.000
            );
        } else if (xCoord < 2.0 * sectionWidth) {
            matrix = mat4(
                0.625, 0.375, 0.000, 0.000,
                0.700, 0.300, 0.000, 0.000,
                0.000, 0.300, 0.700, 0.000,
                0.000, 0.000, 0.000, 1.000
            );
        } else {
            matrix = mat4(
                0.950, 0.050, 0.000, 0.000,
                0.000, 0.433, 0.567, 0.000,
                0.000, 0.475, 0.525, 0.000,
                0.000, 0.000, 0.000, 1.000
            );
        }

        vec4 transformedColor = matrix * vec4(color.rgb, 1.0);

        float lineWidth = 0.005;
        bool isBoundary = abs(mod(xCoord, sectionWidth) - sectionWidth) < lineWidth;

        if (isBoundary) {
            gl_FragColor = vec4(borderColor, 1.0);
        } else {
            transformedColor.rgb = clamp(transformedColor.rgb, 0.0, 1.0);
            gl_FragColor = vec4(transformedColor.rgb, color.a);
        }
    }
`;

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

const positionLocation = gl.getAttribLocation(program, 'a_position');
const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 1,
    1, 1,
    0, 0,
    0, 0,
    1, 1,
    1, 0,
]), gl.STATIC_DRAW);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

let video = document.createElement('video');
video.autoplay = true;
let currentStream = null;
let mirror = false;

async function getWebcamDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const deviceList = document.getElementById('device-select');
    deviceList.innerHTML = '';

    videoDevices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Camera ${deviceList.length + 1}`;
        deviceList.appendChild(option);
    });

    // If there's only one device, mirror it by default
    if (videoDevices.length === 1) {
        mirror = true;
    } else if (videoDevices.length > 1) {
        // Check if a device is labeled as front-facing or similar
        videoDevices.forEach(device => {
            if (device.label.toLowerCase().includes('front')) {
                mirror = true;
                deviceList.value = device.deviceId;
            }
        });
    }
}

document.getElementById('mirror-button').addEventListener('click', () => {
    mirror = !mirror;
    updateBuffer();
});

document.getElementById('device-select').addEventListener('change', async (event) => {
    const deviceId = event.target.value;
    await setupVideo({ video: { deviceId: { exact: deviceId } } });
    updateBuffer();
});

document.getElementById('resolution-select').addEventListener('change', async (event) => {
    const [width, height] = event.target.value.split('x').map(Number);
    const deviceId = document.getElementById('device-select').value;
    await setupVideo({ video: { deviceId: { exact: deviceId }, width: { ideal: width }, height: { ideal: height } } });
    updateBuffer();
    adjustCanvasSize(width, height);
});

function adjustCanvasSize(width, height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function updateBuffer() {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    if (mirror) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            1, -1,
            -1, -1,
            1, 1,
            1, 1,
            -1, -1,
            -1, 1,
        ]), gl.STATIC_DRAW);
    } else {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]), gl.STATIC_DRAW);
    }
}

function updateTexture() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
}

function drawScene() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    updateTexture();

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(drawScene);
}

document.addEventListener('DOMContentLoaded', () => {
    getWebcamDevices().then(() => {
        setupVideo({ video: true }).then(() => {
            updateResolutions();
            video.play();
            updateBuffer();
            requestAnimationFrame(drawScene);
        });
    });

    document.getElementById('device-select').addEventListener('change', async (event) => {
        const deviceId = event.target.value;
        await setupVideo({ video: { deviceId: { exact: deviceId } } });
        updateBuffer();
        updateResolutions();
    });
});


async function updateResolutions() {
    const deviceId = document.getElementById('device-select').value;
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } });
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    const resolutionSelect = document.getElementById('resolution-select');

    resolutionSelect.innerHTML = ''; // Clear previous options

    if (capabilities.width && capabilities.height && capabilities.width > 1) {
        const resolutions = [];
        capabilities.width.max && capabilities.height.max && resolutions.push(`${capabilities.width.max}x${capabilities.height.max}`);
        capabilities.width.min && capabilities.height.min && resolutions.push(`${capabilities.width.min}x${capabilities.height.min}`);

        resolutions.forEach(resolution => {
            const option = document.createElement('option');
            option.value = resolution;
            option.text = resolution;
            resolutionSelect.appendChild(option);
        });
    }
    // Stop the temporary stream
    track.stop();
}

async function setupVideo(constraints) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
    return video;
}
