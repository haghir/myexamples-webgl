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

function cube() {
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

function faces() {
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

function id4() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

function det(m) {
    //  0:11  1:21  2:31  3:41
    //  4:12  5:22  6:32  7:42
    //  8:13  9:23 10:33 11:43
    // 12:14 13:24 14:34 15:44
    return m[0] * m[5] * m[10]
         + m[4] * m[9] * m[ 2]
         + m[8] * m[1] * m[ 6]
         - m[0] * m[9] * m[ 6]
         - m[4] * m[1] * m[10]
         - m[8] * m[5] * m[ 2];
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

function correct(m) {
    function round(value, threshold) {
        if (value < -threshold)
            return -threshold;
        else if (value > threshold)
            return threshold;
        else
            return value;
    }

    let sinx = 0;
    let cosx = 0;
    let siny = round(-m[2], 1);
    let cosy = Math.sqrt(1 - siny * siny);
    let sinz = 0;
    let cosz = 0;

    // If cosy == 0
    function correct1() {
        const asin4 = Math.asin(-m[4]);
        const acos5 = Math.acos(m[5]);
        const x = Math.sign(siny) * (acos5 - asin4) / 2;
        const z = (acos5 + asin4) / 2;
        sinx = Math.sin(x);
        cosx = Math.cos(x);
        sinz = Math.sin(z);
        cosz = Math.cos(z);
    }

    // If cosy != 0
    function correct2() {
        sinx = round(m[6] / cosy, 1);
        cosx = Math.sign(m[10] / cosy);
        cosx *= Math.sqrt(1 - sinx * sinx);

        sinz = round(m[1] / cosy, 1)
        cosz = Math.sign(m[0] / cosy);
        cosz *= Math.sqrt(1 - sinz * sinz);
    }

    if (cosy < 0.000000001)
        correct1();
    else
        correct2();

    const rx = [
        1,     0,    0, 0,
        0,  cosx, sinx, 0,
        0, -sinx, cosx, 0,
        0,     0,    0, 1,
    ];

    const ry = [
        cosy, 0, -siny, 0,
           0, 1,     0, 0,
        siny, 0,  cosy, 0,
           0, 0,     0, 1,
    ];

    const rz = [
         cosz, sinz, 0, 0,
        -sinz, cosz, 0, 0,
            0,    0, 1, 0,
            0,    0, 0, 1,
    ];

    return multiply4(rz, multiply4(ry, rx));
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube()), gl.STATIC_DRAW);
    
    // Create a buffer to store texture coordinates, and transfer.
    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faces()), gl.STATIC_DRAW);

    // Create a texture.
    const image = document.getElementById("texImage");
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
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
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);

    const scale = [
        0.5,   0,   0, 0,
          0, 0.5,   0, 0,
          0,   0, 0.5, 0,
          0,   0,   0, 1,
    ];

    let matrix = id4();

    function prjview(matrix, width, height) {
        const smaller = Math.min(width, height);
        const resize = [
            smaller / width, 0, 0, 0,
            0, smaller / height, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
        return multiply4(resize, matrix);
    }

    const detElem = document.getElementById("det");

    function draw() {
        // Resize canvas.
        const canvasWidth = document.documentElement.clientWidth;
        const canvasHeight = document.documentElement.clientHeight;
        if (gl.canvas.width != canvasWidth || gl.canvas.height != canvasHeight) {
            gl.canvas.width = canvasWidth;
            gl.canvas.height = canvasHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }

        let tr = multiply4(scale, matrix);
        tr = prjview(tr, canvasWidth, canvasHeight);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(transformLocation, false, tr);
        gl.uniform1i(textureLocation, 0);

        // Draw a cube.
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT,  false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT,  false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6 * 2 * 3);

        detElem.textContent = det(matrix);
    }

    function rotate(dx, dy) {
        if (dx == 0 && dy == 0)
            return false;
        const d = Math.sqrt(dx * dx + dy * dy);
        const ex = dx / d;
        const ey = dy / d;
        const ax = ey;
        const ay = -ex;
        const angle = d * Math.PI / 360;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        matrix = multiply4([
            ax, -ay, 0, 0,
            ay,  ax, 0, 0,
             0,   0, 1, 0,
             0,   0, 0, 1,
        ], matrix);

        matrix = multiply4([
            1,    0,   0, 0,
            0,  cos, sin, 0,
            0, -sin, cos, 0,
            0,    0,   0, 1,
        ], matrix);

        matrix = multiply4([
             ax, ay, 0, 0,
            -ay, ax, 0, 0,
              0,  0, 1, 0,
              0,  0, 0, 1,
        ], matrix);

        matrix = correct(matrix);

        draw();

        return true;
    }

    let dragging = false;
    let startX;
    let startY;
    canvas.addEventListener("mousedown", e => {
        startX = e.offsetX;
        startY = e.offsetY;
        dragging = true;
    });

    canvas.addEventListener("mousemove", e => {
        if (!dragging)
            return;
        const dx =  e.offsetX - startX;
        const dy = -e.offsetY + startY;
        if (!rotate(dx, dy))
            return;
        startX = e.offsetX;
        startY = e.offsetY;
    });

    window.addEventListener("mouseup", e => {
        dragging = false;
        draw();
    });

    window.addEventListener("keydown", e => {
        if (e.code == "ArrowUp")
            rotate(0, 10);
        else if (e.code == "ArrowDown")
            rotate(0, -10);
        else if (e.code == "ArrowLeft")
            rotate(-10, 0);
        else if (e.code == "ArrowRight")
            rotate(10, 0);
        else
            return;
    });

    window.onresize = function() {
        draw();
    };

    draw();
};