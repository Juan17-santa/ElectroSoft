import { useEffect, useRef, useState } from "react";

export const useCountUp = (target, ms = 900) => {
    const [val, setVal] = useState(0);
    const raf = useRef(null);
    useEffect(() => {
        const t0 = performance.now();
        const step = (t) => {
            const p = Math.min((t - t0) / ms, 1);
            setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf.current = requestAnimationFrame(step);
        };
        raf.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf.current);
    }, [target, ms]);
    return val;
}