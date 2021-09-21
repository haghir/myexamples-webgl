function createShader(gl, type, source) {
    let shader = gl.createShader(type);
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
    let program = gl.createProgram();
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

function draw(gl, positionAttributeLocation, transformLocation, pointSizeLocation, matrix, pointSize) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT,  false, 0, 0);
    gl.uniformMatrix4fv(transformLocation, false, matrix);
    gl.uniform1f(pointSizeLocation, pointSize);
    gl.drawArrays(gl.LINES, 0, 24);
    gl.drawArrays(gl.POINTS, 24, 15 * 32 + 2);
}

function cube() {
    return [
        -1, -1, -1,  1, -1, -1,
         1,  1, -1,  1, -1, -1,
         1,  1, -1, -1,  1, -1,
        -1, -1, -1, -1,  1, -1,
         1, -1,  1, -1, -1,  1,
         1,  1,  1,  1, -1,  1,
         1,  1,  1, -1,  1,  1,
        -1,  1,  1, -1, -1,  1,
        -1, -1, -1, -1, -1,  1,
         1, -1,  1,  1, -1, -1,
         1,  1,  1,  1,  1, -1,
        -1,  1,  1, -1,  1, -1,
    ];
}

function sphere() {
    const res = 32;
    const half = res / 2;
    const size = (half - 1) * res + 2;
    let ret = Array(size * 3);
    for (let i = 0; i < res; ++i)
        for (let j = 1; j < half; ++j) {
            let r = Math.sin(Math.PI * j / half);
            ret[((half - 1) * i + j - 1) * 3 + 0] = Math.cos(Math.PI * i / half) * r;
            ret[((half - 1) * i + j - 1) * 3 + 1] = Math.sin(Math.PI * i / half) * r;
            ret[((half - 1) * i + j - 1) * 3 + 2] = Math.cos(Math.PI * j / half);
        }
    ret[size * 3 - 6] = 0;
    ret[size * 3 - 5] = 0;
    ret[size * 3 - 4] = 1;
    ret[size * 3 - 3] = 0;
    ret[size * 3 - 2] = 0;
    ret[size * 3 - 1] = -1;
    return ret;
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
    let ret = Array(4 * 4);
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
    let canvas = document.querySelector("#c");
    let gl = canvas.getContext("webgl");
    if (!gl) {
        alert("No WebGL");
        return;
    }

    let vertexShaderSource = document.querySelector("#vertex-shader-3d").text;
    let fragmentShaderSource = document.querySelector("#fragment-shader-3d").text;

    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    let program = createProgram(gl, vertexShader, fragmentShader);

    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    let transformLocation = gl.getUniformLocation(program, "u_transform");
    let pointSizeLocation = gl.getUniformLocation(program, "u_pointSize");

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    let position = cube().concat(sphere());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);

    let s = 0.5;
    let p = 5;
    let x = Math.PI * 20 / 50;
    let y = Math.PI * 10 / 50;
    let z = 0;
    let h = 0;
    let v = 0;
    function onslide() {
        let scale = [
            s, 0, 0, 0,
            0, s, 0, 0,
            0, 0, s, 0,
            0, 0, 0, 1,
        ];
        let rx = [
            1, 0, 0, 0,
            0, Math.cos(x), Math.sin(x), 0,
            0, -Math.sin(x), Math.cos(x), 0,
            0, 0, 0, 1,
        ];
        let ry = [
            Math.cos(y), 0, -Math.sin(y), 0,
            0, 1, 0, 0,
            Math.sin(y), 0, Math.cos(y), 0,
            0, 0, 0, 1,
        ];
        let rz = [
            Math.cos(z), Math.sin(z), 0, 0,
            -Math.sin(z), Math.cos(z), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
        let move = [
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
        draw(gl, positionAttributeLocation, transformLocation, pointSizeLocation, tr, p);
    }

    onslide();

    function onslide_s(e, ui) {
        s = ui.value / 100;
        onslide();
    }

    function onslide_p(e, ui) {
        p = ui.value / 10;
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

    $("#pslider").slider({
        value: 50,
        slide: onslide_p,
        stop: onslide_p,
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