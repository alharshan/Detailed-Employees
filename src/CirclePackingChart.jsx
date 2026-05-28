import React, { useState, useMemo } from "react";
import * as d3 from "d3";

const BAR_COLORS = {
  "سعودي - ذكور": "#006C35",
  "سعودي - إناث": "#4CAF50",
  "غير سعودي - ذكور": "#2B4C7E",
  "غير سعودي - إناث": "#2A9D8F",
};

const PRIMARY_FONT = "'Tajawal', sans-serif";

function formatCompactNumber(number) {
  if (number === 0) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(number);
}

export default function CirclePackingChart({ data }) {
  const baseSize = 928;

  const [focus, setFocus] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { root, nodes } = useMemo(() => {
    const packLayout = d3.pack().size([baseSize, baseSize]).padding(12);

    const hierarchyData = d3
      .hierarchy(data)
      .sum((d) => {
        if (!d.children && d.value > 0) {
          return Math.sqrt(d.value) * 15 + 100;
        }
        return d.value ? Math.sqrt(d.value) * 15 : 0;
      })
      .sort((a, b) => b.value - a.value);

    return {
      root: packLayout(hierarchyData),
      nodes: packLayout(hierarchyData).descendants().slice(1),
    };
  }, [data]);

  const level6Occupations = useMemo(() => {
    return nodes.filter((d) => !d.children && d.data.name);
  }, [nodes]);

  const filteredOccupations = useMemo(() => {
    if (!searchQuery.trim()) return level6Occupations;
    return level6Occupations.filter((d) =>
      d.data.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, level6Occupations]);

  const currentFocus = focus || root;
  const v = [currentFocus.x, currentFocus.y, currentFocus.r * 2];
  const k = baseSize / v[2];

  const handleCircleClick = (event, node) => {
    if (currentFocus === node) {
      if (node.parent) setFocus(node.parent);
    } else {
      setFocus(node);
    }
    if (event) event.stopPropagation();
  };

  const handleSelectOccupation = (node) => {
    setFocus(node);
    setSearchQuery(node.data.name);
    setIsDropdownOpen(false);
  };

  const getActualTrueValue = (node) => {
    if (!node) return 0;
    if (!node.children) return node.data.value || 0;
    return d3.sum(
      node.descendants().filter((n) => !n.children),
      (n) => n.data.value || 0,
    );
  };

  const computedTooltipStats = useMemo(() => {
    if (!hoveredNode) return [];
    if (!hoveredNode.children && hoveredNode.data.stats) {
      return hoveredNode.data.stats;
    }

    const totals = {
      "سعودي - ذكور": 0,
      "سعودي - إناث": 0,
      "غير سعودي - ذكور": 0,
      "غير سعودي - إناث": 0,
    };

    hoveredNode.descendants().forEach((d) => {
      if (!d.children && d.data.stats) {
        d.data.stats.forEach((s) => {
          if (totals[s.label] !== undefined) {
            totals[s.label] += s.value;
          }
        });
      }
    });

    return Object.keys(totals).map((key) => ({
      label: key,
      value: totals[key],
    }));
  }, [hoveredNode]);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "auto",
        minHeight: "85vh",
        margin: "20px auto",
        alignItems: "flex-start",
        padding: "0 40px",
        boxSizing: "border-box",
        direction: "rtl",
        overflow: "visible",
        gap: "60px",
        fontFamily: PRIMARY_FONT,
      }}
      onClick={() => setIsDropdownOpen(false)}
    >
      {/* القسم الأيمن */}
      <div
        style={{
          flex: "0 0 420px",
          display: "flex",
          flexDirection: "column",
          minHeight: "80vh", // لضمان بقاء المصدر في الأسفل
          fontFamily: PRIMARY_FONT,
          textAlign: "right",
          paddingTop: "20px",
          overflow: "visible",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h1
          style={{
            color: "#1c1c1c",
            fontSize: "36px",
            margin: "0 0 8px 0",
            fontWeight: "800",
            lineHeight: "1.3",
            textAlign: "right",
          }}
        >
          نظرة عن قرب على سوق العمل السعودي
        </h1>

        <h3
          style={{
            color: "#BFBFBF",
            fontSize: "16px",
            margin: "0 0 24px 0",
            fontWeight: "500",
          }}
        >
          توزيع العاملين حسب النشاط الاقتصادي والجنس والجنسية
        </h3>

        <p
          style={{
            lineHeight: "1.8",
            color: "#7d7d7d",
            fontSize: "14px",
            margin: "0 0 24px 0",
            fontWeight: "500",
            textAlign: "justify",
          }}
        >
          يستعرض هذا الرسم التفاعلي هيكلية سوق العمل السعودي في الربع الأول من
          عام 2026، حيث يحلل بيانات 13 مليون عامل موزعين على نحو 3000 نشاط
          اقتصادي. يعتمد التصميم تسلسلاً هرمياً وفق معايير ISIC4 الدولية؛ إذ
          ترمز الدوائر الرمادية للمجموعات الرئيسية (المستوى الثاني)، وتتفرع
          بداخلها الدوائر وصولاً إلى الأنشطة الدقيقة (المستوى السادس). ولتسهيل
          القراءة البصرية، يشير حجم الدائرة إلى كثافة العمالة في النشاط، بينما
          يميز اللون الأخضر الأنشطة التي تمثل فيها العمالة الوطنية (السعودية)
          الأغلبية. يوفر العرض إحصائيات تفصيلية حسب الجنس والجنسية لكل نشاط.
          يمكنك النقر على الدوائر للتعمق في التفاصيل (Zoom-in)، أو استخدام محرك
          البحث السريع للوصول المباشر لنشاط محدد.
        </p>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #eee",
            width: "100%",
            margin: "0 0 24px 0",
          }}
        />

        <h2
          style={{
            color: "#111",
            fontSize: "22px",
            margin: "0 0 16px 0",
            fontWeight: "700",
          }}
        >
          ابحث عن نشاط اقتصادي
        </h2>

        <div
          style={{
            position: "relative",
            width: "100%",
            margin: "0 0 30px 0",
            overflow: "visible",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
            }}
          >
            <input
              type="text"
              placeholder="ابحث عن نشاط ..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              style={{
                flex: 1,
                padding: "12px 16px",
                fontSize: "14px",
                fontFamily: PRIMARY_FONT,
                border: "1px solid #ccc",
                borderLeft: "none",
                borderRadius: "0 4px 4px 0",
                outline: "none",
                backgroundColor: "#fff",
                color: "#333",
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (searchQuery) {
                  setSearchQuery("");
                  setFocus(root);
                  setIsDropdownOpen(false);
                } else {
                  setIsDropdownOpen(!isDropdownOpen);
                }
              }}
              style={{
                padding: "0 14px",
                border: "1px solid #ccc",
                backgroundColor: "#f1f1f1",
                cursor: "pointer",
                borderRadius: "4px 0 0 4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "45px",
              }}
            >
              {searchQuery ? (
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#666",
                  }}
                >
                  ×
                </span>
              ) : (
                <span
                  style={{
                    transform: isDropdownOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s",
                    display: "inline-block",
                    fontSize: "10px",
                    color: "#555",
                  }}
                >
                  ▼
                </span>
              )}
            </button>
          </div>

          {isDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 9999,
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "0 0 4px 4px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.12)",
                maxHeight: "180px",
                overflowY: "auto",
                boxSizing: "border-box",
                marginTop: "-1px",
              }}
            >
              <ul style={{ margin: 0, padding: "4px 0", listStyle: "none" }}>
                {filteredOccupations.length > 0 ? (
                  filteredOccupations.map((node, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelectOccupation(node)}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        fontSize: "13.5px",
                        fontFamily: PRIMARY_FONT,
                        color: "#333",
                        textAlign: "right",
                        transition: "background-color 0.1s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#5d5d5d";
                        e.target.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#333";
                      }}
                    >
                      {node.data.name}
                    </li>
                  ))
                ) : (
                  <li
                    style={{
                      padding: "15px",
                      color: "#999",
                      textAlign: "center",
                      fontSize: "13px",
                    }}
                  >
                    لا توجد نتائج مطابقة
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* 🛠️ قسم الاسم والمصدر (يظهر في الأسفل) */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "40px",
            fontSize: "13px",
            color: "#aaa",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div>
            تطوير وإعداد:{" "}
            <strong style={{ color: "#555" }}>د. أنس ال حرشان</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span>مصدر البيانات:</span>
            <span style={{ color: "#555", fontWeight: "600" }}>منشآت</span>
          </div>
        </div>
      </div>

      {/* القسم الأيسر (الرسم البياني) */}
      <div
        style={{
          flex: 1,
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <svg
          viewBox={`-${baseSize / 2} -${baseSize / 2} ${baseSize} ${baseSize}`}
          style={{
            width: "auto",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "80vh",
            cursor: "pointer",
            display: "block",
            borderRadius: "12px",
            userSelect: "none",
          }}
          onClick={() => setFocus(root)}
        >
          <circle
            cx={0}
            cy={0}
            r={baseSize / 2 - 2}
            fill="#f8f9fa"
            stroke="#e9ecef"
            strokeWidth={2}
            shapeRendering="geometricPrecision"
            onMouseEnter={(e) => {
              setTooltipPos({ x: e.clientX + 15, y: e.clientY + 15 });
              setHoveredNode(root);
            }}
            onMouseMove={(e) =>
              setTooltipPos({ x: e.clientX + 15, y: e.clientY + 15 })
            }
            onMouseLeave={() => setHoveredNode(null)}
          />

          <g className="circles-group">
            {nodes.map((d, index) => {
              const cx = (d.x - v[0]) * k;
              const cy = (d.y - v[1]) * k;
              const r = d.r * k;

              const isVisibleNode =
                d.parent === currentFocus ||
                d === currentFocus ||
                (d.parent && d.parent.parent === currentFocus);

              if (!isVisibleNode) return null;

              let saudiTotal = 0;
              let nonSaudiTotal = 0;

              d.descendants().forEach((node) => {
                if (!node.children && node.data.stats) {
                  node.data.stats.forEach((s) => {
                    if (s.label.includes("سعودي") && !s.label.includes("غير")) {
                      saudiTotal += s.value;
                    } else if (s.label.includes("غير سعودي")) {
                      nonSaudiTotal += s.value;
                    }
                  });
                }
              });

              const isSaudiMajority = saudiTotal > nonSaudiTotal;

              let circleFillColor = "white";
              if (isSaudiMajority) {
                circleFillColor = d3
                  .rgb("#4CAF50")
                  .copy({ opacity: 0.05 + 0.04 * d.depth })
                  .toString();
              } else {
                circleFillColor = d3
                  .rgb("#2B4C7E")
                  .copy({ opacity: 0.04 + 0.03 * d.depth })
                  .toString();
              }

              let strokeColor = "#ccc";
              let strokeWidth = 0.8;

              if (hoveredNode === d) {
                strokeColor = "#111";
                strokeWidth = 2.5;
              } else if (currentFocus === d) {
                strokeColor = "#333";
                strokeWidth = 1.5;
              } else if (isSaudiMajority) {
                strokeColor = "#006C35";
                strokeWidth = 1.5;
              }

              return (
                <circle
                  key={`circle-${index}`}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={circleFillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  shapeRendering="geometricPrecision"
                  style={{
                    transition: "all 0.75s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                  onClick={(e) => handleCircleClick(e, d)}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setTooltipPos({ x: e.clientX + 15, y: e.clientY + 15 });
                    setHoveredNode(d);
                  }}
                  onMouseMove={(e) => {
                    e.stopPropagation();
                    setTooltipPos({ x: e.clientX + 15, y: e.clientY + 15 });
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              );
            })}
          </g>

          <g className="bars-group" style={{ pointerEvents: "none" }}>
            {nodes.map((d, index) => {
              if (d.children) return null;

              const cx = (d.x - v[0]) * k;
              const cy = (d.y - v[1]) * k;
              const r = d.r * k;

              const isBarVisible = currentFocus === d && r > 120;
              if (!isBarVisible) return null;

              const stats = d.data.stats || [];
              const maxStatVal = d3.max(stats, (s) => s.value) || 1;
              const boxSize = r * 1.5;

              return (
                <foreignObject
                  key={`fo-${index}`}
                  x={cx - boxSize / 2}
                  y={cy - boxSize / 2}
                  width={boxSize}
                  height={boxSize}
                  style={{
                    transition: "opacity 0.5s",
                    opacity: isBarVisible ? 1 : 0,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "10px",
                      boxSizing: "border-box",
                      fontFamily: PRIMARY_FONT,
                    }}
                  >
                    <div
                      style={{
                        width: "95%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {stats.map((stat, i) => {
                        const percentage = (stat.value / maxStatVal) * 100;
                        const isBarTooShort = percentage < 15;

                        return (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                width: "38%",
                                textAlign: "left",
                                fontSize: `${Math.max(10, r * 0.042)}px`,
                                fontWeight: "700",
                                color: "#222",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {stat.label}
                            </div>

                            <div
                              style={{
                                flex: 1,
                                height: `${Math.max(16, r * 0.058)}px`,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  width: `${percentage}%`,
                                  height: "100%",
                                  backgroundColor:
                                    BAR_COLORS[stat.label] || "#999",
                                  borderRadius: "3px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  paddingLeft: isBarTooShort ? "0px" : "8px",
                                  paddingRight: isBarTooShort ? "0px" : "4px",
                                  boxSizing: "border-box",
                                  transition:
                                    "width 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
                                }}
                              >
                                {!isBarTooShort && (
                                  <span
                                    style={{
                                      color: "#ffffff",
                                      fontSize: `${Math.max(9, r * 0.036)}px`,
                                      fontWeight: "700",
                                    }}
                                  >
                                    {formatCompactNumber(stat.value)}
                                  </span>
                                )}
                              </div>

                              {isBarTooShort && (
                                <span
                                  style={{
                                    color: "#444444",
                                    fontSize: `${Math.max(9, r * 0.036)}px`,
                                    fontWeight: "700",
                                    paddingRight: "6px",
                                  }}
                                >
                                  {formatCompactNumber(stat.value)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </foreignObject>
              );
            })}
          </g>
        </svg>
      </div>

      {hoveredNode && (
        <div
          style={{
            position: "fixed",
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            background: "rgba(33, 37, 41, 0.98)",
            color: "#fff",
            padding: "14px 18px",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: PRIMARY_FONT,
            pointerEvents: "none",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
            zIndex: 9999,
            minWidth: "220px",
            direction: "rtl",
          }}
        >
          <strong
            style={{
              color: "#ffd166",
              display: "block",
              marginBottom: "6px",
              fontSize: "13px",
              fontWeight: "700",
            }}
          >
            {hoveredNode.data.name || "إجمالي القطاعات"}
          </strong>

          <div
            style={{
              fontSize: "11px",
              borderTop: "1px solid #444",
              paddingTop: "6px",
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>إجمالي العمالة الكلي:</span>
            <span style={{ fontWeight: "700", color: "#ffd166" }}>
              {getActualTrueValue(hoveredNode).toLocaleString()}
            </span>
          </div>

          {computedTooltipStats.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "11px",
                color: "#e0e0e0",
              }}
            >
              {computedTooltipStats.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "2px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: BAR_COLORS[s.label],
                      }}
                    ></span>
                    <span>{s.label}:</span>
                  </div>
                  <span style={{ fontWeight: "700", color: "#fff" }}>
                    {s.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
