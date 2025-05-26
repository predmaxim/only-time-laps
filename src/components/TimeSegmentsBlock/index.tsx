import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Swiper,
  SwiperSlide,
  type SwiperRef as SwiperRefType,
} from "swiper/react"; // Import SwiperRefType
import { Navigation } from "swiper/modules";
import gsap from "gsap"; // Убедитесь, что GSAP импортирован
import "swiper/css";
import "swiper/css/navigation";
import  * as styles from "./TimeSegmentsBlock.module.scss"; // Заменил старый импорт CSS на SCSS-модуль
import { TimeSegmentType, Event } from '@/types';

interface TimeSegmentsBlockProps {
  segments: TimeSegmentType[];
}

const TimeSegmentsBlock: React.FC<TimeSegmentsBlockProps> = ({
  segments: initialSegments,
}) => {

  const [segments] = useState<TimeSegmentType[]>(initialSegments);
  const allEventsFromSegments = useMemo(
    () => segments.flatMap((segment) => segment.events),
    [segments]
  );
  const [events] = useState<Event[]>(allEventsFromSegments);
  const [activeIndex, setActiveIndex] = useState(0);
  const [secondaryYearIndex, setSecondaryYearIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const rotatingGroupRef = useRef<SVGGElement>(null);
  const activeLabelRef = useRef<SVGTextElement>(null);
  const swiperRef = useRef<SwiperRefType | null>(null);
  const currentGsapRotationRef = useRef(0);

  const svgSize = 380;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const circleRadius = centerX * 0.75;

  const dotCoords = useMemo(() => {
    if (segments.length === 0) return [];
    return segments.map((_, index) => {
      const angle = (index / segments.length) * (2 * Math.PI) - Math.PI / 2;
      return {
        x: centerX + circleRadius * Math.cos(angle),
        y: centerY + circleRadius * Math.sin(angle),
      };
    });
  }, [segments, centerX, centerY, circleRadius]);

  const numSegments = segments.length;
  const anglePerSegmentDegrees = numSegments > 0 ? 360 / numSegments : 0;
  const initialAngleOfActiveDot = activeIndex * anglePerSegmentDegrees;
  const targetAngleOnScreen = 45;
  const targetAngleOnScreenRad = (targetAngleOnScreen * Math.PI) / 180;
  const rotationDegrees = targetAngleOnScreen - initialAngleOfActiveDot;

  useEffect(() => {
    if (
      segments.length > 0 &&
      rotatingGroupRef.current &&
      dotCoords[activeIndex]
    ) {
      if (activeLabelRef.current) {
        gsap.set(activeLabelRef.current, { opacity: 0 });
      }

      const actualCurrentGsapRotation = currentGsapRotationRef.current;
      const targetCanonicalRotation = rotationDegrees;

      let delta = targetCanonicalRotation - actualCurrentGsapRotation;

      let shortestDelta = delta % 360;
      if (shortestDelta > 180) {
        shortestDelta -= 360;
      } else if (shortestDelta < -180) {
        shortestDelta += 360;
      }

      if (shortestDelta === -180) {
        shortestDelta = 180;
      }

      const newGsapTargetRotation = actualCurrentGsapRotation + shortestDelta;
      currentGsapRotationRef.current = newGsapTargetRotation;

      gsap.to(rotatingGroupRef.current, {
        rotation: newGsapTargetRotation,
        transformOrigin: "50% 50%",
        duration: 0.7,
        ease: "power3.out",
        onComplete: () => {
          if (activeLabelRef.current) {
            gsap.to(activeLabelRef.current, {
              opacity: 1,
              duration: 0.5,
              ease: "power2.inOut",
            });
          }
        },
      });
    } else {
      if (activeLabelRef.current) {
        gsap.set(activeLabelRef.current, { opacity: 0 });
      }
    }
  }, [activeIndex, segments, rotationDegrees, dotCoords]);

  const onDotClick = (i: number) => {
    if (i === activeIndex) return;
    setActiveIndex(i);
  };

  useEffect(() => {
    if (segments.length > 0) {
      setSecondaryYearIndex((activeIndex + 1) % segments.length);
    } else {
      setSecondaryYearIndex(0);
    }
  }, [segments, activeIndex]);

  const handleCircularPrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? segments.length - 1 : prevIndex - 1
    );
  };

  const handleCircularNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % segments.length);
  };

  const primaryYear = segments[activeIndex]?.value;
  const secondaryYearValue = segments[secondaryYearIndex]?.value;

  const startYear =
    primaryYear !== undefined && secondaryYearValue !== undefined
      ? Math.min(primaryYear, secondaryYearValue)
      : primaryYear;
  const endYear =
    primaryYear !== undefined && secondaryYearValue !== undefined
      ? Math.max(primaryYear, secondaryYearValue)
      : secondaryYearValue;

  const sliderEvents = useMemo(() => {
    if (
      primaryYear === undefined ||
      secondaryYearValue === undefined ||
      !segments.length
    )
      return [];

    const currentStartYear = Math.min(primaryYear, secondaryYearValue);
    const currentEndYear = Math.max(primaryYear, secondaryYearValue);

    const eventsInRange = [];
    for (let year = currentStartYear; year <= currentEndYear; year++) {
      const segmentForYear = segments.find((seg) => seg.value === year);
      if (segmentForYear) {
        eventsInRange.push(...segmentForYear.events);
      }
    }
    return eventsInRange.sort((a, b) => a.year - b.year);
  }, [startYear, endYear, segments, primaryYear, secondaryYearValue]);

  if (segments.length === 0) {
    return <div>Нет данных для отображения.</div>;
  }

  const startYearToDisplay = Math.min(
    startYear ?? Infinity,
    endYear ?? Infinity
  );
  const endYearToDisplay = Math.max(
    startYear ?? -Infinity,
    endYear ?? -Infinity
  );

  return (
    <div className={styles.timeSegmentsBlock}>
      <div className={styles.blockTitleWrapper}>
        <div className={styles.decorativeLine}></div>
        <h2 className={styles.blockTitle}>Исторические даты</h2>
      </div>
      <div className={styles.stickyCircularNavArea}>
        <div className={styles.circleNav}>
          <svg viewBox={`0 0 ${svgSize} ${svgSize}`} overflow="visible">
            <circle
              cx={centerX}
              cy={centerY}
              r={circleRadius}
              fill="none"
              stroke="#d1d8e0"
              strokeWidth={2}
              className={styles['perimeter-circle']}
            />
            <g ref={rotatingGroupRef}>
              {dotCoords.map((coord, index) => (
                <line
                  key={`line-${segments[index].id}`}
                  x1={centerX}
                  y1={centerY}
                  x2={coord.x}
                  y2={coord.y}
                  className={styles.line}
                />
              ))}
              {segments.map((segment, index) => {
                const pointX = dotCoords[index].x;
                const pointY = dotCoords[index].y;
                const isHovered =
                  hoveredIndex === index && activeIndex !== index;
                const isActive = activeIndex === index;

                const eventCountDivStyle: React.CSSProperties = {
                  width: "36px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "PT Sans, sans-serif",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#5669FF",
                  userSelect: "none",
                  transform: `rotate(${-rotationDegrees}deg)`,
                  transformOrigin: "center",
                };

                return (
                  <g
                    key={`segment-visual-${segment.id}`}
                    onMouseEnter={() => {
                      if (!isActive) setHoveredIndex(index);
                    }}
                    onMouseLeave={() => {
                      if (!isActive) setHoveredIndex(null);
                    }}
                    onClick={() => {
                      if (!isActive) onDotClick(index);
                    }}
                    style={{ cursor: !isActive ? "pointer" : "default" }}
                  >
                    <circle
                      cx={pointX}
                      cy={pointY}
                      r={18}
                      fill="transparent"
                    />
                    {isActive && (
                      <g>
                        <circle
                          cx={pointX}
                          cy={pointY}
                          r={18}
                          fill="#fff"
                          stroke="#5669FF"
                          strokeWidth={2}
                          style={{
                            filter:
                              "drop-shadow(0 2px 8px rgba(86,105,255,0.10))",
                            pointerEvents: "none",
                          }}
                        />
                        <foreignObject
                          x={pointX - 18}
                          y={pointY - 12}
                          width={36}
                          height={24}
                          style={{ pointerEvents: "none" }}
                        >
                          <div style={eventCountDivStyle}>
                            {segment.events.length}
                          </div>
                        </foreignObject>
                      </g>
                    )}
                    {!isActive && (
                      <g>
                        <circle
                          cx={pointX}
                          cy={pointY}
                          r={isHovered ? 18 : 6}
                          fill={isHovered ? "#fff" : "#d1d8e0"}
                          stroke={isHovered ? "#5669FF" : "none"}
                          strokeWidth={isHovered ? 2 : 0}
                          style={{
                            transition:
                              "r 0.3s ease, fill 0.3s ease, stroke 0.3s ease, stroke-width 0.3s ease, filter 0.3s ease",
                            filter: isHovered
                              ? "drop-shadow(0 2px 8px rgba(86,105,255,0.10))"
                              : "none",
                            pointerEvents: "none",
                          }}
                        />
                        <foreignObject
                          x={pointX - 18}
                          y={pointY - 12}
                          width={36}
                          height={24}
                          style={{
                            opacity: isHovered ? 1 : 0,
                            transition: "opacity 0.3s ease 0.1s",
                            pointerEvents: "none",
                          }}
                        >
                          <div style={eventCountDivStyle}>
                            {segment.events.length}
                          </div>
                        </foreignObject>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
            {segments.length > 0 && dotCoords[activeIndex] && (
              <text
                ref={activeLabelRef}
                key={`svg-label-${segments[activeIndex].id}`}
                x={
                  centerX + circleRadius * Math.sin(targetAngleOnScreenRad) + 38
                }
                y={centerY - circleRadius * Math.cos(targetAngleOnScreenRad)}
                className={styles['active-svg-segment-label']}
                textAnchor="start"
                dominantBaseline="central"
                style={{ opacity: 0 }}
              >
                {segments[activeIndex].category}
              </text>
            )}
          </svg>
          <div className={styles.centerValue}>
            <span className={styles['value-main']}>
              {startYearToDisplay === Infinity ? "..." : startYearToDisplay}
            </span>
            <span className={styles['value-secondary']}>
              {endYearToDisplay === -Infinity ? "..." : endYearToDisplay}
            </span>
          </div>
        </div>
        {segments.length > 1 && (
          <div className={styles.circularNavControls}>
            <div className={styles.circularNavPagination}>
              {activeIndex + 1} / {segments.length}
            </div>
            <div className={styles.circularNavButtons}>
              <button
                onClick={handleCircularPrev}
                className={`${styles['circular-nav-button']} prev`} // Используем "prev" как строку
              >
                &lt;
              </button>
              <button
                onClick={handleCircularNext}
                className={`${styles['circular-nav-button']} next`} // Используем "next" как строку
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
      <div className={styles.sliderSection}>
        <div className="swiperNavContainer"> {/* Используем "swiperNavContainer" как строку */}
          <div className={`swiper-button-prev ${styles['custom-swiper-button-prev']}`}></div>
          <div className={`swiper-button-next ${styles['custom-swiper-button-next']}`}></div>
        </div>
        <div className={styles.sliderWrapper}>
          <div id={`slider-${activeIndex}`}>
            <Swiper
              ref={swiperRef}
              modules={[Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              navigation={{
                nextEl: ".custom-swiper-button-next",
                prevEl: ".custom-swiper-button-prev",
              }}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {sliderEvents.map((event) => (
                <SwiperSlide key={event.id}>
                  <div className={styles.eventCard}>
                    <div className={styles.eventYear}>{event.year}</div>
                    <div className={styles.eventDesc}>{event.description}</div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSegmentsBlock;
