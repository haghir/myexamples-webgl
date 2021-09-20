function createShader(gl, type, source) {
    var shader = gl.createShader(type);
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
    var program = gl.createProgram();
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

function draw(gl, transformLocation, matrix) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(transformLocation, false, matrix);
    gl.drawArrays(gl.LINES, 0, 24);
}

function multiply4(a, b) {
    var ret = Array(4 * 4);
    for (var j = 0; j < 4; ++j)
        for (var i = 0; i < 4; ++i) {
            var v = 0;
            for (var k = 0; k < 4; ++k)
                v += a[k * 4 + i] * b[j * 4 + k];
            ret[j * 4 + i] = v;
        }
    return ret;
}

window.onload =  function() {
    var canvas = document.querySelector("#c");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        alert("No WebGL");
        return;
    }

    var vertexShaderSource = document.querySelector("#vertex-shader-3d").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader-3d").text;

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    var program = createProgram(gl, vertexShader, fragmentShader);

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var transformLocation = gl.getUniformLocation(program, "u_transform");

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var position = [
        -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,
         0.5,  0.5, -0.5,  0.5, -0.5, -0.5,
         0.5,  0.5, -0.5, -0.5,  0.5, -0.5,
        -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,
         0.5, -0.5,  0.5, -0.5, -0.5,  0.5,
         0.5,  0.5,  0.5,  0.5, -0.5,  0.5,
         0.5,  0.5,  0.5, -0.5,  0.5,  0.5,
        -0.5,  0.5,  0.5, -0.5, -0.5,  0.5,
        -0.5, -0.5, -0.5, -0.5, -0.5,  0.5,
         0.5, -0.5,  0.5,  0.5, -0.5, -0.5,
         0.5,  0.5,  0.5,  0.5,  0.5, -0.5,
        -0.5,  0.5,  0.5, -0.5,  0.5, -0.5,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(
        positionAttributeLocation,
        3,        // 3 components per iteration
        gl.FLOAT, // the data is 32bit floats
        false,    // don't normalize the data
        0,        // 0 = move forward size * sizeof(type) each iteration to get the next position
        0         // start at the beginning of the buffer
    );

    draw(gl, transformLocation, [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);

    var x = 0;
    var y = 0;
    var z = 0;
    function onslide() {
        var rx = [
            1, 0, 0, 0,
            0, Math.cos(x), Math.sin(x), 0,
            0, -Math.sin(x), Math.cos(x), 0,
            0, 0, 0, 1,
        ];
        var ry = [
            Math.cos(y), 0, -Math.sin(y), 0,
            0, 1, 0, 0,
            Math.sin(y), 0, Math.cos(y), 0,
            0, 0, 0, 1,
        ];
        var rz = [
            Math.cos(z), Math.sin(z), 0, 0,
            -Math.sin(z), Math.cos(z), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
        draw(gl, transformLocation, multiply4(rz, multiply4(ry, rx)));
    }

    $("#xslider").slider({
        slide: function(e, ui) {
            x = Math.PI * ui.value / 50;
            onslide();
        },
        stop: function(e, ui) {
            x = Math.PI * ui.value / 50;
            onslide();
        }
    });

    $("#yslider").slider({
        slide: function(e, ui) {
            y = Math.PI * ui.value / 50;
            onslide();
        },
        stop: function(e, ui) {
            y = Math.PI * ui.value / 50;
            onslide();
        }
    });

    $("#zslider").slider({
        slide: function(e, ui) {
            z = Math.PI * ui.value / 50;
            onslide();
        },
        stop: function(e, ui) {
            z = Math.PI * ui.value / 50;
            onslide();
        }
    });
}