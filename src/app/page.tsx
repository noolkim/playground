"use client";
// import { useEffect, useState } from "react";
// import Image from "next/image";
import "@/styles/main.scss";

export default function Home() {
    return (
        <main
            id="mainScreen"
            className="root__container root__container--videoBackground"
        >
            <div className="mainScreenContainer">
                <div className="mainScreenContainer__container">
                    <div className="mainScreenContainer__section--video">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            // poster="/video-bg.jpg"
                        >
                            <source
                                src="/dist/video/main.mp4"
                                type="video/mp4"
                            />
                        </video>
                    </div>
                    <div className="mainScreenContainer__section--content">
                        <div className="slogan__container">
                            <div className={`slogan__section--text`}>
                                {"Mobility Evolution for All,"}
                            </div>
                            <div className={`slogan__section--logo`}>
                                {"GCOO"}
                            </div>
                        </div>
                        <div></div>
                    </div>
                </div>
            </div>
        </main>
    );
}
