import React, { useRef, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { EventBus } from "./EventBus";

const Canvas = (props) => {
    const [image, setImage] = useState("");

    const { draw } = props;

    const canvasRef = useRef(null);

    const onStartClick = () => {
        EventBus.dispatch("drawing", true);
    };

    const onPauseClick = () => {
        console.log("Pause");
        EventBus.dispatch("drawing", false);
    };

    const onStopClick = () => {
        console.log("Stop & Save");
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        EventBus.dispatch("drawing", false);
        var img = canvas.toDataURL("image/png");
        console.log(img);
        setImage(img);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let frameCount = 0;
        let animationFrameId;
        let drawing = false;

        EventBus.on("drawing", (params) => {
            drawing = params;
        });

        //Our draw came here
        const render = () => {
            frameCount++;
            if (draw && ctx && drawing) {
                draw(ctx);
            }
            animationFrameId = window.requestAnimationFrame(render);
        };
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [draw]);

    return (
        <>
            <canvas ref={canvasRef} width="1920" height="1080" />
            <br />
            <Button onClick={onStartClick}>Start</Button>
            <Button onClick={onPauseClick}>Pause</Button>
            <Button onClick={onStopClick}>Stop &amp; Save</Button>
            <img src={image} style={{ height: 100 }}></img>
        </>
    );
};

export default Canvas;
