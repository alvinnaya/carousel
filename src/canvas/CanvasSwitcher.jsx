import { useCanvasContext } from '../context/CanvasContext';



//ini gak penting dan harusnya ada diluar canvas ini harusnya ada di folder diluar canvas setidaknya itu rencananya tapi sementara disini dulu
const CanvasSwitcher = () => {
    const { canvases, setCanvases, activeCanvasIndex, setActiveCanvasIndex } = useCanvasContext();

    const addCanvas = () => {
        setCanvases([...canvases, {}]);
        setActiveCanvasIndex(canvases.length);
    };

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 z-50">
            {canvases.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setActiveCanvasIndex(index)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${activeCanvasIndex === index
                        ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400'
                        : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                >
                    {index + 1}
                </button>
            ))}
            <button
                onClick={addCanvas}
                className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold hover:bg-emerald-700 transition-all shadow-lg"
                title="Add New Canvas"
            >
                +
            </button>
        </div>
    );
};

export default CanvasSwitcher;
