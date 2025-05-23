import React, { useState } from "react";
import "./TimeSegmentsBlock.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import gsap from "gsap";
import { TimeSegmentType } from "@/types";

interface TimeSegmentsBlockProps {
  segments: TimeSegmentType[];
}

const RADIUS = 120;
const CENTER = 150;

const TimeSegmentsBlock = ({ segments }: TimeSegmentsBlockProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const getCirclePoints = (count: number, radius: number) => {
    const angleStep = (2 * Math.PI) / count;
    return Array.from({ length: count }, (_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      };
    });
  };

  const points = getCirclePoints(segments.length, RADIUS);

  const onSegmentChange = (i: number) => {
    if (i === activeIndex) return;
    gsap.fromTo(
      `#slider-${i}`,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
    setActiveIndex(i);
  };
  return (
    <div className="timeSegmentsBlock">
      <div className="circleNav">
        <svg width={CENTER * 2} height={CENTER * 2}>
          <g transform={`translate(${CENTER},${CENTER})`}>
            {/* Линии между точками */}
            {points.map((pt, i) => (
              <line
                key={i}
                x1={0}
                y1={0}
                x2={pt.x}
                y2={pt.y}
                className="line"
              />
            ))}
            {/* Точки */}
            {points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={16}
                className={i === activeIndex ? "activeDot" : "dot"}
                onClick={() => onSegmentChange(i)}
                style={{ cursor: "pointer" }}
              />
            ))}
          </g>
        </svg>
        {/* Числа и подписи */}
        <div className="labels">
          {points.map((pt, i) => (
            <div
              key={i}
              className={i === activeIndex ? "activeLabel" : "label"}
              style={{
                left: CENTER + pt.x - 28,
                top: CENTER + pt.y - 28,
              }}
              onClick={() => onSegmentChange(i)}
            >
              <div className="value">{segments[i].value}</div>
              <div className="segmentLabel">{segments[i].label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Слайдер событий для активного сегмента */}
      <div className="sliderWrapper">
        <div id={`slider-${activeIndex}`}>
          <Swiper
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              600: { slidesPerView: 2 },
            }}
          >
            {segments[activeIndex].events.map((event) => (
              <SwiperSlide key={event.id}>
                <div className="eventCard">
                  <div className="eventTitle">{event.title}</div>
                  <div className="eventDesc">{event.description}</div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default TimeSegmentsBlock;
