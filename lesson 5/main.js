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

function shapes() {
    return [
        -1,  1, -0.5,  1, -1, -0.5,  1,  1, -0.5,
        -1,  1, -0.5, -1, -1, -0.5,  1, -1, -0.5,
        -1,  1,  0.5,  1, -1,  0.5,  1,  1,  0.5,
        -1,  1,  0.5, -1, -1,  0.5,  1, -1,  0.5,
    ];
}

function faces() {
    return [
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

    // Create a buffer to store verticies, and transfer verticies of shapes.
    const shapesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, shapesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shapes()), gl.STATIC_DRAW);
    
    // Create a buffer to store texture coordinates, and transfer.
    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faces()), gl.STATIC_DRAW);

    // Create a cloud texture.
    const cloudImage = document.getElementById("texCloud");
    const cloudTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, cloudTexture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cloudImage);
    gl.generateMipmap(gl.TEXTURE_2D);

    // Create a sun texture.
    const sunImage = document.getElementById("texSun");
    const sunTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sunTexture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sunImage);
    gl.generateMipmap(gl.TEXTURE_2D);

    // Get a location of an attribute to pass verticies.
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Get a location of an attribute to pass coordinates of a texture.
    const texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
    gl.enableVertexAttribArray(texcoordAttributeLocation);

    // Get a location of alpha.
    const alphaLocation = gl.getUniformLocation(program, "u_alpha");

    // Get a location of texture.
    const textureLocation = gl.getUniformLocation(program, "u_texture");

    // Get locations of transform.
    const transformLocation = gl.getUniformLocation(program, "u_transform");

    // Disable CULL_FACE in order to observe that the result of alpha blending
    // depends on the order of rendering.
    //gl.enable(gl.CULL_FACE);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);

    let s = 0.5;
    let ca = 1;
    let sa = 1;
    let x = 0;
    let y = 0;
    let z = 0;
    let h = 0;
    let v = 0;

    function draw(matrix) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(transformLocation, false, matrix);
        gl.uniform1i(textureLocation, 0);

        // It is required to draw in order from further away to closer.

        // Draw a sun placed further away.
        gl.bindTexture(gl.TEXTURE_2D, sunTexture);
        gl.bindBuffer(gl.ARRAY_BUFFER, shapesBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT,  false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT,  false, 0, 0);
        gl.uniform1f(alphaLocation, ca);
        gl.drawArrays(gl.TRIANGLES, 6, 6);

        // Draw a cloud placed closer.
        gl.bindTexture(gl.TEXTURE_2D, cloudTexture);
        gl.bindBuffer(gl.ARRAY_BUFFER, shapesBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT,  false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT,  false, 0, 0);
        gl.uniform1f(alphaLocation, sa);
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

    function onslide_ca(e, ui) {
        ca = ui.value / 100;
        onslide();
    }

    function onslide_sa(e, ui) {
        sa = ui.value / 100;
        onslide();
    }

    function onslide_x(e, ui) {
        x = Math.PI * (ui.value - 50) / 50;
        onslide();
    }

    function onslide_y(e, ui) {
        y = Math.PI * (ui.value - 50) / 50;
        onslide();
    }

    function onslide_z(e, ui) {
        z = Math.PI * (ui.value - 50) / 50;
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

    $("#caslider").slider({
        value: 100,
        slide: onslide_ca,
        stop: onslide_ca,
    });

    $("#saslider").slider({
        value: 100,
        slide: onslide_sa,
        stop: onslide_sa,
    });

    $("#xslider").slider({
        value: 50,
        slide: onslide_x,
        stop: onslide_x,
    });

    $("#yslider").slider({
        value: 50,
        slide: onslide_y,
        stop: onslide_y,
    });

    $("#zslider").slider({
        value: 50,
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