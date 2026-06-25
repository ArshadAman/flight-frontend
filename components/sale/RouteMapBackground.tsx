"use client";

import { useMemo } from "react";
import { Plane } from "lucide-react";

type MapPoint = { lat: number; lng: number };

type RouteMapBackgroundProps = {
    origin: MapPoint | null;
    destination: MapPoint | null;
};

function projectPoint(
    lat: number,
    lng: number,
    bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
) {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x: Math.min(96, Math.max(4, x)), y: Math.min(94, Math.max(6, y)) };
}

function arcPath(x1: number, y1: number, x2: number, y2: number) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const lift = Math.min(18, dist * 0.35);
    const cx = mx - (dy / dist) * lift;
    const cy = my + (dx / dist) * lift;
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function planeTransform(x1: number, y1: number, x2: number, y2: number) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const lift = Math.min(18, dist * 0.35);
    const cx = mx - (dy / dist) * lift;
    const cy = my + (dx / dist) * lift;
    const t = 0.55;
    const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
    const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
    const angle = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;
    return { x: px, y: py, angle };
}

export function RouteMapBackground({ origin, destination }: RouteMapBackgroundProps) {
    const bounds = useMemo(() => {
        if (origin && destination) {
            const minLat = Math.min(origin.lat, destination.lat);
            const maxLat = Math.max(origin.lat, destination.lat);
            const minLng = Math.min(origin.lng, destination.lng);
            const maxLng = Math.max(origin.lng, destination.lng);
            const latPad = Math.max(4, (maxLat - minLat) * 0.45);
            const lngPad = Math.max(8, (maxLng - minLng) * 0.45);
            return {
                minLat: minLat - latPad,
                maxLat: maxLat + latPad,
                minLng: minLng - lngPad,
                maxLng: maxLng + lngPad,
            };
        }
        if (origin) {
            return {
                minLat: origin.lat - 12,
                maxLat: origin.lat + 12,
                minLng: origin.lng - 18,
                maxLng: origin.lng + 18,
            };
        }
        return { minLat: -10, maxLat: 50, minLng: 60, maxLng: 140 };
    }, [origin, destination]);

    const mapCenter = useMemo(() => {
        if (origin && destination) {
            return {
                lat: (origin.lat + destination.lat) / 2,
                lng: (origin.lng + destination.lng) / 2,
            };
        }
        if (origin) return origin;
        return { lat: 20, lng: 80 };
    }, [origin, destination]);

    const zoom = origin && destination ? 4 : origin ? 5 : 2;
    const mapQuery =
        origin && destination
            ? `${mapCenter.lat},${mapCenter.lng}`
            : origin
            ? `${origin.lat},${origin.lng}`
            : "South Asia";

    const originPos = origin ? projectPoint(origin.lat, origin.lng, bounds) : null;
    const destPos = destination ? projectPoint(destination.lat, destination.lng, bounds) : null;
    const showRoute = originPos && destPos;

    const plane = showRoute
        ? planeTransform(originPos.x, originPos.y, destPos.x, destPos.y)
        : null;

    return (
        <div className="absolute inset-0 overflow-hidden bg-[#E8F4F8]">
            <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=p&z=${zoom}&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Route map"
                className="absolute inset-0 h-full w-full scale-[1.02] opacity-90 saturate-[0.85]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/30" />

            {showRoute && (
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <path
                        d={arcPath(originPos.x, originPos.y, destPos.x, destPos.y)}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="0.35"
                        strokeDasharray="1.8 1.4"
                        strokeLinecap="round"
                    />
                    <circle cx={originPos.x} cy={originPos.y} r="1.1" fill="#D60D26" stroke="white" strokeWidth="0.35" />
                    <circle cx={destPos.x} cy={destPos.y} r="1.1" fill="#2563eb" stroke="white" strokeWidth="0.35" />
                    <circle cx={destPos.x} cy={destPos.y} r="0.45" fill="white" />
                </svg>
            )}

            {showRoute && plane && (
                <div
                    className="pointer-events-none absolute"
                    style={{
                        left: `${plane.x}%`,
                        top: `${plane.y}%`,
                        transform: `translate(-50%, -50%) rotate(${plane.angle}deg)`,
                    }}
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-[#D60D26]/30">
                        <Plane className="h-4 w-4 fill-[#D60D26] text-[#D60D26]" />
                    </div>
                </div>
            )}

            {originPos && !destination && (
                <div
                    className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D60D26] ring-2 ring-white"
                    style={{ left: `${originPos.x}%`, top: `${originPos.y}%` }}
                />
            )}
        </div>
    );
}
