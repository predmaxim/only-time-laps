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
import "./TimeSegmentsBlock.css";
import { TimeSegmentType, Event } from "../../types";

interface TimeSegmentsBlockProps {
  segments: TimeSegmentType[];
}

const TimeSegmentsBlock: React.FC<TimeSegmentsBlockProps> = ({
  segments: initialSegments,
}) => {
  const [segments] = useState<TimeSegmentType[]>(initialSegments);
  // Assuming events are part of segments, otherwise, this needs to be derived or imported differently.
  // For now, let's flatten all events from all segments for a general pool if needed,
  // or adjust based on how 'demoEvents' was intended to be used.
  // If 'demoEvents' was a separate list, it's not available with the current mock structure.
  // Let's assume for now that all relevant events are within the segments.
  const allEventsFromSegments = useMemo(
    () => segments.flatMap((segment) => segment.events),
    [segments]
  );
  // If you had a separate demoEvents array and need it, the mock structure or import needs adjustment.
  // For this fix, I'll use events from segments.
  const [events] = useState<Event[]>(allEventsFromSegments); // Using events from segments
  const [activeIndex, setActiveIndex] = useState(0);
  const [secondaryYearIndex, setSecondaryYearIndex] = useState(0); // Declare secondaryYearIndex state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null); // Added for hover effect
  const rotatingGroupRef = useRef<SVGGElement>(null);
  const activeLabelRef = useRef<SVGTextElement>(null); // Реф для метки активной категории
  const swiperRef = useRef<SwiperRefType | null>(null); // Declare swiperRef
  const currentGsapRotationRef = useRef(0); // Хранит текущее целевое значение вращения для GSAP

  // Предполагаемые константы и расчеты для SVG (могут отличаться в вашем коде)
  const svgSize = 380; // Размер SVG из CSS (.circleNav)
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const circleRadius = centerX * 0.75; // Радиус для расположения точек (пример)

  const dotCoords = useMemo(() => {
    if (segments.length === 0) return [];
    return segments.map((_, index) => {
      // Initial angle calculation: 0th segment at top (-Math.PI / 2)
      // The GSAP rotation will adjust the group so activeIndex is at targetAngleOnScreen (45 deg)
      const angle = (index / segments.length) * (2 * Math.PI) - Math.PI / 2;
      return {
        x: centerX + circleRadius * Math.cos(angle),
        y: centerY + circleRadius * Math.sin(angle),
      };
    });
  }, [segments, centerX, centerY, circleRadius]);

  // вычисляем rotationDegrees вне useEffect, чтобы использовать для обратного поворота лейбла
  const numSegments = segments.length;
  const anglePerSegmentDegrees = numSegments > 0 ? 360 / numSegments : 0;
  const initialAngleOfActiveDot = activeIndex * anglePerSegmentDegrees;
  const targetAngleOnScreen = 45;
  const targetAngleOnScreenRad = (targetAngleOnScreen * Math.PI) / 180; // Угол в радианах для расчетов
  const rotationDegrees = targetAngleOnScreen - initialAngleOfActiveDot;

  useEffect(() => {
    if (
      segments.length > 0 &&
      rotatingGroupRef.current &&
      dotCoords[activeIndex]
    ) {
      // Немедленно скрыть метку перед началом анимации круга
      if (activeLabelRef.current) {
        gsap.set(activeLabelRef.current, { opacity: 0 });
      }

      // НЕ используем clearProps: "transform", чтобы GSAP анимировал от текущего состояния вращения
      // gsap.set(rotatingGroupRef.current, { clearProps: "transform" });

      const actualCurrentGsapRotation = currentGsapRotationRef.current;
      // rotationDegrees - это канонический целевой угол для группы (например, от -315 до 45)
      const targetCanonicalRotation = rotationDegrees;

      let delta = targetCanonicalRotation - actualCurrentGsapRotation;

      // Нормализация delta до кратчайшего пути [-180, 180]
      let shortestDelta = delta % 360;
      if (shortestDelta > 180) {
        shortestDelta -= 360;
      } else if (shortestDelta < -180) {
        shortestDelta += 360;
      }

      // Если расстояние одинаковое (-180 или 180), выбираем по часовой стрелке (+180)
      if (shortestDelta === -180) {
        shortestDelta = 180;
      }

      const newGsapTargetRotation = actualCurrentGsapRotation + shortestDelta;
      currentGsapRotationRef.current = newGsapTargetRotation; // Обновляем реф новым целевым значением GSAP

      gsap.to(rotatingGroupRef.current, {
        rotation: newGsapTargetRotation, // Анимируем к новому "раскрученному" значению
        transformOrigin: "50% 50%",
        duration: 0.7,
        ease: "power3.out",
        onComplete: () => {
          // Плавно показать метку после завершения анимации круга
          if (activeLabelRef.current) {
            gsap.to(activeLabelRef.current, {
              opacity: 1,
              duration: 0.5, // Длительность появления метки
              ease: "power2.inOut",
            });
          }
        },
      });
    } else {
      // Если сегментов нет или другие условия не выполнены, убедиться, что метка скрыта
      if (activeLabelRef.current) {
        gsap.set(activeLabelRef.current, { opacity: 0 });
      }
    }
  }, [activeIndex, segments, rotationDegrees, dotCoords]); // Добавлены dotCoords в зависимости

  // Обработчик клика по точке на круге
  const onDotClick = (i: number) => {
    if (i === activeIndex) return;
    setActiveIndex(i);
    // setSecondaryYearIndex не нужно здесь, т.к. useEffect [segments, activeIndex] это сделает
  };

  // Обновление secondaryYearIndex при изменении activeIndex или segments
  useEffect(() => {
    if (segments.length > 0) {
      setSecondaryYearIndex((activeIndex + 1) % segments.length);
    } else {
      setSecondaryYearIndex(0); // Или другое значение по умолчанию, если сегментов нет
    }
  }, [segments, activeIndex]);

  // Обработчики для кнопок навигации кругового слайдера
  const handleCircularPrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? segments.length - 1 : prevIndex - 1
    );
  };

  const handleCircularNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % segments.length);
  };

  // Определяем основной и вторичный год для отображения в центре
  const primaryYear = segments[activeIndex]?.value;
  const secondaryYearValue = segments[secondaryYearIndex]?.value;

  // Годы для диапазона слайдера, всегда от меньшего к большому
  // Убедимся, что значения существуют перед использованием Math.min/max
  const startYear =
    primaryYear !== undefined && secondaryYearValue !== undefined
      ? Math.min(primaryYear, secondaryYearValue)
      : primaryYear;
  const endYear =
    primaryYear !== undefined && secondaryYearValue !== undefined
      ? Math.max(primaryYear, secondaryYearValue)
      : secondaryYearValue;

  // Формируем события для слайдера на основе диапазона startYear и endYear
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
    // Сортируем события по году, если это необходимо (на случай, если в одном сегменте события разных лет)
    // или если сегменты изначально не отсортированы по годам (хотя в demo они отсортированы)
    return eventsInRange.sort((a, b) => a.year - b.year);
  }, [startYear, endYear, segments, primaryYear, secondaryYearValue]); // Добавил primaryYear, secondaryYearValue в зависимости

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
    <div className="timeSegmentsBlock">
      <div className="blockTitleWrapper">
        <div className="decorativeLine"></div>
        <h2 className="blockTitle">Исторические даты</h2>
      </div>
      <div className="stickyCircularNavArea">
        {" "}
        {/* New wrapper for sticky behavior */}
        <div className="circleNav">
          <svg viewBox={`0 0 ${svgSize} ${svgSize}`} overflow="visible">
            {/* Круглая линия по периметру */}
            <circle
              cx={centerX}
              cy={centerY}
              r={circleRadius}
              fill="none"
              stroke="#d1d8e0"
              strokeWidth={2}
              className="perimeter-circle"
            />
            {/* Вращающаяся группа */}
            <g ref={rotatingGroupRef}>
              {/* Линии от центра к точкам */}
              {dotCoords.map((coord, index) => (
                <line
                  key={`line-${segments[index].id}`}
                  x1={centerX}
                  y1={centerY}
                  x2={coord.x}
                  y2={coord.y}
                  className="line"
                />
              ))}
              {/* Точки и метки количества событий при наведении */}
              {segments.map((segment, index) => {
                const pointX = dotCoords[index].x;
                const pointY = dotCoords[index].y;
                const isHovered =
                  hoveredIndex === index && activeIndex !== index;
                const isActive = activeIndex === index;

                // Общий стиль для div с количеством событий, обеспечивающий горизонтальность текста
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
                  transform: `rotate(${-rotationDegrees}deg)`, // Контр-вращение
                  transformOrigin: "center", // Центр вращения div
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
                      // Обработчик клика на родительской группе
                      if (!isActive) onDotClick(index);
                    }}
                    style={{ cursor: !isActive ? "pointer" : "default" }}
                  >
                    {/* Невидимый круг для стабильной области наведения/клика */}
                    <circle
                      cx={pointX}
                      cy={pointY}
                      r={18} // Соответствует размеру открытой точки
                      fill="transparent"
                    />

                    {/* Активная точка — всегда открыта, не реагирует на мышь, всегда горизонтальный текст */}
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
                            pointerEvents: "none", // Активная точка не должна перехватывать события
                          }}
                        />
                        <foreignObject
                          x={pointX - 18}
                          y={pointY - 12}
                          width={36}
                          height={24}
                          style={{ pointerEvents: "none" }} // Текст не должен мешать событиям мыши
                        >
                          <div style={eventCountDivStyle}>
                            {segment.events.length}
                          </div>
                        </foreignObject>
                      </g>
                    )}

                    {/* Визуализация для НЕАКТИВНЫХ сегментов: анимированное развертывание */}
                    {!isActive && (
                      <g>
                        {" "}
                        {/* Общая группа для анимируемых элементов неактивной точки */}
                        <circle
                          cx={pointX}
                          cy={pointY}
                          r={isHovered ? 18 : 6}
                          fill={isHovered ? "#fff" : "#d1d8e0"} // #d1d8e0 - цвет из класса .dot
                          stroke={isHovered ? "#5669FF" : "none"}
                          strokeWidth={isHovered ? 2 : 0}
                          style={{
                            transition:
                              "r 0.3s ease, fill 0.3s ease, stroke 0.3s ease, stroke-width 0.3s ease, filter 0.3s ease",
                            filter: isHovered
                              ? "drop-shadow(0 2px 8px rgba(86,105,255,0.10))"
                              : "none",
                            pointerEvents: "none", // Сам круг не должен перехватывать события
                          }}
                        />
                        <foreignObject
                          x={pointX - 18} // Центрируем относительно максимального радиуса (18)
                          y={pointY - 12} // Центрируем относительно максимального радиуса (18)
                          width={36}
                          height={24}
                          style={{
                            opacity: isHovered ? 1 : 0,
                            transition: "opacity 0.3s ease 0.1s", // Небольшая задержка для синхронизации с развертыванием круга
                            pointerEvents: "none", // Текст не должен мешать событиям мыши
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

            {/* SVG Текстовая метка для активного сегмента - ВЫНЕСЕНА ИЗ ВРАЩАЮЩЕЙСЯ ГРУППЫ */}
            {segments.length > 0 && dotCoords[activeIndex] && (
              <text
                ref={activeLabelRef} // Применяем реф
                key={`svg-label-${segments[activeIndex].id}`}
                // Позиционируем метку справа от визуального положения активной точки
                x={
                  centerX + circleRadius * Math.sin(targetAngleOnScreenRad) + 38 // 18px (радиус точки) + 20px (желаемое расстояние от края)
                }
                y={centerY - circleRadius * Math.cos(targetAngleOnScreenRad)} // Используем cos для Y и "-", если targetAngleOnScreenRad это угол CW от верха
                className="active-svg-segment-label"
                textAnchor="start" // Текст начинается от указанной точки x
                dominantBaseline="central"
                style={{ opacity: 0 }} // Начальная непрозрачность 0
              >
                {segments[activeIndex].category}
              </text>
            )}

            {/* Центральный дисплей с датами (НЕ ВРАЩАЕТСЯ) - предполагаем, что он реализован через HTML оверлей или foreignObject */}
            {/* Если .centerValue это HTML, он позиционируется поверх SVG через CSS */}
            {/* Если это SVG <text>, он должен быть здесь, вне <g ref={rotatingGroupRef}> */}
          </svg>
          {/* HTML контейнер для годов, если он позиционируется абсолютно поверх SVG */}
          <div className="centerValue">
            <span className="value-main">
              {startYearToDisplay === Infinity ? "..." : startYearToDisplay}
            </span>
            <span className="value-secondary">
              {endYearToDisplay === -Infinity ? "..." : endYearToDisplay}
            </span>
          </div>
        </div>
        {/* Новый блок управления круговым слайдером */}
        {segments.length > 1 && ( // Показываем контролы только если есть что слайдить
          <div className="circularNavControls">
            <div className="circularNavPagination">
              {activeIndex + 1} / {segments.length}
            </div>
            <div className="circularNavButtons">
              <button
                onClick={handleCircularPrev}
                className="circular-nav-button prev"
              >
                &lt; {/* Простая стрелка влево */}
              </button>
              <button
                onClick={handleCircularNext}
                className="circular-nav-button next"
              >
                &gt; {/* Простая стрелка вправо */}
              </button>
            </div>
          </div>
        )}
      </div>{" "}
      {/* End of stickyCircularNavArea */}
      <div className="sliderSection">
        {/* Контейнер для кнопок навигации слайдера событий остаётся здесь */}
        <div className="swiperNavContainer">
          <div className="swiper-button-prev custom-swiper-button-prev"></div>
          <div className="swiper-button-next custom-swiper-button-next"></div>
        </div>
        <div className="sliderWrapper">
          <div id={`slider-${activeIndex}`}>
            {" "}
            {/* Этот ID может быть уже не так важен для GSAP, если анимация слайдера другая */}
            <Swiper
              ref={swiperRef}
              modules={[Navigation]} // Подключаем модуль навигации
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
                  <div className="eventCard">
                    <div className="eventYear">{event.year}</div>
                    <div className="eventDesc">{event.description}</div>
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
