import CanvasCreation from "./CanvasCreation"
import CanvasViewController from "./CanvasViewController"
import CanvasControllerStyling from "./CanvasControllerStyling"
import CanvasConfig from "./CanvasConfig"
import CanvasStateHandler from "./CanvasStateHandler"
import CanvasCopyPasteHandler from "./CanvasCopyPasteHandler"
import CanvasTextScaleNormalizer from "./CanvasTextScaleNormalizer"
import CanvasPreviewSyncronizer from "./CanvasPreviewSyncronizer"
import CanvasContextMenu from "./CanvasContextMenu"
import CanvasSmartGuide from "./CanvasSmartGuide"
import CanvasSmartGuideScale from "./CanvasSmartGuideScale"
import { useEffect } from "react";


export default function Canvas() {

    console.log("canvas");

    useEffect(() => {
        console.log("canvas useEffect")
    }, [])
    return (
        <div className=" w-full h-full flex justify-center bg-surface no-browser-zoom  p-0 m-0 overflow-hidden relative">

            <CanvasControllerStyling />
            <CanvasConfig />
            <CanvasStateHandler />
            <CanvasPreviewSyncronizer />
            <CanvasCopyPasteHandler />
            <CanvasTextScaleNormalizer />

            <CanvasCreation
                width={1080}
                height={1080}
            />
            <CanvasViewController />
            <CanvasContextMenu />
            <CanvasSmartGuide />
            <CanvasSmartGuideScale />



        </div>
    )
}
