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

    let matrix = [
        0.5,   0,   0, 0,
          0, 0.5,   0, 0,
          0,   0, 0.5, 0,
          0,   0,   0, 1,
    ];

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

    function draw() {
        // Resize canvas.
        const canvasWidth = document.documentElement.clientWidth;
        const canvasHeight = document.documentElement.clientHeight;
        if (gl.canvas.width != canvasWidth || gl.canvas.height != canvasHeight) {
            gl.canvas.width = canvasWidth;
            gl.canvas.height = canvasHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }

        const tr = prjview(matrix, canvasWidth, canvasHeight);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(transformLocation, false, tr);
        gl.uniform1i(textureLocation, 0);

        // Draw a cube.
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT,  false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT,  false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6 * 2 * 3);
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
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.000000001)
            return;
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