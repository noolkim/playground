import { useEffect, useRef, useState } from "react";

// Window 인터페이스 확장
declare global {
    interface Window {
        initNaverMap?: () => void;
        // 외부 API (naver maps) - 타입 정의 불가
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        naver: { [key: string]: any };
    }
}

export default function NaverMap() {
    const mapDomRef = useRef<HTMLDivElement>(null);

    // 맵 인스턴스 상태 관리
    const [map, setMap] = useState<unknown | null>(null);

    const appendScript = async (scriptToAppend: string): Promise<unknown> => {
        try {
            return new Promise(function (resolve, reject) {
                // 새로운 스크립트 추가
                const script = document.createElement("script");
                script.src = scriptToAppend;

                script.onload = () => {
                    resolve(script);
                };
                script.onerror = () => reject(new Error("script load error"));
                document.head.append(script);
            });
        } catch (error) {
            console.error(`script load error`, error);
        }
    };

    // initNaverMap 콜백 함수 설정
    useEffect(() => {
        window.initNaverMap = () => {
            console.log("initNaverMap");
            const mapOptions = {
                center: new window.naver.maps.LatLng(37.3595704, 127.105399),
                zoom: 10,
            };
            const map = new window.naver.maps.Map("map", mapOptions);
        };
    }, []);

    useEffect(() => {
        const loadMap = async () => {
            if (!mapDomRef.current) return;
            try {
                const loadable = await appendScript(
                    `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${"sah1dx3403"}&submodules=visualization,geocoder,drawing&callback=initNaverMap`
                );
                if (loadable) {
                    console.log("loadable map");
                }
            } catch (error) {
                console.error(error);
            }
        };
        loadMap();
    }, []);

    return (
        <>
            <div
                ref={mapDomRef}
                id="map"
                style={{ width: "100%", height: "100%" }}
            ></div>
        </>
    );
}
