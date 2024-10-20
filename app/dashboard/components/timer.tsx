import React, { useState, useEffect } from 'react';

export default function Timer() {
    const [time, setTime] = useState(new Date());
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='opacity-50'>
            <span className='font-mono'>
                {days[time.getDay()]} {time.getDate()}/{time.getMonth() + 1}/{time.getFullYear()}
            </span>
            <h1 className='font-mono'>
                {time.toLocaleTimeString()}
            </h1>
        </div>
    );
};
