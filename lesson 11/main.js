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

    const fps = 60;
    const detElem = document.querySelector("#det");
    const fpsElem = document.querySelector("#fps");
    const axElem = document.querySelector("#ax");
    const ayElem = document.querySelector("#ay");
    const azElem = document.querySelector("#az");
    const oxElem = document.querySelector("#ox");
    const oyElem = document.querySelector("#oy");
    const ozElem = document.querySelector("#oz");
    const rxpElem = document.querySelector("#rxp");
    const rxnElem = document.querySelector("#rxn");
    const rypElem = document.querySelector("#ryp");
    const rynElem = document.querySelector("#ryn");
    const rzpElem = document.querySelector("#rzp");
    const rznElem = document.querySelector("#rzn");

    // rotation
    let ax = 0;
    let ay = 0;
    let az = 0;

    // scale
    let scale = 0.5;

    // move
    let mx = 0;
    let my = 0;
    let mz = 0;

    // for auto rotation.
    let autoRotationCount = 0;
    let dax = 0;
    let day = 0;
    let daz = 0;
    let dstax = 0;
    let dstay = 0;
    let dstaz = 0;

    let dragging = false;
    let mouseX;
    let mouseY;

    const start = Date.now();
    let fpsStart = start;
    let fpsCount = 0;

    function applyRotation(matrix) {
        const sinx = Math.sin(ax);
        const cosx = Math.cos(ax);
        const siny = Math.sin(ay);
        const cosy = Math.cos(ay);
        const sinz = Math.sin(az);
        const cosz = Math.cos(az);

        matrix = multiply4([
            1,     0,    0, 0,
            0,  cosx, sinx, 0,
            0, -sinx, cosx, 0,
            0,     0,    0, 1,
        ], matrix);

        matrix = multiply4([
            cosy, 0, -siny, 0,
               0, 1,     0, 0,
            siny, 0,  cosy, 0,
               0, 0,     0, 1,
        ], matrix);

        matrix = multiply4([
             cosz, sinz, 0, 0,
            -sinz, cosz, 0, 0,
                0,    0, 1, 0,
                0,    0, 0, 1,
        ], matrix);

        return matrix;
    }

    function applyScale(matrix) {
        return multiply4([
            scale, 0, 0, 0,
            0, scale, 0, 0,
            0, 0, scale, 0,
            0, 0, 0, 1,
        ], matrix);
    }

    function applyMove(matrix) {
        return multiply4([
             1,  0,  0, 0,
             0,  1,  0, 0,
             0,  0,  1, 0,
            mx, my, mz, 1,
        ], matrix);
    }

    function calcAngles(m) {
        function round(value, threshold) {
            if (value < -threshold)
                return -threshold;
            else if (value > threshold)
                return threshold;
            else
                return value;
        }

        function sign(value) {
            const sign = Math.sign(value);
            return sign == 0 ? 1 : sign;
        }
    
        const siny = round(-m[2], 1);
        ay = Math.asin(siny);
        const cosy = Math.abs(Math.cos(ay));

        if (cosy < 0.000000001) {
            const asin4 = Math.asin(-m[4]);
            const acos5 = Math.acos(m[5]);
            ax = ay * (acos5 - asin4) / 2;
            az = (acos5 + asin4) / 2;
        } else {
            const signx = sign(m[6] / cosy);
            ax = signx * Math.acos(round(m[10] / cosy, 1));
            const signz = sign(m[1] / cosy);
            az = signz * Math.acos(round(m[0] / cosy, 1));
        }
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

        let matrix = applyRotation(id4());

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

        calcAngles(matrix);

        return true;
    }

    function autoRotation() {
        if (autoRotationCount == null)
            return;

        if (autoRotationCount == 0) {
            ax = dstax;
            ay = dstay;
            az = dstaz;
            autoRotationCount = null;
            return;
        }

        ax += dax;
        ay += day;
        az += daz;
        --autoRotationCount;
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

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let matrix = id4();
        matrix = applyRotation(matrix);
        matrix = applyMove(matrix);
        matrix = applyScale(matrix);
    
        // Draw a frame.
        const tr1 = prjview(matrix, canvasWidth, canvasHeight);

        gl.useProgram(program1);
        gl.uniformMatrix4fv(transformLocation1, false, tr1);
        gl.bindBuffer(gl.ARRAY_BUFFER, frameBuffer);
        gl.vertexAttribPointer(positionAttributeLocation1, 3, gl.FLOAT,  false, 0, 0);
        gl.drawArrays(gl.LINES, 0, 12 * 2);

        // Draw a cube.
        const tr2 = prjview(matrix, canvasWidth, canvasHeight);

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
        axElem.textContent = ax;
        ayElem.textContent = ay;
        azElem.textContent = az;
        oxElem.textContent = mx;
        oyElem.textContent = my;
        ozElem.textContent = mz;
    }

    canvas.addEventListener("wheel", e => {
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;
        const min = Math.min(w, h);
        const x = (e.clientX * 2 - w) / min;
        const y = (h - e.clientY * 2) / min;
        const z = 0;
        let scroll = e.deltaY / 500;
        if (scroll == 0)
            return;
        if (scroll < -1)
            scroll = -1;
        else if (scroll > 1)
            scroll = 1;
        const prev = scale;
        scale *= 1 / (1 + scroll);
        const coef = (1 / scale - 1 / prev);
        mx += coef * x;
        my += coef * y;
        mz += coef * z;
    });

    canvas.addEventListener("mousedown", e => {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
        dragging = true;
    });

    canvas.addEventListener("mousemove", e => {
        if (!dragging)
            return;
        const dx =  e.offsetX - mouseX;
        const dy = -e.offsetY + mouseY;
        if (!rotate(dx, dy))
            return;
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });

    window.addEventListener("mouseup", e => {
        dragging = false;
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

    rxpElem.addEventListener("click", e => {
        autoRotationCount = fps;
        dstax = 0;
        dstay = Math.PI / 2;
        dstaz = 0;
        dax = (dstax - ax) / autoRotationCount;
        day = (dstay - ay) / autoRotationCount;
        daz = (dstaz - az) / autoRotationCount;
    });

    rxnElem.addEventListener("click", e => {
        autoRotationCount = fps;
        dstax = 0;
        dstay = -Math.PI / 2;
        dstaz = 0;
        dax = (dstax - ax) / autoRotationCount;
        day = (dstay - ay) / autoRotationCount;
        daz = (dstaz - az) / autoRotationCount;
    });

    rypElem.addEventListener("click", e => {
        autoRotationCount = fps;
        dstax = -Math.PI / 2;
        dstay = 0;
        dstaz = 0;
        dax = (dstax - ax) / autoRotationCount;
        day = (dstay - ay) / autoRotationCount;
        daz = (dstaz - az) / autoRotationCount;
    });

    rynElem.addEventListener("click", e => {
        autoRotationCount = fps;
        dstax = Math.PI / 2;
        dstay = 0;
        dstaz = 0;
        dax = (dstax - ax) / autoRotationCount;
        day = (dstay - ay) / autoRotationCount;
        daz = (dstaz - az) / autoRotationCount;
    });

    rzpElem.addEventListener("click", e => {
        autoRotationCount = fps;
        dstax = Math.PI;
        dstay = 0;
        dstaz = 0;
        dax = (dstax - ax) / autoRotationCount;
        day = (dstay - ay) / autoRotationCount;
        daz = (dstaz - az) / autoRotationCount;
    });

    rznElem.addEventListener("click", e => {
        autoRotationCount = fps;
        dstax = 0;
        dstay = 0;
        dstaz = 0;
        dax = (dstax - ax) / autoRotationCount;
        day = (dstay - ay) / autoRotationCount;
        daz = (dstaz - az) / autoRotationCount;
    });

    setInterval(function() {
        autoRotation();

        draw();

        const now = Date.now();
        const fpsPast = now - fpsStart; 
        fpsElem.textContent = Math.round(1000 / (fpsPast / ++fpsCount));
        if (fpsPast > 1000) {
            fpsStart = now;
            fpsCount = 0;
        }
    }, 1000 / fps);
};