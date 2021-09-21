import React, { useRef, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Canvas from "./Canvas";
import { EventBus } from "./EventBus";

const Spectrum = (props) => {
    const canvasRef = useRef(null);

    const [drawFn, setDrawFn] = useState(null);

    const [drawing, setDrawing] = useState(false);

    var freqsData;
    var timeData;

    var analyser = null;

    var volumeData = [];

    for (var i = 0; i < 2000; i++) {
        volumeData.push(0);
    }

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices.forEach((d, i) => console.log(d.label, i));
            navigator.mediaDevices
                .getUserMedia({
                    audio: {
                        deviceId: devices[0].deviceId,
                    },
                })
                .then((stream) => {
                    const context = new (window.AudioContext ||
                        window.webkitAudioContext)();
                    analyser = context.createAnalyser();
                    const source = context.createMediaStreamSource(stream);
                    source.connect(analyser);
                    analyser.connect(context.destination);
                    freqsData = new Uint8Array(analyser.frequencyBinCount);
                    analyser.fftSize = 2048;
                    timeData = new Uint8Array(2048);
                });
        });
    }, []);

    const draw = (ctx) => {
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "black";
        ctx.stroke();
        analyser.getByteFrequencyData(freqsData);
        analyser.getByteTimeDomainData(timeData);
        ctx.beginPath();
        let radius = 75;
        let bars = 100;
        if (!analyser && !drawing) {
            return;
        }

        for (var i = 0; i < bars; i++) {
            let radians = (Math.PI * 2) / bars;
            let bar_height = freqsData[i] * 2;

            let x = ctx.canvas.width / 2 + Math.sin(radians * i) * radius;
            let y = ctx.canvas.height / 2 + Math.cos(radians * i) * radius;
            let x_end =
                ctx.canvas.width / 2 +
                Math.sin(radians * i) * (radius + bar_height);
            let y_end =
                ctx.canvas.height / 2 +
                Math.cos(radians * i) * (radius + bar_height);
            let colour =
                "rgb(" +
                100 +
                ", " +
                (200 - freqsData[i]) +
                ", " +
                freqsData[i] * 2 +
                ")";
            ctx.strokeStyle = colour;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x_end, y_end);
            ctx.stroke();
        }

        let color = "rgb(255,0,0)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 128);
        var drawing = false;
        let seenNeg = false;
        let scalex = ctx.canvas.width / 2048;
        let x = 0;
        let sumNeg = 0;
        let sumPos = 0;
        for (var i = 0; i < 2048; i++) {
            let v = timeData[i] - 128;
            if (v < 0) {
                seenNeg = true;
                sumNeg = sumNeg + v * -1;
            } else {
                sumPos = sumPos + v;
                if (seenNeg) {
                    drawing = true;
                }
            }
            let y = timeData[i];
            if (drawing) {
                x = x + scalex;
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        let avg = (sumNeg + sumNeg) / 2048;

        volumeData.push(avg);
        if (volumeData.length > ctx.canvas.width) {
            volumeData.shift();
        }

        for (var i = 0; i < 2000; i = i + 2) {
            ctx.beginPath();
            ctx.moveTo(i, 952 - volumeData[i]);
            ctx.lineTo(i, 952 + volumeData[i]);
            ctx.stroke();
        }
    };

    return <Canvas draw={draw} />;
};

export default Spectrum;
