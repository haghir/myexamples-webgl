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

function generateProgram(gl, vertexShaderId, fragmentShaderId) {
    const vertexShaderSource = document.getElementById(vertexShaderId).text;
    const fragmentShaderSource = document.getElementById(fragmentShaderId).text;
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    return createProgram(gl, vertexShader, fragmentShader);
}

function frame() {
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

window.onload =  function() {
    const canvas = document.querySelector("#c");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert("No WebGL");
        return;
    }

    // Create a buffer to store texture coordinates, and transfer.
    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faces()), gl.STATIC_DRAW);

    // Create a buffer to store verticies, and transfer verticies of a cube.
    const cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube()), gl.STATIC_DRAW);

    // Create a buffer to store verticies, and transfer verticies of a frame.
    const frameBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, frameBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(frame()), gl.STATIC_DRAW);

    // Create a texture.
    const image = document.getElementById("texImage");
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);

    // Create a program 1.
    const program1 = generateProgram(gl, "vertex-shader-3d-1", "fragment-shader-3d-1");

    // Get a location of an attribute to pass verticies.
    const positionAttributeLocation1 = gl.getAttribLocation(program1, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation1);
    gl.vertexAttribPointer(positionAttributeLocation1, 3, gl.FLOAT,  false, 0, 0);

    // Get locations of transform.
    const transformLocation1 = gl.getUniformLocation(program1, "u_transform");

    // Create a program 2.
    const program2 = generateProgram(gl, "vertex-shader-3d-2", "fragment-shader-3d-2");

    // Get a location of an attribute to pass verticies.
    const positionAttributeLocation2 = gl.getAttribLocation(program2, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation2);
    gl.vertexAttribPointer(positionAttributeLocation2, 3, gl.FLOAT,  false, 0, 0);

    // Get a location of an attribute to pass coordinates of a texture.
    // If gl.vertexAttribPointer(texcoordAttributeLocation2, ...) was not called
    // before gl.drawArrays(gl.LINES, ...) was called, it will fail.
    // I'm not sure why, but I added lines that calls vertexAttribPointer after
    // each line where enableVertexAttribArray is called.
    const texcoordAttributeLocation2 = gl.getAttribLocation(program2, "a_texcoord");
    gl.enableVertexAttribArray(texcoordAttributeLocation2);
    gl.vertexAttribPointer(texcoordAttributeLocation2, 2, gl.FLOAT,  false, 0, 0);

    // Get a location of texture.
    const textureLocation2 = gl.getUniformLocation(program2, "u_texture");

    // Get locations of transform.
    const transformLocation2 = gl.getUniformLocation(program2, "u_transform");

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);

    const scale1 = [
        0.5,   0,   0, 0,
          0, 0.5,   0, 0,
          0,   0, 0.5, 0,
          0,   0,   0, 1,
    ];

    const scale2 = [
        0.4,   0,   0, 0,
          0, 0.4,   0, 0,
          0,   0, 0.4, 0,
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

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Draw a frame.
        let tr1 = multiply4(matrix, scale1);
        tr1 = prjview(tr1, canvasWidth, canvasHeight);

        gl.useProgram(program1);
        gl.uniformMatrix4fv(transformLocation1, false, tr1);
        gl.bindBuffer(gl.ARRAY_BUFFER, frameBuffer);
        gl.vertexAttribPointer(positionAttributeLocation1, 3, gl.FLOAT,  false, 0, 0);
        gl.drawArrays(gl.LINES, 0, 12 * 2);

        // Draw a cube.
        let tr2 = multiply4(matrix, scale2);
        tr2 = prjview(tr2, canvasWidth, canvasHeight);

        gl.useProgram(program2);
        gl.uniformMatrix4fv(transformLocation2, false, tr2);
        gl.uniform1i(textureLocation2, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
        gl.vertexAttribPointer(positionAttributeLocation2, 3, gl.FLOAT,  false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.vertexAttribPointer(texcoordAttributeLocation2, 2, gl.FLOAT,  false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6 * 2 * 3);

        // Show the determinant of the matrix.
        detElem.textContent = det(matrix);
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
        if (dx == 0 && dy == 0)
            return;
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

        startX = e.offsetX;
        startY = e.offsetY;

        draw();
    });

    window.addEventListener("mouseup", e => {
        dragging = false;
        draw();
    });

    window.onresize = function() {
        draw();
    };

    draw();
};