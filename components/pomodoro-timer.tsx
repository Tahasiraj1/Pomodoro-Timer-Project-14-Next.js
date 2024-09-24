"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
    MinusIcon, 
    PauseIcon, 
    PlayIcon, 
    PlusIcon, 
    RefreshCwIcon
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";

type TimerStatus = "idle" | "running" | "paused";
type SessionType = "work" | "break";

interface PomodoroState {
    workDuration: number;
    breakDuration: number;
    currentTime: number;
    currentSession: SessionType;
    timerStatus: TimerStatus;
}

export default function PomodoroTimer() {
    const [state, setState] = useState<PomodoroState>({
        workDuration: 25 * 60,
        breakDuration: 5 * 60,
        currentTime: 25 * 60,
        currentSession: "work",
        timerStatus: "idle"
    });
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const audio = useMemo(() => new Audio('/level-up-191997.mp3'), []);

    const handleSessionSwitch = useCallback(() => {
        setState((prevState) => {
            const isWorkSession = prevState.currentSession === "work";
            return {
                ...prevState,
                currentSession: isWorkSession ? "break" : "work",
                currentTime: isWorkSession ? prevState.breakDuration : prevState.workDuration,
            };
        });
    }, [setState]);

    useEffect(() => {
        if (state.timerStatus === 'running' && state.currentTime > 0) {
            timerRef.current = setInterval(() => {
                setState((prevState) => ({
                    ...prevState,
                    currentTime: prevState.currentTime - 1,
                }));
            }, 1000);
        } else if (state.currentTime === 0) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            const audioInterval = setInterval(() => {
                audio.play();
            }, 1000);
            setTimeout(() => {
                clearInterval(audioInterval);
                audio.pause();
                audio.currentTime = 0;
                handleSessionSwitch();
            }, 7000)
        }
        return () => clearInterval(timerRef.current as NodeJS.Timeout);
    }, [state.timerStatus, state.currentTime, handleSessionSwitch, audio]);

    const handleStartPause = (): void => {
        if (state.timerStatus === "running") {
            setState((prevState) => ({
                ...prevState,
                timerStatus: "paused",
            }));
            clearInterval(timerRef.current as NodeJS.Timeout);
        } else {
            setState((prevState) => ({
                ...prevState,
                timerStatus: "running",
            }));
        }
    };

    const handleReset = (): void => {
        clearInterval(timerRef.current as NodeJS.Timeout);
        setState((prevState) => ({
            ...prevState,
            currentTime: prevState.workDuration,
            currentSession: "work",
            timerStatus: "idle",
        }));
    };

    const handleDurationChange = (increment: boolean): void => {
        setState((prevState) => {
            const durationChange = increment ? 60 : -60;
            const newTime = Math.max(60, prevState.currentTime + durationChange);

            if (prevState.currentSession === "work") {
                return {
                    ...prevState,
                    workDuration: newTime,
                    currentTime: newTime,
                }; 
            } else {
                return {
                    ...prevState,
                    breakDuration: newTime,
                    currentTime: newTime,
                };
            }
        });
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"
        style={{
            backgroundImage: `url('/clock3.jpg')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
        }}
        >
            <Card className="w-full max-w-md p-6 bg-white/90 shadow-gray-700 shadow-inner rounded-3xl">
                <div className="flex flex-col items-center justify-center gap-6">
                    <h1 className="text-5xl font-serif">Pomodoro Timer</h1>
                    <p className="text-xl font-sans">A timer for the Pomodoro Technique</p>
                    <div className="flex flex-col items-center gap-4">
                        {/* Display current session (work or break) */}
                        <div className="text-2xl font-medium">
                            <span
                            className="transition duration-1000 text-3xl animate-pulse"
                            >
                                {state.currentSession === "work" ? "Work" : "Break"}
                            </span>
                        </div>
                        {/* Display formatted time */}
                        <div className="text-8xl font-bold">
                            {formatTime(state.currentTime)}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Buttons to change duration, start/pause, and reset timer */}
                        <Button
                        className="active:scale-90 transition-transform duration-300 rounded-xl hover:bg-gray-300 border-b-black border-t-black border-l-gray-300  border-r-gray-300"
                        variant="outline"
                        size="icon"
                        onClick={() => handleDurationChange(false)}
                        >
                            <MinusIcon className="h-6 w-6" />
                        </Button>
                        <Button
                        className="active:scale-90 transition-transform duration-300 rounded-xl hover:bg-gray-300 border-b-black border-t-black border-l-gray-300  border-r-gray-300"
                        variant="outline"
                        size="icon"
                        onClick={() => handleDurationChange(true)}
                        >
                            <PlusIcon className="h-6 w-6" />
                        </Button>
                        <Button
                        className="active:scale-90 transition-transform duration-300 rounded-xl hover:bg-gray-300 border-b-black border-t-black border-l-gray-300  border-r-gray-300"
                        variant="outline"
                        size="icon"
                        onClick={handleStartPause}
                        >
                            {state.timerStatus === "running" ? (
                                <PauseIcon className="h-6 w-6" />
                            ) : (
                                <PlayIcon className="h-6 w-6" />
                            )}
                        </Button>
                        <Button
                        className="active:animate-spin transition-transform rounded-xl hover:bg-gray-300 border-b-black border-t-black border-l-gray-300  border-r-gray-300"
                        variant="outline"
                        size="icon"
                        onClick={handleReset}
                        >
                            <RefreshCwIcon className="h-6 w-6" />
                        </Button>
                    </div>
                    <div className="p-6">
                        {/* AlertDialog for explaining the Pomodoro Technique */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                className="rounded-2xl hover:bg-gray-700 active:scale-95 transition-transform duration-300"
                                variant="default">What is Pomodoro Technique?</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card w-full max-w-2xl p-4 md:p-6">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-black">
                                        <strong> ➡️ Explanation of Pomodoro Technique 🔥</strong>
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        <strong>The Pomodoro Technique</strong>
                                        {`is a time management method that uses a timer to break work into 
                                        intervals called Pomodoros. The Pomodoro timer is traditionally set for 25 minutes,
                                        but can be customized to fit your needs. The basic steps are:`}{" "}
                                        <br />
                                        <br />
                                        <ol>
                                            <strong>
                                                <li>1. Select a single task to focus on.</li>
                                                <li>
                                                    2. Set a timer for 25-30 min. and work continuosly
                                                    until the timer goes off.
                                                </li>
                                                <li>
                                                3. Take a productive 5 min. break-walk around, get a
                                                snack, relax.
                                                </li>
                                                <li>4. Repeat steps 2 & 3 for 4 rounds.</li>
                                                <li>5. Take a longer (20-30 min.) break.</li>
                                            </strong>
                                        </ol>
                                        <br />
                                        <Button
                                        className="rounded-3xl hover:bg-gray-700 active:scale-95 transition-transform duration-0"
                                        >
                                            {" "}
                                            <a
                                            href="https://todoist.com/productivity-methods/pomodoro-technique"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            >
                                                Click Here to Read more!
                                            </a>{" "}
                                        </Button>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel
                                    className="text-gray-900 rounded-3xl border-gray-300 hover:bg-gray-400 active:scale-95 transition-transform duration-75"
                                    >
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                    className="rounded-3xl hover:bg-gray-700 active:scale-95 transition-transform duration-75"
                                    >
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </Card>
        </div>
    );
}
