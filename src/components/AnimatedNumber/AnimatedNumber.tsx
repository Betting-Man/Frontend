import React, { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

// 값이 바뀌면 숫자가 올라가거나 내려가듯 바뀐다
export default function AnimatedNumber({ value }: { value: number }) {
    const current = useMotionValue(value);
    const text = useTransform(current, (v) => Math.round(v).toString());

    useEffect(() => {
        const controls = animate(current, value, { duration: 0.4 });
        return () => controls.stop();
    }, [current, value]);

    return <motion.span>{text}</motion.span>;
}
