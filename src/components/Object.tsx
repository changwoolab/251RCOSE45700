export function Object({
    mode,
    startPoint,
    endPoint,
    zOrder,
    color,
    }: {
    mode: "line" | "";
    startPoint: { x: number; y: number } | null;
    endPoint: { x: number; y: number } | null;
    zOrder: number | null;
    color: string | null;
    }) {
    return (
        <div className="absolute top-0 left-0 bg-white border border-black rounded-md p-2">
        <div>Mode: {mode}</div>
        <div>Start Point: {startPoint?.x}, {startPoint?.y}</div>
        <div>End Point: {endPoint?.x}, {endPoint?.y}</div>
        <div>Z-Order: {zOrder}</div>
        <div>Color: {color}</div>
        </div>
    );
}
