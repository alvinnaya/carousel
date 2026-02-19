import CanvasCreation from "./CanvasCreation"
import CanvasViewController from "./CanvasViewController"
import CanvasControllerStyling from "./CanvasControllerStyling"
import CanvasConfig from "./CanvasConfig"
import CanvasStateHandler from "./CanvasStateHandler"
import CanvasCopyPasteHandler from "./CanvasCopyPasteHandler"
import { useEffect } from "react";
import CanvasSwitcher from "./CanvasSwitcher"


export default function Canvas() {

    console.log("canvas");

    useEffect(() => {
        console.log("canvas useEffect")
    }, [])
    return (
        <div className=" w-full h-full flex justify-center bg-black no-browser-zoom  p-0 m-0 overflow-hidden relative">

            <CanvasControllerStyling />
            <CanvasConfig />
            <CanvasStateHandler />
            <CanvasCopyPasteHandler />
            <CanvasSwitcher />
            <CanvasCreation
                width={1080}
                height={1080}
            />
            <CanvasViewController />


        </div>
    )
}