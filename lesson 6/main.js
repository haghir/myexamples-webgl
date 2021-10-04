function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
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
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

const makeTextCanvas = (function() {
    const ctx = document.createElement("canvas").getContext("2d");
    return function(text, width, height) {
        ctx.canvas.width  = width;
        ctx.canvas.height = height;
        ctx.font = "36px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "red";
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillText(text, width / 2, height / 2);
        return ctx.canvas;
    }
})();

function cubePolygon() {
    return [
        -1,  1, -1,  1, -1, -1,  1,  1, -1,
        -1,  1, -1, -1, -1, -1,  1, -1, -1,
         1,  1,  1, -1, -1,  1, -1,  1,  1,
         1,  1,  1,  1, -1,  1, -1, -1,  1,

        -1, -1,  1, -1,  1, -1, -1,  1,  1,
        -1, -1,  1, -1, -1, -1, -1,  1, -1,
         1,  1,  1,  1, -1, -1,  1, -1,  1,
         1,  1,  1,  1,  1, -1,  1, -1, -1,

         1, -1, -1, -1, -1,  1,  1, -1,  1,
         1, -1, -1, -1, -1, -1, -1, -1,  1,
         1,  1,  1, -1,  1, -1,  1,  1, -1,
         1,  1,  1, -1,  1,  1, -1,  1, -1,
    ];
}

function cubeFaces() {
    return [
        0, 0, 1, 1, 1, 0,
        0, 0, 0, 1, 1, 1,
        0, 0, 1, 1, 1, 0,
        0, 0, 0, 1, 1, 1,
        0, 0, 1, 1, 1, 0,
        0, 0, 0, 1, 1, 1,
        0, 0, 1, 1, 1, 0,
        0, 0, 0, 1, 1, 1,
        0, 0, 1, 1, 1, 0,
        0, 0, 0, 1, 1, 1,
        0, 0, 1, 1, 1, 0,
        0, 0, 0, 1, 1, 1,
    ];
}

function textPolygon() {
    return [
        -0.5,  0.5, -1,
         0.5, -0.5, -1,
         0.5,  0.5, -1,
        -0.5,  0.5, -1,
        -0.5, -0.5, -1,
         0.5, -0.5, -1,
    ];
}

function textFaces() {
    return [
        0, 0, 1, 1, 1, 0,
        0, 0, 0, 1, 1, 1,
    ]
}

function id4() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

function multiply4(a, b) {
    const ret = Array(4 * 4);
    for (let i = 0; i < 4; ++i)
        for (let j = 0; j < 4; ++j) {
            let v = 0;
            for (let k = 0; k < 4; ++k)
                v += a[k * 4 + i] * b[j * 4 + k];
            ret[j * 4 + i] = v;
        }
    return ret;
}

window.onload =  function() {
    const canvas = document.querySelector("#c");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert("No WebGL");
        return;
    }

    // Create a program.
    const vertexShaderSource = document.querySelector("#vertex-shader-3d").text;
    const fragmentShaderSource = document.querySelector("#fragment-shader-3d").text;
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Create a buffer to store verticies, and transfer verticies of a cube.
    const cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubePolygon()), gl.STATIC_DRAW);

    // Create a buffer to store texture coordinates, and transfer.
    const cubeCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeFaces()), gl.STATIC_DRAW);

    // Create a texture.
    const cubeImage = document.getElementById("texImage");
    const cubeTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeImage);
    gl.generateMipmap(gl.TEXTURE_2D);

    // Create a buffer to store vertices of text canvas.
    const textBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textPolygon()), gl.STATIC_DRAW);

    // Create a buffer to store texture coordinates, and transfer.
    const textCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textFaces()), gl.STATIC_DRAW);

    // Create a hello texture.
    const textCanvas = makeTextCanvas("HELLO", 128, 128);
    const textTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textTexture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    gl.generateMipmap(gl.TEXTURE_2D);

    // Get a location of an attribute to pass verticies.
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Get a location of an attribute to pass coordinates of a texture.
    const texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
    gl.enableVertexAttribArray(texcoordAttributeLocation);

    // Get a location of texture.
    const textureLocation = gl.getUniformLocation(program, "u_texture");

    // Get locations of transform.
    const transformLocation = gl.getUniformLocation(program, "u_transform");

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);

    let s = 0.5;
    let x = Math.PI * 20 / 50;
    let y = Math.PI * 10 / 50;
    let z = 0;
    let h = 0;
    let v = 0;

    function draw(matrix) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniform1i(textureLocation, 0);

        // Draw a cubePolygon.
        gl.uniformMatrix4fv(transformLocation, false, matrix);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT,  false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeCoordBuffer);
        gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT,  false, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
        gl.drawArrays(gl.TRIANGLES, 0, 6 * 2 * 3);

        // Draw a text.
        gl.uniformMatrix4fv(transformLocation, false, id4());
        gl.bindBuffer(gl.ARRAY_BUFFER, textBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT,  false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, textCoordBuffer);
        gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT,  false, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, textTexture);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function onslide() {
        const scale = [
            s, 0, 0, 0,
            0, s, 0, 0,
            0, 0, s, 0,
            0, 0, 0, 1,
        ];
        const rx = [
            1, 0, 0, 0,
            0, Math.cos(x), Math.sin(x), 0,
            0, -Math.sin(x), Math.cos(x), 0,
            0, 0, 0, 1,
        ];
        const ry = [
            Math.cos(y), 0, -Math.sin(y), 0,
            0, 1, 0, 0,
            Math.sin(y), 0, Math.cos(y), 0,
            0, 0, 0, 1,
        ];
        const rz = [
            Math.cos(z), Math.sin(z), 0, 0,
            -Math.sin(z), Math.cos(z), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
        const move = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            h, v, 0, 1,
        ];
        let tr = id4();
        tr = multiply4(scale, tr);
        tr = multiply4(rx, tr);
        tr = multiply4(ry, tr);
        tr = multiply4(rz, tr);
        tr = multiply4(move, tr);
        draw(tr);
    }

    onslide();

    function onslide_s(e, ui) {
        s = ui.value / 100;
        onslide();
    }

    function onslide_x(e, ui) {
        x = Math.PI * ui.value / 50;
        onslide();
    }

    function onslide_y(e, ui) {
        y = Math.PI * ui.value / 50;
        onslide();
    }

    function onslide_z(e, ui) {
        z = Math.PI * ui.value / 50;
        onslide();
    }

    function onslide_h(e, ui) {
        h = ui.value / 50 - 1;
        onslide();
    }

    function onslide_v(e, ui) {
        v = ui.value / 50 - 1;
        onslide();
    }

    $("#sslider").slider({
        value: 50,
        slide: onslide_s,
        stop: onslide_s,
    });

    $("#xslider").slider({
        value: 20,
        slide: onslide_x,
        stop: onslide_x,
    });

    $("#yslider").slider({
        value: 10,
        slide: onslide_y,
        stop: onslide_y,
    });

    $("#zslider").slider({
        slide: onslide_z,
        stop: onslide_z,
    });

    $("#hslider").slider({
        value: 50,
        slide: onslide_h,
        stop: onslide_h,
    });

    $("#vslider").slider({
        value: 50,
        slide: onslide_v,
        stop: onslide_v,
    });
}